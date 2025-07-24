import {View, Text} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useAppDispatch, useAppSelector} from '../../hooks/redux-hook';
import {kundliVimshottari} from '../../store/reducer/kundli';
import {useTranslation} from 'react-i18next';

const VimshottariDasha = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const {t} = useTranslation();
  const kundliPerson = useAppSelector(state => state.kundli.kundliPerson);
  const [dashaType, setDashaType] = useState<
    'maha-dasha' | 'antar-dasha' | 'pratyantar-dasha' | 'sookshma-dasha'
  >('maha-dasha');

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
          params: {dashaType, language: t('lan')},
        }),
      ).unwrap();
      console.log(payload, '---kundli details');
      if (payload.success) {
        setData(payload.data.data);
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
  return (
    <View>
      <Text>VimshottariDasha</Text>
    </View>
  );
};

export default VimshottariDasha;
