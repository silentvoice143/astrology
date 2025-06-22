import React from 'react';
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

export type TagItem = {
  id: string;
  label: string;
  icon?: string;
};

type ValueType = 'id' | 'object';

type ControlledTagSelectorProps<T extends ValueType> = {
  tags: TagItem[];
  selectedTags: T extends 'id' ? string[] : TagItem[];
  onChange?: (selected: T extends 'id' ? string[] : TagItem[]) => void;
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
  valueType?: T;
};

function ControlledTagSelector<T extends ValueType = 'id'>({
  tags,
  selectedTags,
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
  valueType = 'id' as T,
}: ControlledTagSelectorProps<T>) {
  const selectedIds =
    valueType === 'object'
      ? (selectedTags as TagItem[]).map(t => t.id)
      : (selectedTags as string[]);

  const getReturnValue = (
    ids: string[],
  ): T extends 'id' ? string[] : TagItem[] => {
    return (
      valueType === 'object' ? tags.filter(tag => ids.includes(tag.id)) : ids
    ) as any;
  };

  const toggleSelect = (id: string) => {
    let updated: string[];

    if (multiSelect) {
      updated = selectedIds.includes(id)
        ? selectedIds.filter(tagId => tagId !== id)
        : [...selectedIds, id];
    } else {
      updated = selectedIds.includes(id) ? [] : [id];
    }

    onChange?.(getReturnValue(updated));
  };

  const handleRemove = (id: string) => {
    const updated = selectedIds.filter(tagId => tagId !== id);
    onChange?.(getReturnValue(updated));
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          style={[
            styles.label,
            {color: selectedIds.length ? '#007BFF' : '#000'},
            labelStyle,
          ]}>
          {label}
        </Text>
      )}

      <FlatList
        data={tags}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.listContent, contentContainerStyle]}
        renderItem={({item}) => {
          const isSelected = selectedIds.includes(item.id);
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
}

export default ControlledTagSelector;

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
