import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import TransparentVideo from 'react-native-transparent-video';

const SOURCES: { label: string; layers: number[] }[] = [
  { label: 'alpha-demo', layers: [require('./assets/videos/alpha_demo.mp4')] },
  {
    label: 'parallax x6',
    layers: [
      require('./assets/videos/1.mp4'),
      require('./assets/videos/2.mp4'),
      require('./assets/videos/3.mp4'),
      require('./assets/videos/4.mp4'),
      require('./assets/videos/5.mp4'),
      require('./assets/videos/6.mp4'),
    ],
  },
  { label: 'layer 4', layers: [require('./assets/videos/4.mp4')] },
];

const BACKGROUNDS = [
  { label: 'Xanh', gradient: 'linear-gradient(135deg, #00c6ff 0%, #0047ff 100%)' },
  { label: 'Đỏ', gradient: 'linear-gradient(135deg, #ff9a8b 0%, #d4001a 100%)' },
  { label: 'Tím', gradient: 'linear-gradient(135deg, #e0a3ff 0%, #5b00c9 100%)' },
  { label: 'Vàng', gradient: 'linear-gradient(135deg, #fff59d 0%, #ff9800 100%)' },
];

const Chip = ({ label, active, onPress }: any) => (
  <Pressable
    onPress={onPress}
    style={[styles.chip, active && styles.chipActive]}
    accessibilityLabel={label}>
    <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
  </Pressable>
);

export default function App() {
  const [source, setSource] = useState(0);
  const [background, setBackground] = useState(0);
  const bg = BACKGROUNDS[background];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.toolbar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {SOURCES.map((s, i) => (
            <Chip key={s.label} label={s.label} active={i === source} onPress={() => setSource(i)} />
          ))}
        </ScrollView>
        <View style={styles.cards}>
          {BACKGROUNDS.map((b, i) => (
            <Pressable
              key={b.label}
              accessibilityLabel={`bg-${i}`}
              onPress={() => setBackground(i)}
              style={[
                styles.card,
                { backgroundImage: b.gradient },
                i === background && styles.cardActive,
              ]}>
              <Text style={styles.cardText}>{b.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={[styles.stage, { backgroundImage: bg.gradient }]}>
        <Text style={styles.behind}>BEHIND THE VIDEO</Text>
        {SOURCES[source].layers.map((layer, i) => (
          <TransparentVideo key={`${source}-${i}`} source={layer} style={styles.video} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  toolbar: { paddingTop: 60, paddingHorizontal: 8, paddingBottom: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 4,
    borderRadius: 16,
    backgroundColor: '#333',
  },
  chipActive: { backgroundColor: '#fff' },
  chipText: { color: '#fff', fontSize: 13 },
  chipTextActive: { color: '#000' },
  stage: { flex: 1, overflow: 'hidden' },
  cards: { flexDirection: 'row', gap: 8, padding: 4 },
  card: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: 'transparent',
    justifyContent: 'flex-end',
    padding: 6,
  },
  cardActive: { borderColor: '#fff' },
  cardText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  behind: {
    position: 'absolute',
    top: '45%',
    alignSelf: 'center',
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
  },
  video: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
});
