from __future__ import annotations
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any, List


@dataclass
class ProviderInfo:
    id: str
    name: str
    type: str  # "free" | "freemium" | "paid"
    markets: list[str]
    rate_limit: str
    api_key_required: bool
    documentation: str
    notes: str


class DataProvider(ABC):
    @abstractmethod
    def info(self) -> ProviderInfo:
        ...

    @abstractmethod
    def fetch_bars(self, symbol: str, interval: str = "1m", limit: int = 100) -> list[dict[str, Any]]:
        ...

    @abstractmethod
    def fetch_quote(self, symbol: str) -> dict[str, Any]:
        ...


class ProviderRegistry:
    def __init__(self):
        self._providers: dict[str, DataProvider] = {}

    def register(self, provider: DataProvider) -> None:
        self._providers[provider.info().id] = provider

    def get(self, provider_id: str) -> DataProvider | None:
        return self._providers.get(provider_id)

    def all_providers(self) -> list[ProviderInfo]:
        return [p.info() for p in self._providers.values()]

    def provider_ids(self) -> list[str]:
        return list(self._providers.keys())
