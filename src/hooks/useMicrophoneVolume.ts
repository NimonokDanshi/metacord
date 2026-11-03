import { useEffect, useRef } from 'react';
import { useDiscordStore } from '@/stores/discordStore';
import { useRoomStore } from '@/stores/roomStore';

/**
 * useMicrophoneVolume
 * Web Audio API を活用し、ユーザー自身のマイク音量 (RMS: 0.0 ~ 1.0) をリアルタイム測定して
 * discordStore の userVoiceVolumes に同期するとともに、Supabase Broadcast 経由で
 * 同じボイスチャンネルの全参加者に超低遅延ブロードキャストするフック。
 * 
 * これにより、大声シャウト (> 0.6) によるアバターの限界突破・咆哮・オーラ演出が
 * 全員の見ている画面で完全に同期して描画されます。
 */
export function useMicrophoneVolume() {
  const user = useDiscordStore((s) => s.user);
  const setVoiceVolume = useDiscordStore((s) => s.setVoiceVolume);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastBroadcastTimeRef = useRef<number>(0);
  const lastSentVolumeRef = useRef<number>(0);

  useEffect(() => {
    if (!user || !user.id) return;
    const currentUserId: string = user.id;

    let isMounted = true;

    async function initAudio() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) return;

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: false,
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioContextRef.current = ctx;

        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.3;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const checkVolume = () => {
          if (!isMounted || !analyserRef.current) return;

          analyserRef.current.getByteFrequencyData(dataArray);

          // RMS (二乗平均平方根) を計算
          let sumSquares = 0;
          for (let i = 0; i < dataArray.length; i++) {
            const normalized = dataArray[i] / 255;
            sumSquares += normalized * normalized;
          }
          const rms = Math.sqrt(sumSquares / dataArray.length);

          // 非線形ブースト (声の大きさにメリハリをつける)
          const boostedVolume = Math.min(1.0, Math.pow(rms * 2.8, 1.4));

          // ローカルストアの更新
          setVoiceVolume(currentUserId, boostedVolume);

          // --- リアルタイム・ブロードキャスト配信 (約60msスロットル) ---
          const now = Date.now();
          const pService = useRoomStore.getState().presenceService;
          const isSilent = boostedVolume < 0.05;
          const wasSilent = lastSentVolumeRef.current < 0.05;

          // 発言中、または無音に切り替わった瞬間に送信
          if (pService) {
            if (!isSilent && (now - lastBroadcastTimeRef.current > 60 || Math.abs(boostedVolume - lastSentVolumeRef.current) > 0.2)) {
              pService.broadcastVoiceVolume(boostedVolume);
              lastBroadcastTimeRef.current = now;
              lastSentVolumeRef.current = boostedVolume;
            } else if (isSilent && !wasSilent) {
              pService.broadcastVoiceVolume(0);
              lastBroadcastTimeRef.current = now;
              lastSentVolumeRef.current = 0;
            }
          }

          animationFrameRef.current = requestAnimationFrame(checkVolume);
        };

        checkVolume();
      } catch (err) {
        // マイク権限が拒否された場合やヘッドセット非接続時は静かに無視 (SpeakingEventフォールバック)
        console.debug('Microphone audio analysis skipped or not permitted:', err);
      }
    }

    initAudio();

    return () => {
      isMounted = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      // クリーンアップ時に無音送信
      const pService = useRoomStore.getState().presenceService;
      if (pService) {
        pService.broadcastVoiceVolume(0);
      }
    };
  }, [user?.id, setVoiceVolume]);
}
