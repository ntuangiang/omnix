
export type StrokeStyle = 'none' | 'solid' | 'dashed';
export type PaddingPreset = 'NONE' | 'S' | 'M' | 'L' | 'CUSTOM';
export type BlendMode = 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten';
export type BlurMode = 'element' | 'backdrop';

export interface BackgroundStyle {
  enabled: boolean;
  color: { r: number; g: number; b: number; a: number };
  stroke: StrokeStyle;
  cornerRadius: number;
  paddingPreset: PaddingPreset;
  paddingTopBottomPct: number;
  paddingLeftRightPct: number;
  blendMode: BlendMode;
  blurEnabled: boolean;
  blurMode: BlurMode;
  blurAmountPx: number;
}

export interface Block {
  id: string;
  type: string;
  x: number; // Grid Column
  y: number; // Grid Row
  w: number; // Width in Columns
  h: number; // Height in Rows
  content?: any;
  style?: BackgroundStyle;
}
