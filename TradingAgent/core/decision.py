from __future__ import annotations
import math
from dataclasses import dataclass, field
from typing import Optional

from .market import MarketSnapshot
from .portfolio import PortfolioState
from .actions import AgentAction


@dataclass
class ScoredSymbol:
    symbol: str
    score: float
    confidence: float
    predicted_return: float
    volatility: float
    reasons: list[str] = field(default_factory=list)


class StockScorer:
    def __init__(self, performance_data: dict | None = None):
        self.performance = performance_data or {}

    def score(
        self,
        symbol: str,
        predictions: dict[str, dict],
        history: list,
        portfolio: PortfolioState,
    ) -> ScoredSymbol:
        reasons = []
        score = 0.0
        best_conf = 0.0
        best_return = 0.0

        strat_scores = []
        for strat_name, pred in predictions.items():
            perf = self.performance.get(strat_name, {}).get(symbol, {})
            accuracy = perf.get("accuracy", 0.5)
            pnl = perf.get("pnl", 0)
            strat_score = accuracy * pred.get("confidence", 0) * (1 + pnl / 1000)
            strat_scores.append(strat_score)

            if pred.get("confidence", 0) > best_conf:
                best_conf = pred["confidence"]
                best_return = pred.get("expected_return", 0)

        score = sum(strat_scores) / max(len(strat_scores), 1) if strat_scores else 0.5

        if portfolio.has_position(symbol):
            score *= 0.7
            reasons.append("already holding")

        volatility = self._estimate_volatility(history)
        if volatility > 0.05:
            score *= 0.85
            reasons.append(f"high vol ({volatility:.2%})")

        return ScoredSymbol(
            symbol=symbol,
            score=round(score, 4),
            confidence=round(best_conf, 4),
            predicted_return=round(best_return, 4),
            volatility=round(volatility, 4),
            reasons=reasons,
        )

    def _estimate_volatility(self, history: list) -> float:
        if len(history) < 10:
            return 0.02
        prices = [h.close for h in history[-20:]]
        returns = [(prices[i] - prices[i - 1]) / prices[i - 1] for i in range(1, len(prices))]
        if not returns:
            return 0.02
        mean = sum(returns) / len(returns)
        variance = sum((r - mean) ** 2 for r in returns) / len(returns)
        return math.sqrt(variance) if variance > 0 else 0.02

    def pick_best(
        self,
        candidates: list[ScoredSymbol],
        count: int = 3,
        held_symbols: set | None = None,
    ) -> list[ScoredSymbol]:
        held = held_symbols or set()
        sorted_candidates = sorted(candidates, key=lambda x: x.score, reverse=True)
        selected = []
        for c in sorted_candidates:
            if len(selected) >= count:
                break
            selected.append(c)
        return selected


class DecisionEngine:
    def __init__(self, registry, scorer: StockScorer):
        self.registry = registry
        self.scorer = scorer

    def decide(
        self,
        symbol: str,
        market: MarketSnapshot,
        portfolio: PortfolioState,
        predictions: dict[str, dict] | None = None,
    ) -> AgentAction:
        strategies = self.registry.get_all()
        votes = []

        for name, strategy in strategies.items():
            action = strategy.act(market, portfolio)
            if action.action != "hold":
                votes.append((name, action, strategy.confidence(market, portfolio)))

        if not votes:
            return AgentAction("hold", symbol=symbol)

        weighted_buy = sum(conf for n, a, conf in votes if a.action == "buy")
        weighted_sell = sum(conf for n, a, conf in votes if a.action == "sell")
        total_conf = weighted_buy + weighted_sell

        move = "buy" if weighted_buy > weighted_sell else "sell"
        confidence = max(weighted_buy, weighted_sell) / max(total_conf, 1)

        pred = predictions or {}
        expected_return = sum(
            pred.get(n, {}).get("expected_return", 0) * conf
            for n, a, conf in votes
        ) / max(total_conf, 1)

        qty = 0
        if move == "buy" and not portfolio.has_position(symbol):
            price = market.price(symbol)
            balance = portfolio.cash
            qty = max(1, int(balance * 0.1 * confidence // price))
        elif move == "sell" and portfolio.has_position(symbol):
            qty = portfolio.position_qty(symbol)

        return AgentAction(
            action=move,
            symbol=symbol,
            quantity=qty,
            confidence=round(confidence, 4),
            reason=f"ensemble vote: buy={weighted_buy:.2f}/sell={weighted_sell:.2f}",
            expected_return=round(expected_return, 4),
        )
