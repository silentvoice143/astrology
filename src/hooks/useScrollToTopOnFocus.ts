import {useRef, useCallback} from 'react';
import {ScrollView, FlatList, SectionList} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';

export const useScrollToTopOnFocus = <
  T extends ScrollView | FlatList<any> | SectionList<any>,
>() => {
  const scrollRef = useRef<T>(null);

  useFocusEffect(
    useCallback(() => {
      // Scroll to top when screen is focused
      if (scrollRef.current?.scrollTo) {
        scrollRef.current.scrollTo({x: 0, y: 0, animated: true});
      }
    }, []),
  );

  return scrollRef;
};
