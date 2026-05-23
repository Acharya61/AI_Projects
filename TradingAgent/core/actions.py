from __future__ import annotations
from dataclasses import dataclass, field


@dataclass
class AgentAction:
    action: str  # 'buy' | 'sell' | 'hold'
    symbol: str = ""
    quantity: int = 0
    confidence: float = 0.0
    reason: str = ""
    expected_return: float = 0.0
