from __future__ import annotations
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class Position:
    symbol: str
    quantity: int
    avg_entry: float = 0.0
    stop_loss: float = 0.0


@dataclass
class PortfolioState:
    cash: float = 100000.0
    positions: dict[str, Position] = field(default_factory=dict)
    initial_cash: float = 100000.0

    def equity(self, prices: dict[str, float]) -> float:
        pos_value = sum(
            p.quantity * prices.get(p.symbol, 0) for p in self.positions.values()
        )
        return self.cash + pos_value

    def has_position(self, symbol: str) -> bool:
        return symbol in self.positions and self.positions[symbol].quantity > 0

    def position_qty(self, symbol: str) -> int:
        return self.positions[symbol].quantity if symbol in self.positions else 0

    def unrealized_pnl(self, symbol: str, current_price: float) -> float:
        if not self.has_position(symbol):
            return 0.0
        pos = self.positions[symbol]
        return (current_price - pos.avg_entry) * pos.quantity

    def total_unrealized_pnl(self, prices: dict[str, float]) -> float:
        return sum(self.unrealized_pnl(sym, prices.get(sym, 0)) for sym in self.positions)

    def total_pnl(self) -> float:
        return self.cash - self.initial_cash

    def reset(self, cash: float = 100000.0):
        self.cash = cash
        self.initial_cash = cash
        self.positions.clear()


class RiskManager:
    def __init__(self, max_risk_per_trade: float = 0.02, max_portfolio_risk: float = 0.1):
        self.max_risk_per_trade = max_risk_per_trade
        self.max_portfolio_risk = max_portfolio_risk

    def kelly_fraction(self, win_rate: float, avg_win: float, avg_loss: float) -> float:
        if avg_loss == 0:
            return 0.25
        kelly = (win_rate / abs(avg_loss)) - ((1 - win_rate) / abs(avg_win)) if avg_win != 0 else 0
        return max(0.0, min(kelly, 0.25))

    def volatility_sizing(
        self,
        portfolio: PortfolioState,
        price: float,
        volatility: float,
        confidence: float,
        portfolio_equity: float,
    ) -> int:
        base_risk = portfolio_equity * self.max_risk_per_trade
        vol_adjusted = base_risk / (volatility * price) if volatility > 0 else base_risk / price
        confidence_scaled = vol_adjusted * confidence
        position_value = min(confidence_scaled * price, portfolio.cash * 0.3)
        qty = int(position_value // price)
        return max(0, qty)

    def kelly_sizing(
        self,
        portfolio: PortfolioState,
        price: float,
        win_rate: float,
        avg_win: float,
        avg_loss: float,
        portfolio_equity: float,
    ) -> int:
        fraction = self.kelly_fraction(win_rate, avg_win, avg_loss)
        alloc = portfolio_equity * fraction * 0.5
        qty = int(alloc // price)
        max_by_cash = int(portfolio.cash * 0.3 // price)
        return max(0, min(qty, max_by_cash))

    def atr_stop_price(self, entry_price: float, atr: float, multiplier: float = 2.0) -> float:
        return entry_price - (atr * multiplier)
