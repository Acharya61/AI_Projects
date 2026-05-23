"""
Legacy compatibility wrapper — imports from new strategies structure.
"""
from strategies import SMAStrategy, RSIStrategy, MomentumStrategy
from strategies.base import BaseStrategy
from core.actions import AgentAction
from core.market import MarketSnapshot as MarketState
from core.portfolio import PortfolioState

RandomStrategy = type("RandomStrategy", (BaseStrategy,), {
    "name": lambda self: "Random",
    "act": lambda self, market, portfolio: (
        AgentAction("buy", 10, 0.5, "Random buy")
        if __import__("random").random() < 0.05 and not portfolio.has_position(list(market.symbols.keys())[0] if market.symbols else "")
        else AgentAction("sell", portfolio.position_qty(list(market.symbols.keys())[0] if market.symbols else ""), 0.5, "Random sell")
        if __import__("random").random() < 0.10 and portfolio.has_position(list(market.symbols.keys())[0] if market.symbols else "")
        else AgentAction("hold")
    ),
})

RuleBasedStrategy = SMAStrategy
QLearningStrategy = type("QLearningStrategy", (BaseStrategy,), {
    "name": lambda self: "Q-Learning (legacy)",
    "act": lambda self, market, portfolio: AgentAction("hold"),
    "reset": lambda self: None,
    "save": lambda self: None,
    "_load": lambda self: None,
})

BaseStrategy = BaseStrategy
