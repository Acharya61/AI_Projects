from __future__ import annotations
import json
import os
import math
import random
from pathlib import Path
from typing import Optional

from core.market import MarketSnapshot, OHLCBar
from strategies.registry import StrategyRegistry


MODELS_DIR = Path(__file__).parent.parent / "models"


class PredictionTracker:
    def __init__(self, filepath: Optional[Path] = None):
        self.filepath = filepath or MODELS_DIR / "strategy_performance.json"
        self.data: dict[str, dict[str, dict]] = {}
        self._load()

    def _load(self):
        if self.filepath and self.filepath.exists():
            try:
                with open(self.filepath) as f:
                    self.data = json.load(f)
            except (json.JSONDecodeError, IOError):
                self.data = {}

    def save(self):
        if self.filepath:
            self.filepath.parent.mkdir(parents=True, exist_ok=True)
            with open(self.filepath, "w") as f:
                json.dump(self.data, f, indent=2)

    _lasts: dict[str, float] = {}

    def _last_price(self, symbol: str) -> float:
        return self._lasts.get(symbol, 0.0)

    def _set_last(self, symbol: str, price: float):
        self._lasts[symbol] = price

    def record_prediction(
        self,
        strategy_name: str,
        symbol: str,
        predicted_price: float,
        actual_price: float,
        pnl: float = 0.0,
    ):
        if strategy_name not in self.data:
            self.data[strategy_name] = {}
        if symbol not in self.data[strategy_name]:
            self.data[strategy_name][symbol] = {
                "predictions": 0,
                "correct": 0,
                "accuracy": 0.5,
                "pnl": 0.0,
                "total_pnl": 0.0,
                "avg_return": 0.0,
            }

        perf = self.data[strategy_name][symbol]

        prev_price = self._last_price(symbol)
        if prev_price > 0:
            perf["predictions"] += 1
            predicted_direction = "up" if predicted_price > prev_price else "down"
            actual_direction = "up" if actual_price > prev_price else "down"
            correct = predicted_direction == actual_direction
            if correct:
                perf["correct"] += 1
            perf["accuracy"] = perf["correct"] / max(perf["predictions"], 1)

        perf["pnl"] = pnl
        perf["total_pnl"] += pnl
        perf["avg_return"] = (perf["total_pnl"] / max(perf["predictions"], 1))

        self._set_last(symbol, actual_price)
        self.save()

    def accuracy(self, strategy_name: str, symbol: str) -> float:
        return self.data.get(strategy_name, {}).get(symbol, {}).get("accuracy", 0.5)

    def pnl(self, strategy_name: str, symbol: str) -> float:
        return self.data.get(strategy_name, {}).get(symbol, {}).get("pnl", 0.0)

    def total_pnl(self, strategy_name: str, symbol: str) -> float:
        return self.data.get(strategy_name, {}).get(symbol, {}).get("total_pnl", 0.0)

    def best_strategy(self, symbol: str) -> tuple[str, float]:
        best_name = ""
        best_score = -float("inf")
        for sname, stocks in self.data.items():
            if symbol in stocks:
                acc = stocks[symbol].get("accuracy", 0.5)
                pnl = stocks[symbol].get("total_pnl", 0)
                score = acc * 0.6 + (1 / (1 + abs(pnl))) * 0.4 if pnl <= 0 else acc * 0.6 + min(pnl / 1000, 1) * 0.4
                if score > best_score:
                    best_score = score
                    best_name = sname
        return best_name, best_score

    def get_all_performance(self) -> dict:
        return self.data


class Predictor:
    def __init__(self, registry: StrategyRegistry, tracker: PredictionTracker):
        self.registry = registry
        self.tracker = tracker

    def predict(
        self,
        symbol: str,
        market: MarketSnapshot,
        horizon_ticks: int = 10,
        horizon_bars: int = 5,
    ) -> dict[str, dict]:
        price = market.price(symbol)
        hist = market.ohlc(symbol)
        close_price = hist.close if hist else price

        results = {}
        for name, strategy in self.registry.get_all().items():
            if name == "ensemble":
                continue
            hist_acc = self.tracker.accuracy(name, symbol)

            volatility = 0.02
            direction = 2 * random.random() - 1
            tick_change = price * volatility * direction
            tick_pred = price + tick_change * horizon_ticks * 0.5

            bar_direction = 2 * random.random() - 1
            bar_change = close_price * volatility * bar_direction
            bar_pred = close_price + bar_change * horizon_bars * 0.3

            expected_return = ((tick_pred - price) / price) * 0.5 + ((bar_pred - close_price) / close_price) * 0.5

            confidence = max(0.1, min(0.95, hist_acc))

            results[name] = {
                "predicted_price_ticks": round(tick_pred, 2),
                "predicted_price_bars": round(bar_pred, 2),
                "expected_return": round(expected_return, 4),
                "confidence": round(confidence, 4),
                "accuracy": round(hist_acc, 4),
            }

        return results

    def predict_all(
        self,
        market: MarketSnapshot,
        symbols: list[str],
        horizon_ticks: int = 10,
        horizon_bars: int = 5,
    ) -> dict[str, dict[str, dict]]:
        return {
            sym: self.predict(sym, market, horizon_ticks, horizon_bars)
            for sym in symbols if sym in market.symbols
        }

    def track_outcome(
        self,
        strategy_name: str,
        symbol: str,
        predicted: float,
        actual: float,
        pnl: float = 0.0,
    ):
        self.tracker.record_prediction(strategy_name, symbol, predicted, actual, pnl)
