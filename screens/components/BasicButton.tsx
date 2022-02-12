import React from 'react';
import {StyleSheet, TouchableOpacity} from 'react-native';
import {colors} from '../../utils/colors';
import TextComp from './TextComp';

interface IBasicButton {
  title: string;
  onPress: () => void;
  disable?: boolean;
}

function BasicButton({title, onPress, disable = false}: IBasicButton) {
  return (
    <TouchableOpacity
      style={disable ? styles.disabledButton : styles.button}
      onPress={onPress}
      disabled={disable}>
      <TextComp text={title} color="white" size={20} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.PBlue,
    alignSelf: 'stretch',
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: colors.PLightGray,
    alignSelf: 'stretch',
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BasicButton;
