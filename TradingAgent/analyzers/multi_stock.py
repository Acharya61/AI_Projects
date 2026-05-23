from __future__ import annotations
from core.market import MarketSnapshot
from core.portfolio import PortfolioState
from core.decision import StockScorer, ScoredSymbol


class MultiStockScanner:
    def __init__(self, scorer: StockScorer):
        self.scorer = scorer

    def scan(
        self,
        market: MarketSnapshot,
        portfolio: PortfolioState,
        predictions: dict[str, dict[str, dict]] | None = None,
    ) -> list[ScoredSymbol]:
        candidates = []
        predictions = predictions or {}

        for symbol in market.symbols:
            hist = []
            ohlc = market.ohlc(symbol)
            if ohlc:
                hist = [ohlc]

            sym_preds = predictions.get(symbol, {})
            scored = self.scorer.score(symbol, sym_preds, hist, portfolio)
            candidates.append(scored)

        return candidates

    def pick_top(
        self,
        market: MarketSnapshot,
        portfolio: PortfolioState,
        predictions: dict[str, dict[str, dict]] | None = None,
        count: int = 3,
        held_symbols: set | None = None,
    ) -> list[ScoredSymbol]:
        candidates = self.scan(market, portfolio, predictions)
        return self.scorer.pick_best(candidates, count, held_symbols)
