import logger from '../../utils/logger';

import { View, Image, Text, StyleSheet } from 'react-native';

/**
 * Avatar Component with fallback initials
 */
export const Avatar = ({
  source,
  name,
  size = 'medium',
  style,
}) => {
  const sizeValue = sizes[size] || sizes.medium;
  
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const containerStyle = {
    width: sizeValue,
    height: sizeValue,
    borderRadius: sizeValue / 2,
  };

  // Check if source exists and has a valid uri
  if (source && typeof source === 'object' && source.uri) {
    logger.info('Avatar source URI:', source.uri);
    return (
      <Image
        source={source}
        style={[styles.image, containerStyle, style]}
      />
    );
  }

  // Fallback to initials
  return (
    <View style={[styles.fallback, containerStyle, style]}>
      <Text style={[styles.initials, { fontSize: sizeValue / 2.5 }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
};

const sizes = {
  small: 32,
  medium: 48,
  large: 64,
  xlarge: 96,
};

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
  },
  fallback: {
    backgroundColor: '#6C5CE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default Avatar;
