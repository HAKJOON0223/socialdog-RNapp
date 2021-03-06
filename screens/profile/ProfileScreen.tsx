import {useQuery} from '@apollo/client';
import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {ME} from '../../apollo-gqls/auth';
import {UseNavigationProp} from '../../routes';
import {QMe} from '../../__generated__/QMe';
import AntDesignIcon from '../components/Icons/AntDesign';
import UserProfilePhoto from '../components/profile-photo/UserProfilePhoto';
import TextComp from '../components/TextComp';

function ProfileScreen() {
  //const user = useSelector((state: RootState) => state.auth.user);

  const {data} = useQuery<QMe>(ME);
  const user = data?.me.data;
  const naviation = useNavigation<UseNavigationProp<'ProfileTab'>>();

  const navigateToEditProfile = () => {
    naviation.navigate('EditProfile', {
      username: user?.username,
      dogname: null,
      loginStrategy: user?.loginStrategy,
      id: user?.id,
      photo: user?.photo,
    });
  };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity style={styles.tobMenu} onPress={navigateToEditProfile}>
        <AntDesignIcon name="setting" size={30} />
      </TouchableOpacity>
      <View style={styles.avatarContainer}>
        <UserProfilePhoto url={user?.photo} size={100} />
        {user?.username ? (
          <View style={styles.rowBox}>
            <TextComp text={'보호자:'} />
            <TextComp text={user?.username} />
          </View>
        ) : (
          <TextComp text={'보호자이름을 설정해주세요.'} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'white',
  },
  tobMenu: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  avatarContainer: {
    height: 200,
    widhth: '100%',
    alignItems: 'center',
    paddingVertical: 30,
  },
  rowBox: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
});

export default ProfileScreen;
