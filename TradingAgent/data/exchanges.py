from dataclasses import dataclass
from datetime import datetime, timezone, timedelta
from typing import Literal

MarketType = Literal["stock", "futures", "forex", "crypto"]


@dataclass
class Exchange:
    mic: str
    name: str
    country: str
    country_code: str
    currency: str
    timezone: str
    open_time: str
    close_time: str
    type: MarketType


EXCHANGES: list[Exchange] = [
    Exchange("XNYS", "New York Stock Exchange", "United States", "US", "USD", "America/New_York", "09:30", "16:00", "stock"),
    Exchange("XNAS", "NASDAQ", "United States", "US", "USD", "America/New_York", "09:30", "16:00", "stock"),
    Exchange("XLON", "London Stock Exchange", "United Kingdom", "GB", "GBP", "Europe/London", "08:00", "16:30", "stock"),
    Exchange("XTKS", "Tokyo Stock Exchange", "Japan", "JP", "JPY", "Asia/Tokyo", "09:00", "15:00", "stock"),
    Exchange("XHKG", "Hong Kong Exchange", "Hong Kong", "HK", "HKD", "Asia/Hong_Kong", "09:30", "16:00", "stock"),
    Exchange("XNSE", "National Stock Exchange of India", "India", "IN", "INR", "Asia/Kolkata", "09:15", "15:30", "stock"),
    Exchange("XPAR", "Euronext Paris", "France", "FR", "EUR", "Europe/Paris", "09:00", "17:30", "stock"),
    Exchange("XETR", "Deutsche Börse", "Germany", "DE", "EUR", "Europe/Berlin", "09:00", "17:30", "stock"),
    Exchange("CME", "Chicago Mercantile Exchange", "United States", "US", "USD", "America/Chicago", "17:00", "16:00", "futures"),
    Exchange("FX", "Forex Market", "Global", "XX", "USD", "UTC", "00:00", "24:00", "forex"),
    Exchange("BINANCE", "Binance", "Global", "XX", "USDT", "UTC", "00:00", "24:00", "crypto"),
]


def get_exchange(mic: str) -> Exchange | None:
    for ex in EXCHANGES:
        if ex.mic == mic:
            return ex
    return None


def is_exchange_open(exchange: Exchange) -> bool:
    now = datetime.now(timezone.utc)
    try:
        import pytz
        tz = pytz.timezone(exchange.timezone)
        local = now.astimezone(tz)
    except ImportError:
        local = now
    time_str = local.strftime("%H:%M")
    return exchange.open_time <= time_str <= exchange.close_time
