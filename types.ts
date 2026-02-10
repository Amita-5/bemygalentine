export type GalentineStep =
  'hero' |
  'collage' |
  'reasons' |
  'final' |
  'post-proposal-collage';

export interface ImageUpload {
  id: string;
  file: File;
  previewUrl: string;
  caption: string;
}

export type CollageLayout = 'grid' | 'stacked' | 'polaroid';

export interface ReasonCard {
  id: string;
  text: string;
  emoji: string;
  bg: string;
}