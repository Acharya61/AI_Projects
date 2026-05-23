from __future__ import annotations
import math


class RiskAnalyzer:
    @staticmethod
    def kelly_fraction(win_rate: float, avg_win: float, avg_loss: float) -> float:
        if avg_loss == 0:
            return 0.0
        if avg_win == 0:
            return 0.0
        fraction = win_rate / abs(avg_loss) - (1 - win_rate) / abs(avg_win)
        return max(0.0, min(fraction, 0.25))

    @staticmethod
    def volatility(prices: list[float], period: int = 20) -> float:
        if len(prices) < 2:
            return 0.02
        returns = [(prices[i] - prices[i - 1]) / prices[i - 1] for i in range(1, len(prices))]
        recent = returns[-period:] if len(returns) > period else returns
        if not recent:
            return 0.02
        mean = sum(recent) / len(recent)
        variance = sum((r - mean) ** 2 for r in recent) / len(recent)
        return math.sqrt(variance)

    @staticmethod
    def annualized_volatility(daily_vol: float) -> float:
        return daily_vol * math.sqrt(252)

    @staticmethod
    def sharpe_ratio(returns: list[float], risk_free: float = 0.0) -> float:
        if len(returns) < 2:
            return 0.0
        mean_r = sum(returns) / len(returns)
        excess = [r - risk_free for r in returns]
        variance = sum((r - mean_r) ** 2 for r in excess) / len(excess)
        std = math.sqrt(variance)
        return mean_r / std if std > 0 else 0.0

    @staticmethod
    def max_drawdown(equity_curve: list[float]) -> tuple[float, int, int]:
        if len(equity_curve) < 2:
            return 0.0, 0, 0
        peak = equity_curve[0]
        peak_idx = 0
        max_dd = 0.0
        max_dd_start = 0
        max_dd_end = 0
        for i in range(1, len(equity_curve)):
            if equity_curve[i] > peak:
                peak = equity_curve[i]
                peak_idx = i
            dd = (peak - equity_curve[i]) / peak
            if dd > max_dd:
                max_dd = dd
                max_dd_start = peak_idx
                max_dd_end = i
        return max_dd, max_dd_start, max_dd_end

    @staticmethod
    def var(returns: list[float], confidence: float = 0.95) -> float:
        if not returns:
            return 0.0
        sorted_rets = sorted(returns)
        idx = int((1 - confidence) * len(sorted_rets))
        return sorted_rets[min(idx, len(sorted_rets) - 1)]

    @staticmethod
    def position_size(
        portfolio_equity: float,
        risk_per_trade: float,
        entry_price: float,
        stop_price: float,
    ) -> int:
        risk_per_share = abs(entry_price - stop_price)
        if risk_per_share <= 0:
            return 0
        risk_amount = portfolio_equity * risk_per_trade
        qty = int(risk_amount / risk_per_share)
        return max(0, qty)
