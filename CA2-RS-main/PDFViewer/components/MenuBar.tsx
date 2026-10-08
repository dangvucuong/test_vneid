import React from 'react';
import {
  GestureResponderEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
// import {Icon} from '@ant-design/react-native';
import {InsertTypes} from '../constants';
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';
import { AntDesign } from '@expo/vector-icons';
interface MenuBarProps {
  currentPage: number;
  totalPage: number;
  handleCloseViewer?: (event: GestureResponderEvent) => void | undefined;
  handleInsertBtn?: any;
  handleCancelBtn?: any;
  insertType?: string;
  onInsert?: any;
  selected?: boolean;
  isInserted?: boolean;
  handleSave: any;
  handleEdit: any;
  handleDelete: any;
  editMode: boolean;
}

const MenuBar = (props: MenuBarProps) => {
  const {
    currentPage,
    totalPage,
    handleCloseViewer,
    handleInsertBtn,
    handleCancelBtn,
    insertType,
    onInsert,
    selected,
    isInserted,
    handleSave,
    handleEdit,
    handleDelete,
    editMode,
  } = props;

  const getBtnColor = (btn: InsertTypes) => {
    return insertType ? (insertType === btn ? '#2646a4' : '#00000040') : '#000';
  };

  return (
    <View style={styles.menuBar}>
      <View style={styles.menuItem}>
        <Text>
          Page: {currentPage} / {totalPage}
        </Text>
      </View>
      <View style={styles.extraBtns}>
        {!insertType ? (
          <TouchableOpacity onPress={handleCloseViewer}>
             <Ionicons name="close-circle" size={32} color="red" />
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={styles.insertBtn}
              onPress={onInsert}
              disabled={!selected}>
                <Ionicons name="checkmark-sharp" size={24} color={selected ? 'green' : 'gray'}/>
              {/* <Icon
                name="check"
                size={24}
                color={selected ? 'green' : 'gray'}
              /> */}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.insertBtn}
              onPress={handleCancelBtn}>
                <Ionicons name="stop" size={24} color="#000" />
              {/* <Icon name="stop" size={24} color="#000" /> */}
            </TouchableOpacity>
          </>
        )}
      </View>
      <View style={styles.insertBtnRow}>
        {isInserted ? (
          <>
            <TouchableOpacity style={styles.insertBtn} onPress={handleSave}>
            <Ionicons name="save" size={24} color="green" />
              {/* <Icon name="save" size={24} color="green" /> */}
            </TouchableOpacity>
            <TouchableOpacity style={styles.insertBtn} onPress={handleEdit}>
            <Entypo name="edit" size={24} color="#000" />
              {/* <Icon name="edit" size={24} color="#000" /> */}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.insertBtn}
              onPress={handleDelete}
              disabled={editMode}>
                <AntDesign name="delete" size={24} color={editMode ? '' : '#FF0000'} />
              {/* <Icon name="delete" size={24} color={editMode ? '' : '#FF0000'} /> */}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              disabled={!!insertType}
              style={styles.insertBtn}
              onPress={() => handleInsertBtn(InsertTypes.DEFAULT)}>
                <Ionicons name="add-circle-outline" size={24} color={getBtnColor(InsertTypes.DEFAULT)} />
              {/* <Icon
                name="plus-circle"
                size={24}
                color={getBtnColor(InsertTypes.DEFAULT)}
              /> */}
            </TouchableOpacity>
            <TouchableOpacity
              disabled={!!insertType}
              style={styles.insertBtn}
              onPress={() => handleInsertBtn(InsertTypes.TEXT)}>
                  <Entypo name="edit" size={24} color={getBtnColor(InsertTypes.TEXT)} />
              {/* <Icon
                name="edit"
                size={24}
                color={getBtnColor(InsertTypes.TEXT)}
              /> */}
            </TouchableOpacity>
            <TouchableOpacity
              disabled={!!insertType}
              style={styles.insertBtn}
              onPress={() => handleInsertBtn(InsertTypes.IMAGE)}>
                <AntDesign name="addfile" size={24}  color={getBtnColor(InsertTypes.IMAGE)} />
              {/* <Icon
                name="file-add"
                size={24}
                color={getBtnColor(InsertTypes.IMAGE)}
              /> */}
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  menuBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    minHeight: 60,
    position: 'relative',
    zIndex: 100,
    backgroundColor: '#fff',
    borderBottomColor: '#00050',
    borderBottomWidth: 1,
  },
  extraBtns: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  menuBtn: {
    borderWidth: 0,
  },
  insertBtnRow: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    minWidth: 60,
  },
  insertBtn: {
    width: 30,
    alignItems: 'center',
    color: '#000',
  },
});

export default MenuBar;
