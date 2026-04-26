'use client';
 
import { useEffect, useCallback, useRef } from 'react';
import { useDiscordStore } from '@/stores/discordStore';
import { useRoomStore } from '@/stores/roomStore';
import { pickEmptySeat } from '@/dispatcher/roomDispatcher';
import { roomActions } from '@/actions/roomActions';
 
export function useVoiceCommand() {
  const { user, setSpeaking } = useDiscordStore();
  const { 
    mySeatIndex, 
    furnitures, 
    getOccupiedSeats, 
  } = useRoomStore();
 
  const recognitionRef = useRef<any>(null);
 
  const handleCommand = useCallback((text: string) => {
    const normalized = text.toLowerCase();
    console.log('[VoiceCommand] Recognized:', normalized);
 
    if (normalized.includes('移動') || normalized.includes('いどう') || normalized.includes('move')) {
      console.log('[VoiceCommand] Action: Move');
      
      const occupiedSeats = getOccupiedSeats();
      const occupiedFurnitureIds = new Set<string>();
      // 現在の Presence から占有状況を再計算（簡易版）
      const { occupants } = useRoomStore.getState();
      occupants.forEach(occ => {
        if (occ.furniture_id) occupiedFurnitureIds.add(occ.furniture_id);
      });
 
      const seatInfo = pickEmptySeat(occupiedSeats, occupiedFurnitureIds, furnitures);
      roomActions.changeSeat(seatInfo.seat_index, seatInfo.furniture_id || null);
    }
    
    // 他のコマンドもここに追加可能
  }, [furnitures, getOccupiedSeats]);
 
  const isListeningRef = useRef(false);
 
  useEffect(() => {
    if (typeof window === 'undefined') return;
 
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
 
    const recognition = new SpeechRecognition();
    recognition.lang = 'ja-JP';
    recognition.continuous = true;
    recognition.interimResults = false;
 
    recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      const text = event.results[last][0].transcript;
      handleCommand(text);
    };
 
    recognition.onerror = (event: any) => {
      // 'aborted' は停止時によく出るので無視、'no-speech' も頻繁に出るので無視
      if (event.error === 'aborted' || event.error === 'no-speech') return;
      console.error('[VoiceCommand] Error:', event.error);
    };
 
    recognition.onend = () => {
      // 意図的に停止させた（クリーンアップされた）のでなければ再開
      if (isListeningRef.current) {
        try {
          recognition.start();
        } catch (e) {
          // すでに開始されている場合は無視
        }
      }
    };
 
    recognitionRef.current = recognition;
    isListeningRef.current = true;
    
    try {
      recognition.start();
    } catch (e) {
      console.warn('[VoiceCommand] Failed to start:', e);
    }
 
    return () => {
      isListeningRef.current = false;
      recognitionRef.current = null;
      try {
        recognition.stop();
      } catch (e) {
        // すでに停止している場合は無視
      }
    };
  }, [handleCommand]);
}
