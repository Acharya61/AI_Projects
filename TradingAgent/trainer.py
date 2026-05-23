"""
Trainer — trains strategies using the new multi-stock framework.
"""

import time
from pathlib import Path

from core.market import SyntheticDataSource, MarketSnapshot
from core.portfolio import PortfolioState, RiskManager
from core.decision import StockScorer, DecisionEngine
from core.agent import TradingAgent
from strategies import (
    SMAStrategy, RSIStrategy, MomentumStrategy, EnsembleStrategy,
    StrategyRegistry,
)
from analyzers import Predictor, PredictionTracker, MultiStockScanner
from data_loader import generate_synthetic, add_features


def train_session(
    episodes: int = 50,
    initial_cash: float = 100000.0,
    symbol: str = "AAPL",
    verbose: bool = True,
):
    registry = StrategyRegistry()
    registry.register("sma", SMAStrategy(5, 20))
    registry.register("rsi", RSIStrategy(14, 30, 70))
    registry.register("momentum", MomentumStrategy(10))
    ensemble = EnsembleStrategy(registry, weights={"sma": 1.0, "rsi": 1.0, "momentum": 1.0})
    registry.register("ensemble", ensemble)

    tracker = PredictionTracker()
    predictor = Predictor(registry, tracker)
    scorer = StockScorer(tracker.data)
    scanner = MultiStockScanner(scorer)
    decision = DecisionEngine(registry, scorer)

    raw_data = generate_synthetic(1000, base_price=150.0)
    data = add_features(raw_data)
    if verbose:
        print(f"Generated {len(data)} bars with features")

    for ep in range(episodes):
        agent = TradingAgent(decision, tracked_symbols=[symbol])
        agent.reset(initial_cash)
        agent.running = True
        prev_equity = initial_cash

        for bar in data:
            snap = MarketSnapshot(timestamp=bar["time"], symbols={
                symbol: {
                    "price": bar["close"],
                    "close": bar["close"],
                    "open": bar["open"],
                    "high": bar["high"],
                    "low": bar["low"],
                    "volume": bar["volume"],
                    "time": bar["time"],
                }
            })
            actions = agent.on_tick(snap)
            equity = agent.equity({symbol: bar["close"]})
            reward = equity - prev_equity
            prev_equity = equity

            for a in actions:
                if a.action == "sell":
                    for name in ensemble.weights:
                        if reward > 0:
                            ensemble.weights[name] = min(1.0, ensemble.weights.get(name, 0.5) * 1.01)
                        else:
                            ensemble.weights[name] = max(0.01, ensemble.weights.get(name, 0.5) * 0.99)

        if verbose and (ep + 1) % 10 == 0:
            total_pnl = agent.total_pnl
            print(f"Episode {ep + 1}/{episodes} | P&L: ${total_pnl:.2f} | "
                  f"Trades: {len(agent.trades)} | Weights: {ensemble.weights}")

    tracker.save()
    if verbose:
        print(f"\nFinal performance saved to models/strategy_performance.json")
        print(f"Strategy weights: {ensemble.weights}")

    return agent, tracker, registry


def main():
    print("Training AI Trading Agent...")
    agent, tracker, registry = train_session(episodes=50, verbose=True)

    print("\n--- Strategy Performance ---")
    for sname, stocks in tracker.data.items():
        for sym, perf in stocks.items():
            print(f"  {sname} / {sym}: accuracy={perf['accuracy']:.1%}, pnl=${perf['total_pnl']:.2f}")


if __name__ == "__main__":
    main()
