import { DefaultAvatarModel } from '@/components/models/avatars/DefaultAvatarModel';
import { PenguinModel } from '@/components/models/avatars/PenguinModel';
import { CatModel } from '@/components/models/avatars/CatModel';
import { CyberBunnyModel } from '@/components/models/avatars/CyberBunnyModel';
import { ShibaDogModel } from '@/components/models/avatars/ShibaDogModel';
import { MechaDragonModel } from '@/components/models/avatars/MechaDragonModel';
import { ChubbyChickModel } from '@/components/models/avatars/ChubbyChickModel';
import { BaristaBearModel } from '@/components/models/avatars/BaristaBearModel';
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
    id: 'chubby-chick',
    name: 'Chubby Chick',
    description: 'A round yellow chick with tiny flapping wings.',
    rarity: 'common',
    component: ChubbyChickModel
  },
  {
    id: 'barista-bear',
    name: 'Barista Bear',
    description: 'A calm brown bear wearing a cozy cafe apron.',
    rarity: 'common',
    component: BaristaBearModel
  },
  {
    id: 'shiba-dog',
    name: 'Shiba Dog',
    description: 'A cheerful Japanese Shiba Inu with a curled tail.',
    rarity: 'rare',
    component: ShibaDogModel
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
  },
  {
    id: 'mecha-dragon',
    name: 'Mecha Dragon',
    description: 'Armored metallic dragon with radiant golden energy horns and wings.',
    rarity: 'legendary',
    component: MechaDragonModel,
    monetization: {
      isPremium: true,
      skuId: 'sku_mecha_dragon',
      priceLabel: '$2.99',
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
