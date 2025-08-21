// components/ZodiacCard.tsx
import React from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';

interface ZodiacCardProps {
  name: string;
  image: any;
  onPress?: () => void;
  isSelected?: boolean;
}

const ZodiacCard: React.FC<ZodiacCardProps> = ({
  name,
  image,
  onPress,
  isSelected,
}) => {
  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.selected]}
      onPress={onPress}>
      <Image source={image} style={styles.image} />
      <Text style={styles.name}>{name}</Text>
    </TouchableOpacity>
  );
};

export default ZodiacCard;

const styles = StyleSheet.create({
  card: {
    width: 150,
    height: 180,
    backgroundColor: '#fff',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  selected: {
    borderWidth: 2,
    borderColor: '#333',
  },
  image: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
});
