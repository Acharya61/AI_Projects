from dataclasses import dataclass, field, asdict
from typing import Any


@dataclass
class WsMessage:
    type: str
    data: dict = field(default_factory=dict)

    def to_json(self) -> dict:
        return {"type": self.type, **self.data}

    @classmethod
    def from_json(cls, raw: dict) -> "WsMessage":
        msg_type = raw.get("type", "")
        data = {k: v for k, v in raw.items() if k != "type"}
        return cls(type=msg_type, data=data)


MESSAGE_TYPES = {
    "start": "Start the agent with given config",
    "stop": "Stop the agent",
    "reset": "Reset agent portfolio",
    "tick": "Send a price tick to the agent",
    "train": "Train the agent on historical data",
    "get_status": "Request agent status",
    "predict": "Run prediction for a symbol",
    "predict_all": "Run prediction for all tracked symbols",
    "session_start": "Begin a trading session",
    "session_stop": "Stop the current session",
    "session_status": "Get live session status",
    "get_performance": "Get strategy performance data",
    "status": "Agent status update",
    "tick_result": "Result of a tick",
    "train_progress": "Training progress update",
    "train_complete": "Training finished",
    "prediction_result": "Prediction results",
    "session_update": "Live session status update",
    "session_result": "Final session results with retrospective",
    "performance_data": "Strategy performance data",
    "error": "Error message",
}
