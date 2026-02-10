import React from 'react';
import Button from './Button';

interface HeroSectionProps {
  onNext: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onNext }) => {
  return (
    <div className="text-center p-8 bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl max-w-2xl mx-auto transform transition-all duration-500 ease-in-out hover:scale-105">
      <h1 className="text-4xl md:text-6xl font-pacifico text-pink-600 mb-4 animate-fade-in-down">
        Celebrating the girls who make life brighter 💕
      </h1>
      <p className="text-lg md:text-xl text-gray-700 mb-8 animate-fade-in delay-200">
        A little surprise made just for you.
      </p>
      <Button
        onClick={onNext}
        size="large"
        className="animate-bounce-once"
      >
        💖 Be My Galentine
      </Button>
    </div>
  );
};

export default HeroSection;