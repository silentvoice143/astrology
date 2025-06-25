// import React, {useEffect} from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   Dimensions,
//   Platform,
//   ActivityIndicator,
// } from 'react-native';
// import LinearGradient from 'react-native-linear-gradient';
// import {colors} from '../../constants/colors';
// import {textStyle} from '../../constants/text-style';
// import {useAppDispatch, useAppSelector} from '../../hooks/redux-hook';
// import {getPersonKundliDetail} from '../../store/reducer/kundli';

// const windowWidth = Dimensions.get('window').width;
// const sideCardWidth = (windowWidth - 48) / 2;

// export const kundliDetail = {
//   nakshatra_details: {
//     nakshatra: {
//       id: 3,
//       name: 'Rohini',
//       pada: 2,
//       lord: {id: 1, name: 'Moon', vedic_name: 'Chandra'},
//     },
//     chandra_rasi: {
//       id: 1,
//       name: 'Vrishabha',
//       lord: {id: 3, name: 'Venus', vedic_name: 'Shukra'},
//     },
//     soorya_rasi: {
//       id: 3,
//       name: 'Karka',
//       lord: {id: 1, name: 'Moon', vedic_name: 'Chandra'},
//     },
//     zodiac: {id: 4, name: 'Leo'},
//     additional_info: {
//       deity: 'Brahma',
//       ganam: 'Manushya',
//       symbol: '🐍',
//       animal_sign: 'Snake',
//       nadi: 'Kapha',
//       color: 'White',
//       best_direction: 'East',
//       syllables: 'O, Va, Vi, Vu',
//       birth_stone: 'Pearl',
//       gender: 'Female',
//       planet: 'Chandra',
//       enemy_yoni: 'Mongoose',
//     },
//   },
//   mangal_dosha: {
//     has_dosha: false,
//     description: 'The person is Not Manglik',
//   },
// };

// const GradientCard = ({children, style}: any) => (
//   <LinearGradient
//     colors={[colors.primary_surface, colors.primary_surface]}
//     start={{x: 0, y: 0}}
//     end={{x: 1, y: 1}}
//     style={[styles.card, style]}>
//     {children}
//   </LinearGradient>
// );

// const NakshatraAndDosha = () => {
//   const {kundliPerson, isLoading} = useAppSelector(state => state.kundli);
//   const kundliDetail = useAppSelector(
//     (state: any) => state.kundli.kundliDetail,
//   );

//   const nakshatra_details = kundliDetail?.nakshatra_details;
//   const yoga_details = kundliDetail?.yoga_details;
//   const nakshatra = nakshatra_details?.nakshatra;
//   const additional_info = nakshatra_details?.additional_info;
//   const chandraRasi = nakshatra_details?.chandra_rasi;
//   const sooryaRasi = nakshatra_details?.soorya_rasi;

//   const mangalDosha = kundliDetail?.mangal_dosha;
//   const dispatch = useAppDispatch();

//   const getKundliData = async () => {
//     try {
//       console.log('getting kundli details.......', kundliPerson);
//       const payload = await dispatch(
//         getPersonKundliDetail({
//           ...kundliPerson,
//           birthPlace: 'Varanasi',
//           latitude: 25.317645,
//           longitude: 82.973915,
//         }),
//       ).unwrap();
//       console.log(payload);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   useEffect(() => {
//     getKundliData();
//   }, []);

//   if (isLoading) {
//     return (
//       <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
//         <ActivityIndicator size={20} />
//       </View>
//     );
//   }

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       {/* Nakshatra Main */}
//       <GradientCard style={styles.nakshatraCard}>
//         <View style={{flex: 1}}>
//           <Text style={[styles.nakshatraName, textStyle.fs_abyss_36_400]}>
//             {nakshatra.name}
//           </Text>
//           <Text style={styles.nakshatraInfo}>
//             Pada: <Text style={styles.boldText}>{nakshatra.pada}</Text>
//           </Text>
//           <Text style={styles.nakshatraInfo}>
//             Lord:{' '}
//             <Text style={styles.boldText}>
//               {nakshatra.lord.name} ({nakshatra.lord.vedic_name})
//             </Text>
//           </Text>
//         </View>
//         <View style={styles.symbolContainer}>
//           <Text style={styles.symbolText}>{additional_info.symbol}</Text>
//         </View>
//       </GradientCard>

//       {/* Rasi Row */}
//       <View style={styles.row}>
//         <GradientCard style={[styles.sideCard, {marginRight: 16}]}>
//           <Text style={styles.rasiName}>{chandraRasi.name}</Text>
//           <Text style={styles.rasiInfo}>
//             Lord:{' '}
//             <Text style={styles.boldText}>
//               {chandraRasi.lord.name} ({chandraRasi.lord.vedic_name})
//             </Text>
//           </Text>
//           <Text style={styles.rasiInfo}>
//             Nadi: <Text style={styles.boldText}>{additional_info.nadi}</Text>
//           </Text>
//           <Text style={styles.rasiInfo}>
//             Color: <Text style={styles.boldText}>{additional_info.color}</Text>
//           </Text>
//         </GradientCard>

//         <GradientCard style={styles.sideCard}>
//           <Text style={styles.rasiName}>{sooryaRasi.name}</Text>
//           <Text style={styles.rasiInfo}>
//             Lord:{' '}
//             <Text style={styles.boldText}>
//               {sooryaRasi.lord.name} ({sooryaRasi.lord.vedic_name})
//             </Text>
//           </Text>
//           <Text style={styles.rasiInfo}>
//             Gender:{' '}
//             <Text style={styles.boldText}>{additional_info.gender}</Text>
//           </Text>
//           <Text style={styles.rasiInfo}>
//             Birth Stone:{' '}
//             <Text style={styles.boldText}>{additional_info.birth_stone}</Text>
//           </Text>
//         </GradientCard>
//       </View>

//       {/* Additional Info */}
//       <Text style={styles.sectionHeading}>Additional Details</Text>
//       <View style={styles.grid}>
//         {[
//           {label: 'Deity', value: additional_info.deity, icon: '🧘'},
//           {label: 'Ganam', value: additional_info.ganam, icon: '🧬'},
//           {
//             label: 'Best Direction',
//             value: additional_info.best_direction,
//             icon: '🧭',
//           },
//           {label: 'Syllables', value: additional_info.syllables, icon: '🔤'},
//           {label: 'Planet', value: additional_info.planet, icon: '🪐'},
//           {label: 'Enemy Yoni', value: additional_info.enemy_yoni, icon: '🦫'},
//         ].map((item, idx) => (
//           <GradientCard key={idx} style={styles.gridCard}>
//             <Text style={styles.gridIcon}>{item.icon}</Text>
//             <Text style={styles.gridLabel}>{item.label}</Text>
//             <Text style={styles.gridValue}>{item.value}</Text>
//           </GradientCard>
//         ))}
//       </View>

//       {/* Mangal Dosha */}
//       <GradientCard style={[styles.mangalCard, {marginTop: 24}]}>
//         <Text style={styles.mangalTitle}>Manglik Status</Text>
//         <Text style={styles.mangalStatus}>
//           {mangalDosha.has_dosha ? '⚠️ Manglik' : '✅ Not Manglik'}
//         </Text>
//         <Text style={styles.mangalDesc}>{mangalDosha.description}</Text>
//       </GradientCard>
//     </ScrollView>
//   );
// };

// export default NakshatraAndDosha;

// const styles = StyleSheet.create({
//   container: {
//     padding: 16,
//     backgroundColor: colors.primary_surface || '#fff',
//     paddingBottom: 40,
//   },
//   card: {
//     borderRadius: 14,
//     padding: 16,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     shadowOffset: {width: 0, height: 3},
//   },
//   nakshatraCard: {
//     flexDirection: 'row',
//     marginBottom: 20,
//     alignItems: 'center',
//   },
//   symbolContainer: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingLeft: 16,
//     minWidth: 70,
//   },
//   symbolText: {
//     fontSize: 52,
//   },
//   nakshatraName: {
//     marginBottom: 6,
//     color: '#222',
//   },
//   nakshatraInfo: {
//     color: '#444',
//     marginBottom: 4,
//     ...textStyle.fs_mont_16_400,
//   },
//   boldText: {
//     fontWeight: '700',
//     color: '#111',
//   },
//   row: {
//     flexDirection: 'row',
//   },
//   sideCard: {
//     flex: 1,
//     paddingVertical: 20,
//     paddingHorizontal: 16,
//   },
//   rasiName: {
//     fontSize: 22,
//     fontWeight: '700',
//     marginBottom: 8,
//     color: '#222',
//   },
//   rasiInfo: {
//     fontSize: 15,
//     color: '#555',
//     marginBottom: 6,
//   },
//   mangalCard: {
//     paddingVertical: 24,
//     paddingHorizontal: 20,
//     alignItems: 'center',
//   },
//   mangalTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     marginBottom: 8,
//     color: '#222',
//   },
//   mangalStatus: {
//     fontSize: 18,
//     marginBottom: 4,
//   },
//   mangalDesc: {
//     fontSize: 15,
//     color: '#444',
//     textAlign: 'center',
//   },
//   sectionHeading: {
//     fontSize: 18,
//     fontWeight: '700',
//     marginVertical: 14,
//     color: '#333',
//   },
//   grid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//   },
//   gridCard: {
//     width: sideCardWidth,
//     marginBottom: 14,
//     padding: 14,
//   },
//   gridIcon: {
//     fontSize: 26,
//     marginBottom: 4,
//   },
//   gridLabel: {
//     fontSize: 13,
//     color: '#444',
//   },
//   gridValue: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#111',
//   },
// });

import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {useAppDispatch, useAppSelector} from '../../hooks/redux-hook';
import {
  getPersonKundliDetail,
  setKundliPerson,
} from '../../store/reducer/kundli';

const SimpleCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{title}</Text>
    {children}
  </View>
);

const NakshatraAndDosha = ({active}: {active: number}) => {
  const dispatch = useAppDispatch();
  const {kundliPerson, isLoading} = useAppSelector(state => state.kundli);
  console.log(kundliPerson, '-----kundliperson');
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
      console.log(payload, '-----paylaod');

      if (payload.success) {
        setKundliDetail(payload.data.data);
        console.log(payload.data.data, '-----paylaod');
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

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size={20} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Nakshatra */}
      {nakshatra && (
        <SimpleCard title="Nakshatra">
          <Text>Name: {nakshatra.name}</Text>
          <Text>
            Lord: {nakshatra.lord?.name} ({nakshatra.lord?.vedic_name})
          </Text>
          <Text>Pada: {nakshatra.pada}</Text>
        </SimpleCard>
      )}

      {/* Chandra Rasi */}
      {chandraRasi && (
        <SimpleCard title="Chandra Rasi">
          <Text>Name: {chandraRasi.name}</Text>
          <Text>
            Lord: {chandraRasi.lord?.name} ({chandraRasi.lord?.vedic_name})
          </Text>
        </SimpleCard>
      )}

      {/* Soorya Rasi */}
      {sooryaRasi && (
        <SimpleCard title="Soorya Rasi">
          <Text>Name: {sooryaRasi.name}</Text>
          <Text>
            Lord: {sooryaRasi.lord?.name} ({sooryaRasi.lord?.vedic_name})
          </Text>
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

      {/* Mangal Dosha */}
      {mangal_dosha && (
        <SimpleCard title="Manglik Status">
          <Text>
            Status: {mangal_dosha.has_dosha ? 'Manglik' : 'Not Manglik'}
          </Text>
          <Text>{mangal_dosha.description}</Text>
        </SimpleCard>
      )}

      {/* Yoga Details */}
      {Array.isArray(yoga_details) && yoga_details.length > 0 && (
        <SimpleCard title="Yoga Details">
          {yoga_details.map((item, index) => (
            <View key={index} style={{marginBottom: 8}}>
              <Text style={{fontWeight: 'bold'}}>{item.name}</Text>
              <Text>{item.description}</Text>
            </View>
          ))}
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
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
});
