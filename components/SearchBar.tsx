// SearchBar.tsx
import { StyleSheet, View, Pressable } from 'react-native';
import React from 'react';
import { theme } from '@/constants/theme';
import Icon from '@/assets/icons/icons';
import Input from './Input';

interface SearchBarProps {
  value: string;
  onChangeText: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChangeText }) => {
  return (
    <View style={styles.container}>
      <Input
        value={value}
        onChangeText={onChangeText}
        placeholder="Enter to search"
        icon={<Icon name="search" size={22} />}
      />

      {value.length > 0 && (
        <Pressable style={styles.clearButton} onPress={() => onChangeText('')}>
          <Icon name="delete" size={22} color={theme.colors.darkGray} />
        </Pressable>
      )}
    </View>
  );
};

export default SearchBar;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
  },
  clearButton: {
    position: 'absolute',
    right: 10,
  },
});
