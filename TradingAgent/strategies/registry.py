from typing import Optional
from .base import BaseStrategy


class StrategyRegistry:
    def __init__(self):
        self._strategies: dict[str, BaseStrategy] = {}

    def register(self, name: str, strategy: BaseStrategy):
        self._strategies[name] = strategy

    def get(self, name: str) -> Optional[BaseStrategy]:
        return self._strategies.get(name)

    def get_all(self) -> dict[str, BaseStrategy]:
        return dict(self._strategies)

    def names(self) -> list[str]:
        return list(self._strategies.keys())

    def remove(self, name: str):
        self._strategies.pop(name, None)

    def clear(self):
        self._strategies.clear()

    def __len__(self) -> int:
        return len(self._strategies)
