import CoinSearchBar from "@/feature/coin-search/ui/CoinSearchBar";
import CoinList from "@/widgets/coin-list/ui/CoinList";
import Header from "@/widgets/header/ui/Header";

const HomePage = () => {
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* 1. Header */}
      <Header />

      {/* 2. SearchBar */}
      <div className="py-10">
        <CoinSearchBar />
      </div>

      {/* 3. CoinList */}
      <div className="flex-1 min-h-0">
        <CoinList />
      </div>
    </div>
  );
};

export default HomePage;
