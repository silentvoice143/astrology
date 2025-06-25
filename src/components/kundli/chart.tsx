import React, {use, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';

import {useAppDispatch, useAppSelector} from '../../hooks/redux-hook';
import {kundliChart} from '../../store/reducer/kundli';
import {SvgXml} from 'react-native-svg';
import {customizeSVG} from '../../utils/customize-svg';
import {scale, verticalScale} from '../../utils/sizer';

const ChartPage = ({active}: {active: number}) => {
  const [width, setWidth] = useState(Dimensions.get('screen').width);
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

  const {kundliPerson} = useAppSelector(state => state.kundli);
  const [chartSvg, setChartSvg] = useState<string | null>(null);
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
      const payload = await dispatch(
        kundliChart({
          body: body,
          query: {chartType: 'lagna', chartStyle: 'east-indian'},
        }),
      ).unwrap();
      console.log(payload, '----kundli chart data');
      setChartSvg(customizeSVG(payload));
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const onChange = ({screen}: {screen: {width: number}}) => {
      setWidth(screen.width);
    };

    const subscription = Dimensions.addEventListener('change', onChange);

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    getKundliChartData();
  }, [dispatch, kundliPerson]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size={20} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Kundli Chart */}
      {chartSvg ? (
        <SvgXml xml={chartSvg} height={width - 28} width={width - 28} />
      ) : null}
    </ScrollView>
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

export default ChartPage;
