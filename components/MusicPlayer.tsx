import React, { useState, useEffect, useRef, useCallback } from 'react';

const MusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRefs = useRef<OscillatorNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);

  const stopMusic = useCallback(() => {
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

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    noteGain.gain.setValueAtTime(0, startTime);
    noteGain.gain.linearRampToValueAtTime(volume, startTime + 0.5);
    noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(noteGain);
    noteGain.connect(gainNodeRef.current);

    osc.start(startTime);
    osc.stop(startTime + duration);
    oscillatorRefs.current.push(osc);
  };

  const startMelody = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
    }

    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    const now = audioContextRef.current.currentTime;
    
    // A soft Cmaj7 - Fmaj7 loop
    // Notes: C4, E4, G4, B4 (Cmaj7) -> F3, A3, C4, E4 (Fmaj7)
    const chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
    ];

    let time = now;
    const playLoop = () => {
      if (!isPlaying) return;
      
      chords.forEach((chord, i) => {
        chord.forEach(freq => {
          playNote(freq, time + i * 4, 6, 0.05);
        });
        // Add a tiny random sparkle note
        if (Math.random() > 0.5) {
            playNote(880, time + i * 4 + 2, 2, 0.02);
        }
      });

      time += 8;
      // Schedule next loop before this one ends
      const timeout = (time - audioContextRef.current!.currentTime - 2) * 1000;
      setTimeout(playLoop, Math.max(0, timeout));
    };

    playLoop();
  };

  useEffect(() => {
    if (isPlaying) {
      startMelody();
    } else {
      stopMusic();
    }
    return () => stopMusic();
  }, [isPlaying]);

  return (
    <button
      onClick={() => setIsPlaying(!isPlaying)}
      className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-90 flex items-center justify-center ${
        isPlaying ? 'bg-pink-400 text-white animate-pulse' : 'bg-white text-pink-400 border border-pink-200'
      }`}
      aria-label={isPlaying ? "Stop Music" : "Play Music"}
    >
      <span className="text-xl">{isPlaying ? '🎵' : '🔇'}</span>
      <span className="ml-2 text-xs font-semibold hidden md:inline">
        {isPlaying ? 'Galentine Tune On' : 'Play Theme'}
      </span>
    </button>
  );
};

export default MusicPlayer;