import { DefaultAvatarModel } from '@/components/members/models/DefaultAvatarModel';
import { PenguinModel } from '@/components/members/models/PenguinModel';
import { CatModel } from '@/components/members/models/CatModel';
import { AvatarType } from '@/types/room';

export interface AvatarMetadata {
  id: AvatarType;
  name: string;
  description: string;
  component: React.ComponentType<any>;
}

/**
 * アバターレジストリ
 * モデルを追加した際は、ここに追記するだけでアバター選択画面に反映されます。
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

export function getAvatarComponent(type: AvatarType) {
  const avatar = AVATAR_REGISTRY.find(a => a.id === type);
  return avatar ? avatar.component : DefaultAvatarModel;
}
