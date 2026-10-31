import { useEffect, useRef } from 'react';
import { useDiscordStore } from '@/stores/discordStore';

/**
 * useMicrophoneVolume
 * Web Audio API を活用し、ユーザー自身のマイク音量 (RMS: 0.0 ~ 1.0) をリアルタイム測定して
 * discordStore の userVoiceVolumes に同期するフック。
 * 大声シャウト (> 0.6) を検知してアバターの限界突破・咆哮ギミックを発動させます。
 */
export function useMicrophoneVolume() {
  const user = useDiscordStore((s) => s.user);
  const setVoiceVolume = useDiscordStore((s) => s.setVoiceVolume);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

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

          setVoiceVolume(currentUserId, boostedVolume);

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
    };
  }, [user?.id, setVoiceVolume]);
}
