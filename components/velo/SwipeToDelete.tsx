import { useRef } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, View } from 'react-native';
import { Trash2 } from 'lucide-react-native';

import { useColors } from '@/hooks/useColors';
import { Radius } from '@/constants/theme';

const THRESHOLD = -72;

type Props = {
  children: React.ReactNode;
  onDelete: () => void;
};

export function SwipeToDelete({ children, onDelete }: Props) {
  const colors = useColors();
  const translateX = useRef(new Animated.Value(0)).current;
  const deleteOpacity = translateX.interpolate({
    inputRange: [THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 6 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderMove: (_, g) => {
        const x = Math.max(THRESHOLD * 1.2, Math.min(0, g.dx));
        translateX.setValue(x);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx < THRESHOLD) {
          Animated.spring(translateX, { toValue: THRESHOLD, useNativeDriver: true, tension: 80, friction: 12 }).start();
        } else {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }).start();
        }
      },
    }),
  ).current;

  const close = () =>
    Animated.spring(translateX, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }).start();

  return (
    <View style={styles.outer}>
      {/* Delete backdrop */}
      <Animated.View style={[styles.backdrop, { backgroundColor: colors.danger, opacity: deleteOpacity }]}>
        <Pressable style={styles.deleteBtn} onPress={() => { close(); onDelete(); }}>
          <Trash2 size={20} color="#fff" strokeWidth={2} />
        </Pressable>
      </Animated.View>

      {/* Swipeable row */}
      <Animated.View style={{ transform: [{ translateX }] }} {...panResponder.panHandlers}>
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { position: 'relative', overflow: 'hidden', borderRadius: Radius.lg },
  backdrop: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 72, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  deleteBtn: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' },
});
