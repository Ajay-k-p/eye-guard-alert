import { useRef, useCallback, useState, useEffect } from 'react';

export function useAlarm() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const intervalRef = useRef<number | null>(null);

  // Initialize audio context on first user interaction
  const unlockAudio = useCallback(() => {
    if (isUnlocked) return;
    
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Play a silent sound to unlock audio
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      gainNode.gain.value = 0; // Silent
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      oscillator.start();
      oscillator.stop(audioContextRef.current.currentTime + 0.1);
      
      setIsUnlocked(true);
      console.log('Audio unlocked successfully');
    } catch (error) {
      console.error('Error unlocking audio:', error);
    }
  }, [isUnlocked]);

  // Add click listener to unlock audio
  useEffect(() => {
    const handleInteraction = () => {
      unlockAudio();
    };

    document.addEventListener('click', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, [unlockAudio]);

  const playBeep = useCallback(() => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const audioContext = audioContextRef.current;
    
    // Resume if suspended
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Loud siren-like sound
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.2);
    oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.4);

    gainNode.gain.setValueAtTime(1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  }, []);

  const startAlarm = useCallback(() => {
    if (isPlaying) return;

    try {
      // Play immediately and repeat
      playBeep();
      intervalRef.current = window.setInterval(playBeep, 600);

      setIsPlaying(true);

      // Also try vibration API for mobile
      if ('vibrate' in navigator) {
        navigator.vibrate([500, 200, 500, 200, 500, 200, 500]);
      }
      
      console.log('Alarm started');
    } catch (error) {
      console.error('Error starting alarm:', error);
    }
  }, [isPlaying, playBeep]);

  const stopAlarm = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Stop vibration
    if ('vibrate' in navigator) {
      navigator.vibrate(0);
    }

    setIsPlaying(false);
    console.log('Alarm stopped');
  }, []);

  const testAlarm = useCallback(() => {
    playBeep();
    if ('vibrate' in navigator) {
      navigator.vibrate(200);
    }
  }, [playBeep]);

  return {
    startAlarm,
    stopAlarm,
    testAlarm,
    isPlaying,
    isUnlocked,
  };
}
