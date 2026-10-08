import React, { memo, useRef, useState } from "react";
import { Pressable, View, Image, Dimensions } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { IMAGE_GROUP } from "../../utils/constant";

const HomeCarousel = ({ navigation }) => {
  const carouselREF = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const BannerItem = () => {
    return (
      <View style={{ paddingHorizontal: 16 }}>
        <Pressable onPress={() => {}}>
          <Image
            style={{
              width: "90%",
              height: 120,
              minWidth: "100%",
              borderRadius: 6,
            }}
            source={IMAGE_GROUP.home.banner}
          />
        </Pressable>
      </View>
    );
  };

  const Pagination = ({ current, data }) => {
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          position: "absolute",
          top: 109,
          right: 0,
          left: 0,
        }}
      >
        {data.map((_, idx) => {
          let active = Boolean(current === idx);
          return (
            <View
              key={"pagination-box-" + idx}
              style={{
                width: 12,
                height: 3,
                borderRadius: 4,
                backgroundColor: active ? "#1858EA" : "#D1D5DB",
                marginHorizontal: 2,
              }}
            />
          );
        })}
      </View>
    );
  };

  return (
    <>
      {/* <Carousel
        width={Dimensions.get("window").width}
        height={125}
        ref={carouselREF}
        autoPlay={true}
        autoPlayInterval={2000}
        data={[1, 2, 3]}
        snapEnabled
        pagingEnabled={true}
        onSnapToItem={setActiveIndex}
        renderItem={() => <BannerItem navigation={navigation} />}
      />

      <Pagination current={activeIndex} data={[1, 2, 3]} /> */}
      <BannerItem />
    </>
  );
};

export default memo(HomeCarousel);
