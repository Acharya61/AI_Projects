from __future__ import annotations


class TechnicalAnalyzer:
    @staticmethod
    def sma(prices: list[float], period: int) -> list[float | None]:
        result: list[float | None] = []
        for i in range(len(prices)):
            if i < period - 1:
                result.append(None)
            else:
                result.append(sum(prices[i - period + 1:i + 1]) / period)
        return result

    @staticmethod
    def ema(prices: list[float], period: int) -> list[float | None]:
        result: list[float | None] = []
        multiplier = 2 / (period + 1)
        for i in range(len(prices)):
            if i < period - 1:
                result.append(None)
            elif i == period - 1:
                result.append(sum(prices[:i + 1]) / period)
            else:
                prev = result[-1]
                result.append((prices[i] - prev) * multiplier + prev)
        return result

    @staticmethod
    def rsi(prices: list[float], period: int = 14) -> list[float | None]:
        result: list[float | None] = []
        for i in range(len(prices)):
            if i < period:
                result.append(None)
            else:
                gains = []
                losses = []
                for j in range(i - period, i):
                    diff = prices[j + 1] - prices[j]
                    gains.append(max(diff, 0))
                    losses.append(max(-diff, 0))
                avg_gain = sum(gains) / period
                avg_loss = sum(losses) / period
                if avg_loss == 0:
                    result.append(100.0)
                else:
                    rs = avg_gain / avg_loss
                    result.append(100 - 100 / (1 + rs))
        return result

    @staticmethod
    def macd(
        prices: list[float],
        fast: int = 12,
        slow: int = 26,
        signal: int = 9,
    ) -> tuple[list[float | None], list[float | None], list[float | None]]:
        ema_fast = TechnicalAnalyzer.ema(prices, fast)
        ema_slow = TechnicalAnalyzer.ema(prices, slow)
        macd_line: list[float | None] = []
        for i in range(len(prices)):
            if ema_fast[i] is not None and ema_slow[i] is not None:
                macd_line.append(ema_fast[i] - ema_slow[i])
            else:
                macd_line.append(None)
        signal_line = TechnicalAnalyzer.ema([m for m in macd_line if m is not None], signal)
        sig_idx = 0
        histogram: list[float | None] = []
        for i in range(len(macd_line)):
            if macd_line[i] is not None and sig_idx < len(signal_line) and signal_line[sig_idx] is not None:
                histogram.append(macd_line[i] - signal_line[sig_idx])
                sig_idx += 1
            else:
                histogram.append(None)
        return macd_line, [None] * (len(prices) - len(signal_line)) + signal_line, histogram

    @staticmethod
    def bollinger(
        prices: list[float], period: int = 20, std_mult: float = 2.0
    ) -> tuple[list[float | None], list[float | None], list[float | None]]:
        sma = TechnicalAnalyzer.sma(prices, period)
        upper: list[float | None] = []
        lower: list[float | None] = []
        for i in range(len(prices)):
            if sma[i] is None or i < period - 1:
                upper.append(None)
                lower.append(None)
            else:
                window = prices[i - period + 1:i + 1]
                variance = sum((p - sma[i]) ** 2 for p in window) / period
                std = variance ** 0.5
                upper.append(sma[i] + std_mult * std)
                lower.append(sma[i] - std_mult * std)
        return upper, [s if s is not None else None for s in sma], lower

    @staticmethod
    def atr(
        high: list[float], low: list[float], close: list[float], period: int = 14
    ) -> list[float | None]:
        result: list[float | None] = []
        for i in range(len(close)):
            if i == 0:
                result.append(None)
            else:
                tr = max(
                    high[i] - low[i],
                    abs(high[i] - close[i - 1]),
                    abs(low[i] - close[i - 1]),
                )
                if i < period:
                    result.append(None)
                elif i == period:
                    vals = [max(high[j] - low[j], abs(high[j] - close[j - 1]), abs(low[j] - close[j - 1])) for j in range(1, period + 1)]
                    result.append(sum(vals) / period)
                else:
                    prev = result[-1]
                    result.append((prev * (period - 1) + tr) / period)
        return result
