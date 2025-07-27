import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useAppDispatch, useAppSelector} from '../../hooks/redux-hook';
import {kundliVimshottari} from '../../store/reducer/kundli';
import {useTranslation} from 'react-i18next';
import {themeColors} from '../../constants/colors';
import {scale, verticalScale} from '../../utils/sizer';
import ChangeIcon from '../../assets/icons/change-icon';
import ChangeDashaModal from './modal/change-dasha-modal';
import {parseISO, isValid, format, differenceInDays} from 'date-fns';

const {width} = Dimensions.get('window');

interface DashaPeriod {
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  antar_dasha?: {[key: string]: DashaPeriod};
}

interface DashaData {
  [key: string]: DashaPeriod;
}

interface ProcessedDashaItem {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  duration: string;
  hasSubPeriods: boolean;
  subPeriods?: ProcessedDashaItem[];
  level: number;
  parentPlanet?: string;
}

const VimshottariDasha = ({active}: {active?: number}) => {
  const [rawData, setRawData] = useState<DashaData | null>(null);
  const [processedData, setProcessedData] = useState<ProcessedDashaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');

  const dispatch = useAppDispatch();
  const {t} = useTranslation();
  const kundliPerson = useAppSelector(state => state.kundli.kundliPerson);

  const [dashaType, setDashaType] = useState<
    'maha-dasha' | 'antar-dasha' | 'pratyantar-dasha' | 'sookshma-dasha'
  >('antar-dasha');
  const [showDashaModal, setShowDashaModal] = useState(false);

  const safeFormatDate = (dateString: string): string => {
    const parsed = parseISO(dateString);
    return isValid(parsed) ? format(parsed, 'dd-MM-yyyy') : '';
  };

  // Utility to calculate duration string
  const calculateDuration = (startDate: string, endDate: string): string => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);

    if (!isValid(start) || !isValid(end)) return '';

    const diffDays = differenceInDays(end, start);
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    const days = diffDays % 30;

    if (years > 0) return `${years}y ${months}m ${days}d`;
    if (months > 0) return `${months}m ${days}d`;
    return `${days}d`;
  };

  // Recursively process data and skip invalid dates
  const NESTED_KEYS = ['antar_dasha', 'pratyantar_dasha', 'sookshma_dasha'];

  const processDashaData = (
    data: DashaData,
    level: number = 0,
    parentId: string = '',
    parentPlanet?: string,
  ): ProcessedDashaItem[] => {
    return Object.entries(data).flatMap(([planet, period], index) => {
      const startDateRaw = period.start_date || period.start_time || '';
      const endDateRaw = period.end_date || period.end_time || '';

      const startDate = parseISO(startDateRaw);
      const endDate = parseISO(endDateRaw);

      if (!isValid(startDate) || !isValid(endDate)) return [];

      const id = `${parentId ? `${parentId}-` : ''}${planet}-${level}-${index}`;

      const item: ProcessedDashaItem = {
        id,
        title: planet,
        startDate: startDateRaw,
        endDate: endDateRaw,
        duration: calculateDuration(startDateRaw, endDateRaw),
        hasSubPeriods: false,
        level,
        parentPlanet,
      };

      for (const key of NESTED_KEYS) {
        if (period[key as keyof DashaPeriod]) {
          item.hasSubPeriods = true;
          item.subPeriods = processDashaData(
            period[key as keyof DashaPeriod] as DashaData,
            level + 1,
            id,
            planet,
          );
          break; // only one nested key per level
        }
      }

      return [item];
    });
  };

  // Flatten nested items to linear array
  const flattenDashaData = (
    items: ProcessedDashaItem[],
  ): ProcessedDashaItem[] => {
    return items.reduce<ProcessedDashaItem[]>((acc, item) => {
      acc.push(item);
      if (item.subPeriods) acc.push(...flattenDashaData(item.subPeriods));
      return acc;
    }, []);
  };

  // Toggle expansion of dasha periods
  const toggleExpansion = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  // Find current active dasha
  const getCurrentActiveDasha = (
    data: ProcessedDashaItem[],
  ): ProcessedDashaItem | null => {
    const now = new Date();
    const allItems = flattenDashaData(data);

    return (
      allItems.find(item => {
        const start = parseISO(item.startDate);
        const end = parseISO(item.endDate);
        return isValid(start) && isValid(end) && now >= start && now <= end;
      }) || null
    );
  };

  const fetchKundliDetails = async () => {
    setLoading(true);
    try {
      const payload = await dispatch(
        kundliVimshottari({
          body: {
            ...kundliPerson,
            birthPlace: 'Varanasi',
            latitude: 25.317645,
            longitude: 82.973915,
          },
          query: {dashaType, lan: t('lan')},
        }),
      ).unwrap();

      if (payload.success) {
        // For demonstration, I'll use the provided JSON data
        // Replace this with: const dashaDetails = payload.dasha.data;
        const dashaDetails = payload.dasha.data.maha_dasha;
        // console.log(dashaDetails, '----dasha details');

        setRawData(dashaDetails);
        const processed = processDashaData(dashaDetails);
        setProcessedData(processed);
      }
    } catch (err) {
      console.error('Error fetching kundli details:', err);
    } finally {
      setLoading(false);
      setShowDashaModal(false);
    }
  };

  useEffect(() => {
    if (active === 4) {
      fetchKundliDetails();
      setExpandedItems(new Set());
    }
  }, [dispatch, kundliPerson, dashaType, active]);

  // Render individual dasha card
  const renderDashaCard = ({item}: {item: ProcessedDashaItem}) => {
    const isExpanded = expandedItems.has(item.id);
    const isActive = getCurrentActiveDasha([item])?.id === item.id;

    return (
      <View
        style={[
          styles.card,
          {marginLeft: item.level * scale(16)},
          isActive && styles.activeCard,
        ]}>
        <Pressable
          onPress={() => item.hasSubPeriods && toggleExpansion(item.id)}
          style={styles.cardHeader}>
          <View style={styles.planetInfo}>
            <View
              style={[
                styles.planetIndicator,
                {backgroundColor: getPlanetColor(item.title)},
              ]}
            />
            <View style={styles.planetDetails}>
              <Text
                style={[
                  styles.planetTitle,
                  isActive && styles.activePlanetTitle,
                ]}>
                {item.title}
                {item.parentPlanet && (
                  <Text style={styles.parentPlanet}>
                    {' '}
                    in {item.parentPlanet}
                  </Text>
                )}
              </Text>
              <Text style={styles.duration}>{item.duration}</Text>
            </View>
          </View>

          {item.hasSubPeriods && (
            <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
          )}
        </Pressable>

        <View style={styles.dateContainer}>
          <View style={styles.dateBox}>
            <Text style={styles.dateLabel}>Start</Text>
            <Text style={styles.dateValue}>
              {safeFormatDate(item.startDate)}
            </Text>
          </View>
          <View style={styles.dateSeparator} />
          <View style={styles.dateBox}>
            <Text style={styles.dateLabel}>End</Text>
            <Text style={styles.dateValue}>
              {/* {format(parseISO(item.endDate), 'dd-MM-yyyy')}
               */}
              {safeFormatDate(item.endDate)}
            </Text>
          </View>
        </View>

        {isActive && (
          <View style={styles.activeIndicator}>
            <Text style={styles.activeText}>● Currently Active</Text>
          </View>
        )}

        {isExpanded && item.subPeriods && (
          <View style={styles.subPeriodsContainer}>
            {item.subPeriods.map(subItem => (
              <View key={subItem.id}>{renderDashaCard({item: subItem})}</View>
            ))}
          </View>
        )}
      </View>
    );
  };

  // Get planet color for visual distinction
  const getPlanetColor = (planet: string): string => {
    const colors: {[key: string]: string} = {
      Sun: '#FFD700',
      Moon: '#C0C0C0',
      Mars: '#FF4500',
      Mercury: '#32CD32',
      Jupiter: '#FF6347',
      Venus: '#FF69B4',
      Saturn: '#4169E1',
      Rahu: '#8B4513',
      Ketu: '#808080',
    };
    return colors[planet] || '#6B7280';
  };

  // Render overview mode
  const renderOverview = () => {
    const activeDasha = getCurrentActiveDasha(processedData);

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.overviewContainer}>
        {activeDasha && (
          <View style={styles.currentDashaCard}>
            <Text style={styles.currentDashaTitle}>Current Active Period</Text>
            <View style={styles.currentDashaContent}>
              <View
                style={[
                  styles.currentPlanetIndicator,
                  {backgroundColor: getPlanetColor(activeDasha.title)},
                ]}
              />
              <View>
                <Text style={styles.currentPlanetName}>
                  {activeDasha.title}
                </Text>
                <Text style={styles.currentDashaDate}>
                  {safeFormatDate(activeDasha.startDate)} -{' '}
                  {safeFormatDate(activeDasha.endDate)}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.timelineContainer}>
          <Text style={styles.timelineTitle}>Dasha Timeline</Text>
          {processedData.map((item, index) => (
            <View key={item.id} style={styles.timelineItem}>
              <View style={styles.timelineIndicator}>
                <View
                  style={[
                    styles.timelineDot,
                    {backgroundColor: getPlanetColor(item.title)},
                  ]}
                />
                {index < processedData.length - 1 && (
                  <View style={styles.timelineLine} />
                )}
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelinePlanet}>{item.title}</Text>
                <Text style={styles.timelineDuration}>{item.duration}</Text>
                <Text style={styles.timelineDate}>
                  {safeFormatDate(item.startDate)} -{' '}
                  {safeFormatDate(item.endDate)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color={themeColors.surface.darkPink} />
        <Text>Please wait a moment</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header]}>
        <Text style={styles.heading}>
          {t(`dasha.${dashaType}`)} Dasha Periods
        </Text>
        <View style={styles.headerActions}>
          <Pressable
            style={[
              styles.viewModeButton,
              viewMode === 'overview' && styles.activeViewMode,
            ]}
            onPress={() => setViewMode('overview')}>
            <Text
              style={[
                styles.viewModeText,
                viewMode === 'overview' && styles.activeViewModeText,
              ]}>
              Overview
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.viewModeButton,
              viewMode === 'detailed' && styles.activeViewMode,
            ]}
            onPress={() => setViewMode('detailed')}>
            <Text
              style={[
                styles.viewModeText,
                viewMode === 'detailed' && styles.activeViewModeText,
              ]}>
              Detailed
            </Text>
          </Pressable>
          <Pressable
            style={styles.changeButton}
            onPress={() => setShowDashaModal(true)}>
            <ChangeIcon size={20} color={themeColors.text.primary} />
          </Pressable>
        </View>
      </View>

      {/* Content */}
      {viewMode === 'overview' ? (
        renderOverview()
      ) : (
        <FlatList
          data={processedData}
          keyExtractor={item => item.id}
          renderItem={renderDashaCard}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {showDashaModal && (
        <ChangeDashaModal
          isOpen={showDashaModal}
          onClose={() => setShowDashaModal(false)}
          selectedOption={dashaType}
          onChange={val => setDashaType(val)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.surface.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(16),
    backgroundColor: themeColors.surface.mutedSurface,
    elevation: 2,
  },
  heading: {
    fontSize: scale(18),
    fontWeight: '700',
    color: themeColors.text.primary,
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  viewModeButton: {
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: scale(16),
    backgroundColor: 'transparent',
  },
  activeViewMode: {
    backgroundColor: themeColors.surface.primarySurface,
  },
  viewModeText: {
    fontSize: scale(12),
    color: themeColors.text.primary,
  },
  activeViewModeText: {
    color: themeColors.text.light,
    fontWeight: '600',
  },
  changeButton: {
    height: verticalScale(32),
    width: verticalScale(32),
    backgroundColor: themeColors.surface.secondarySurface,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scale(16),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: scale(16),
  },
  card: {
    backgroundColor: themeColors.surface.secondarySurface,
    borderRadius: scale(12),
    marginBottom: verticalScale(12),
    overflow: 'hidden',
    borderLeftWidth: scale(4),
    borderLeftColor: '#E5E5E5',
  },
  activeCard: {
    borderLeftColor: '#4CAF50',
    backgroundColor: '#F8FFF8',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: scale(16),
  },
  planetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  planetIndicator: {
    width: scale(12),
    height: scale(12),
    borderRadius: scale(6),
    marginRight: scale(12),
  },
  planetDetails: {
    flex: 1,
  },
  planetTitle: {
    fontSize: scale(16),
    fontWeight: '600',
    color: '#333',
  },
  activePlanetTitle: {
    color: '#2E7D32',
  },
  parentPlanet: {
    fontSize: scale(14),
    fontWeight: '400',
    color: '#666',
  },
  duration: {
    fontSize: scale(12),
    color: '#888',
    marginTop: verticalScale(2),
  },
  expandIcon: {
    fontSize: scale(16),
    color: '#666',
  },
  dateContainer: {
    flexDirection: 'row',
    paddingHorizontal: scale(16),
    paddingBottom: scale(16),
  },
  dateBox: {
    flex: 1,
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: scale(12),
    color: '#888',
    marginBottom: verticalScale(4),
  },
  dateValue: {
    fontSize: scale(14),
    fontWeight: '500',
    color: '#333',
  },
  dateSeparator: {
    width: scale(1),
    backgroundColor: '#E5E5E5',
    marginHorizontal: scale(16),
  },
  activeIndicator: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
  },
  activeText: {
    fontSize: scale(12),
    color: '#2E7D32',
    fontWeight: '600',
  },
  subPeriodsContainer: {
    backgroundColor: '#FAFAFA',
    paddingVertical: verticalScale(8),
  },
  // Overview styles
  overviewContainer: {
    flex: 1,
    padding: scale(16),
  },
  currentDashaCard: {
    backgroundColor: themeColors.surface.darkPink,
    borderRadius: scale(16),
    padding: scale(20),
    marginBottom: verticalScale(20),
  },
  currentDashaTitle: {
    fontSize: scale(16),
    fontWeight: '600',
    color: themeColors.text.light,
    marginBottom: verticalScale(12),
    textAlign: 'center',
  },
  currentDashaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentPlanetIndicator: {
    width: scale(20),
    height: scale(20),
    borderRadius: scale(10),
    marginRight: scale(16),
  },
  currentPlanetName: {
    fontSize: scale(20),
    fontWeight: '700',
    color: themeColors.text.light,
  },
  currentDashaDate: {
    fontSize: scale(14),
    color: themeColors.text.light,
    marginTop: verticalScale(4),
  },
  timelineContainer: {
    backgroundColor: themeColors.surface.secondarySurface,
    borderRadius: scale(16),
    padding: scale(20),
  },
  timelineTitle: {
    fontSize: scale(18),
    fontWeight: '600',
    color: '#333',
    marginBottom: verticalScale(16),
    textAlign: 'center',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: verticalScale(16),
  },
  timelineIndicator: {
    alignItems: 'center',
    marginRight: scale(16),
  },
  timelineDot: {
    width: scale(16),
    height: scale(16),
    borderRadius: scale(8),
    marginBottom: verticalScale(8),
  },
  timelineLine: {
    width: scale(2),
    flex: 1,
    backgroundColor: '#E5E5E5',
  },
  timelineContent: {
    flex: 1,
    paddingBottom: verticalScale(8),
  },
  timelinePlanet: {
    fontSize: scale(16),
    fontWeight: '600',
    color: '#333',
  },
  timelineDuration: {
    fontSize: scale(12),
    color: '#666',
    marginTop: verticalScale(2),
  },
  timelineDate: {
    fontSize: scale(12),
    color: '#888',
    marginTop: verticalScale(2),
  },
});

export default VimshottariDasha;
