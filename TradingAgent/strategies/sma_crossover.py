from .base import BaseStrategy
from core.market import MarketSnapshot
from core.portfolio import PortfolioState
from core.actions import AgentAction


class SMAStrategy(BaseStrategy):
    def __init__(self, fast_period: int = 5, slow_period: int = 20):
        self.fast_period = fast_period
        self.slow_period = slow_period
        self._prices: dict[str, list[float]] = {}

    def name(self) -> str:
        return f"SMA Crossover ({self.fast_period}/{self.slow_period})"

    def _prices_for(self, symbol: str, market: MarketSnapshot) -> list[float]:
        if symbol not in self._prices:
            self._prices[symbol] = []
        prices = self._prices[symbol]
        price = market.price(symbol)
        if price > 0 and (not prices or prices[-1] != price):
            prices.append(price)
        return prices

    def _sma(self, prices: list[float], period: int) -> float:
        if len(prices) < period:
            return 0.0
        return sum(prices[-period:]) / period

    def act(self, market: MarketSnapshot, portfolio: PortfolioState) -> AgentAction:
        symbol = market.symbols.keys()
        if not symbol:
            return AgentAction("hold")
        sym = list(symbol)[0]

        prices = self._prices_for(sym, market)
        if len(prices) < self.slow_period + 1:
            return AgentAction("hold")

        fast_prev = self._sma(prices[-(self.fast_period + 1):-1], self.fast_period)
        fast_curr = self._sma(prices, self.fast_period)
        slow_prev = self._sma(prices[-(self.slow_period + 1):-1], self.slow_period)
        slow_curr = self._sma(prices, self.slow_period)

        if not portfolio.has_position(sym) and fast_prev <= slow_prev and fast_curr > slow_curr:
            price = market.price(sym)
            qty = max(1, int(portfolio.cash * 0.2 // price))
            return AgentAction("buy", sym, qty, 0.7, "Golden cross")
        elif portfolio.has_position(sym) and fast_prev >= slow_prev and fast_curr < slow_curr:
            qty = portfolio.position_qty(sym)
            return AgentAction("sell", sym, qty, 0.7, "Death cross")

        return AgentAction("hold")

    def reset(self):
        self._prices.clear()
