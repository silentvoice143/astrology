import {TextStyle} from 'react-native';
import {scaleFont} from '../utils/sizer';

export const textStyle = {
  // AbyssinicaSIL-Regular (only has regular weight)
  fs_abyss_10_400: {
    fontSize: scaleFont(10),
    fontFamily: 'AbyssinicaSIL-Regular',
    fontWeight: 400,
  },
  fs_abyss_12_400: {
    fontSize: scaleFont(12),
    fontFamily: 'AbyssinicaSIL-Regular',
    fontWeight: 400,
  },
  fs_abyss_14_400: {
    fontSize: scaleFont(14),
    fontFamily: 'AbyssinicaSIL-Regular',
    fontWeight: 400,
  },
  fs_abyss_16_400: {
    fontSize: scaleFont(16),
    fontFamily: 'AbyssinicaSIL-Regular',
    fontWeight: 400,
  },
  fs_abyss_18_400: {
    fontSize: scaleFont(18),
    fontFamily: 'AbyssinicaSIL-Regular',
    fontWeight: 400,
  },
  fs_abyss_20_400: {
    fontSize: scaleFont(20),
    fontFamily: 'AbyssinicaSIL-Regular',
    fontWeight: 400,
  },
  fs_abyss_24_400: {
    fontSize: scaleFont(24),
    fontFamily: 'AbyssinicaSIL-Regular',
    fontWeight: 400,
  },
  fs_abyss_28_400: {
    fontSize: scaleFont(28),
    fontFamily: 'AbyssinicaSIL-Regular',
    fontWeight: 400,
  },
  fs_abyss_32_400: {
    fontSize: scaleFont(32),
    fontFamily: 'AbyssinicaSIL-Regular',
    fontWeight: 400,
  },
  fs_abyss_36_400: {
    fontSize: scaleFont(36),
    fontFamily: 'AbyssinicaSIL-Regular',
    fontWeight: 400,
  },

  // Montserrat - 400 (Regular)
  ...generateMontserratStyles('Regular', 400),

  // Montserrat - 500 (Medium)
  ...generateMontserratStyles('Medium', 500),

  // Montserrat - 600 (SemiBold)
  ...generateMontserratStyles('SemiBold', 600),

  // Montserrat - 700 (Bold)
  ...generateMontserratStyles('Bold', 700),
};
type MontserratWeight = 400 | 500 | 600 | 700;
type FontSize = 10 | 12 | 14 | 16 | 18 | 20 | 24 | 28 | 32 | 36;

type StyleKey = `fs_mont_${FontSize}_${MontserratWeight}`;

export function generateMontserratStyles(
  fontFamilySuffix: string,
  weight: MontserratWeight,
): Record<StyleKey, TextStyle> {
  const styles = {} as Record<StyleKey, TextStyle>;

  const fontSizes: FontSize[] = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36];

  fontSizes.forEach(size => {
    const key = `fs_mont_${size}_${weight}` as StyleKey;
    styles[key] = {
      fontSize: scaleFont(size),
      fontFamily: `Montserrat-${fontFamilySuffix}`,
      fontWeight: weight,
    };
  });

  return styles;
}
