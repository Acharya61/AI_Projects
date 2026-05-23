"""
Legacy compatibility wrapper — imports from new core + strategies structure.
"""
from core.market import MarketSnapshot as MarketState
from core.portfolio import PortfolioState
from core.actions import AgentAction
from core.agent import TradingAgent, TradeRecord
from strategies.base import BaseStrategy
