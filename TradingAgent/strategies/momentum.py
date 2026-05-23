from .base import BaseStrategy
from core.market import MarketSnapshot
from core.portfolio import PortfolioState
from core.actions import AgentAction


class MomentumStrategy(BaseStrategy):
    def __init__(self, lookback: int = 10, breakout_multiplier: float = 1.0):
        self.lookback = lookback
        self.breakout_multiplier = breakout_multiplier
        self._highs: dict[str, list[float]] = {}
        self._lows: dict[str, list[float]] = {}
        self._prices: dict[str, list[float]] = {}

    def name(self) -> str:
        return f"Momentum Breakout ({self.lookback})"

    def act(self, market: MarketSnapshot, portfolio: PortfolioState) -> AgentAction:
        symbol = market.symbols.keys()
        if not symbol:
            return AgentAction("hold")
        sym = list(symbol)[0]

        price = market.price(sym)
        if price <= 0:
            return AgentAction("hold")

        if sym not in self._highs:
            self._highs[sym] = []
            self._lows[sym] = []
            self._prices[sym] = []

        self._prices[sym].append(price)
        ohlc = market.ohlc(sym)
        if ohlc:
            self._highs[sym].append(ohlc.high)
            self._lows[sym].append(ohlc.low)

        prices = self._prices[sym]
        if len(prices) < self.lookback:
            return AgentAction("hold")

        highest_high = max(self._highs[sym][-self.lookback:]) if self._highs[sym] else price
        lowest_low = min(self._lows[sym][-self.lookback:]) if self._lows[sym] else price

        if not portfolio.has_position(sym) and price >= highest_high * self.breakout_multiplier:
            qty = max(1, int(portfolio.cash * 0.2 // price))
            return AgentAction("buy", sym, qty, 0.65, f"Breakout above {highest_high:.2f}")
        elif portfolio.has_position(sym) and price <= lowest_low:
            qty = portfolio.position_qty(sym)
            return AgentAction("sell", sym, qty, 0.65, f"Breakdown below {lowest_low:.2f}")

        return AgentAction("hold")

    def reset(self):
        self._highs.clear()
        self._lows.clear()
        self._prices.clear()
