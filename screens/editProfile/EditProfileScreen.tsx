import {gql, useApolloClient, useMutation} from '@apollo/client';
import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {Alert, Button, StyleSheet, View} from 'react-native';
import {Asset, launchImageLibrary} from 'react-native-image-picker';
import {RootRouteProps, UseNavigationProp} from '../../routes';
import {
  MEditProfile,
  MEditProfileVariables,
} from '../../__generated__/MEditProfile';
import BasicButton from '../components/BasicButton';
import FormInputBox from '../components/Input/FormInputBox';
import UserProfilePhoto from '../components/profile-photo/UserProfilePhoto';
import {FileType} from '../../__generated__/globalTypes';
import {
  MCreatePreSignedUrls,
  MCreatePreSignedUrlsVariables,
} from '../../__generated__/MCreatePreSignedUrls';
import {ME} from '../../apollo-gqls/auth';
import {CREATE_PRESIGNED_URL} from '../../apollo-gqls/upload';
import Config from 'react-native-config';

const EDIT_PROFILE = gql`
  mutation MEditProfile($username: String, $password: String, $photo: String) {
    editProfile(
      args: {username: $username, password: $password, photo: $photo}
    ) {
      ok
      error
    }
  }
`;
function EditProfileScreen() {
  const {params: user} = useRoute<RootRouteProps<'EditProfile'>>();
  const navigation = useNavigation<UseNavigationProp<'ProfileTab'>>();
  const client = useApolloClient();
  const {control, formState, handleSubmit, setValue} =
    useForm<MEditProfileVariables>();
  const [editProfile] = useMutation<MEditProfile, MEditProfileVariables>(
    EDIT_PROFILE,
  );
  const [createPreSignedUrl] = useMutation<
    MCreatePreSignedUrls,
    MCreatePreSignedUrlsVariables
  >(CREATE_PRESIGNED_URL);

  const [newPhoto, setNewPhoto] = useState<Asset>();

  useEffect(() => {
    setValue('username', user.username);
  }, []);

  const goBackToProfile = () => {
    navigation.goBack();
  };

  const getBlob = async (fileUri: string) => {
    const resp = await fetch(fileUri);
    const imageBody = await resp.blob();
    return imageBody;
  };

  const uploadPhotoToS3 = async (file: Asset) => {
    try {
      const blob = await getBlob(file.uri!);
      const filename = `userPhoto/${Date.now()}_${user.id}_${
        newPhoto?.fileName
      }`;

      const preSignedUrlData = await createPreSignedUrl({
        variables: {
          files: [
            {
              filename: filename,
              fileType: FileType.IMAGE,
            },
          ],
        },
      });
      const preSignedUrl = preSignedUrlData.data?.createPreSignedUrls.urls[0];
      if (!preSignedUrl) {
        throw new Error('preSignedUrl??? ???????????? ???????????????.');
      }

      const awsUploadresult = await fetch(preSignedUrl, {
        method: 'PUT',
        body: blob,
      });
      console.log(awsUploadresult);
      if (awsUploadresult.status !== 200) {
        throw new Error('?????? ????????? ??????');
      }
      return Config.AWS_S3_ENDPOINT + '/' + filename;
    } catch (e) {
      throw new Error('?????? ????????? ??????');
    }
  };

  const onSubmit = async (formData: MEditProfileVariables) => {
    try {
      const file = newPhoto ? await uploadPhotoToS3(newPhoto) : undefined;

      const res = await editProfile({
        variables: {
          ...formData,
          photo: file,
        },
      });
      if (res.data?.editProfile.ok) {
        client.writeQuery({
          query: ME,
          data: {
            me: {
              __typename: 'CoreUserOutputDto',
              ok: true,
              data: {
                __typename: 'UserProfile',
                username: formData.username,
                loginStrategy: user.loginStrategy,
                id: user.id,
                photo: file ? file : user.photo,
              },
            },
          },
          variables: {id: 10},
        });
        Alert.alert('?????? ??????', '??????????????? ?????????????????????.', [
          {
            text: '??????',
            onPress: () => {
              goBackToProfile();
            },
          },
        ]);
      } else {
        Alert.alert('?????? ??????', '????????? ??????????????????.', [
          {
            text: '??????',
          },
        ]);
      }
    } catch (e) {
      Alert.alert('??????', '????????? ?????? ???????????? ????????? ??????????????????.');
    }
  };

  const changeProfilePhoto = async () => {
    // You can also use as a promise without 'callback':
    const result = await launchImageLibrary({
      mediaType: 'photo',
      maxWidth: 1000,
      maxHeight: 1000,
      quality: 0.1,
    });
    if (!result.didCancel) {
      setNewPhoto(result.assets?.[0]);
    }
    console.log(result.assets?.[0]);
  };

  return (
    <View style={styles.wrapper}>
      <UserProfilePhoto url={newPhoto?.uri || user.photo} />
      <Button title="????????????" onPress={changeProfilePhoto} />
      <FormInputBox
        title="??????"
        name="username"
        control={control}
        rules={{
          required: '????????? ??????????????????.',
        }}
        errors={formState.errors.username?.message}
        maxLength={20}
      />
      <FormInputBox
        title="????????? ??????"
        name="dogname"
        control={control}
        rules={{
          required: '????????? ??????????????????.',
        }}
        errors={formState.errors.username?.message}
        maxLength={20}
      />
      {user?.loginStrategy === 'LOCAL' && (
        <FormInputBox
          title="??????"
          name="username"
          control={control}
          rules={{
            required: '????????? ??????????????????.',
          }}
          errors={formState.errors.username?.message}
          maxLength={20}
        />
      )}
      <BasicButton title="????????????" onPress={handleSubmit(onSubmit)} />
    </View>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: '10%',
  },
});

export default EditProfileScreen;
