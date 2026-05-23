from __future__ import annotations
import random
from typing import Optional
from dataclasses import dataclass, field

from .market import MarketSnapshot
from .portfolio import PortfolioState, RiskManager
from .decision import DecisionEngine, AgentAction


@dataclass
class TradeRecord:
    symbol: str
    side: str
    quantity: int
    price: float
    pnl: float
    timestamp: float
    strategy: str = ""
    reason: str = ""
    expected_return: float = 0.0


class TradingAgent:
    def __init__(
        self,
        decision_engine: DecisionEngine,
        risk_manager: Optional[RiskManager] = None,
        initial_cash: float = 100000.0,
        tracked_symbols: list[str] | None = None,
    ):
        self.decision = decision_engine
        self.risk = risk_manager or RiskManager()
        self.portfolio = PortfolioState(cash=initial_cash, initial_cash=initial_cash)
        self.trades: list[TradeRecord] = []
        self.running = False
        self.tracked_symbols = tracked_symbols or []
        self._last_prices: dict[str, float] = {}
        self.total_pnl = 0.0

    def on_tick(self, market: MarketSnapshot) -> list[AgentAction]:
        if not self.running:
            return []

        symbols = self.tracked_symbols or list(market.symbols.keys())
        actions = []

        for symbol in symbols:
            price = market.price(symbol)
            if price <= 0:
                continue

            predictions = {}
            action = self.decision.decide(symbol, market, self.portfolio, predictions)

            if action.action == "buy":
                self._execute_buy(action, price)
            elif action.action == "sell":
                self._execute_sell(action, price)

            actions.append(action)
            self._last_prices[symbol] = price

        return actions

    def _execute_buy(self, action: AgentAction, price: float):
        qty = action.quantity
        if qty <= 0:
            return
        cost = qty * price
        if cost > self.portfolio.cash:
            qty = int(self.portfolio.cash // price)
            cost = qty * price
        if qty <= 0:
            return

        self.portfolio.cash -= cost
        if self.portfolio.has_position(action.symbol):
            existing = self.portfolio.positions[action.symbol]
            new_qty = existing.quantity + qty
            new_avg = ((existing.avg_entry * existing.quantity) + cost) / new_qty
            existing.quantity = new_qty
            existing.avg_entry = round(new_avg, 2)
        else:
            self.portfolio.positions[action.symbol] = type(
                "Position", (), {"symbol": action.symbol, "quantity": qty, "avg_entry": price, "stop_loss": 0.0}
            )()

    def _execute_sell(self, action: AgentAction, price: float):
        if not self.portfolio.has_position(action.symbol):
            return
        pos = self.portfolio.positions[action.symbol]
        qty = min(action.quantity or pos.quantity, pos.quantity)
        if qty <= 0:
            return

        proceeds = qty * price
        entry_cost = qty * pos.avg_entry
        pnl = proceeds - entry_cost

        self.portfolio.cash += proceeds
        self.total_pnl += pnl
        new_qty = pos.quantity - qty

        self.trades.append(TradeRecord(
            symbol=action.symbol,
            side="sell",
            quantity=qty,
            price=price,
            pnl=round(pnl, 2),
            timestamp=__import__("time").time(),
            strategy="",
            reason=action.reason,
            expected_return=action.expected_return,
        ))

        if new_qty <= 0:
            del self.portfolio.positions[action.symbol]
        else:
            pos.quantity = new_qty

    def equity(self, current_prices: dict[str, float]) -> float:
        return self.portfolio.equity(current_prices)

    def reset(self, cash: float = 100000.0):
        self.portfolio.reset(cash)
        self.trades.clear()
        self.total_pnl = 0.0
        self._last_prices.clear()

    def to_dict(self) -> dict:
        return {
            "tracked_symbols": self.tracked_symbols,
            "running": self.running,
            "cash": round(self.portfolio.cash, 2),
            "positions": {
                s: {"quantity": p.quantity, "avg_entry": p.avg_entry}
                for s, p in self.portfolio.positions.items()
            },
            "total_pnl": round(self.total_pnl, 2),
            "trade_count": len(self.trades),
            "trades": [
                {"symbol": t.symbol, "side": t.side, "quantity": t.quantity,
                 "price": t.price, "pnl": t.pnl, "reason": t.reason}
                for t in self.trades[-20:]
            ],
        }
