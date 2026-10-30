import { create } from 'zustand';

interface MonetizationStore {
  /** 購入済みの SKU ID セット */
  purchasedSkuIds: Set<string>;
  /** 読み込み中フラグ */
  isLoading: boolean;
  /** 購入済み判定 */
  isPurchased: (skuId?: string) => boolean;
  /** 購入済み SKU の一括セット */
  setPurchasedSkuIds: (skuIds: string[]) => void;
  /** モック/ローカル開発用のアンロック機能 */
  unlockMockPurchase: (skuId: string) => void;
}

export const useMonetizationStore = create<MonetizationStore>((set, get) => ({
  purchasedSkuIds: new Set<string>(),
  isLoading: false,

  isPurchased: (skuId?: string) => {
    if (!skuId) return true; // SKUが指定されていないアバターは無料
    return get().purchasedSkuIds.has(skuId);
  },

  setPurchasedSkuIds: (skuIds: string[]) => {
    set({ purchasedSkuIds: new Set(skuIds) });
  },

  unlockMockPurchase: (skuId: string) => {
    set((state) => {
      const next = new Set(state.purchasedSkuIds);
      next.add(skuId);
      return { purchasedSkuIds: next };
    });
  },
}));
