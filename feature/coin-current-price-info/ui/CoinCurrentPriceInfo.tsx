const CoinCurrentPriceInfo = ({ price }: { price: number | undefined }) => {
  return <div className="text-xl">{price?.toLocaleString("ko-KR")}</div>;
};

export default CoinCurrentPriceInfo;
