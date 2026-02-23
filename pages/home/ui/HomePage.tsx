import CoinSearchBar from "@/feature/coin-search/ui/CoinSearchBar";
import CoinList from "@/widgets/coin-list/ui/CoinList";
import Header from "@/widgets/header/ui/Header";

const HomePage = () => {
  return (
    <div className="flex flex-col h-full gap-10">
      {/* 1. Header */}
      <Header />

      {/* 2. SearchBar */}
      <CoinSearchBar />

      {/* 3. CoinList */}
      <CoinList />
    </div>
  );
};

export default HomePage;
