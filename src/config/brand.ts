
import logoAsset from '../assets/optistyle-logo.svg';
import { BRAND_NAME, BRAND_COLORS, PDF_VECTOR_PATH } from './brand.constants';

// SINGLE SOURCE OF TRUTH FOR BRANDING
export const brandLogo = logoAsset;
export const brandName = BRAND_NAME;
export const brandColors = BRAND_COLORS;

// Export vector path for consistency, though primarily for backend
export { PDF_VECTOR_PATH };
