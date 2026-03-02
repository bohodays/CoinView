import { CandleUnit, UpbitCandle } from "@/entities/candle/model/type";
import {
  CandlestickData,
  CandlestickSeries,
  createChart,
  HistogramData,
  HistogramSeries,
  IChartApi,
  ISeriesApi,
} from "lightweight-charts";
import React, { useEffect, useMemo, useRef } from "react";
import { upbitCandlesToSeriesData } from "../lib/utils";

const CoinChart = ({ candles }: { candles: UpbitCandle[] }) => {
  const { candleData, volumeData, firstTimeSec, lastTimeSec } = useMemo(() => {
    return upbitCandlesToSeriesData(candles ?? []);
  }, [candles]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  // 차트에 마지막으로 반영한 time 추적(초 단위)
  const lastAppliedTimeRef = useRef<number | null>(null);
  // 데이터 최초 반영 여부
  const didInitSetDataRef = useRef(false);

  // 1) 차트 생성/파괴
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      autoSize: true, // 컨테이너 크기 따라감(단, 컨테이너에 height 필요)
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
    // addCandlestickSeries
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#ef4444",
      downColor: "#3b82f6",
      borderVisible: false,
      wickUpColor: "#ef4444",
      wickDownColor: "#3b82f6",
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "", // 별도 스케일
    });

    // 볼륨을 아래쪽에 배치
    chart.priceScale("").applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    return () => {
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;

      didInitSetDataRef.current = false;
      lastAppliedTimeRef.current = null;
    };
  }, []);

  /**
   * 2) candles 변경 반영
   * - 최초: setData 전체
   * - 이후: 대부분 update(last)
   */
  useEffect(() => {
    const candleSeries = candleSeriesRef.current;
    const volumeSeries = volumeSeriesRef.current;
    const chart = chartRef.current;

    if (!candleSeries || !volumeSeries || !chart) return;
    if (!candleData.length || !volumeData.length || lastTimeSec === null)
      return;

    const prevLast = lastAppliedTimeRef.current;

    // 최초 1회 전체 세팅
    if (!didInitSetDataRef.current || prevLast === null) {
      candleSeries.setData(candleData);
      volumeSeries.setData(volumeData);

      didInitSetDataRef.current = true;
      lastAppliedTimeRef.current = lastTimeSec;

      chart.timeScale().fitContent();
      return;
    }

    //  리셋/마켓전환 등: 마지막 time이 과거로 점프하면 전체 재세팅
    if (lastTimeSec < prevLast) {
      candleSeries.setData(candleData);
      volumeSeries.setData(volumeData);

      lastAppliedTimeRef.current = lastTimeSec;
      chart.timeScale().fitContent();
      return;
    }

    // 그 외 마지막 봉만 업데이트
    const lastCandle = candleData[candleData.length - 1];
    const lastVolume = volumeData[volumeData.length - 1];

    candleSeries.update(lastCandle);
    volumeSeries.update(lastVolume);

    lastAppliedTimeRef.current = lastTimeSec;
  }, [candleData, volumeData, firstTimeSec, lastTimeSec]);

  return <div ref={containerRef} className="w-full h-[360px]" />;
};

export default CoinChart;
