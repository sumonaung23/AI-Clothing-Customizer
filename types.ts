export type GarmentView = 'front' | 'back';

export interface PrintableArea {
  left: number;
  top: number;
  width: number;
  height: number;
  realWidthInches: number; // Real-world width in inches for dimension calculation
}

export interface SelectedObjectInfo {
  type: 'image' | 'text';
  widthInches: number;
  heightInches: number;
  rotation: number;
  src?: string; // Original base64 source for images
  fileType?: string; // e.g., 'image/jpeg'
  ppi?: number;
  qualityWarning: boolean;
}

export type FilterType = 'none' | 'grayscale' | 'sepia' | 'invert' | 'vintage';
