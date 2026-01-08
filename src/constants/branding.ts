
// DEPRECATED: Please use 'src/config/brand.ts' for Frontend logic.
// This file is maintained for Backend/PDF Generator compatibility.

import { PDF_VECTOR_PATH, BRAND_COLORS, BRAND_NAME } from '../config/brand.constants.ts';

export const BRAND = {
  name: BRAND_NAME,
  tagline: "Vision, Refined.",
  website: "https://optistyle.com",
  colors: {
    primary: BRAND_COLORS.primary,
    primaryDark: '#1E40AF',
    text: BRAND_COLORS.dark,
    textLight: '#64748B',
    bg: '#F8FAFC',
    white: BRAND_COLORS.light
  }
};

// MASTER LOGO DEFINITION FOR BACKEND
export const LOGO_ASSET = {
  path: PDF_VECTOR_PATH, 
  viewBox: "0 0 24 24",
  originalWidth: 24,
  originalHeight: 24
};
