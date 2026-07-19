export type MarketEvent = {
  warning: boolean; // 유의 종목 여부
  caution: {
    PRICE_FLUCTUATIONS: boolean; // 가격 급등락 경보
    TRADING_VOLUME_SOARING: boolean; // 거래량 급증 경보
    DEPOSIT_AMOUNT_SOARING: boolean; // 입금량 급증 경보
    GLOBAL_PRICE_DIFFERENCES: boolean; // 국내외 가격 차이 경보
    CONCENTRATION_OF_SMALL_ACCOUNTS: boolean; // 소수 계정 집중 거래 경보
  };
};

export type Market = {
  market: string;
  korean_name: string;
  english_name: string;
  market_event: MarketEvent;
};
