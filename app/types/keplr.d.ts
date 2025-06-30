import { Keplr, Window as KeplrWindow } from "@keplr-wallet/types";
import { OfflineSigner } from "@cosmjs/proto-signing";

declare global {
  interface Window extends KeplrWindow {
    getOfflineSigner?: (chainId: string) => OfflineSigner;
  }
} 