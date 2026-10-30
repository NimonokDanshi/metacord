import { DefaultAvatarModel } from '@/components/models/avatars/DefaultAvatarModel';
import { PenguinModel } from '@/components/models/avatars/PenguinModel';
import { CatModel } from '@/components/models/avatars/CatModel';
import { CyberBunnyModel } from '@/components/models/avatars/CyberBunnyModel';
import { AvatarMetadata, AvatarModelProps, AvatarRarity } from '@/types/avatar';
import { AvatarType } from '@/types/room';

export type { AvatarMetadata, AvatarModelProps, AvatarRarity };

/**
 * アバターレジストリ
 * 各アバターのランク（rarity: common / rare / epic / legendary / ultimate）および
 * 課金情報（monetization）を定義。
 * 新しいアバターを追加する際は、モデル作成後にここに1行追加するだけで
 * アバター選択UI、プレビュー、3D空間への描画に自動的に反映されます。
 */
export const AVATAR_REGISTRY: AvatarMetadata[] = [
  {
    id: 'default',
    name: 'Standard Bot',
    description: 'The classic blue voxel bot.',
    rarity: 'common',
    component: DefaultAvatarModel
  },
  {
    id: 'penguin',
    name: 'Polar Penguin',
    description: 'A chilly friend from the south pole.',
    rarity: 'rare',
    component: PenguinModel
  },
  {
    id: 'cat',
    name: 'Gray Tabby',
    description: 'A cool gray cat in voxel art.',
    rarity: 'rare',
    component: CatModel
  },
  {
    id: 'cyber-bunny',
    name: 'Cyber Bunny',
    description: 'Neon-lit cyber rabbit equipped with a luminous visor.',
    rarity: 'epic',
    component: CyberBunnyModel,
    monetization: {
      isPremium: true,
      skuId: 'sku_cyber_bunny',
      priceLabel: '$1.99',
      requiredTier: 'pro'
    }
  }
];

/**
 * IDから対応するアバターコンポーネントを取得します（未登録の場合はデフォルトアバター）
 */
export function getAvatarComponent(type: AvatarType): React.ComponentType<AvatarModelProps> {
  const avatar = AVATAR_REGISTRY.find(a => a.id === type);
  return avatar ? avatar.component : DefaultAvatarModel;
}

/**
 * IDからアバターのメタデータを取得します
 */
export function getAvatarMetadata(type: AvatarType): AvatarMetadata | undefined {
  return AVATAR_REGISTRY.find(a => a.id === type);
}
