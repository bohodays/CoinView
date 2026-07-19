import { UpbitCandle } from "@/entities/candle/model/type";
import {
  CandlestickSeries,
  createChart,
  HistogramSeries,
  IChartApi,
  ISeriesApi,
} from "lightweight-charts";
import React, { useEffect, useMemo, useRef } from "react";
import { upbitCandlesToSeriesData } from "../lib/utils";

const CoinChart = ({
  candles,
  isLoadingMore,
  onLoadMore,
}: {
  candles: UpbitCandle[];
  isLoadingMore: boolean;
  onLoadMore: () => Promise<void>;
}) => {
  const { candleData, volumeData, firstTimeSec, lastTimeSec } = useMemo(() => {
    return upbitCandlesToSeriesData(candles ?? []);
  }, [candles]);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  const firstAppliedTimeRef = useRef<number | null>(null);
  const lastAppliedTimeRef = useRef<number | null>(null);
  const didInitSetDataRef = useRef(false);

  const loadMoreLockRef = useRef(false);
  const enteredThresholdRef = useRef(false);
  const isLoadingMoreRef = useRef(isLoadingMore);
  const onLoadMoreRef = useRef(onLoadMore);

  useEffect(() => {
    isLoadingMoreRef.current = isLoadingMore;
    onLoadMoreRef.current = onLoadMore;
  }, [isLoadingMore, onLoadMore]);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      autoSize: true,
      rightPriceScale: { borderVisible: false },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: true,
      },
      layout: { background: { color: "transparent" }, textColor: "#6b7280" },
      grid: { vertLines: { visible: false }, horzLines: { visible: false } },
      crosshair: { mode: 1 },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#ef4444",
      downColor: "#3b82f6",
      borderVisible: false,
      wickUpColor: "#ef4444",
      wickDownColor: "#3b82f6",
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "",
    });

    chart.priceScale("").applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    const timeScale = chart.timeScale();
    const handler = (range: { from: number; to: number } | null) => {
      if (!range) return;

      const THRESHOLD = 10;
      const isNearLeft = range.from < THRESHOLD;

      if (!isNearLeft) {
        enteredThresholdRef.current = false;
        return;
      }

      if (enteredThresholdRef.current) return;
      enteredThresholdRef.current = true;

      if (loadMoreLockRef.current || isLoadingMoreRef.current) return;

      loadMoreLockRef.current = true;
      Promise.resolve(onLoadMoreRef.current()).finally(() => {
        loadMoreLockRef.current = false;
      });
    };

    timeScale.subscribeVisibleLogicalRangeChange(handler);
    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    return () => {
      timeScale.unsubscribeVisibleLogicalRangeChange(handler);
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;

      didInitSetDataRef.current = false;
      firstAppliedTimeRef.current = null;
      lastAppliedTimeRef.current = null;
    };
  }, []);

  useEffect(() => {
    const candleSeries = candleSeriesRef.current;
    const volumeSeries = volumeSeriesRef.current;
    const chart = chartRef.current;

    if (!candleSeries || !volumeSeries || !chart) return;
    if (!candleData.length || !volumeData.length || lastTimeSec === null) {
      return;
    }

    const prevFirst = firstAppliedTimeRef.current;
    const prevLast = lastAppliedTimeRef.current;

    if (!didInitSetDataRef.current || prevLast === null) {
      candleSeries.setData(candleData);
      volumeSeries.setData(volumeData);

      didInitSetDataRef.current = true;
      firstAppliedTimeRef.current = firstTimeSec;
      lastAppliedTimeRef.current = lastTimeSec;

      chart.timeScale().fitContent();
      return;
    }

    // loadMore response: older candles are prepended.
    if (firstTimeSec !== null && prevFirst !== null && firstTimeSec < prevFirst) {
      candleSeries.setData(candleData);
      volumeSeries.setData(volumeData);

      firstAppliedTimeRef.current = firstTimeSec;
      lastAppliedTimeRef.current = lastTimeSec;
      return;
    }

    if (lastTimeSec < prevLast) {
      candleSeries.setData(candleData);
      volumeSeries.setData(volumeData);

      firstAppliedTimeRef.current = firstTimeSec;
      lastAppliedTimeRef.current = lastTimeSec;
      chart.timeScale().fitContent();
      return;
    }

    const lastCandle = candleData[candleData.length - 1];
    const lastVolume = volumeData[volumeData.length - 1];

    candleSeries.update(lastCandle);
    volumeSeries.update(lastVolume);

    firstAppliedTimeRef.current = firstTimeSec;
    lastAppliedTimeRef.current = lastTimeSec;
  }, [candleData, volumeData, firstTimeSec, lastTimeSec]);

  return <div ref={containerRef} className="w-full h-[360px]" />;
};

export default CoinChart;
