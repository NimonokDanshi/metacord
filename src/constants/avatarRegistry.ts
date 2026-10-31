import { DefaultAvatarModel } from '@/components/models/avatars/DefaultAvatarModel';
import { PenguinModel } from '@/components/models/avatars/PenguinModel';
import { CatModel } from '@/components/models/avatars/CatModel';
import { CyberBunnyModel } from '@/components/models/avatars/CyberBunnyModel';
import { ShibaDogModel } from '@/components/models/avatars/ShibaDogModel';
import { MechaDragonModel } from '@/components/models/avatars/MechaDragonModel';
import { ChubbyChickModel } from '@/components/models/avatars/ChubbyChickModel';
import { BaristaBearModel } from '@/components/models/avatars/BaristaBearModel';
import { GentlemanPenguinModel } from '@/components/models/avatars/GentlemanPenguinModel';
import { RetroCosmoBotModel } from '@/components/models/avatars/RetroCosmoBotModel';
import { VoxelWizardModel } from '@/components/models/avatars/VoxelWizardModel';
import { CyberKitsuneModel } from '@/components/models/avatars/CyberKitsuneModel';
import { AvatarMetadata, AvatarModelProps, AvatarRarity } from '@/types/avatar';
import { AvatarType } from '@/types/room';

export type { AvatarMetadata, AvatarModelProps, AvatarRarity };

/**
 * アバターレジストリ
 * 各アバターのランク、ギミック特徴（features）、課金情報（monetization）を定義。
 */
export const AVATAR_REGISTRY: AvatarMetadata[] = [
  {
    id: 'default',
    name: 'Standard Bot',
    description: 'The classic blue voxel bot.',
    rarity: 'common',
    features: [
      'クラシックなボクセルロボット',
      '座席に着席して足を前に伸ばすポーズ'
    ],
    component: DefaultAvatarModel
  },
  {
    id: 'chubby-chick',
    name: 'Chubby Chick',
    description: 'A round yellow chick with tiny flapping wings.',
    rarity: 'common',
    features: [
      'まんまるな黄色いマスコットボディ',
      '発言時: 小さな羽を一生懸命パタパタ羽ばたかせる',
      '着席時: オレンジの足を前へちょこんと揃えて座る'
    ],
    component: ChubbyChickModel
  },
  {
    id: 'barista-bear',
    name: 'Barista Bear',
    description: 'A calm brown bear wearing a cozy cafe apron.',
    rarity: 'common',
    features: [
      '落ち着いたブラウン毛並みとペン付きカフェエプロン',
      '発言時: まあるい耳がピコピコ動く',
      '着席時: 脚を前方に折りたたんで着席'
    ],
    component: BaristaBearModel
  },
  {
    id: 'shiba-dog',
    name: 'Shiba Dog',
    description: 'A cheerful Japanese Shiba Inu with a curled tail.',
    rarity: 'rare',
    features: [
      'ピンと立った三角耳、麻呂眉、くるんとした巻き尾',
      '発言時: 耳が嬉しそうにパタパタ動く',
      '着席時: お行儀よく「おすわり」ポーズに変化'
    ],
    component: ShibaDogModel
  },
  {
    id: 'penguin',
    name: 'Polar Penguin',
    description: 'A chilly friend from the south pole.',
    rarity: 'rare',
    features: [
      'ぽっこりお腹と黄色いくちばし・足',
      '着席時: 黄色い足を前方に揃えて座る'
    ],
    component: PenguinModel
  },
  {
    id: 'gentleman-penguin',
    name: 'Gentleman Penguin',
    description: 'An elegant penguin gentleman with a top hat, gold monocle, red bow tie, and wooden cane.',
    rarity: 'rare',
    features: [
      'シルクハット、片眼鏡、蝶ネクタイ、ステッキを装備した英国紳士',
      '発言時: くちばしが開き、ステッキを小粋にタップ、翼をパタパタ動かす',
      '着席時: 黄色い足を前方に揃えて優雅に着席'
    ],
    component: GentlemanPenguinModel
  },
  {
    id: 'retro-cosmo-bot',
    name: 'Retro Cosmo Bot',
    description: 'A vintage astronaut robot equipped with a domed glass visor, instrument chest, and pulse antenna.',
    rarity: 'rare',
    features: [
      'レトロ宇宙服、ガラスバイザー、背面酸素ボンベ、胸部計器パネル',
      '発言時: 頭上のアンテナ赤ランプが高速点滅し、ピコピコ上下ステップ',
      '着席時: 脚を前方に曲げて着席'
    ],
    component: RetroCosmoBotModel
  },
  {
    id: 'cat',
    name: 'Gray Tabby',
    description: 'A cool gray cat in voxel art.',
    rarity: 'rare',
    features: [
      '4足歩行のスマートなグレートラ猫',
      'ピンと上を向いたしっぽとピンクの耳・鼻'
    ],
    component: CatModel
  },
  {
    id: 'cyber-bunny',
    name: 'Cyber Bunny',
    description: 'Neon-lit cyber rabbit equipped with a luminous visor.',
    rarity: 'epic',
    features: [
      'サイバーゴーグル（バイザー）＆ネオンイヤー装備',
      '発言時: ゴーグルとイヤーのネオン発光輝度がブースト',
      '着席時: ネオンソールのスニーカーで着席'
    ],
    component: CyberBunnyModel,
    monetization: {
      isPremium: true,
      skuId: 'sku_cyber_bunny',
      priceLabel: '$1.99',
      requiredTier: 'pro'
    }
  },
  {
    id: 'voxel-wizard',
    name: 'Voxel Wizard',
    description: 'An apprentice wizard in golden-trimmed deep purple robes with a pointed hat and glowing crystal wand.',
    rarity: 'epic',
    features: [
      'とんがり帽子、豊かな白髭、金縁ローブ、エナジークリスタルの杖',
      '発言時: 杖を掲げて詠唱モーション、クリスタルが青くパルス発光 ＆ 浮遊魔法粒子',
      '着席時: ローブの裾を広げて着席'
    ],
    component: VoxelWizardModel,
    monetization: {
      isPremium: true,
      skuId: 'sku_voxel_wizard',
      priceLabel: '$1.99',
      requiredTier: 'pro'
    }
  },
  {
    id: 'mecha-dragon',
    name: 'Mecha Dragon',
    description: 'Armored metallic dragon with radiant golden energy horns and wings.',
    rarity: 'legendary',
    features: [
      'ガンメタルとゴールドの重厚なロボット装甲',
      '胸部に青く輝くエナジーコア＆エナジーホーン',
      '発言時: 角とコアが激しく発光 ＆ 背中の翼が大きく羽ばたく',
      '着席時: 脚部を折りたたんで着席'
    ],
    component: MechaDragonModel,
    monetization: {
      isPremium: true,
      skuId: 'sku_mecha_dragon',
      priceLabel: '$2.99',
      requiredTier: 'pro'
    }
  },
  {
    id: 'cyber-kitsune',
    name: 'Cyber Kitsune',
    description: 'A cybernetic mystical white kitsune with neon Fox mask, holographic ears, and dual luminous energy tails.',
    rarity: 'legendary',
    features: [
      'サイバー狐面、隈取ライン、ホログラム立ち耳、2本のネオンテイル',
      '常時待機: 背後に浮かぶ二重反転サイバーオーラリング ＆ 神秘的な浮遊',
      '発言時: 狐面のネオンアイがブースト発光 ＆ 2本の尾が優美にサイン波でうねる',
      '着席時: 尾をサイドに流して静かに着席'
    ],
    component: CyberKitsuneModel,
    monetization: {
      isPremium: true,
      skuId: 'sku_cyber_kitsune',
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
