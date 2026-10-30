import { discordSdk } from '@/utils/discord';
import { useMonetizationStore } from '@/stores/monetizationStore';
import { useDiscordStore } from '@/stores/discordStore';

/**
 * Discord Premium Apps (直接購入/Durable SKU) 関連のアクション
 */
export const monetizationActions = {
  /**
   * ユーザーの購入済み Entitlement (所有権) を取得します
   */
  fetchEntitlements: async () => {
    const { setPurchasedSkuIds } = useMonetizationStore.getState();
    const { addLogMessage } = useDiscordStore.getState();

    try {
      if (discordSdk && typeof (discordSdk.commands as any)?.getEntitlements === 'function') {
        addLogMessage('[Monetization] Fetching entitlements from Discord...');
        const response = await (discordSdk.commands as any).getEntitlements();
        const entitlements = response?.entitlements || [];
        const skuIds = entitlements.map((e: any) => e.sku_id);
        
        addLogMessage(`[Monetization] Entitlements loaded: ${skuIds.length} items`);
        setPurchasedSkuIds(skuIds);
        return skuIds;
      } else {
        // ローカル開発用
        addLogMessage('[Monetization] Local mode: Mock entitlements ready');
        return [];
      }
    } catch (err: any) {
      console.warn('[Monetization] Failed to fetch entitlements:', err);
      addLogMessage(`[Monetization] Error: ${err.message || err}`);
      return [];
    }
  },

  /**
   * アバターの直接購入フローを開始します
   * @param skuId Discord Developer Portal で発行した SKU ID
   * @param avatarName 表示用のアバター名
   */
  purchaseAvatar: async (skuId: string, avatarName?: string) => {
    const { unlockMockPurchase } = useMonetizationStore.getState();
    const { addLogMessage } = useDiscordStore.getState();

    addLogMessage(`[Monetization] Starting purchase for ${avatarName || skuId}...`);

    try {
      if (discordSdk && typeof (discordSdk.commands as any)?.openPremiumPaymentModal === 'function') {
        // Discord ネイティブの決済モーダルを開く
        await (discordSdk.commands as any).openPremiumPaymentModal({ sku_id: skuId });
        addLogMessage('[Monetization] Payment modal closed. Refreshing entitlements...');

        // 決済完了後、最新の所有権を再取得
        await monetizationActions.fetchEntitlements();
        return true;
      } else {
        // ローカル開発・モック環境のシミュレーション
        const confirmed = window.confirm(
          `【開発テスト用】\n「${avatarName || 'アバター'}」を購入しますか？\n（本番環境では Discord 公式の決済画面が表示されます）`
        );
        if (confirmed) {
          unlockMockPurchase(skuId);
          addLogMessage(`[Monetization] Mock purchase successful: ${skuId}`);
          return true;
        }
        return false;
      }
    } catch (err: any) {
      console.error('[Monetization] Purchase failed:', err);
      addLogMessage(`[Monetization] Purchase error: ${err.message || err}`);
      return false;
    }
  },
};
