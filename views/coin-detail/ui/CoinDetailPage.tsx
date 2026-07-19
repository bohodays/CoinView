import CoinDetail from "@/widgets/coin-detail/ui/CoinDetail";

type Props = {
  market: string;
};

const CoinDetailPage = ({ market }: Props) => {
  return <CoinDetail market={market} />;
};

export default CoinDetailPage;
