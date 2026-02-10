import React, { useState, useEffect, useRef, useCallback } from 'react';

const MusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRefs = useRef<OscillatorNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);
  const loopTimeoutRef = useRef<number | null>(null);

  const stopMusic = useCallback(() => {
    if (loopTimeoutRef.current) {
      clearTimeout(loopTimeoutRef.current);
      loopTimeoutRef.current = null;
    }
    oscillatorRefs.current.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {}
    });
    oscillatorRefs.current = [];
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(0, audioContextRef.current?.currentTime || 0, 0.1);
    }
  }, []);

  const playNote = (freq: number, startTime: number, duration: number, volume: number) => {
    if (!audioContextRef.current || !gainNodeRef.current) return;

    const osc = audioContextRef.current.createOscillator();
    const noteGain = audioContextRef.current.createGain();

    // Pure sine for that sweet, melodic indie-pop feel of 'Glue Song'
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    const filter = audioContextRef.current.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, startTime);

    noteGain.gain.setValueAtTime(0, startTime);
    noteGain.gain.linearRampToValueAtTime(volume, startTime + 1.2);
    noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(gainNodeRef.current);

    osc.start(startTime);
    osc.stop(startTime + duration);
    oscillatorRefs.current.push(osc);
  };

  const startMelody = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
    }

    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    const now = audioContextRef.current.currentTime;
    
    // 'Glue Song' inspired progression: G Major -> B Minor -> C Major -> C Minor
    const glueChords = [
      [196.00, 246.94, 293.66, 392.00], // G Major (G3, B3, D4, G4)
      [246.94, 293.66, 369.99, 493.88], // B Minor (B3, D4, F#4, B4)
      [261.63, 329.63, 392.00, 523.25], // C Major (C4, E4, G4, C5)
      [261.63, 311.13, 392.00, 523.25], // C Minor (C4, Eb4, G4, C5)
    ];

    let time = now;

    const playLoop = () => {
      if (!isPlaying) return;
      
      glueChords.forEach((chord, i) => {
        chord.forEach((freq, noteIdx) => {
          // Stagger notes slightly for a strumming/plucking effect
          playNote(freq, time + i * 4 + (noteIdx * 0.1), 5, 0.015);
        });

        // Add a gentle high-pitched "sparkle" melody
        if (i === 0) playNote(587.33, time + i * 4 + 2, 2, 0.005); // D5
        if (i === 1) playNote(739.99, time + i * 4 + 2, 2, 0.005); // F#5
        if (i === 2) playNote(659.25, time + i * 4 + 2, 2, 0.005); // E5
        if (i === 3) playNote(622.25, time + i * 4 + 2, 2, 0.005); // Eb5
      });

      time += 16;
      const timeRemaining = (time - audioContextRef.current!.currentTime - 2) * 1000;
      loopTimeoutRef.current = window.setTimeout(playLoop, Math.max(0, timeRemaining));
    };

    playLoop();
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      startMelody();
    } else {
      stopMusic();
    }
    return () => stopMusic();
  }, [isPlaying, startMelody, stopMusic]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end">
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className={`bg-white/80 backdrop-blur-md rounded-full shadow-lg p-4 transition-all duration-300 transform hover:scale-110 active:scale-95 border border-pink-100 flex items-center justify-center ${
          isPlaying ? 'text-pink-500 ring-2 ring-pink-200' : 'text-gray-400'
        }`}
        aria-label={isPlaying ? "Stop Music" : "Play Music"}
      >
        <span className="text-2xl transition-transform duration-300" style={{ transform: isPlaying ? 'rotate(12deg)' : 'none' }}>
          {isPlaying ? '🎧' : '🔇'}
        </span>
      </button>
    </div>
  );
};

export default MusicPlayer;