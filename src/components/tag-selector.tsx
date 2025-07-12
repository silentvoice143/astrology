import React, {useEffect, useState} from 'react';
import {
  FlatList,
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Image,
} from 'react-native';
import {colors} from '../constants/colors';
import {scaleFont} from '../utils/sizer';

type TagItem = {
  id: string;
  label: string;
  icon?: string; // can be emoji or image URI
};

type AdvancedTagSelectorProps = {
  tags: TagItem[];
  selectedTags?: string[]; // persist selection
  onChange?: (selected: string[]) => void;
  multiSelect?: boolean;
  removable?: boolean;
  containerStyle?: ViewStyle;
  tagStyle?: ViewStyle;
  tagTextStyle?: TextStyle;
  selectedTagStyle?: ViewStyle;
  selectedTagTextStyle?: TextStyle;
  label?: string;
  labelStyle?: TextStyle;
  contentContainerStyle?: ViewStyle;
};

const TagSelector: React.FC<AdvancedTagSelectorProps> = ({
  tags,
  selectedTags = [],
  onChange,
  multiSelect = true,
  removable = false,
  containerStyle,
  tagStyle,
  tagTextStyle,
  selectedTagStyle,
  selectedTagTextStyle,
  label,
  labelStyle,
  contentContainerStyle,
}) => {
  const [selected, setSelected] = useState<string[]>(selectedTags);

  useEffect(() => {
    setSelected(selectedTags);
  }, [selectedTags]);

  const toggleSelect = (id: string) => {
    let updated: string[] = [];

    if (multiSelect) {
      if (selected.includes(id)) {
        updated = selected.filter(tagId => tagId !== id);
      } else {
        updated = [...selected, id];
      }
    } else {
      updated = selected.includes(id) ? [] : [id];
    }

    setSelected(updated);
    onChange?.(updated);
  };

  const handleRemove = (id: string) => {
    const updated = selected.filter(tagId => tagId !== id);
    setSelected(updated);
    onChange?.(updated);
  };
  console.log(selected, '---selected');
  const labelColor = selected.length > 0 ? '#007BFF' : '#000'; // Blue if selected, black otherwise

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text style={[styles.label, {color: labelColor}, labelStyle]}>
          {label}
        </Text>
      ) : null}

      <FlatList
        data={tags}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.listContent, contentContainerStyle]}
        renderItem={({item}) => {
          const isSelected = selected.includes(item.id);
          return (
            <TouchableOpacity
              style={[
                styles.tag,
                tagStyle,
                isSelected && styles.selectedTag,
                isSelected && selectedTagStyle,
              ]}
              onPress={() => toggleSelect(item.id)}>
              {item.icon &&
                (item.icon.startsWith('http') ? (
                  <Image source={{uri: item.icon}} style={styles.icon} />
                ) : (
                  <Text style={styles.emoji}>{item.icon}</Text>
                ))}

              <Text
                style={[
                  styles.tagText,
                  tagTextStyle,
                  isSelected && styles.selectedTagText,
                  isSelected && selectedTagTextStyle,
                ]}>
                {item.label}
              </Text>

              {removable && isSelected && (
                <TouchableOpacity onPress={() => handleRemove(item.id)}>
                  <Text style={styles.remove}>×</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

export default TagSelector;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    backgroundColor: colors.primary_surface,
  },
  label: {
    fontSize: scaleFont(14),
    marginBottom: 6,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#eee',
    borderRadius: 20,
    marginRight: 10,
  },
  selectedTag: {
    backgroundColor: '#1c274c',
  },
  tagText: {
    color: '#333',
    fontSize: 14,
  },
  selectedTagText: {
    color: '#fff',
    fontWeight: '600',
  },
  remove: {
    fontSize: 18,
    color: '#fff',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  icon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginRight: 6,
  },
  emoji: {
    fontSize: 16,
    marginRight: 6,
  },
});
