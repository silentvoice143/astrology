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
import {colors} from '../../../constants/colors';
import ChangeIcon from '../../../assets/icons/change-icon';
import DocumentDownloadIcon from '../../../assets/icons/download-file-icon';
import ChangeKundliTypeModal from '../modal/change-type-modal';

const LagnaChart = ({
  active,
  chartWidth,
}: {
  active: number;
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
  const [chartSvgLagna, setChartSvgLagna] = useState<string | null>(null);

  const [selectedKundliType, setSelectedKundliType] = useState({
    label: 'East-Indian Style',
    id: 'east_indian_style',
    value: 'east-indian',
  });

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

      console.log('api body', body);

      // call both API requests in parallel:
      const [lagnaPayload] = await Promise.all([
        dispatch(
          kundliChart({
            body,
            query: {chartType: 'lagna', chartStyle: selectedKundliType.value},
          }),
        ).unwrap(),
      ]);

      console.log(lagnaPayload, '----kundli chart data (lagna)');

      setChartSvgLagna(customizeSVG(lagnaPayload));
    } catch (err) {
      console.log(err);
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
    getKundliChartData();
  }, [dispatch, kundliPerson, selectedKundliType]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size={20} />
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
        <Pressable
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
        </Pressable>
      </View>
      <ScrollView
        style={{marginBottom: verticalScale(20)}}
        contentContainerStyle={styles.container}>
        {/* Kundli Chart */}
        {chartSvgLagna ? (
          <SvgXml xml={chartSvgLagna} height={width - 28} width={width - 28} />
        ) : null}

        <Text
          style={[
            textStyle.fs_abyss_12_400,
            {textAlign: 'center', color: colors.secondaryText},
          ]}>
          You can download this kundli with all the additional details usign the
          top right button in pdf format
        </Text>
        <ChangeKundliTypeModal
          isOpen={changeKundliOpen}
          onClose={() => setChangeKundliOpen(false)}
          selectedOption={selectedKundliType}
          onChange={kundli => {
            kundli && setSelectedKundliType(kundli);
            setChangeKundliOpen(false);
          }}
        />
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

export default LagnaChart;
