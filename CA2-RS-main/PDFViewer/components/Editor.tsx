/* eslint-disable react-hooks/exhaustive-deps */
// import {Icon} from '@ant-design/react-native';
import React, {useEffect, useImperativeHandle, useState} from 'react';
import {View, TextInput, StyleSheet, LayoutChangeEvent, Platform} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import * as ImagePicker from 'expo-image-picker';
import {DEFAULT_IMG_URL, InsertTypes} from '../constants';
import ImageWrapper from './ImageWrapper';
import { AntDesign } from '@expo/vector-icons'; 
interface EditorProps {
  insertType: string;
  onCancel: (...agrs: any) => any;
  onInsert: (
    content: string,
    position: {
      x: number;
      y: number;
    },
    dimensions: {
      width: number;
      height: number;
    },
    type: string,
    scale?: number,
  ) => void;
  selected?: boolean;
  setLoading: any;
  editMode: boolean;
  isInserted: boolean;
  lastContent: string;
  regionLabel?: string;
}
const Editor = React.forwardRef<{handleInsert: any}, EditorProps>(
  (props, ref) => {
    const {
      insertType,
      onCancel,
      onInsert,
      selected,
      setLoading,
      editMode,
      isInserted,
      lastContent,
    } = props;
    configureReanimatedLogger({
      level: ReanimatedLogLevel.warn,
      strict: false, // Reanimated runs in strict mode by default
    });
    const dragging = useSharedValue(false);
    const positionX = useSharedValue(0);
    const positionY = useSharedValue(0);
    const latestX = useSharedValue(0);
    const latestY = useSharedValue(0);
    const [content, setContent] = useState<string>('');
    const [scale, setScale] = useState<number>(1);
    const [contentDimension, setContentDimension] = useState<{
      width: number;
      height: number;
    }>({width: 0, height: 0});

    const [lastDims, setLastDims] = useState({
      width: 0,
      height: 0,
    });

    const animatedStyle = useAnimatedStyle(() => ({
      left: positionX.value,
      top: positionY.value,
    }));

    useImperativeHandle(ref, () => ({
      handleInsert: () => {
        const diff = {
          x: (contentDimension.width * (1 - scale)) / 2,
          y: (contentDimension.height * (1 - scale)) / 2,
        };
        onInsert(
          content,
          {x: positionX.value + diff.x, y: positionY.value + diff.y},
          {
            width: contentDimension.width * scale,
            height: contentDimension.height * scale,
          },
          insertType,
          scale,
        );
        setLastDims({
          width: contentDimension.width * scale,
          height: contentDimension.height * scale,
        });
      },
    }));

    const drag = Gesture.Pan()
      .maxPointers(1)
      .onStart(_ => {
        dragging.value = true;
      })
      .onUpdate(e => {
        positionX.value += e.translationX - latestX.value;
        positionY.value += e.translationY - latestY.value;
        latestX.value = e.translationX;
        latestY.value = e.translationY;
      })
      .onEnd(_ => {
        latestX.value = 0;
        latestY.value = 0;
      });

    const onLayout = (e: LayoutChangeEvent) => {
      const {width, height} = e.nativeEvent.layout;
      setContentDimension({width, height});
    };

    const insertContent = React.useMemo(() => {
      switch (insertType) {
        case InsertTypes.TEXT:
          return (
            <>
              <View onLayout={onLayout}>
                <TextInput
                  style={styles.text}
                  placeholder="Enter text to insert"
                  value={content}
                  onChange={e => setContent(e.nativeEvent.text)}
                />
              </View>
              <GestureDetector gesture={drag}>
                {/* <Icon
                  name="drag"
                  size={16}
                  color="#000"
                  style={styles.btnDrag}
                /> */}
                
              </GestureDetector>
            </>
          );
        case InsertTypes.DEFAULT:
        case InsertTypes.IMAGE:
          return (
            <ImageWrapper
              contentUri={props.regionLabel && insertType === InsertTypes.DEFAULT ? '' : content}
              frameLabel={
                props.regionLabel && insertType === InsertTypes.DEFAULT
                  ? props.regionLabel
                  : ''
              }
              dragGesture={drag}
              lastDims={lastDims}
              editMode={editMode}
              onDimensionChange={({width, height}) =>
                setContentDimension({width, height})
              }
            />
          );
      }
    }, [insertType, content, editMode, lastDims]);

    const isSavedView = isInserted && !selected && !editMode;
    const showEditor = selected || isSavedView;

    useEffect(() => {
      if (selected && !editMode) {
        if (insertType === InsertTypes.IMAGE) {
          const pickImage = async () => {
            try {
              setLoading(true);

              if (Platform.OS === 'ios') {
                const permissionResult =
                  await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (!permissionResult.granted) {
                  console.log('Permission to access media library denied');
                  onCancel && onCancel();
                  setLoading(false);
                  return;
                }
              }

              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images, // Chỉ chọn ảnh
                allowsEditing: false, // Không cho phép chỉnh sửa (tùy chọn)
                quality: 1, // Chất lượng ảnh cao nhất
              });
    
              setLoading(false); // Tắt trạng thái loading
    
              if (result.canceled) {
                onCancel && onCancel();
                return;
              }
    
              const img = result.assets[0]; // Lấy ảnh đầu tiên
              if (img.type === 'image' && (img.uri.endsWith('.jpg') || img.uri.endsWith('.jpeg'))) {
                setContent(img.uri); // Gán URI của ảnh vào content
                return;
              }
    
              onCancel && onCancel(); // Gọi onCancel nếu không phải JPEG
            } catch (error) {
              setLoading(false);
              console.log('ImagePicker Error: ', error);
              onCancel && onCancel();
            }
          };
    
          pickImage(); // Gọi hàm chọn ảnh
        }
    
        positionX.value = 10;
        positionY.value = 10;
      }
    }, [selected]);

    useEffect(() => {
      if (!insertType && !isInserted) {
        setContent('');
        setScale(1);
      }
      if (insertType === InsertTypes.DEFAULT) {
        setContent(DEFAULT_IMG_URL);
      }
    }, [insertType, isInserted]);

    useEffect(() => {
      if (editMode) {
        setContent(lastContent);
      }
    }, [editMode]);

    return (
      showEditor && (
        <View
          style={[styles.overlay, isSavedView && styles.savedOverlay]}
          pointerEvents={isSavedView ? 'none' : 'auto'}>
          <Animated.View style={[styles.textWrapper, animatedStyle]}>
            {isSavedView ? (
              <ImageWrapper
                contentUri={props.regionLabel ? '' : content || lastContent || DEFAULT_IMG_URL}
                frameLabel={props.regionLabel || ''}
                dragGesture={drag}
                lastDims={lastDims}
                editMode={false}
                readOnly
                onDimensionChange={() => {}}
              />
            ) : (
              insertContent
            )}
          </Animated.View>
        </View>
      )
    );
  },
);

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: '#00000030',
  },
  savedOverlay: {
    backgroundColor: 'transparent',
  },
  imagesWrapper: {
    backgroundColor: '#fff',
    maxHeight: 100,
    maxWidth: 100,
    flex: 1,
  },
  images: {
    aspectRatio: 1,
  },
  textWrapper: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  text: {
    fontSize: 14,
    minWidth: 50,
    padding: 2,
    backgroundColor: '#ffffff',
  },
  btnAction: {
    backgroundColor: '#ffffff',
    padding: 2,
  },
  btnDrag: {
    position: 'absolute',
    borderRadius: 100,
    bottom: '100%',
    left: 0,
    backgroundColor: '#ffffff',
  },
});

export default Editor;
