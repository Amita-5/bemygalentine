import React, { useState, useCallback } from 'react';
import Button from './Button';
import { FRIENDSHIP_REASONS } from '../constants';

interface ReasonsSectionProps {
  onNext: () => void;
}

const ReasonsSection: React.FC<ReasonsSectionProps> = ({ onNext }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextCard = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % FRIENDSHIP_REASONS.length);
  }, []);

  const prevCard = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + FRIENDSHIP_REASONS.length) % FRIENDSHIP_REASONS.length);
  }, []);

  return (
    <div className="text-center p-8 bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl max-w-2xl mx-auto w-full animate-fade-in transition-all duration-500">
      <h2 className="text-3xl md:text-5xl font-pacifico text-pink-600 mb-2">
        Reasons I Chose You 💕
      </h2>
      <p className="text-lg text-gray-700 mb-10">
        Swipe through the little things that make you my person
      </p>

      {/* Carousel Container */}
      <div className="relative h-80 w-full flex items-center justify-center perspective-1000 mb-12">
        <div className="relative w-full h-full flex items-center justify-center">
          {FRIENDSHIP_REASONS.map((reason, index) => {
            const isCenter = index === activeIndex;
            const isPrev = index === (activeIndex - 1 + FRIENDSHIP_REASONS.length) % FRIENDSHIP_REASONS.length;
            const isNext = index === (activeIndex + 1) % FRIENDSHIP_REASONS.length;
            
            let offset = 0;
            let scale = 0.8;
            let opacity = 0;
            let zIndex = 0;

            if (isCenter) {
              offset = 0;
              scale = 1;
              opacity = 1;
              zIndex = 10;
            } else if (isPrev) {
              offset = -120;
              scale = 0.85;
              opacity = 0.6;
              zIndex = 5;
            } else if (isNext) {
              offset = 120;
              scale = 0.85;
              opacity = 0.6;
              zIndex = 5;
            }

            return (
              <div
                key={reason.id}
                className={`absolute w-64 md:w-80 h-64 p-8 rounded-2xl shadow-xl flex flex-col items-center justify-center transition-all duration-500 ease-in-out ${reason.bg}`}
                style={{
                  transform: `translateX(${offset}px) scale(${scale})`,
                  opacity: opacity,
                  zIndex: zIndex,
                  pointerEvents: isCenter ? 'auto' : 'none',
                }}
              >
                <span className="text-5xl mb-4">{reason.emoji}</span>
                <p className="text-gray-800 font-medium text-lg leading-relaxed">
                  {reason.text}
                </p>
              </div>
            );
          })}
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={prevCard}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white/80 hover:bg-white text-pink-500 w-10 h-10 rounded-full shadow-lg flex items-center justify-center z-20 transition-transform active:scale-90"
          aria-label="Previous reason"
        >
          ←
        </button>
        <button
          onClick={nextCard}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white/80 hover:bg-white text-pink-500 w-10 h-10 rounded-full shadow-lg flex items-center justify-center z-20 transition-transform active:scale-90"
          aria-label="Next reason"
        >
          →
        </button>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 mb-10">
        {FRIENDSHIP_REASONS.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${i === activeIndex ? 'bg-pink-500 w-4' : 'bg-pink-200'}`}
          />
        ))}
      </div>

      <Button
        onClick={onNext}
        icon="✨"
        size="large"
      >
        Continue to My Proposal
      </Button>

      <p className="mt-8 text-sm text-gray-500 italic">
        This journey is made with so much love 💗
      </p>
    </div>
  );
};

export default ReasonsSection;