from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Callable, Optional
import random
import math
import threading
import time


@dataclass
class OHLCBar:
    time: float
    open: float
    high: float
    low: float
    close: float
    volume: int


@dataclass
class MarketSnapshot:
    timestamp: float
    symbols: dict = field(default_factory=dict)

    def price(self, symbol: str) -> float:
        return self.symbols.get(symbol, {}).get("price", 0.0)

    def ohlc(self, symbol: str) -> Optional[OHLCBar]:
        raw = self.symbols.get(symbol, {})
        if "open" not in raw:
            return None
        return OHLCBar(
            time=raw.get("time", 0),
            open=raw["open"],
            high=raw["high"],
            low=raw["low"],
            close=raw["close"],
            volume=raw.get("volume", 0),
        )


class DataSource(ABC):
    @abstractmethod
    def fetch_snapshot(self, symbols: list[str]) -> MarketSnapshot:
        ...

    @abstractmethod
    def fetch_history(self, symbol: str, bars: int = 100) -> list[OHLCBar]:
        ...


_SYMBOLS = [
    "AAPL", "GOOGL", "MSFT", "AMZN", "TSLA",
    "META", "NVDA", "JPM", "V", "JNJ",
]

_BASE_PRICES = {
    "AAPL": 198.50, "GOOGL": 176.30, "MSFT": 425.10,
    "AMZN": 186.70, "TSLA": 248.50, "META": 512.40,
    "NVDA": 880.20, "JPM": 198.60, "V": 285.30, "JNJ": 156.80,
}


class SyntheticDataSource(DataSource):
    def __init__(self):
        self._seed = 42
        self._tick_counter = 0
        self._price_states: dict[str, dict] = {}
        self._ohlc_histories: dict[str, list[OHLCBar]] = {}
        self._listeners: list[Callable[[MarketSnapshot], None]] = []
        self._running = False
        self._thread: Optional[threading.Thread] = None

    def _seeded_random(self, seed: int) -> float:
        x = math.sin(seed * 9301 + 49297) * 49297
        return x - math.floor(x)

    def _normal_random(self, seed: int) -> float:
        u1 = self._seeded_random(seed)
        u2 = self._seeded_random(seed + 1)
        return math.sqrt(-2 * math.log(u1 + 0.0001)) * math.cos(2 * math.pi * (u2 + 0.0001))

    def _init_symbol(self, symbol: str, idx: int):
        base = _BASE_PRICES.get(symbol, 100)
        s = idx * 1000
        price = base + self._normal_random(s) * base * 0.02
        self._price_states[symbol] = {
            "price": price,
            "prev_close": base,
            "high": max(price, base * 1.02),
            "low": min(price, base * 0.98),
            "open": base + self._normal_random(s + 2) * base * 0.01,
        }

    def _generate_history(self, symbol: str, bars: int = 100) -> list[OHLCBar]:
        base = _BASE_PRICES.get(symbol, 100)
        price = base
        now = time.time()
        history = []
        for i in range(bars):
            t = now - (bars - i) * 60
            vol = base * 0.005
            change = self._normal_random(i * 7) * vol
            open_p = price
            close = price + change
            high = max(open_p, close) + abs(self._normal_random(i * 7 + 1) * vol * 0.5)
            low = min(open_p, close) - abs(self._normal_random(i * 7 + 2) * vol * 0.5)
            volume = int(abs(self._normal_random(i * 7 + 3)) * 2000000 + 300000)
            history.append(OHLCBar(t, round(open_p, 2), round(high, 2), round(low, 2), round(close, 2), volume))
            price = close
        return history

    def fetch_snapshot(self, symbols: list[str] | None = None) -> MarketSnapshot:
        if symbols is None:
            symbols = _SYMBOLS
        if not self._price_states:
            for idx, sym in enumerate(_SYMBOLS):
                self._init_symbol(sym, idx)
                self._ohlc_histories[sym] = self._generate_history(sym)

        self._tick_counter += 1
        data = {}
        for sym in symbols:
            if sym not in self._price_states:
                continue
            state = self._price_states[sym]
            vol = state["price"] * 0.002
            drift = 0.0001
            seed = self._tick_counter * 13 + ord(sym[0]) * 100
            change_pct = drift + self._normal_random(seed) * vol / state["price"]
            new_price = state["price"] * (1 + change_pct)
            state["high"] = max(state["high"], new_price)
            state["low"] = min(state["low"], new_price)
            volume = int(abs(self._normal_random(seed + 10)) * 200000 + 10000)
            state["price"] = new_price

            data[sym] = {
                "price": round(new_price, 2),
                "close": round(new_price, 2),
                "open": round(state["open"], 2),
                "high": round(state["high"], 2),
                "low": round(state["low"], 2),
                "change": round(new_price - state["prev_close"], 2),
                "change_percent": round((new_price - state["prev_close"]) / state["prev_close"] * 100, 2),
                "volume": volume,
                "time": time.time(),
            }

            if self._tick_counter % 5 == 0:
                ohlc_vol = state["price"] * 0.003
                s = self._tick_counter * 17
                o_open = state["price"]
                o_close = o_open + self._normal_random(s) * ohlc_vol
                o_high = max(o_open, o_close) + abs(self._normal_random(s + 1)) * ohlc_vol * 0.3
                o_low = min(o_open, o_close) - abs(self._normal_random(s + 2)) * ohlc_vol * 0.3
                o_vol = int(abs(self._normal_random(s + 3)) * 500000 + 50000)
                bar = OHLCBar(
                    time=time.time(),
                    open=round(o_open, 2),
                    high=round(o_high, 2),
                    low=round(o_low, 2),
                    close=round(o_close, 2),
                    volume=o_vol,
                )
                if sym not in self._ohlc_histories:
                    self._ohlc_histories[sym] = []
                self._ohlc_histories[sym].append(bar)

        snap = MarketSnapshot(timestamp=time.time(), symbols=data)
        return snap

    def fetch_history(self, symbol: str, bars: int = 100) -> list[OHLCBar]:
        if symbol not in self._ohlc_histories:
            self._ohlc_histories[symbol] = self._generate_history(symbol)
        return self._ohlc_histories[symbol][-bars:]

    def subscribe(self, callback: Callable[[MarketSnapshot], None]):
        self._listeners.append(callback)

    def start_streaming(self, interval: float = 1.0):
        if self._running:
            return
        self._running = True

        def _loop():
            while self._running:
                snap = self.fetch_snapshot()
                for cb in self._listeners:
                    cb(snap)
                time.sleep(interval)

        self._thread = threading.Thread(target=_loop, daemon=True)
        self._thread.start()

    def stop_streaming(self):
        self._running = False
