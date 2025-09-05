import React from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

export default function ShowcaseScreen() {
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={true}
    >
      <Text style={styles.title}>Component Showcase</Text>
      <Text style={styles.subtitle}>Text • Custom Button • Image • ScrollView</Text>

      {/* Horizontal gallery to make scrolling obvious */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator
        style={styles.gallery}
        contentContainerStyle={styles.galleryContent}
      >
        {['900/300', '901/300', '902/300', '903/300'].map((size, i) => (
          <Image
            key={i}
            source={{ uri: `https://picsum.photos/${size}` }}
            style={styles.galleryImage}
          />
        ))}
      </ScrollView>

      {/* Custom button without black box issue */}
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Press to show hello alert"
        style={styles.customButton}
        activeOpacity={0.8}
        onPress={() => Alert.alert('Hello!', 'Custom button works')}
      >
        <Text style={styles.customButtonText}>PRESS ME</Text>
      </TouchableOpacity>

      {/* Extra text to force vertical scrolling */}
      {Array.from({ length: 16 }).map((_, i) => (
        <Text key={i} style={styles.paragraph}>
          This is paragraph {i + 1}. Keep scrolling to see more content.
        </Text>
      ))}

      <Text style={styles.footer}>End of demo.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 100,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 16,
  },
  gallery: { marginBottom: 16 },
  galleryContent: { gap: 12, paddingHorizontal: 4 },
  galleryImage: { width: 280, height: 150, borderRadius: 12 },

  customButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    alignSelf: 'center',
    minWidth: 200,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    marginBottom: 12,
  },
  customButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
    marginTop: 12,
  },
  footer: {
    textAlign: 'center',
    color: '#888',
    marginTop: 24,
  },
});
