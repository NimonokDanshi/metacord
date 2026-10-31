import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AvatarRarity } from '@/types/avatar';

/**
 * レアリティを数値レベルに変換 (1: common 〜 5: ultimate)
 */
export const RARITY_LEVEL: Record<AvatarRarity, number> = {
  common: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
  ultimate: 5,
};

export interface UseAvatarGimmickOptions {
  /** アバターのレアリティ (デフォルト: 'common') */
  rarity?: AvatarRarity;
  /** 着席中フラグ (座りポーズ時はモーション幅を抑制) */
  isSitting?: boolean;
  /** 発言中フラグ (ボイス連動アニメーションを有効化) */
  isSpeaking?: boolean;
  /**
   * 返却される groupRef の position.y に (breathY + speakBounceY + hoverY) を毎フレーム自動適用するか
   * デフォルト: true
   */
  autoApplyTransform?: boolean;
  /**
   * アバターの基本となるY座標オフセット (デフォルト: 0)
   */
  baseOffsetY?: number;
}

export interface AvatarGimmickValues {
  /** アイドル時の微細な呼吸による上下動（Common以上） */
  breathY: number;
  /** 発言時のリズミカルな上下運動（Rare以上） */
  speakBounceY: number;
  /** 常時ふわりと浮遊する上下動（Legendary/Ultimate時） */
  hoverY: number;
  /** breathY + speakBounceY + hoverY の合算値 */
  totalY: number;
  /** 発言時や待機時に連動する発光倍率（Epic以上でブースト） */
  glowIntensity: number;
  /** 魔法陣やオーラリングの回転角度（ラジアン） */
  rotationY: number;
}

export interface UseAvatarGimmickReturn {
  /** アバターのルートにバインドすることで自動的に上下動を適用できるGroup Ref */
  groupRef: React.RefObject<THREE.Group | null>;
  /** useFrame毎に更新される最新のギミック値Ref (React再レンダリングなしで参照可能) */
  valuesRef: React.MutableRefObject<AvatarGimmickValues>;
  /** 最新のギミック値を取得するヘルパー関数 */
  getValues: () => AvatarGimmickValues;
  /** レアリティ数値レベル (1: common 〜 5: ultimate) */
  rarityLevel: number;
}

/**
 * アバターのレア度別共通ギミック・アニメーションフック
 * useFrame 内で毎フレーム直接 Ref を更新するため、React の再レンダリング負荷を発生させずに
 * 60fps の滑らかなアニメーション（呼吸・発言バウンド・ホバリング・発光パルス・回転）を提供します。
 */
export function useAvatarGimmick({
  rarity = 'common',
  isSitting = false,
  isSpeaking = false,
  autoApplyTransform = true,
  baseOffsetY = 0,
}: UseAvatarGimmickOptions = {}): UseAvatarGimmickReturn {
  const groupRef = useRef<THREE.Group | null>(null);

  const valuesRef = useRef<AvatarGimmickValues>({
    breathY: 0,
    speakBounceY: 0,
    hoverY: 0,
    totalY: 0,
    glowIntensity: 1.0,
    rotationY: 0,
  });

  const rarityLevel = useMemo(() => RARITY_LEVEL[rarity] ?? 1, [rarity]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // 1. breathY: アイドル時の微細な呼吸による上下動 (Common以上)
    // 座っているときは動きを控えめにし、自然な呼吸リズムを再現
    const breathFreq = isSitting ? 2.0 : 2.4;
    const breathAmp = isSitting ? 0.006 : 0.012;
    const breathY = Math.sin(t * breathFreq) * breathAmp;

    // 2. speakBounceY: 発言時のリズミカルな上下運動 (Rare以上)
    // 喋っている間、小気味よくバウンド（約2Hz）
    let speakBounceY = 0;
    if (isSpeaking && rarityLevel >= 2) {
      const bounceAmp = isSitting ? 0.02 : 0.038;
      speakBounceY = Math.abs(Math.sin(t * 12)) * bounceAmp;
    }

    // 3. hoverY: 常時ふわりと浮遊する上下動 (Legendary/Ultimate時)
    // 浮遊感のあるゆっくりとした波形。isSitting のときは控えめに
    let hoverY = 0;
    if (rarityLevel >= 4) {
      if (isSitting) {
        hoverY = Math.sin(t * 1.5) * 0.012;
      } else {
        // 地面から少し浮きつつ、ゆらゆら揺れる
        hoverY = Math.sin(t * 1.8) * 0.035 + 0.035;
      }
    }

    // 4. 合算Yオフセット
    const totalY = breathY + speakBounceY + hoverY;

    // 5. glowIntensity: 発言時や待機時に連動する発光倍率 (Epic以上でブースト)
    let glowIntensity = 1.0;
    if (rarityLevel <= 2) {
      // Common / Rare
      glowIntensity = isSpeaking ? 1.2 : 1.0;
    } else if (rarityLevel === 3) {
      // Epic: サイバーパルス
      if (isSpeaking) {
        glowIntensity = (Math.sin(t * 14) * 0.5 + 0.5) * 1.2 + 1.6; // 1.6 〜 2.8
      } else {
        glowIntensity = Math.sin(t * 2.5) * 0.2 + 1.0; // 0.8 〜 1.2
      }
    } else {
      // Legendary / Ultimate: オーラ高輝度パルス
      if (isSpeaking) {
        glowIntensity = (Math.sin(t * 18) * 0.5 + 0.5) * 1.6 + 2.0; // 2.0 〜 3.6
      } else {
        glowIntensity = Math.sin(t * 3.0) * 0.35 + 1.35; // 1.0 〜 1.7
      }
    }

    // 6. rotationY: 魔法陣やオーラリングの回転角度
    // レア度が高いほどやや神秘的・優雅に回転
    const rotSpeed = rarityLevel >= 4 ? 0.8 : 0.5;
    const rotationY = (t * rotSpeed) % (Math.PI * 2);

    // 値オブジェクトを更新
    valuesRef.current.breathY = breathY;
    valuesRef.current.speakBounceY = speakBounceY;
    valuesRef.current.hoverY = hoverY;
    valuesRef.current.totalY = totalY;
    valuesRef.current.glowIntensity = glowIntensity;
    valuesRef.current.rotationY = rotationY;

    // autoApplyTransform が有効ならルートグループの position.y を自動更新
    if (autoApplyTransform && groupRef.current) {
      groupRef.current.position.y = baseOffsetY + totalY;
    }
  });

  return {
    groupRef,
    valuesRef,
    getValues: () => valuesRef.current,
    rarityLevel,
  };
}
