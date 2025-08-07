// ui/BusinessImageSlider.tsx
import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  I18nManager,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { scale, moderateScale } from 'react-native-size-matters';
import { ThemeColors } from '../../types/theme';

// ---- props -------------------------------------------------------
interface Props {
  images: string[];
  businessId: string;
  currentIndex: number;
  onIndexChange: (id: string, idx: number) => void;
  onScroll: (
    e: NativeSyntheticEvent<NativeScrollEvent>,
    id: string,
    count: number,
  ) => void;
  maxHeight?: number;
  cropTolerance?: number; // 0 … 0.5   (default 0.2  = 20 %)
  minFillRatio?: number; // 0 … 1     (default 0.8  = 80 %)
}
// ------------------------------------------------------------------

const BusinessImageSlider: React.FC<Props> = ({
  images,
  businessId,
  currentIndex,
  onIndexChange,
  onScroll,
  maxHeight = 180,
  cropTolerance = 0.2,
  minFillRatio = 0.8,
}) => {
  const { colors }: { colors: ThemeColors } = useTheme();
  const { width: winW } = useWindowDimensions(); // :contentReference[oaicite:2]{index=2}
  const scrollRef = useRef<ScrollView>(null);

  /** per‑URI cache of “cover vs contain” + computed height */
  const [cfg, setCfg] = useState<
    Record<string, { mode: 'cover' | 'contain'; height: number }>
  >({});

  const decide = useCallback(
    (uri: string, w: number, h: number) => {
      setCfg(prev => {
        if (prev[uri]) return prev;

        const imgR = w / h; // image aspect
        const boxR = winW / maxHeight; // frame aspect

        // --- if cover, how much would be lost?  --------------------
        const coverCrop =
          imgR < boxR
            ? 1 - imgR / boxR // horiz loss (portrait)
            : 1 - boxR / imgR; // vert  loss (landscape)

        const useCover = coverCrop <= cropTolerance;
        const mode = useCover ? 'cover' : 'contain';

        // If contain shrinks too far, bump it up to minFillRatio
        const targetH = useCover
          ? maxHeight
          : Math.max(maxHeight * minFillRatio, winW / imgR);

        return { ...prev, [uri]: { mode, height: targetH } };
      });
    },
    [winW, maxHeight, cropTolerance, minFillRatio],
  );

  const jumpTo = (idx: number) => {
    scrollRef.current?.scrollTo({ x: idx * winW, animated: true });
    onIndexChange(businessId, idx);
  };

  return (
    <View style={{ width: '100%' }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={e => onScroll(e, businessId, images.length)}
        scrollEventThrottle={16}
      >
        {images.map((uri, i) => {
          const c = cfg[uri];
          const h = c?.height ?? maxHeight;
          return (
            <View key={i} style={{ width: winW, height: h }}>
              <Image
                source={{ uri }}
                style={StyleSheet.absoluteFillObject}
                resizeMode={c?.mode ?? 'cover'}
                onLoad={e =>
                  decide(
                    uri,
                    e.nativeEvent.source.width,
                    e.nativeEvent.source.height,
                  )
                }
              />
              <View style={styles.overlay} />
            </View>
          );
        })}
      </ScrollView>

      {images.length > 1 && (
        <View style={styles.dots}>
          {images.map((_, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    i === currentIndex
                      ? colors.buttonColor
                      : 'rgba(255,255,255,0.5)',
                },
              ]}
              onPress={() => jumpTo(i)}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  dots: {
    position: 'absolute',
    bottom: moderateScale(12),
    left: 0,
    right: 0,
    flexDirection: I18nManager ? 'row-reverse' : 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: 4,
    marginHorizontal: scale(3),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
});

export default BusinessImageSlider;
