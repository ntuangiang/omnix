
export type ColorThemeType = 'LIGHTEST_1' | 'LIGHTEST_2' | 'LIGHT_1' | 'LIGHT_2' | 'BRIGHT_1' | 'BRIGHT_2' | 'DARK_1' | 'DARK_2' | 'DARKEST_1' | 'DARKEST_2';

export interface GridConfig {
  cellW: number;
  cellH: number;
  gap: number;
  paddingX: number;
  paddingY: number;
}

export const DEFAULT_GRID: GridConfig = {
  cellW: 32,
  cellH: 32,
  gap: 8,
  paddingX: 48,
  paddingY: 48
};
