
import type { GarmentView, PrintableArea } from './types';

export const GARMENT_VIEWS: Record<GarmentView, string> = {
  front: 'https://i.imgur.com/2a9e2D8.png', // Plain white t-shirt front
  back: 'https://i.imgur.com/eNxtb5o.png', // Plain white t-shirt back
};

// These values are based on a canvas size of 800x800
// and a garment image that fits well within it.
export const PRINTABLE_AREAS: Record<GarmentView, PrintableArea> = {
  front: {
    left: 275,
    top: 150,
    width: 250,
    height: 350,
    realWidthInches: 12,
  },
  back: {
    left: 275,
    top: 150,
    width: 250,
    height: 400,
    realWidthInches: 12,
  },
};

export const PPI_THRESHOLD = 100; // Pixels Per Inch threshold for quality warning
