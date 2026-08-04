'use client';

import { useMemo } from 'react';
import { useThemeColors, useThemeFonts } from '@/app/hooks/useTheme';

/**
 * Backward-compatible section theme hook used by serving-area sections.
 * Keeps a stable return shape: { colors, fonts }.
 */
export function useSectionTheme() {
  const colors = useThemeColors();
  const fonts = useThemeFonts();

  return useMemo(
    () => ({
      colors,
      fonts,
    }),
    [colors, fonts]
  );
}

export default useSectionTheme;
