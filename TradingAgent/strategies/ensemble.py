from .base import BaseStrategy
from .registry import StrategyRegistry
from core.market import MarketSnapshot
from core.portfolio import PortfolioState
from core.actions import AgentAction


class EnsembleStrategy(BaseStrategy):
    def __init__(self, registry: StrategyRegistry, weights: dict[str, float] | None = None):
        self.registry = registry
        self.weights = weights or {}

    def name(self) -> str:
        return "Ensemble (weighted)"

    def set_weights(self, weights: dict[str, float]):
        self.weights = weights

    def act(self, market: MarketSnapshot, portfolio: PortfolioState) -> AgentAction:
        strategies = self.registry.get_all()
        buy_weight = 0.0
        sell_weight = 0.0
        reasons = []

        for name, strategy in strategies.items():
            if name == "ensemble":
                continue
            w = self.weights.get(name, 1.0)
            action = strategy.act(market, portfolio)
            if action.action == "buy":
                buy_weight += w * action.confidence
                reasons.append(f"{name}:buy({w * action.confidence:.2f})")
            elif action.action == "sell":
                sell_weight += w * action.confidence
                reasons.append(f"{name}:sell({w * action.confidence:.2f})")

        total = buy_weight + sell_weight
        if total == 0:
            return AgentAction("hold")

        symbol = list(market.symbols.keys())[0] if market.symbols else ""
        if buy_weight > sell_weight:
            confidence = buy_weight / total
            price = market.price(symbol)
            qty = max(1, int(portfolio.cash * 0.15 * confidence // price)) if price > 0 else 0
            return AgentAction("buy", symbol, qty, round(confidence, 3), "; ".join(reasons))
        else:
            confidence = sell_weight / total
            qty = portfolio.position_qty(symbol)
            return AgentAction("sell", symbol, qty, round(confidence, 3), "; ".join(reasons))

    def confidence(self, market: MarketSnapshot, portfolio: PortfolioState) -> float:
        strategies = self.registry.get_all()
        total_conf = sum(
            s.confidence(market, portfolio) * self.weights.get(n, 1.0)
            for n, s in strategies.items() if n != "ensemble"
        )
        return total_conf / max(len(strategies) - 1, 1)

    def reset(self):
        for s in self.registry.get_all().values():
            s.reset()
