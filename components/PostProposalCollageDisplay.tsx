import React, { useCallback, useState } from 'react';
import { ImageUpload } from '../types';
import Button from './Button';

interface PostProposalCollageDisplayProps {
  images: ImageUpload[];
}

const PostProposalCollageDisplay: React.FC<PostProposalCollageDisplayProps> = ({ images }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadFinalCollage = useCallback(async () => {
    if (images.length === 0) return;
    setIsDownloading(true);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsDownloading(false);
      return;
    }

    const CANVAS_WIDTH = 800;
    const CANVAS_HEIGHT = 800;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // Background
    ctx.fillStyle = '#FFF5F7';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Decorative bits
    for (let i = 0; i < 30; i++) {
      ctx.font = '24px Pacifico';
      ctx.fillStyle = 'rgba(255,182,193,0.3)';
      ctx.fillText('💖', Math.random() * CANVAS_WIDTH, Math.random() * CANVAS_HEIGHT);
    }

    const loadedImages = await Promise.all(
      images.map((imgUpload) => {
        return new Promise<HTMLImageElement | null>((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = imgUpload.previewUrl;
        });
      })
    );

    loadedImages.forEach((img, i) => {
      if (!img) return;
      const x = 50 + (i % 2) * 400 + (Math.random() - 0.5) * 50;
      const y = 50 + Math.floor(i / 2) * 250 + (Math.random() - 0.5) * 50;
      const rotation = (Math.random() - 0.5) * 0.2;
      
      ctx.save();
      ctx.translate(x + 150, y + 150);
      ctx.rotate(rotation);
      ctx.translate(-(x + 150), -(y + 150));
      
      ctx.fillStyle = 'white';
      ctx.shadowColor = 'rgba(0,0,0,0.1)';
      ctx.shadowBlur = 10;
      ctx.fillRect(x, y, 300, 220);
      ctx.drawImage(img, x + 10, y + 10, 280, 160);
      
      if (images[i].caption) {
        ctx.font = '14px Quicksand';
        ctx.fillStyle = '#4A5568';
        ctx.textAlign = 'center';
        ctx.fillText(images[i].caption, x + 150, y + 200, 280);
      }
      ctx.restore();
    });

    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'OurGalentineForever.png';
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsDownloading(false);
  }, [images]);

  if (images.length === 0) {
    return (
      <div className="text-center p-8 bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl max-w-2xl mx-auto w-full animate-fade-in delay-300">
        <h2 className="text-3xl md:text-5xl font-pacifico text-pink-600 mb-4">
          Our Special Moments
        </h2>
        <p className="text-lg text-gray-700">No images were uploaded to display, but our bond is forever! 💖</p>
      </div>
    );
  }

  const containerWidth = 600;
  const polaroidCardWidth = 200;
  const polaroidImageHeight = 150;

  return (
    <div className="text-center p-8 bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl max-w-2xl mx-auto w-full animate-fade-in delay-300">
      <h2 className="text-3xl md:text-5xl font-pacifico text-pink-600 mb-4">
        Our Memories, Our Forever Together ✨
      </h2>
      <p className="text-lg text-gray-700 mb-8">
        A beautiful reminder of our friendship journey!
      </p>

      <div
        className="relative mx-auto"
        style={{ width: containerWidth, minHeight: images.length * 40 + polaroidImageHeight + 100 }}
      >
        {images.map((image, index) => (
          <div
            key={image.id}
            className="absolute p-3 bg-white shadow-xl rounded-md transition-all duration-300 ease-out"
            style={{
              width: polaroidCardWidth,
              top: `${index * 20 + Math.random() * 20}px`,
              left: `${(index % 2) * (containerWidth - polaroidCardWidth - 40) + Math.random() * 20}px`,
              zIndex: images.length - index,
              transform: `rotate(${(Math.random() - 0.5) * 15}deg)`,
            }}
          >
            <img
              src={image.previewUrl}
              alt={`Galentine photo ${image.id}`}
              className="w-full object-cover mb-2 rounded-sm"
              style={{ height: polaroidImageHeight }}
            />
            {image.caption && (
              <p className="text-xs text-gray-700 font-medium text-center break-words">
                {image.caption}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-16 flex flex-col items-center gap-4">
        <Button onClick={downloadFinalCollage} disabled={isDownloading} icon="📥">
          {isDownloading ? 'Downloading...' : 'Download Our Collage'}
        </Button>
        <p className="text-md text-gray-600 italic animate-fade-in delay-500">
          Friendship looks good on us! 💖
        </p>
      </div>
    </div>
  );
};

export default PostProposalCollageDisplay;