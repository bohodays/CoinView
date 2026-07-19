import CoinDetailPage from "@/views/coin-detail/ui/CoinDetailPage";
import React from "react";

type Props = {
  params: Promise<{
    market: string;
  }>;
};

const Page = async ({ params }: Props) => {
  const { market } = await params;
  return <CoinDetailPage market={market} />;
};

export default Page;
