import React, {use, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Pressable,
} from 'react-native';

import {useAppDispatch, useAppSelector} from '../../../hooks/redux-hook';
import {kundliChart} from '../../../store/reducer/kundli';
import {SvgXml} from 'react-native-svg';
import {customizeSVG} from '../../../utils/customize-svg';
import {scale, verticalScale} from '../../../utils/sizer';
import {textStyle} from '../../../constants/text-style';
import {colors, themeColors} from '../../../constants/colors';
import ChangeIcon from '../../../assets/icons/change-icon';
import DocumentDownloadIcon from '../../../assets/icons/download-file-icon';
import ChangeKundliTypeModal from '../modal/change-type-modal';
import {makeResponsiveSVG} from '../../../utils/utils';
import {useTranslation} from 'react-i18next';
import Toast from 'react-native-toast-message';

const NavamshaChart = ({
  forModal = false,
  active,
  chartWidth,
}: {
  forModal?: boolean;
  active?: number;
  chartWidth?: number;
}) => {
  const [width, setWidth] = useState(
    chartWidth ? chartWidth : Dimensions.get('screen').width,
  );
  const tags = [
    {label: 'Retrograde', symbol: '⭒'},
    {label: 'Exalted', symbol: '+'},
    {label: 'Debilitated', symbol: '⬇'},
    {label: 'Combust', symbol: '^'},
    {label: 'Vargottama', symbol: '¤'},
  ];

  const planetData = [
    {planet: 'Lagna', symbol: 'La', position: '08°31\'06"'},
    {planet: 'Sun', symbol: 'Su', position: '15°12\'24"'},
    {planet: 'Moon', symbol: 'Mo', position: '21°42\'55"'},
  ];
  const [changeKundliOpen, setChangeKundliOpen] = useState(false);
  const {kundliPerson} = useAppSelector(state => state.kundli);
  const [chartSvg, setChartSvg] = useState<string | null>(null);
  const {t} = useTranslation();

  const [selectedKundliType, setSelectedKundliType] = useState(
    t('lan') === 'bn'
      ? {
          label: 'East-Indian Style',
          id: 'east_indian_style',
          value: 'east',
        }
      : {
          label: 'North-Indian Style',
          id: 'north_indian_style',
          value: 'north',
        },
  );

  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();

  const getKundliChartData = async () => {
    try {
      setLoading(true);

      const body = {
        ...kundliPerson,
        birthPlace: 'Varanasi',
        latitude: 25.317645,
        longitude: 82.973915,
      };

      const payload: any = await dispatch(
        kundliChart({
          body,
          query: {
            chartType: 'D9',
            chartStyle: selectedKundliType.value,
            lan: t('lan'),
          },
        }),
      ).unwrap();

      if (payload) {
        setChartSvg(payload);
      } else {
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Failed to fetch chart',
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (chartWidth) return;
    const onChange = ({screen}: {screen: {width: number}}) => {
      setWidth(screen.width);
    };

    const subscription = Dimensions.addEventListener('change', onChange);

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (active === 1) {
      getKundliChartData();
    }
  }, [dispatch, kundliPerson, selectedKundliType, active]);

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color={themeColors.surface.darkPink} />
        <Text>Please wait a moment</Text>
      </View>
    );
  }

  return (
    <View>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: scale(8),
          paddingHorizontal: scale(20),
          paddingVertical: verticalScale(8),
        }}>
        <View
          style={{
            borderColor: colors.primary_surface_2,
            borderWidth: 1,
            flex: 1,
            paddingVertical: verticalScale(12),
            paddingHorizontal: scale(8),
            borderRadius: scale(24),
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text style={[textStyle.fs_abyss_16_400]}>
            {selectedKundliType.label}
          </Text>
        </View>
        <Pressable
          style={{
            height: verticalScale(40),
            width: verticalScale(40),
            backgroundColor: colors.primary_surface_2,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: scale(20),
          }}
          onPress={() => setChangeKundliOpen(true)}>
          <ChangeIcon size={30} color={colors.primary_surface} />
        </Pressable>
        {/* <Pressable
          style={{
            height: verticalScale(40),
            width: verticalScale(40),
            backgroundColor: colors.primary_surface_2,
            paddingHorizontal: scale(8),
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: scale(20),
          }}>
          <DocumentDownloadIcon size={24} color={colors.primary_surface} />
        </Pressable> */}
      </View>
      <ScrollView
        style={{marginBottom: verticalScale(20)}}
        contentContainerStyle={styles.container}>
        {/* Kundli Chart */}
        {chartSvg ? (
          <View style={{width: width - 40, height: width - 40}}>
            <SvgXml
              xml={makeResponsiveSVG(
                chartSvg,
                width,
                width,
                selectedKundliType.value == 'east',
              )}
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid meet"
              style={{width: '100%', height: '100%'}}
            />
          </View>
        ) : null}

        <Text
          style={[
            textStyle.fs_abyss_12_400,
            {textAlign: 'center', color: colors.secondaryText},
          ]}>
          You can download this kundli with all the additional details usign the
          top right button in pdf format
        </Text>
        {changeKundliOpen && (
          <ChangeKundliTypeModal
            isOpen={changeKundliOpen}
            onClose={() => setChangeKundliOpen(false)}
            selectedOption={selectedKundliType}
            onChange={kundli => {
              kundli && setSelectedKundliType(kundli);
              setChangeKundliOpen(false);
            }}
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fefefe',
    gap: 20,
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(20),
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kundliContainer: {
    aspectRatio: 1,
    width: '100%',
    maxWidth: 320,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignSelf: 'center',
    borderRadius: 12,
    backgroundColor: '#fff6c2',
    borderWidth: 1,
    borderColor: '#e3b800',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    elevation: 3,
  },
  kundliBox: {
    width: '33.33%',
    height: '33.33%',
    borderWidth: 0.5,
    borderColor: '#e3b800',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  tag: {
    backgroundColor: '#f3f3f3',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  tagText: {
    fontSize: 13,
    color: '#444',
  },
  tableContainer: {
    marginTop: 10,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#ff8c00',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  headerCell: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#fff',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    color: '#333',
    fontSize: 14,
  },
});

export default NavamshaChart;
