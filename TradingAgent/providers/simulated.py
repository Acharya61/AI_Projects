import random
import time
from typing import Any
from .base import DataProvider, ProviderInfo


class SimulatedProvider(DataProvider):
    def info(self) -> ProviderInfo:
        return ProviderInfo(
            id="simulated",
            name="Simulated (Local)",
            type="free",
            markets=["stock", "futures", "forex", "crypto"],
            rate_limit="Unlimited",
            api_key_required=False,
            documentation="",
            notes="Built-in data generator. No API needed.",
        )

    def fetch_bars(self, symbol: str, interval: str = "1m", limit: int = 100) -> list[dict[str, Any]]:
        bars = []
        price = 150.0
        t = int(time.time()) - limit * 60
        vol = 500000
        for i in range(limit):
            change = price * 0.02 * (2 * random.random() - 1 + 0.0002)
            o = price
            c = price + change
            h = max(o, c) * (1 + abs(random.gauss(0, 0.003)))
            l = min(o, c) * (1 - abs(random.gauss(0, 0.003)))
            bars.append({
                "time": t + i * 60,
                "open": round(o, 2),
                "high": round(h, 2),
                "low": round(l, 2),
                "close": round(c, 2),
                "volume": int(vol + random.random() * 200000),
            })
            price = c
        return bars

    def fetch_quote(self, symbol: str) -> dict[str, Any]:
        return {
            "symbol": symbol,
            "price": round(100 + random.random() * 400, 2),
            "change": round(random.gauss(0, 2), 2),
            "change_pct": round(random.gauss(0, 1), 2),
            "volume": int(random.random() * 5000000),
            "timestamp": int(time.time()),
        }
