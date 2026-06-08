import CoinDetail from "@/widgets/coin-detail/ui/CoinDetail";
import React from "react";

type Props = {
  params: {
    market: string;
  };
};

const Page = async ({ params }: Props) => {
  const { market } = await params;
  return <CoinDetail market={market} />;
};

export default Page;
