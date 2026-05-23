"""
WebSocket server — connects the multi-stock trading agent to the dashboard.
Run: python server.py
"""

import asyncio
import json
import time
import traceback
import threading

import websockets

from core.market import SyntheticDataSource, MarketSnapshot
from core.portfolio import PortfolioState, RiskManager
from core.decision import StockScorer, DecisionEngine
from core.agent import TradingAgent
from core.session import SessionManager, SessionConfig
from core.protocol import WsMessage
from strategies import (
    SMAStrategy, RSIStrategy, MomentumStrategy, EnsembleStrategy,
    StrategyRegistry,
)
from analyzers import Predictor, PredictionTracker, MultiStockScanner


connected_clients = set()
market_source: SyntheticDataSource = None
registry: StrategyRegistry = None
scorer: StockScorer = None
decision: DecisionEngine = None
agent: TradingAgent = None
predictor: Predictor = None
predict_tracker: PredictionTracker = None
scanner: MultiStockScanner = None
session_mgr: SessionManager = None
risk_mgr: RiskManager = None
last_market: MarketSnapshot = None


def build_default_agent():
    global registry, scorer, decision, agent, predictor, predict_tracker, scanner, session_mgr, risk_mgr, market_source
    market_source = SyntheticDataSource()

    registry = StrategyRegistry()
    registry.register("sma", SMAStrategy(5, 20))
    registry.register("rsi", RSIStrategy(14, 30, 70))
    registry.register("momentum", MomentumStrategy(10))
    ensemble = EnsembleStrategy(registry, weights={"sma": 1.0, "rsi": 1.0, "momentum": 1.0})
    registry.register("ensemble", ensemble)

    predict_tracker = PredictionTracker()
    predictor = Predictor(registry, predict_tracker)
    scorer = StockScorer(predict_tracker.data)
    scanner = MultiStockScanner(scorer)
    decision = DecisionEngine(registry, scorer)
    risk_mgr = RiskManager()

    agent = TradingAgent(decision, risk_mgr, tracked_symbols=["AAPL", "GOOGL", "MSFT"])

    session_mgr = SessionManager(agent, predictor, scanner, predict_tracker, registry)

    return agent


def handle_status_update(status_data: dict):
    if connected_clients:
        msg = json.dumps({"type": "session_update", **status_data})
        websockets.broadcast(connected_clients, msg)


async def handle_message(websocket, message: str):
    global agent, registry, predictor, scanner, session_mgr, last_market

    try:
        raw = json.loads(message)
        msg = WsMessage.from_json(raw)
        msg_type = msg.type

        if msg_type == "start":
            config = msg.data
            symbol = config.get("symbol", "AAPL")
            strategy_name = config.get("strategy", "ensemble")

            new_reg = StrategyRegistry()
            new_reg.register("sma", SMAStrategy(
                config.get("fastPeriod", 5),
                config.get("slowPeriod", 20),
            ))
            new_reg.register("rsi", RSIStrategy(14, 30, 70))
            new_reg.register("momentum", MomentumStrategy(10))
            new_ens = EnsembleStrategy(new_reg, weights={"sma": 1.0, "rsi": 1.0, "momentum": 1.0})
            new_reg.register("ensemble", new_ens)

            new_tracker = PredictionTracker()
            new_predictor = Predictor(new_reg, new_tracker)
            new_scorer = StockScorer(new_tracker.data)
            new_scanner = MultiStockScanner(new_scorer)
            new_decision = DecisionEngine(new_reg, new_scorer)

            new_agent = TradingAgent(new_decision, risk_mgr, tracked_symbols=[symbol])
            new_agent.running = True

            globals().update({
                "registry": new_reg,
                "predict_tracker": new_tracker,
                "predictor": new_predictor,
                "scorer": new_scorer,
                "scanner": new_scanner,
                "decision": new_decision,
                "agent": new_agent,
            })
            session_mgr = SessionManager(new_agent, new_predictor, new_scanner, new_tracker, new_reg)

            await websocket.send(json.dumps({
                "type": "status",
                "agent": new_agent.to_dict(),
                "strategies": new_reg.names(),
            }))

        elif msg_type == "stop":
            if agent:
                agent.running = False
            await websocket.send(json.dumps({
                "type": "status",
                "agent": agent.to_dict() if agent else {},
            }))

        elif msg_type == "reset":
            if agent:
                cash = msg.data.get("cash", 100000.0)
                agent.reset(cash)
            await websocket.send(json.dumps({
                "type": "status",
                "agent": agent.to_dict() if agent else {},
            }))

        elif msg_type == "tick":
            if agent and agent.running and last_market:
                actions = agent.on_tick(last_market)
                agent_dict = agent.to_dict()
            else:
                actions = []
                agent_dict = agent.to_dict() if agent else {}
            await websocket.send(json.dumps({
                "type": "tick_result",
                "actions": [a.__dict__ for a in actions] if actions else [],
                "agent": agent_dict,
            }))

        elif msg_type == "train":
            episodes = msg.data.get("episodes", 50)
            symbol = msg.data.get("symbol", "AAPL")

            from data_loader import generate_synthetic, add_features
            raw_data = generate_synthetic(1000, seed=hash(time.time()) % 10000)
            train_data = add_features(raw_data)

            for ep in range(episodes):
                agent.reset(100000.0)
                agent.tracked_symbols = [symbol]
                agent.running = True
                prev_equity = 100000.0

                for bar in train_data:
                    snap = MarketSnapshot(timestamp=bar["time"], symbols={
                        symbol: {
                            "price": bar["close"],
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
                            ensemble = registry.get("ensemble")
                            if ensemble:
                                for name in ensemble.weights:
                                    if reward > 0:
                                        ensemble.weights[name] = min(1.0, ensemble.weights.get(name, 0.5) * 1.01)
                                    else:
                                        ensemble.weights[name] = max(0.01, ensemble.weights.get(name, 0.5) * 0.99)

                if (ep + 1) % 10 == 0:
                    total_pnl = agent.portfolio.total_pnl()
                    await websocket.send(json.dumps({
                        "type": "train_progress",
                        "episode": ep + 1,
                        "total": episodes,
                        "total_pnl": round(total_pnl, 2),
                    }))

            await websocket.send(json.dumps({
                "type": "train_complete",
                "episodes": episodes,
                "total_pnl": round(agent.total_pnl, 2),
            }))

        elif msg_type == "predict":
            symbol = msg.data.get("symbol", "AAPL")
            horizon_ticks = msg.data.get("horizon_ticks", 10)
            horizon_bars = msg.data.get("horizon_bars", 5)

            if not last_market:
                await websocket.send(json.dumps({
                    "type": "prediction_result",
                    "symbol": symbol,
                    "predictions": {},
                }))
                return

            predictions = predictor.predict(symbol, last_market, horizon_ticks, horizon_bars)
            await websocket.send(json.dumps({
                "type": "prediction_result",
                "symbol": symbol,
                "predictions": predictions,
            }))

        elif msg_type == "predict_all":
            horizon_ticks = msg.data.get("horizon_ticks", 10)
            horizon_bars = msg.data.get("horizon_bars", 5)

            if last_market:
                predictions = predictor.predict_all(
                    last_market,
                    list(last_market.symbols.keys()),
                    horizon_ticks,
                    horizon_bars,
                )
            else:
                predictions = {}

            await websocket.send(json.dumps({
                "type": "prediction_result",
                "predictions": predictions,
            }))

        elif msg_type == "session_start":
            pre_session = msg.data.get("pre_session_time", 300.0)
            config = SessionConfig(
                duration=msg.data.get("duration", 600.0),
                max_stocks=msg.data.get("max_stocks", 3),
                initial_cash=msg.data.get("initial_cash", 100000.0),
                prediction_horizon_ticks=msg.data.get("horizon_ticks", 10),
                prediction_horizon_bars=msg.data.get("horizon_bars", 5),
            )

            if last_market:
                session_mgr.start(config, last_market)
                session_mgr.on_status(handle_status_update)
                await websocket.send(json.dumps({
                    "type": "session_update",
                    "status": "started",
                    "phase": "pre_session",
                    "pre_session_time": pre_session,
                    "symbols": session_mgr.selected_symbols,
                    "config": {
                        "duration": config.duration,
                        "max_stocks": config.max_stocks,
                        "initial_cash": config.initial_cash,
                        "pre_session_time": pre_session,
                    },
                }))
            else:
                await websocket.send(json.dumps({
                    "type": "error",
                    "message": "No market data available",
                }))

        elif msg_type == "session_stop":
            if session_mgr and session_mgr.active:
                result = session_mgr.end()
                if result:
                    await websocket.send(json.dumps({
                        "type": "session_result",
                        "total_pnl": result.total_pnl,
                        "total_trades": result.total_trades,
                        "winning_trades": result.winning_trades,
                        "losing_trades": result.losing_trades,
                        "win_rate": result.win_rate,
                        "reward": result.reward,
                        "punishment": result.punishment,
                        "retrospective": result.retrospective,
                        "strategy_scores": result.strategy_scores,
                        "trades": [
                            {"symbol": t.symbol, "side": t.side, "quantity": t.quantity,
                             "entry_price": t.entry_price, "exit_price": t.exit_price,
                             "pnl": t.pnl}
                            for t in result.trades
                        ],
                    }))
            else:
                await websocket.send(json.dumps({
                    "type": "error",
                    "message": "No active session",
                }))

        elif msg_type == "session_status":
            if session_mgr and session_mgr.active:
                await websocket.send(json.dumps({
                    "type": "session_update",
                    **session_mgr._build_status(),
                }))
            else:
                await websocket.send(json.dumps({
                    "type": "session_update",
                    "active": False,
                }))

        elif msg_type == "get_performance":
            perf = predict_tracker.get_all_performance() if predict_tracker else {}
            await websocket.send(json.dumps({
                "type": "performance_data",
                "data": perf,
            }))

        elif msg_type == "get_status":
            await websocket.send(json.dumps({
                "type": "status",
                "agent": agent.to_dict() if agent else {},
                "strategies": registry.names() if registry else [],
                "session_active": session_mgr.active if session_mgr else False,
                "tracked_symbols": agent.tracked_symbols if agent else [],
            }))

        elif msg_type == "scan":
            if not last_market or not scanner or not predictor:
                await websocket.send(json.dumps({"type": "scan_result", "scored": [], "predictions": {}}))
                return

            horizon = msg.data.get("horizon_ticks", 10)
            horizon_bars = msg.data.get("horizon_bars", 5)
            count = msg.data.get("count", 5)

            predictions = predictor.predict_all(last_market, list(last_market.symbols.keys()), horizon, horizon_bars)
            scored = scanner.pick_top(last_market, agent.portfolio if agent else None, predictions, count=count)

            await websocket.send(json.dumps({
                "type": "scan_result",
                "scored": [
                    {"symbol": s.symbol, "score": s.score, "confidence": s.confidence,
                     "predicted_return": s.predicted_return, "volatility": s.volatility, "reasons": s.reasons}
                    for s in scored
                ],
                "predictions": {
                    sym: {
                        sname: {
                            "predicted_price_ticks": sp.get("predicted_price_ticks", 0),
                            "predicted_price_bars": sp.get("predicted_price_bars", 0),
                            "expected_return": sp.get("expected_return", 0),
                            "confidence": sp.get("confidence", 0),
                        }
                        for sname, sp in sym_preds.items()
                    }
                    for sym, sym_preds in predictions.items()
                },
                "current_prices": {sym: last_market.price(sym) for sym in last_market.symbols if last_market.price(sym) > 0},
            }))

    except Exception as e:
        traceback.print_exc()
        await websocket.send(json.dumps({
            "type": "error",
            "message": str(e),
        }))


async def handler(websocket):
    connected_clients.add(websocket)
    try:
        async for message in websocket:
            await handle_message(websocket, message)
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        connected_clients.discard(websocket)


def market_loop():
    global last_market, market_source, agent, session_mgr
    while True:
        snap = market_source.fetch_snapshot()
        last_market = snap

        if agent and agent.running:
            agent.on_tick(snap)

        if session_mgr and session_mgr.active:
            session_mgr.tick(snap)

        time.sleep(1)


async def main():
    build_default_agent()

    market_thread = threading.Thread(target=market_loop, daemon=True)
    market_thread.start()

    port = 8765
    print(f"AI Trading Agent WebSocket server starting on ws://localhost:{port}")
    async with websockets.serve(handler, "localhost", port):
        await asyncio.Future()


if __name__ == "__main__":
    print("=" * 50)
    print("  AI TRADING AGENT SERVER v2")
    print("  Multi-stock | Sessions | Predictions")
    print("  Connect dashboard at ws://localhost:8765")
    print("=" * 50)
    asyncio.run(main())
