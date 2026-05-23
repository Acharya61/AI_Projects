from __future__ import annotations
import time
import json
import math
from pathlib import Path
from typing import Optional, Callable
from dataclasses import dataclass, field

from .market import MarketSnapshot
from .portfolio import PortfolioState
from .agent import TradingAgent
from analyzers.predictor import Predictor, PredictionTracker
from analyzers.multi_stock import MultiStockScanner
from analyzers.risk import RiskAnalyzer
from strategies.registry import StrategyRegistry


@dataclass
class SessionConfig:
    duration: float = 600.0
    max_stocks: int = 3
    initial_cash: float = 100000.0
    prediction_horizon_ticks: int = 10
    prediction_horizon_bars: int = 5


@dataclass
class SessionTradeBreakdown:
    symbol: str
    side: str
    quantity: int
    entry_price: float
    exit_price: float
    pnl: float
    strategy: str = ""
    correct_prediction: bool = False


@dataclass
class SessionResult:
    total_pnl: float
    total_trades: int
    winning_trades: int
    losing_trades: int
    win_rate: float
    reward: float
    punishment: float
    trades: list[SessionTradeBreakdown]
    strategy_scores: dict[str, float]
    retrospective: str


class SessionManager:
    def __init__(
        self,
        agent: TradingAgent,
        predictor: Predictor,
        scanner: MultiStockScanner,
        tracker: PredictionTracker,
        registry: StrategyRegistry,
        performance_path: Optional[Path] = None,
    ):
        self.agent = agent
        self.predictor = predictor
        self.scanner = scanner
        self.tracker = tracker
        self.registry = registry
        self.performance_path = performance_path or Path(
            __file__).parent.parent / "models" / "strategy_performance.json"
        self._session_active = False
        self._config: Optional[SessionConfig] = None
        self._start_time = 0.0
        self._elapsed = 0.0
        self._selected_symbols: list[str] = []
        self._session_trades: list[SessionTradeBreakdown] = []
        self._pending_trades: dict[str, dict] = {}
        self._equity_samples: list[tuple[float, float]] = []
        self._on_status: Optional[Callable[[dict], None]] = None

    @property
    def active(self) -> bool:
        return self._session_active

    @property
    def config(self) -> Optional[SessionConfig]:
        return self._config

    @property
    def elapsed(self) -> float:
        if self._session_active:
            return time.time() - self._start_time
        return self._elapsed

    @property
    def remaining(self) -> float:
        if not self._config:
            return 0.0
        return max(0.0, self._config.duration - self.elapsed)

    @property
    def selected_symbols(self) -> list[str]:
        return list(self._selected_symbols)

    def on_status(self, callback: Callable[[dict], None]):
        self._on_status = callback

    def start(self, config: SessionConfig, market: MarketSnapshot):
        if self._session_active:
            return

        self._config = config
        self._start_time = time.time()
        self._elapsed = 0.0
        self._session_trades = []
        self._pending_trades = {}
        self._equity_samples = []
        self._session_active = True

        self.agent.reset(config.initial_cash)
        self.agent.running = True

        predictions = self.predictor.predict_all(
            market,
            list(market.symbols.keys()),
            config.prediction_horizon_ticks,
            config.prediction_horizon_bars,
        )

        scored = self.scanner.pick_top(
            market,
            self.agent.portfolio,
            predictions,
            count=config.max_stocks,
            held_symbols=set(),
        )
        self._selected_symbols = [s.symbol for s in scored]
        self.agent.tracked_symbols = self._selected_symbols

        predicted_returns = {
            sym: predictions.get(sym, {}).get("sma_crossover", {}).get("expected_return", 0)
            for sym in self._selected_symbols
        }

    def tick(self, market: MarketSnapshot):
        if not self._session_active:
            return
        self._elapsed = time.time() - self._start_time

        actions = self.agent.on_tick(market)

        prices = {sym: market.price(sym) for sym in self._selected_symbols}
        equity = self.agent.equity(prices)
        self._equity_samples.append((time.time(), equity))

        for action in actions:
            if action.action == "buy":
                self._pending_trades[action.symbol] = {
                    "entry_price": market.price(action.symbol),
                    "entry_time": time.time(),
                }
            elif action.action == "sell" and action.symbol in self._pending_trades:
                entry = self._pending_trades.pop(action.symbol, None)
                if entry:
                    pnl_price = market.price(action.symbol)
                    pnl = action.quantity * pnl_price - action.quantity * entry["entry_price"]
                    is_correct = pnl > 0

                    preds = self.predictor.predict(action.symbol, market)
                    for sname in preds:
                        self.tracker.record_prediction(
                            sname, action.symbol,
                            preds[sname].get("predicted_price_ticks", market.price(action.symbol)),
                            market.price(action.symbol),
                            pnl / max(self._equity_samples[-1][1] if self._equity_samples else 1, 1),
                        )

                    self._session_trades.append(SessionTradeBreakdown(
                        symbol=action.symbol,
                        side="sell",
                        quantity=action.quantity,
                        entry_price=entry["entry_price"],
                        exit_price=market.price(action.symbol),
                        pnl=round(pnl, 2),
                        correct_prediction=is_correct,
                    ))

        if self.remaining <= 0 and self._session_active:
            result = self.end()
            if result and self._on_status:
                self._on_status({
                    "type": "session_result",
                    "total_pnl": result.total_pnl,
                    "total_trades": result.total_trades,
                    "winning_trades": result.winning_trades,
                    "losing_trades": result.losing_trades,
                    "win_rate": result.win_rate,
                    "reward": result.reward,
                    "punishment": result.punishment,
                    "retrospective": result.retrospective,
                    "strategy_scores": result.strategy_scores,
                })
            return

        if self._on_status:
            self._on_status(self._build_status())

    def end(self) -> Optional[SessionResult]:
        if not self._session_active:
            return None
        self._session_active = False
        self.agent.running = False

        prices = {sym: 0.0 for sym in self._selected_symbols}
        end_equity = self.agent.equity(prices)
        start_cash = self._config.initial_cash if self._config else 100000.0
        total_pnl = end_equity - start_cash if self._config else 0

        winning = [t for t in self._session_trades if t.pnl > 0]
        losing = [t for t in self._session_trades if t.pnl <= 0]
        win_rate = len(winning) / max(len(self._session_trades), 1)

        reward = max(0, total_pnl * 0.01) if total_pnl > 0 else 0
        punishment = abs(total_pnl) * 0.01 if total_pnl < 0 else 0

        strategy_scores: dict[str, float] = {}
        for name in self.registry.names():
            if name == "ensemble":
                continue
            total_acc = 0
            count = 0
            for sym in self._selected_symbols:
                acc = self.tracker.accuracy(name, sym)
                if acc > 0:
                    total_acc += acc
                    count += 1
            strategy_scores[name] = round(total_acc / max(count, 1), 4)

        ensemble = self.registry.get("ensemble")
        if ensemble:
            for name, score in strategy_scores.items():
                adjusted = score + (reward * 0.001) - (punishment * 0.001)
                ensemble.weights[name] = max(0.01, min(1.0, adjusted))
            for name in self.registry.names():
                if name != "ensemble" and name not in ensemble.weights:
                    ensemble.weights[name] = 0.5

        retrospective_parts = []
        if winning:
            retrospective_parts.append(f"Won {len(winning)}/{len(self._session_trades)} trades")
        if losing:
            retrospective_parts.append(f"Lost {len(losing)}/{len(self._session_trades)} trades")
        if total_pnl > 0:
            retrospective_parts.append(f"Session profitable: +${total_pnl:.2f}")
        elif total_pnl < 0:
            retrospective_parts.append(f"Session loss: ${total_pnl:.2f}")

        best_strategy = max(strategy_scores, key=strategy_scores.get) if strategy_scores else "none"
        retrospective_parts.append(f"Best strategy: {best_strategy} ({strategy_scores.get(best_strategy, 0):.1%})")

        result = SessionResult(
            total_pnl=round(total_pnl, 2),
            total_trades=len(self._session_trades),
            winning_trades=len(winning),
            losing_trades=len(losing),
            win_rate=round(win_rate, 4),
            reward=round(reward, 2),
            punishment=round(punishment, 2),
            trades=list(self._session_trades),
            strategy_scores=strategy_scores,
            retrospective=" | ".join(retrospective_parts),
        )

        self.tracker.save()
        self.agent.reset(self._config.initial_cash if self._config else 100000.0)
        self._selected_symbols = []
        self._pending_trades = {}

        return result

    def _build_status(self, phase: str = "trading") -> dict:
        prices = {sym: 0.0 for sym in self._selected_symbols}
        equity = self.agent.equity(prices)
        return {
            "active": self._session_active,
            "phase": phase,
            "elapsed": round(self.elapsed, 1),
            "remaining": round(self.remaining, 1),
            "active_stocks": self._selected_symbols,
            "positions": {
                s: {"quantity": p.quantity, "avg_entry": p.avg_entry}
                for s, p in self.agent.portfolio.positions.items()
            },
            "equity": round(equity, 2),
            "cash": round(self.agent.portfolio.cash, 2),
            "total_pnl": round(equity - (self._config.initial_cash if self._config else 100000.0), 2),
            "trade_count": len(self._session_trades),
        }
