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
  /** 声の音量 (0.0 ~ 1.0) */
  voiceVolume?: number;
  /** 大声・シャウト・限界突破フラグ */
  isShouting?: boolean;
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
  /** 発言時や待機時に連動する発光倍率（Epic以上でブースト、大声で限界突破） */
  glowIntensity: number;
  /** 魔法陣やオーラリングの回転角度（ラジアン） */
  rotationY: number;
  /** 大声・限界突破中か (isShouting || voiceVolume > 0.6) */
  isOverdrive: boolean;
  /** 大声時のスケール倍率 (1.0 〜 1.15) */
  shoutScale: number;
  /** 大声咆哮時の微振動オフセット (X/Z軸) */
  shakeOffset: number;
  /** 翼や尾の展開角度 (ラジアン) */
  wingSpreadAngle: number;
  /** 足元から広がる衝撃波の拡大スケール (0 〜 3.0) */
  shockwaveScale: number;
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
  voiceVolume = 0,
  isShouting = false,
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
    isOverdrive: false,
    shoutScale: 1.0,
    shakeOffset: 0,
    wingSpreadAngle: 0,
    shockwaveScale: 0,
  });

  const rarityLevel = useMemo(() => RARITY_LEVEL[rarity] ?? 1, [rarity]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const isOverdrive = isShouting || (isSpeaking && voiceVolume > 0.6);

    // 1. breathY: アイドル時の微細な呼吸による上下動 (Common以上)
    const breathFreq = isSitting ? 2.0 : 2.4;
    const breathAmp = isSitting ? 0.006 : 0.012;
    const breathY = Math.sin(t * breathFreq) * breathAmp;

    // 2. speakBounceY: 発言時のリズミカルな上下運動 (Rare以上)
    let speakBounceY = 0;
    if (isSpeaking && rarityLevel >= 2) {
      const baseAmp = isSitting ? 0.02 : 0.038;
      const overdriveMultiplier = isOverdrive ? 1.8 : 1.0;
      speakBounceY = Math.abs(Math.sin(t * (isOverdrive ? 18 : 12))) * (baseAmp * overdriveMultiplier);
    }

    // 3. hoverY: 常時ふわりと浮遊する上下動 (Legendary/Ultimate時)
    let hoverY = 0;
    if (rarityLevel >= 4) {
      if (isSitting) {
        hoverY = Math.sin(t * 1.5) * 0.012;
      } else {
        // 大声シャウト時はさらに高く浮遊！
        const hoverAmp = isOverdrive ? 0.07 : 0.035;
        const hoverBase = isOverdrive ? 0.09 : 0.035;
        hoverY = Math.sin(t * (isOverdrive ? 3.0 : 1.8)) * hoverAmp + hoverBase;
      }
    }

    // 4. 合算Yオフセット
    const totalY = breathY + speakBounceY + hoverY;

    // 5. glowIntensity: 発言時や待機時に連動する発光倍率 (Epic以上で大声時に限界突破)
    let glowIntensity = 1.0;
    if (rarityLevel <= 2) {
      // Common / Rare: 控えめ
      glowIntensity = isSpeaking ? (isOverdrive ? 1.5 : 1.2) : 1.0;
    } else if (rarityLevel === 3) {
      // Epic: 大声で落雷ストロボ発光 (4.0 〜 6.5)
      if (isOverdrive) {
        glowIntensity = (Math.sin(t * 32) * 0.5 + 0.5) * 2.5 + 4.0;
      } else if (isSpeaking) {
        glowIntensity = (Math.sin(t * 14) * 0.5 + 0.5) * 1.2 + 1.6;
      } else {
        glowIntensity = Math.sin(t * 2.5) * 0.2 + 1.0;
      }
    } else {
      // Legendary / Ultimate: 大声で咆哮超絶オーラ (6.0 〜 9.5)
      if (isOverdrive) {
        glowIntensity = (Math.sin(t * 40) * 0.5 + 0.5) * 3.5 + 6.0;
      } else if (isSpeaking) {
        glowIntensity = (Math.sin(t * 18) * 0.5 + 0.5) * 1.6 + 2.0;
      } else {
        glowIntensity = Math.sin(t * 3.0) * 0.35 + 1.35;
      }
    }

    // 6. rotationY: 魔法陣やオーラリングの回転角度 (大声時は高速回転)
    const baseRotSpeed = rarityLevel >= 4 ? 0.8 : 0.5;
    const rotSpeed = isOverdrive ? baseRotSpeed * 3.0 : baseRotSpeed;
    const rotationY = (t * rotSpeed) % (Math.PI * 2);

    // 7. shoutScale & shakeOffset: 大声時の迫力スケールと微振動
    const shoutScale = isOverdrive ? (rarityLevel >= 4 ? 1.15 : 1.08) : 1.0;
    const shakeOffset = isOverdrive && rarityLevel >= 3 ? Math.sin(t * 45) * 0.025 : 0;

    // 8. wingSpreadAngle: 翼や尾の展開角度 (大声シャウト時に最大展開)
    const wingSpreadAngle = isOverdrive
      ? 1.05 + Math.sin(t * 14) * 0.15
      : isSpeaking
      ? 0.45 + Math.sin(t * 8) * 0.1
      : 0.15;

    // 9. shockwaveScale: 足元から広がる衝撃波
    const shockwaveScale = isOverdrive ? (t * 2.5) % 3.0 : 0;

    // 値オブジェクトを更新
    valuesRef.current.breathY = breathY;
    valuesRef.current.speakBounceY = speakBounceY;
    valuesRef.current.hoverY = hoverY;
    valuesRef.current.totalY = totalY;
    valuesRef.current.glowIntensity = glowIntensity;
    valuesRef.current.rotationY = rotationY;
    valuesRef.current.isOverdrive = isOverdrive;
    valuesRef.current.shoutScale = shoutScale;
    valuesRef.current.shakeOffset = shakeOffset;
    valuesRef.current.wingSpreadAngle = wingSpreadAngle;
    valuesRef.current.shockwaveScale = shockwaveScale;

    // autoApplyTransform が有効ならルートグループの position と scale を自動更新
    if (autoApplyTransform && groupRef.current) {
      groupRef.current.position.y = baseOffsetY + totalY;
      groupRef.current.position.x = shakeOffset;
      groupRef.current.scale.set(shoutScale, shoutScale, shoutScale);
    }
  });

  return {
    groupRef,
    valuesRef,
    getValues: () => valuesRef.current,
    rarityLevel,
  };
}
