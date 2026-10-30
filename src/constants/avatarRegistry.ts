import { DefaultAvatarModel } from '@/components/models/avatars/DefaultAvatarModel';
import { PenguinModel } from '@/components/models/avatars/PenguinModel';
import { CatModel } from '@/components/models/avatars/CatModel';
import { AvatarMetadata, AvatarModelProps } from '@/types/avatar';
import { AvatarType } from '@/types/room';

export type { AvatarMetadata, AvatarModelProps };

/**
 * アバターレジストリ
 * 新しいアバターを追加する際は、モデル作成後にここに1行追加するだけで
 * アバター選択UI、プレビュー、3D空間への描画に自動的に反映されます。
 */
export const AVATAR_REGISTRY: AvatarMetadata[] = [
  {
    id: 'default',
    name: 'Standard Bot',
    description: 'The classic blue voxel bot.',
    component: DefaultAvatarModel
  },
  {
    id: 'penguin',
    name: 'Polar Penguin',
    description: 'A chilly friend from the south pole.',
    component: PenguinModel
  },
  {
    id: 'cat',
    name: 'Gray Tabby',
    description: 'A cool gray cat in voxel art.',
    component: CatModel
  }
];

/**
 * IDから対応するアバターコンポーネントを取得します（未登録の場合はデフォルトアバター）
 */
export function getAvatarComponent(type: AvatarType): React.ComponentType<AvatarModelProps> {
  const avatar = AVATAR_REGISTRY.find(a => a.id === type);
  return avatar ? avatar.component : DefaultAvatarModel;
}
