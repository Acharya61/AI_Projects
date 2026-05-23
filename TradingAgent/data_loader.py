"""
Data loader — loads historical price data from CSV or generates synthetic data.
"""

import csv
import random
import math
from pathlib import Path


def load_csv(filepath: str) -> list[dict]:
    rows = []
    with open(filepath, newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append({
                "time": float(row.get("time", 0)),
                "open": float(row.get("open", 0)),
                "high": float(row.get("high", 0)),
                "low": float(row.get("low", 0)),
                "close": float(row.get("close", 0)),
                "volume": int(float(row.get("volume", 0))),
            })
    return rows


def generate_synthetic(bars: int = 500, base_price: float = 150.0,
                       volatility: float = 0.02, seed: int = 42) -> list[dict]:
    rng = random.Random(seed)
    data = []
    price = base_price
    t = int(__import__("time").time()) - bars * 60

    for i in range(bars):
        change = price * volatility * (2 * rng.random() - 1 + 0.0002)
        open_p = price
        close = price + change
        high = max(open_p, close) * (1 + abs(rng.gauss(0, 0.003)))
        low = min(open_p, close) * (1 - abs(rng.gauss(0, 0.003)))
        vol = int(rng.random() * 2000000 + 200000)

        data.append({
            "time": t + i * 60,
            "open": round(open_p, 2),
            "high": round(high, 2),
            "low": round(low, 2),
            "close": round(close, 2),
            "volume": vol,
        })
        price = close

    return data


def add_features(data: list[dict]) -> list[dict]:
    """Add technical indicator features to price data."""
    closes = [d["close"] for d in data]

    for i, d in enumerate(data):
        # SMA 5
        if i >= 4:
            d["sma5"] = round(sum(closes[i-4:i+1]) / 5, 2)
        else:
            d["sma5"] = None

        # SMA 20
        if i >= 19:
            d["sma20"] = round(sum(closes[i-19:i+1]) / 20, 2)
        else:
            d["sma20"] = None

        # RSI 14
        if i >= 14:
            gains = [max(closes[j] - closes[j-1], 0) for j in range(i-13, i+1)]
            losses = [max(closes[j-1] - closes[j], 0) for j in range(i-13, i+1)]
            avg_gain = sum(gains) / 14
            avg_loss = sum(losses) / 14
            if avg_loss == 0:
                d["rsi14"] = 100.0
            else:
                rs = avg_gain / avg_loss
                d["rsi14"] = round(100 - 100 / (1 + rs), 2)
        else:
            d["rsi14"] = None

        # Price change %
        if i > 0:
            d["change_pct"] = round((closes[i] - closes[i-1]) / closes[i-1] * 100, 3)
        else:
            d["change_pct"] = 0.0

    return data
