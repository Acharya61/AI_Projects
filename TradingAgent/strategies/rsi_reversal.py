from .base import BaseStrategy
from core.market import MarketSnapshot
from core.portfolio import PortfolioState
from core.actions import AgentAction


class RSIStrategy(BaseStrategy):
    def __init__(self, period: int = 14, oversold: float = 30, overbought: float = 70):
        self.period = period
        self.oversold = oversold
        self.overbought = overbought
        self._prices: dict[str, list[float]] = {}
        self._prev_rsi: dict[str, float] = {}

    def name(self) -> str:
        return f"RSI Reversal ({self.period})"

    def _prices_for(self, symbol: str, market: MarketSnapshot) -> list[float]:
        if symbol not in self._prices:
            self._prices[symbol] = []
        prices = self._prices[symbol]
        price = market.price(symbol)
        if price > 0 and (not prices or prices[-1] != price):
            prices.append(price)
        return prices

    def _calc_rsi(self, prices: list[float]) -> float:
        if len(prices) < self.period + 1:
            return 50.0
        recent = prices[-(self.period + 1):]
        gains = []
        losses = []
        for i in range(1, len(recent)):
            diff = recent[i] - recent[i - 1]
            gains.append(max(diff, 0))
            losses.append(max(-diff, 0))
        avg_gain = sum(gains) / self.period
        avg_loss = sum(losses) / self.period
        if avg_loss == 0:
            return 100.0
        rs = avg_gain / avg_loss
        return 100 - 100 / (1 + rs)

    def act(self, market: MarketSnapshot, portfolio: PortfolioState) -> AgentAction:
        symbol = market.symbols.keys()
        if not symbol:
            return AgentAction("hold")
        sym = list(symbol)[0]

        prices = self._prices_for(sym, market)
        if len(prices) < self.period + 1:
            return AgentAction("hold")

        rsi = self._calc_rsi(prices)
        prev_rsi = self._prev_rsi.get(sym, 50)
        self._prev_rsi[sym] = rsi

        if not portfolio.has_position(sym) and rsi < self.oversold and rsi > prev_rsi:
            price = market.price(sym)
            qty = max(1, int(portfolio.cash * 0.15 // price))
            return AgentAction("buy", sym, qty, 0.75, f"RSI oversold reversal ({rsi:.1f})")
        elif portfolio.has_position(sym) and rsi > self.overbought and rsi < prev_rsi:
            qty = portfolio.position_qty(sym)
            return AgentAction("sell", sym, qty, 0.75, f"RSI overbought reversal ({rsi:.1f})")

        return AgentAction("hold")

    def confidence(self, market: MarketSnapshot, portfolio: PortfolioState) -> float:
        symbol = list(market.symbols.keys())[0] if market.symbols else ""
        if not symbol:
            return 0.5
        prices = self._prices.get(symbol, [])
        if len(prices) < self.period + 1:
            return 0.5
        rsi = self._calc_rsi(prices)
        if rsi < self.oversold:
            return 0.8
        elif rsi > self.overbought:
            return 0.8
        return 0.5

    def reset(self):
        self._prices.clear()
        self._prev_rsi.clear()
