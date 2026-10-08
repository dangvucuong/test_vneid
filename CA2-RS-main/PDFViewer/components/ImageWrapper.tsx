/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect} from 'react';
import {
  Gesture,
  GestureDetector,
  PanGesture,
} from 'react-native-gesture-handler';
import {
  Image,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  configureReanimatedLogger,
  ReanimatedLogLevel,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {Icon} from '@ant-design/react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';
import { AntDesign } from '@expo/vector-icons';

interface ImageProps {
  contentUri?: string;
  frameLabel?: string;
  dragGesture: PanGesture;
  onDimensionChange?: (dims: {width: number; height: number}) => any;
  editMode: boolean;
  lastDims: any;
  readOnly?: boolean;
}
const ImageWrapper = (props: ImageProps) => {
  const {contentUri, frameLabel, dragGesture, onDimensionChange, editMode, lastDims, readOnly = false} =
    props;
  configureReanimatedLogger({
    strict: false, // Reanimated runs in strict mode by default
  });
  const imageW = useSharedValue(100);
  const imageH = useSharedValue(100);
  const latestX = useSharedValue(0);
  const latestY = useSharedValue(0);

  const onLayout = (e: LayoutChangeEvent) => {
    const {width, height} = e.nativeEvent.layout;
    onDimensionChange && onDimensionChange({width, height});
  };

  const wrapperStyle = useAnimatedStyle(() => ({
    ...styles.imagesWrapper,
    width: imageW.value,
    height: imageH.value,
  }));

  const resizeGesture = Gesture.Pan()
    .maxPointers(1)
    .onUpdate(e => {
      const changeX = e.translationX - latestX.value;
      const changeY = e.translationY - latestY.value;
      if (imageW.value + changeX >= 20 && imageH.value + changeY >= 20) {
        imageW.value += changeX;
        imageH.value += changeY;
      }
      latestX.value = e.translationX;
      latestY.value = e.translationY;
    })
    .onEnd(_ => {
      latestX.value = 0;
      latestY.value = 0;
    });

  useEffect(() => {
    if (readOnly && lastDims.width > 0 && lastDims.height > 0) {
      imageW.value = lastDims.width;
      imageH.value = lastDims.height;
    } else if (editMode) {
      imageW.value = lastDims.width;
      imageH.value = lastDims.height;
    } else if (frameLabel) {
      imageW.value = 168;
      imageH.value = 64;
    } else if (contentUri) {
      Image.getSize(contentUri, (width, height) => {
        const ratio = width / height;
        if (ratio > 1) {
          imageW.value = 100;
          imageH.value = 100 / ratio;
        } else {
          imageW.value = 100 * ratio;
          imageH.value = 100;
        }
      });
    }
  }, [contentUri, editMode, readOnly, lastDims]);

  return (
    <Animated.View style={[wrapperStyle, frameLabel ? styles.frameWrap : null]}>
      {readOnly ? (
        frameLabel ? (
          <View onLayout={onLayout} style={styles.frame}>
            <Text style={styles.frameTitle}>{frameLabel}</Text>
          </View>
        ) : contentUri ? (
          <Image
            onLayout={onLayout}
            source={{uri: contentUri}}
            style={styles.image}
          />
        ) : (
          <View />
        )
      ) : (
        <>
          <GestureDetector gesture={dragGesture}>
            {frameLabel ? (
              <View onLayout={onLayout} style={styles.frame}>
                <Text style={styles.frameTitle}>{frameLabel}</Text>
                <Text style={styles.frameHint}>Kéo để đặt vùng ký</Text>
              </View>
            ) : contentUri ? (
              <Image
                onLayout={onLayout}
                source={{uri: contentUri}}
                style={styles.image}
              />
            ) : (
              <View />
            )}
          </GestureDetector>
          <GestureDetector gesture={resizeGesture}>
            <TouchableOpacity style={styles.resize}>
              <AntDesign name="arrowsalt" size={18} color="#000" />
            </TouchableOpacity>
          </GestureDetector>
        </>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  imagesWrapper: {
    backgroundColor: '#fff',
    position: 'relative',
    borderWidth: 1,
    borderStyle: 'dotted',
    borderColor: '#000',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'stretch',
  },
  frameWrap: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  frame: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#1858EA',
    backgroundColor: 'rgba(24, 88, 234, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameTitle: {
    color: '#1858EA',
    fontWeight: '700',
    fontSize: 14,
  },
  frameHint: {
    color: '#1E3A8A',
    fontSize: 11,
    marginTop: 2,
  },
  resize: {
    position: 'absolute',
    borderRadius: 100,
    padding: 2,
    transform: [{rotate: '90deg'}, {translateX: 10}, {translateY: -10}],
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000',
  },
});

export default ImageWrapper;
