
import { Block, BackgroundStyle } from './block.model';
import { ColorThemeType } from './builder-document.model';

// Re-export for compatibility if needed, though direct import is preferred
export type { BackgroundStyle as SectionBackgroundStyle } from './block.model';
export type { StrokeStyle, PaddingPreset, BlendMode } from './block.model';

export interface SectionSettings {
  design: {
    grid: {
      rowCount: number;
      gap: 'no-gap' | 'small' | 'large';
    };
    section: {
      fillScreen: boolean;
      height: 'S' | 'M' | 'L';
      alignment: 'top' | 'center' | 'bottom';
    };
    styling: {
      divider: boolean;
    };
    anchor: string;
  };
  background: {
    type: 'image' | 'video' | 'art';
    imageSrc?: string;
    width: 'full-bleed' | 'inset';
  };
  // Use the shared style interface
  backgroundStyle: BackgroundStyle;
  colorTheme: ColorThemeType;
}

export interface UiComponent {
  id: string;
  type: 'hero' | 'features' | 'content' | 'cta' | 'footer' | 'pricing' | 'button';
  title: string;
  description: string;
  bg: 'white' | 'gray' | 'green';
  linkedWorkflowId?: string;
  blocks?: Block[];
  settings?: SectionSettings;
}
