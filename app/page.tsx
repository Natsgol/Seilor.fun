import CharacterCard from "./components/characters/CharacterCard";
import CharacterCreationForm from "./components/characters/CharacterCreationForm";
import { ConnectWalletButton } from "./components/ConnectWalletButton";
import EnhancedMarketplace from "./components/EnhancedMarketplace";
import TradingInterface from "./components/trading/TradingInterface";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12 lg:p-24 bg-zinc-900 text-white">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-zinc-800 bg-gradient-to-b from-zinc-900 pb-6 pt-8 backdrop-blur-2xl lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-zinc-800 lg:p-4">
          Welcome to Seilor.fun
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-black via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <ConnectWalletButton />
        </div>
      </div>

      <div className="w-full max-w-5xl mt-16">
        <h1 className="text-4xl font-bold text-center my-8">Seilor.fun</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <TradingInterface />
          </div>
          <div>
            <CharacterCreationForm />
          </div>
        </div>

        <div className="my-8">
          <EnhancedMarketplace />
        </div>

        <div className="my-8">
            <h2 className="text-2xl font-bold mb-4">Featured Character</h2>
            <CharacterCard name="Captain Sei" archetype="Diamond Hands" imageUrl="https://via.placeholder.com/512" />
        </div>
      </div>
    </main>
  );
}
