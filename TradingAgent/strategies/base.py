from abc import ABC, abstractmethod
from core.market import MarketSnapshot
from core.portfolio import PortfolioState
from core.actions import AgentAction


class BaseStrategy(ABC):
    @abstractmethod
    def name(self) -> str:
        ...

    @abstractmethod
    def act(self, market: MarketSnapshot, portfolio: PortfolioState) -> AgentAction:
        ...

    def confidence(self, market: MarketSnapshot, portfolio: PortfolioState) -> float:
        return 0.5

    def reset(self):
        pass
