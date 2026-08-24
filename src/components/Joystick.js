import React, { useRef } from 'react';
import { View, StyleSheet, Animated, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/theme';

export default function Joystick({
  size = 180,
  knobSize = 70,
  onMove = () => {},
}) {
  const pan = useRef(new Animated.ValueXY()).current;
  const maxRadius = (size - knobSize) / 2;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderMove: (_, gestureState) => {
        const { dx, dy } = gestureState;
        const distance = Math.sqrt(dx * dx + dy * dy);

        let clampedX = dx;
        let clampedY = dy;

        // Limita o movimento dentro do raio da base do joystick
        if (distance > maxRadius) {
          const angle = Math.atan2(dy, dx);
          clampedX = Math.cos(angle) * maxRadius;
          clampedY = Math.sin(angle) * maxRadius;
        }

        pan.setValue({ x: clampedX, y: clampedY });

        // Normaliza os valores entre -1.0 e 1.0 (Inverte Y para que CIMA seja positivo)
        const normalizedX = Number((clampedX / maxRadius).toFixed(2));
        const normalizedY = Number((-clampedY / maxRadius).toFixed(2));

        onMove({ x: normalizedX, y: normalizedY });
      },

      onPanResponderRelease: () => {
        // Animação para retornar a manopla ao centro suavemente
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          friction: 5,
          tension: 40,
          useNativeDriver: false,
        }).start();

        onMove({ x: 0, y: 0 });
      },
    })
  ).current;

  return (
    <View style={[styles.base, { width: size, height: size, borderRadius: size / 2 }]}>
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.knob,
          {
            width: knobSize,
            height: knobSize,
            borderRadius: knobSize / 2,
            transform: pan.getTranslateTransform(),
          },
        ]}
      >
        <Ionicons name="move" size={24} color={colors.surface} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  knob: {
    backgroundColor: colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 8,
  },
});