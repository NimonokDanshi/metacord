import { Json } from '@/types/database';

export interface MySet {
  chair: string;
  desk: string;
}

export const DEFAULT_MYSET: MySet = {
  chair: 'standard-chair',
  desk: 'standard-desk'
};

/**
 * ユーザーのメタデータからMySet情報を抽出する
 */
export function parseMySet(metadata: Json): MySet {
  if (typeof metadata !== 'object' || metadata === null || Array.isArray(metadata)) {
    return DEFAULT_MYSET;
  }

  const myset = (metadata as any).myset;
  
  if (!myset || typeof myset !== 'object') {
    return DEFAULT_MYSET;
  }

  return {
    chair: myset.chair || DEFAULT_MYSET.chair,
    desk: myset.desk || DEFAULT_MYSET.desk
  };
}

/**
 * MySet情報をメタデータJSONに統合する
 */
export function mergeMySet(metadata: Json, myset: MySet): Json {
  const currentMetadata = (typeof metadata === 'object' && metadata !== null && !Array.isArray(metadata))
    ? { ...metadata }
    : {};

  return {
    ...currentMetadata,
    myset: {
      chair: myset.chair,
      desk: myset.desk
    }
  };
}
