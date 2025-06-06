import {Dimensions, PixelRatio} from 'react-native';

const {width, height} = Dimensions.get('window');

// Base scale (reference size from a standard screen, e.g., iPhone 11)
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

// Scale functions
export const scale = (size: number) => (width / guidelineBaseWidth) * size;
export const verticalScale = (size: number) =>
  (height / guidelineBaseHeight) * size;
export const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

// Font scaling
export const scaleFont = (size: number) => size * PixelRatio.getFontScale();
