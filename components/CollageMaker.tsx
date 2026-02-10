import React, { useState, useCallback, useMemo } from 'react';
import Button from './Button';
import { ImageUpload, CollageLayout } from '../types';

const generateUniqueId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

interface CollageMakerProps {
  onNext: (images: ImageUpload[], layout: CollageLayout) => void;
}

const CollageMaker: React.FC<CollageMakerProps> = ({ onNext }) => {
  const [uploadedImages, setUploadedImages] = useState<ImageUpload[]>([]);
  const [selectedLayout, setSelectedLayout] = useState<CollageLayout>('grid');
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray: File[] = Array.from(event.target.files);
      if (uploadedImages.length + filesArray.length > 6) {
        alert('You can upload a maximum of 6 photos.');
        return;
      }
      const newImages: ImageUpload[] = filesArray.map((file: File) => ({
        id: generateUniqueId(),
        file,
        previewUrl: URL.createObjectURL(file),
        caption: '',
      }));
      setUploadedImages((prev) => [...prev, ...newImages]);
      event.target.value = ''; // Clear input for re-uploading same file
    }
  }, [uploadedImages]);

  const handleRemoveImage = useCallback((id: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== id));
  }, []);

  const handleCaptionChange = useCallback((id: string, text: string) => {
    setUploadedImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, caption: text } : img))
    );
  }, []);

  const handleStickerClick = useCallback((id: string, sticker: string) => {
    setUploadedImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, caption: img.caption + ' ' + sticker } : img))
    );
  }, []);

  const collageGridClass = useMemo(() => {
    switch (uploadedImages.length) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-2';
      case 3: return 'grid-cols-3';
      case 4: return 'grid-cols-2';
      case 5: case 6: return 'grid-cols-3';
      default: return 'grid-cols-1';
    }
  }, [uploadedImages.length]);

  const renderImage = useCallback((image: ImageUpload) => {
    const commonClasses = 'relative w-full h-40 object-cover rounded-xl shadow-md transition-transform duration-300 ease-in-out hover:scale-105';
    let imageClasses = commonClasses;

    return (
      <div key={image.id} className="relative group">
        <img
          src={image.previewUrl}
          alt={`Uploaded photo ${image.id}`}
          className={imageClasses}
        />
        <button
          onClick={() => handleRemoveImage(image.id)}
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
          aria-label="Remove image"
        >
          ✕
        </button>
        <textarea
          value={image.caption}
          onChange={(e) => handleCaptionChange(image.id, e.target.value)}
          placeholder="Add a caption..."
          className="mt-2 w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-pink-300 focus:border-pink-300 transition-all duration-200"
          rows={2}
        />
        <div className="flex gap-1 mt-1 text-xl">
          {['💖', '✨', '🌟', '😊'].map((sticker, idx) => (
            <button
              key={idx}
              onClick={() => handleStickerClick(image.id, sticker)}
              className="hover:scale-125 transition-transform duration-150"
              aria-label={`Add ${sticker} sticker`}
            >
              {sticker}
            </button>
          ))}
        </div>
      </div>
    );
  }, [handleRemoveImage, handleCaptionChange, handleStickerClick]);

  const downloadCollage = useCallback(async () => {
    setIsDownloading(true);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      alert('Failed to get canvas context. Your browser might not support this feature.');
      setIsDownloading(false);
      return;
    }

    const CANVAS_WIDTH = 800;
    let CANVAS_HEIGHT = 600; // Default height, adjust dynamically

    // Load all images first
    const loadedImages = await Promise.all(
      uploadedImages.map((imgUpload) => {
        return new Promise<HTMLImageElement | null>((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous'; // For external images, if any, otherwise not strictly needed for blob URLs
          img.onload = () => resolve(img);
          img.onerror = () => {
            console.error(`Failed to load image: ${imgUpload.previewUrl}`);
            resolve(null);
          };
          img.src = imgUpload.previewUrl;
        });
      })
    );

    const validLoadedImages = uploadedImages.map((imgUpload, index) => ({
      ...imgUpload,
      loadedImage: loadedImages[index],
    })).filter(item => item.loadedImage !== null);

    if (validLoadedImages.length === 0) {
      alert('No valid images to download.');
      setIsDownloading(false);
      return;
    }

    // Dynamic height adjustment for stacked/polaroid
    if (selectedLayout === 'stacked') {
      CANVAS_HEIGHT = Math.max(CANVAS_HEIGHT, validLoadedImages.length * (CANVAS_WIDTH * 0.5 + 80) + 100);
    } else if (selectedLayout === 'polaroid') {
      CANVAS_HEIGHT = Math.max(CANVAS_HEIGHT, validLoadedImages.length * 40 + 350);
    }

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // Draw cute background gradient
    const gradient = ctx.createRadialGradient(
      CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 0,
      CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, Math.max(CANVAS_WIDTH, CANVAS_HEIGHT) / 2
    );
    gradient.addColorStop(0, '#FFF5F7'); // Lighter pink
    gradient.addColorStop(1, '#F0E6FA'); // Lighter purple
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw cutesy background elements (hearts and sparkles)
    const cutesyElements = ['💖', '✨'];
    const cutesyColors = ['rgba(255,192,203,0.3)', 'rgba(240,230,250,0.3)', 'rgba(255,239,213,0.3)']; // Pastel colors with transparency

    for (let i = 0; i < 40; i++) { // Draw 40 cutesy elements
      const element = cutesyElements[Math.floor(Math.random() * cutesyElements.length)];
      const color = cutesyColors[Math.floor(Math.random() * cutesyColors.length)];
      const size = Math.random() * 15 + 15; // 15-30px
      const x = Math.random() * CANVAS_WIDTH;
      const y = Math.random() * CANVAS_HEIGHT;
      const rotation = (Math.random() - 0.5) * 45 * Math.PI / 180; // +/- 45 degrees in radians

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.font = `${size}px Pacifico`; // Use Pacifico for cutesy elements
      ctx.fillStyle = color;
      ctx.fillText(element, 0, 0);
      ctx.restore();
    }

    // Set main text styles (for captions)
    ctx.font = '20px Quicksand';
    ctx.fillStyle = '#4A5568'; // A dark gray for text
    ctx.textAlign = 'center';

    const IMAGE_MARGIN = 20;
    const POLAROID_PADDING = 15;
    const POLAROID_WIDTH = 250; // Fixed width for polaroids on canvas
    const POLAROID_HEIGHT = 200; // Fixed height for image area in polaroid
    const CAPTION_FONT_SIZE = 16;
    // const STICKER_FONT_SIZE = 20; // Not directly used in canvas drawing, handled in caption

    if (selectedLayout === 'grid') {
      const imagesPerRow = validLoadedImages.length === 1 ? 1 : (validLoadedImages.length === 2 || validLoadedImages.length === 4 ? 2 : 3);
      const cellWidth = (CANVAS_WIDTH - IMAGE_MARGIN * (imagesPerRow + 1)) / imagesPerRow;
      const cellHeight = cellWidth * 0.75; // Maintain aspect ratio approximately

      validLoadedImages.forEach((imgUpload, i) => {
        if (!imgUpload.loadedImage) return;

        const row = Math.floor(i / imagesPerRow);
        const col = i % imagesPerRow;
        const x = IMAGE_MARGIN + col * (cellWidth + IMAGE_MARGIN);
        const y = IMAGE_MARGIN + row * (cellHeight + IMAGE_MARGIN);

        ctx.drawImage(imgUpload.loadedImage, x, y, cellWidth, cellHeight);
        
        if (imgUpload.caption) {
          ctx.font = `${CAPTION_FONT_SIZE}px Quicksand`;
          ctx.fillStyle = '#4A5568';
          ctx.fillText(imgUpload.caption, x + cellWidth / 2, y + cellHeight + CAPTION_FONT_SIZE + 5);
        }
      });
    } else if (selectedLayout === 'stacked') {
      validLoadedImages.forEach((imgUpload, i) => {
        if (!imgUpload.loadedImage) return;

        const imgWidth = CANVAS_WIDTH * 0.7; // 70% of canvas width
        const imgHeight = imgWidth * (imgUpload.loadedImage.naturalHeight / imgUpload.loadedImage.naturalWidth);
        const x = (CANVAS_WIDTH - imgWidth) / 2;
        const y = IMAGE_MARGIN + i * (imgHeight * 0.8 + IMAGE_MARGIN); // Slightly overlap

        ctx.drawImage(imgUpload.loadedImage, x, y, imgWidth, imgHeight);

        if (imgUpload.caption) {
          ctx.font = `${CAPTION_FONT_SIZE}px Quicksand`;
          ctx.fillStyle = '#4A5568';
          ctx.fillText(imgUpload.caption, x + imgWidth / 2, y + imgHeight + CAPTION_FONT_SIZE + 5);
        }
      });
    } else if (selectedLayout === 'polaroid') {
      validLoadedImages.forEach((imgUpload, i) => {
        if (!imgUpload.loadedImage) return;

        const totalPolaroidHeight = POLAROID_HEIGHT + POLAROID_PADDING * 2 + CAPTION_FONT_SIZE * 2; // Image + padding + caption
        const x = IMAGE_MARGIN + (i % 2) * (POLAROID_WIDTH + IMAGE_MARGIN * 2); // Stagger left/right
        const y = IMAGE_MARGIN + i * 40; // Overlap vertically

        // Apply random rotation
        const rotationAngle = (Math.random() - 0.5) * 15 * Math.PI / 180; // +/- 15 degrees in radians
        
        ctx.save();
        ctx.translate(x + POLAROID_WIDTH / 2, y + totalPolaroidHeight / 2);
        ctx.rotate(rotationAngle);
        ctx.translate(-(x + POLAROID_WIDTH / 2), -(y + totalPolaroidHeight / 2));

        // Draw polaroid background
        ctx.fillStyle = 'white';
        ctx.fillRect(x, y, POLAROID_WIDTH, totalPolaroidHeight);
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        ctx.fillRect(x, y, POLAROID_WIDTH, totalPolaroidHeight); // Draw again for shadow to apply
        ctx.shadowColor = 'transparent'; // Reset shadow

        // Draw image
        ctx.drawImage(imgUpload.loadedImage, x + POLAROID_PADDING, y + POLAROID_PADDING, POLAROID_WIDTH - POLAROID_PADDING * 2, POLAROID_HEIGHT);

        // Draw caption
        if (imgUpload.caption) {
          ctx.font = `${CAPTION_FONT_SIZE}px Quicksand`;
          ctx.fillStyle = '#4A5568';
          const captionY = y + POLAROID_PADDING + POLAROID_HEIGHT + CAPTION_FONT_SIZE + 5;
          ctx.fillText(imgUpload.caption, x + POLAROID_WIDTH / 2, captionY, POLAROID_WIDTH - POLAROID_PADDING * 2);
        }
        ctx.restore(); // Restore context to original state (undo rotation/translation)
      });
    }

    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'MyGalentineCollage.png';
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsDownloading(false);
  }, [uploadedImages, selectedLayout]);


  return (
    <div className="text-center p-8 bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl max-w-4xl mx-auto w-full animate-fade-in delay-300">
      <h2 className="text-3xl md:text-5xl font-pacifico text-pink-600 mb-4">
        Our Moments ✨
      </h2>
      <p className="text-lg text-gray-700 mb-8">
        Because our memories deserve their own space
      </p>

      <div className="mb-8 p-6 border-2 border-dashed border-pink-200 rounded-xl bg-pink-50 flex flex-col items-center justify-center space-y-4">
        <label htmlFor="file-upload" className="cursor-pointer text-pink-500 hover:text-pink-700 font-semibold text-lg flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Upload 3-6 photos
        </label>
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        {uploadedImages.length > 0 && (
          <p className="text-sm text-gray-600">{uploadedImages.length} photos uploaded (Max 6)</p>
        )}
      </div>

      {uploadedImages.length > 0 && (
        <>
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Choose a layout:</h3>
            <div className="flex justify-center gap-4">
              <Button
                variant={selectedLayout === 'grid' ? 'primary' : 'secondary'}
                onClick={() => setSelectedLayout('grid')}
                size="small"
              >
                Grid
              </Button>
              <Button
                variant={selectedLayout === 'stacked' ? 'primary' : 'secondary'}
                onClick={() => setSelectedLayout('stacked')}
                size="small"
              >
                Stacked
              </Button>
              <Button
                variant={selectedLayout === 'polaroid' ? 'primary' : 'secondary'}
                onClick={() => setSelectedLayout('polaroid')}
                size="small"
              >
                Polaroid
              </Button>
            </div>
          </div>

          <div className={`relative mb-8 p-4 bg-purple-50 rounded-2xl shadow-inner min-h-[300px] flex items-center justify-center`}>
            {selectedLayout === 'grid' && (
              <div className={`grid ${collageGridClass} gap-4 w-full max-w-3xl`}>
                {uploadedImages.map(renderImage)}
              </div>
            )}

            {selectedLayout === 'stacked' && (
              <div className="flex flex-col items-center space-y-4 w-full max-w-sm">
                {uploadedImages.map(renderImage)}
              </div>
            )}

            {selectedLayout === 'polaroid' && (
              <div className="relative w-full max-w-3xl h-auto min-h-[400px]">
                {uploadedImages.map((image, index) => (
                  <div
                    key={image.id}
                    className="absolute w-48 h-auto p-4 bg-white shadow-xl rounded-md transition-all duration-300 ease-out"
                    style={{
                      top: `${index * 20 + Math.random() * 20}px`,
                      left: `${index * 20 + Math.random() * 20}px`,
                      zIndex: uploadedImages.length - index,
                      transform: `rotate(${(Math.random() - 0.5) * 20}deg)`, // Random slight rotation
                    }}
                  >
                    <img
                      src={image.previewUrl}
                      alt={`Polaroid photo ${image.id}`}
                      className="w-full h-32 object-cover mb-2"
                    />
                    <button
                        onClick={() => handleRemoveImage(image.id)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs z-10"
                        aria-label="Remove image"
                    >
                        ✕
                    </button>
                    {/* Caption input for polaroid directly on the polaroid card */}
                    <textarea
                        value={image.caption}
                        onChange={(e) => handleCaptionChange(image.id, e.target.value)}
                        placeholder="Add a caption..."
                        className="mt-2 w-full p-1 text-xs border border-gray-200 rounded-md focus:ring-pink-300 focus:border-pink-300 resize-none"
                        rows={1}
                    />
                    <div className="flex gap-1 mt-1 text-lg justify-center">
                        {['💖', '✨', '🌟', '😊'].map((sticker, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleStickerClick(image.id, sticker)}
                                className="hover:scale-125 transition-transform duration-150"
                                aria-label={`Add ${sticker} sticker`}
                            >
                                {sticker}
                            </button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
        <Button
          onClick={downloadCollage}
          disabled={uploadedImages.length === 0 || isDownloading}
          icon="📸"
        >
          {isDownloading ? 'Generating...' : 'Download Collage'}
        </Button>
        <Button
          onClick={() => onNext(uploadedImages, selectedLayout)}
          disabled={uploadedImages.length === 0}
          icon="🎀"
        >
          Reasons I Chose You
        </Button>
      </div>
    </div>
  );
};

export default CollageMaker;