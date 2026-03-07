import { useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';

export function useConfetti(school1Slug) {
  const audioRef = useRef(null);
  const timeoutRef = useRef(null);

  const celebrate = useCallback(() => {
    // Fire confetti
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#1e3a5f', '#f5a623', '#22c55e', '#8b5cf6', '#ec4899'],
    });

    // Second burst for extra fun
    setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });
    }, 250);

    // Play fight song if available
    if (school1Slug) {
      try {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        audioRef.current = new Audio(`/audio/${school1Slug}.mp3`);
        audioRef.current.volume = 0.5;
        audioRef.current.play().catch(() => {
          // Browser may block autoplay - that's okay
        });

        // Stop after 5 seconds
        timeoutRef.current = setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }
        }, 5000);
      } catch {
        // Audio file may not exist yet
      }
    }
  }, [school1Slug]);

  return { celebrate };
}
