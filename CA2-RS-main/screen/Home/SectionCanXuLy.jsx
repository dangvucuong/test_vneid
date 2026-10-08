import { StyleSheet, View } from "react-native";
import { useI18n } from "../../utils/i18n";
import SectionItem from "./SectionItem";
import SectionHeader from "./SectionHeader";

export default function SectionCanXuLy({
  data,
  onPressItem,
  selected,
  setSelected,
}) {
  const { i18n } = useI18n();

  const handleSelect = (item) => {
    if (selected.includes(item)) {
      setSelected(selected.filter((i) => i !== item));
    } else {
      setSelected(selected.concat([item]));
    }
  };

  const handleSelectAll = () => {
    if (selected.length !== 0) {
      setSelected([]);
    } else {
      setSelected(data.map((item) => item.Code));
    }
  };

  return (
    <View style={styles.container}>
      <SectionHeader
        title={i18n.t("home.can_xu_ly")}
        actionLabel={i18n.t(
          selected.length ? "common.deselect_all" : "common.select_all"
        )}
        onPressAction={handleSelectAll}
      />
      {data.map((item) => (
        <SectionItem
          key={item.key}
          item={item}
          onPress={() => onPressItem(item)}
          selected={selected.includes(item.Code)}
          onSelect={() => handleSelect(item.Code)}
          showAttach={!!item.attach}
          highlightSub
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingTop: 16,
    gap: 8,
    marginBottom: 4,
    backgroundColor: "#ffffff",
  },
});
