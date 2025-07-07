import {
  Dimensions,
  Text,
  View,
  Pressable,
  LayoutChangeEvent,
} from 'react-native';
import {useEffect, useState} from 'react';
import Carousel from '../../carosel';
import BasicDetails from '../../kundli/basic-detail';
import NakshatraAndDosha from '../../kundli/nakshatra';
import KundliPage from '../../kundli/kundli-page';
import LagnaChart from '../../kundli/charts/lagna-chart';
import RasiChart from '../../kundli/charts/rasi-chart';
import {scale, verticalScale} from '../../../utils/sizer';
import {colors} from '../../../constants/colors';
import CloseIcon from '../../../assets/icons/close-icon';
import {textStyle} from '../../../constants/text-style';

const SessionKundliModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number>(
    Dimensions.get('screen').width * 0.8,
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({screen}) => {
      setContainerWidth(screen.width * 0.8);
    });

    return () => subscription?.remove?.(); // clean up listener
  }, []);

  if (!isOpen) return null;

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        backgroundColor: colors.bg.overlay,
      }}>
      <View
        style={{
          height: '80%',
          width: containerWidth,
          backgroundColor: colors.primary_surface,
          borderRadius: scale(16),
          overflow: 'hidden',
        }}>
        <View
          style={{
            paddingHorizontal: scale(20),
            paddingVertical: verticalScale(20),
          }}>
          <Text style={[textStyle.fs_mont_18_600]}>Kundli</Text>
          <Pressable
            onPress={onClose}
            style={{
              position: 'absolute',
              top: scale(12),
              right: scale(12),
              zIndex: 10,
              padding: 8,
            }}>
            <CloseIcon />
          </Pressable>
        </View>

        <View style={{flex: 1, marginBottom: verticalScale(20)}}>
          <Carousel
            data={[
              {
                id: 1,
                screen: 'Lagna Chart',
                data: (
                  <LagnaChart
                    active={selectedTab}
                    chartWidth={containerWidth}
                  />
                ),
              },
              {
                id: 4,
                screen: 'Rasi Chart',
                data: (
                  <RasiChart active={selectedTab} chartWidth={containerWidth} />
                ),
              },
              {
                id: 2,
                screen: 'Basic details',
                data: <BasicDetails active={selectedTab} />,
              },
              {
                id: 3,
                screen: 'Nakshatra',
                data: <NakshatraAndDosha active={selectedTab} />,
              },
            ]}
            pagination={false}
            cardWidthScale={0.8}
            CardComponent={KundliPage}
            showTabs={true}
            onChange={(index: number) => setSelectedTab(index)}
          />
        </View>
      </View>
    </View>
  );
};

export default SessionKundliModal;
