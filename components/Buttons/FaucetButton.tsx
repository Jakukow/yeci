import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

interface FaucetButtonProps {
  onSuccess: () => void;
}

export const FaucetButton = ({ onSuccess }: FaucetButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAirdrop = async () => {
    if (isLoading) return;
    setIsLoading(true);

    const promise = axios.post(
      "/api/wallet/faucet",
      {},
      { withCredentials: true }
    );

    try {
      await toast.promise(promise, {
        loading: "Minting test tokens...",
        success: "100 USDC sent to your wallet! 💧",
        error: "Faucet failed. Try again later.",
      });
      onSuccess();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleAirdrop}
      disabled={isLoading}
      className="group flex items-center gap-2 backdrop-blur-xl bg-cyan-950/40 px-4 py-2 rounded-xl border border-cyan-500/20 hover:border-cyan-400/50 transition-all duration-300 hover:bg-cyan-900/30 hover:shadow-lg hover:shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="flex items-center gap-2 text-cyan-300/70 group-hover:text-cyan-200 transition-colors">
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
        ) : (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
            />
          </svg>
        )}
        <span className="text-sm font-medium">Faucet</span>
      </div>
    </button>
  );
};
