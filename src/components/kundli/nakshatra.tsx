import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import {useAppDispatch, useAppSelector} from '../../hooks/redux-hook';
import {getPersonKundliDetail} from '../../store/reducer/kundli';
import {colors} from '../../constants/colors';
import {moderateScale, scale, verticalScale} from '../../utils/sizer';
import {textStyle} from '../../constants/text-style';

const SimpleCard = ({
  title,
  children,
  color,
  textColor,
}: {
  title: string;
  children: React.ReactNode;
  color?: string;
  textColor?: string;
}) => (
  <View
    style={[
      styles.card,
      {backgroundColor: color ? color : colors.primary_card_2},
    ]}>
    <Text
      style={[
        styles.cardTitle,
        {color: textColor ? textColor : colors.primaryText},
      ]}>
      {title}
    </Text>
    {children}
  </View>
);

const RasiCard = ({
  title,
  zodiac,
  vedicName,
  name,
}: {
  title: string;
  zodiac: string;
  vedicName: string;
  name: string;
}) => (
  <View
    style={{
      height: verticalScale(140),
      borderRadius: scale(12),
      overflow: 'hidden',
      flexDirection: 'row',
    }}>
    <View
      style={{
        zIndex: 10,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: scale(20),
      }}>
      <Text style={[textStyle.fs_mont_16_500, {color: colors.gray_text}]}>
        {name}
      </Text>
      <Text style={[textStyle.fs_mont_12_500, {color: colors.gray_text}]}>
        Vedic Name: {vedicName}
      </Text>
      <Text style={[textStyle.fs_mont_12_400, {color: colors.gray_text}]}>
        ({title})
      </Text>
    </View>
    {/* <View
      style={{
        zIndex: 10,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Text style={[textStyle.fs_mont_14_400, {color: colors.gray_text}]}>
        {zodiac}
      </Text>
      <Text style={[textStyle.fs_mont_12_400, {color: colors.gray_text}]}>
        (Zodiac Sign)
      </Text>
    </View> */}
    <Image
      source={require('../../assets/imgs/card-bg.png')}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '100%',
        width: '100%',
      }}
    />
  </View>
);

const NakshatraAndDosha = ({active}: {active: number}) => {
  const dispatch = useAppDispatch();
  const {kundliPerson} = useAppSelector(state => state.kundli);

  const [kundliDetail, setKundliDetail] = useState<any>();
  const [loading, setLoading] = useState(false);
  const fetchKundliDetails = async () => {
    setLoading(true);
    console.log('fetching kundli data');
    try {
      const payload = await dispatch(
        getPersonKundliDetail({
          ...kundliPerson,
          birthPlace: 'Varanasi',
          latitude: 25.317645,
          longitude: 82.973915,
        }),
      ).unwrap();

      if (payload.success) {
        setKundliDetail(payload.data.data);
      }
    } catch (err) {
      console.error('Error fetching kundli details:', err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchKundliDetails();
  }, [dispatch, kundliPerson]);

  const nakshatra_details = kundliDetail?.nakshatra_details;
  const yoga_details = kundliDetail?.yoga_details;
  const nakshatra = nakshatra_details?.nakshatra;
  const additionalInfo = nakshatra_details?.additional_info;
  const chandraRasi = nakshatra_details?.chandra_rasi;
  const sooryaRasi = nakshatra_details?.soorya_rasi;

  const mangal_dosha = kundliDetail?.mangal_dosha;
  console.log(nakshatra_details);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size={20} />
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.container, {gap: verticalScale(16)}]}>
      {/* Nakshatra */}
      {nakshatra && (
        <View
          style={{
            backgroundColor: colors.primary_card_2,
            padding: scale(16),
            borderRadius: scale(12),
            flexDirection: 'row',
            gap: scale(8),
          }}>
          <View style={{gap: verticalScale(4), flex: 1}}>
            <Text style={[styles.sub_details]}>Name: {nakshatra.name}</Text>
            <Text style={[styles.sub_details]}>
              Lord: {nakshatra.lord?.name} ({nakshatra.lord?.vedic_name})
            </Text>
            <Text style={[styles.sub_details]}>Pada: {nakshatra.pada}</Text>
            <Text style={[styles.sub_details]}>
              Deity: {additionalInfo.deity}
            </Text>
            <Text style={[styles.sub_details, {}]}>
              Symbol: {additionalInfo.symbol}
            </Text>
            <Text style={[styles.sub_details]}>
              Animal Sign: {additionalInfo.animal_sign}
            </Text>
          </View>
          <View
            style={{justifyContent: 'center', alignItems: 'center', flex: 1}}>
            <View
              style={{
                backgroundColor: colors.primary_surface_2,
                paddingHorizontal: scale(12),
                paddingVertical: scale(8),
                borderRadius: scale(24),
              }}>
              <Text
                style={[textStyle.fs_abyss_24_400, {color: colors.whiteText}]}>
                {nakshatra?.name}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Chandra Rasi */}

      {chandraRasi && (
        <RasiCard
          title="Chandra Rasi"
          name={chandraRasi?.name}
          zodiac="Gemini"
          vedicName={chandraRasi.lord?.vedic_name}
        />
      )}

      {/* Soorya Rasi */}
      {sooryaRasi && (
        <RasiCard
          title="Soorya Rasi"
          name={sooryaRasi?.name}
          zodiac="Gemini"
          vedicName={sooryaRasi.lord?.vedic_name}
        />
      )}

      {/* Mangal Dosha */}
      {mangal_dosha && (
        <SimpleCard
          textColor={colors.whiteText}
          color={colors.primary_surface_2}
          title="Manglik Status">
          <Text style={[styles.sub_details, {color: colors.whiteText}]}>
            Status: {mangal_dosha.has_dosha ? 'Manglik' : 'Not Manglik'}
          </Text>
          <Text style={[styles.sub_details, {color: colors.whiteText}]}>
            {mangal_dosha.description}
          </Text>
        </SimpleCard>
      )}

      {/* Yoga Details */}
      {Array.isArray(yoga_details) && yoga_details.length > 0 && (
        <SimpleCard title="Yoga Details">
          <View style={{flexDirection: 'row', gap: scale(4), flexWrap: 'wrap'}}>
            {yoga_details.map((item, index) => (
              <View
                key={index}
                style={{
                  height: verticalScale(100),
                  padding: moderateScale(8),
                  borderRadius: moderateScale(12),
                  backgroundColor: colors.primary_surface_2,
                  flex: 1,
                  minWidth: '49%',
                  maxWidth: '49%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text
                  style={[
                    textStyle.fs_mont_14_700,
                    {
                      color: colors.primaryText,
                      marginBottom: verticalScale(8),
                    },
                  ]}>
                  {item.name}
                </Text>
                <Text
                  style={[
                    textStyle.fs_abyss_14_400,
                    {color: colors.whiteText, textAlign: 'center'},
                  ]}>
                  {item.description}
                </Text>
              </View>
            ))}
          </View>
        </SimpleCard>
      )}

      {/* Additional Info */}
      {additionalInfo && (
        <SimpleCard title="Additional Info">
          <Text>Deity: {additionalInfo.deity}</Text>
          <Text>Ganam: {additionalInfo.ganam}</Text>
          <Text>Symbol: {additionalInfo.symbol}</Text>
          <Text>Animal Sign: {additionalInfo.animal_sign}</Text>
          <Text>Nadi: {additionalInfo.nadi}</Text>
          <Text>Color: {additionalInfo.color}</Text>
          <Text>Best Direction: {additionalInfo.best_direction}</Text>
          <Text>Syllables: {additionalInfo.syllables}</Text>
          <Text>Birth Stone: {additionalInfo.birth_stone}</Text>
          <Text>Gender: {additionalInfo.gender}</Text>
          <Text>Planet: {additionalInfo.planet}</Text>
          <Text>Enemy Yoni: {additionalInfo.enemy_yoni}</Text>
        </SimpleCard>
      )}
    </ScrollView>
  );
};

export default NakshatraAndDosha;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#fff',
  },
  sub_details: {
    ...textStyle.fs_abyss_14_400,
    color: colors.primaryText,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: scale(12),
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
});
