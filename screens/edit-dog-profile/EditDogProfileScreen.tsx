import {gql, useApolloClient, useMutation} from '@apollo/client';
import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {UseControllerProps, useForm} from 'react-hook-form';
import {
  Alert,
  Button,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {Asset, launchImageLibrary} from 'react-native-image-picker';
import {RootRouteProps, UseNavigationProp} from '../../routes';
import BasicButton from '../components/BasicButton';
import FormInputBox from '../components/Input/FormInputBox';
import UserProfilePhoto from '../components/profile-photo/UserProfilePhoto';
import {EditDogInputDto, FileType} from '../../__generated__/globalTypes';
import {
  MCreatePreSignedUrls,
  MCreatePreSignedUrlsVariables,
} from '../../__generated__/MCreatePreSignedUrls';
import {CREATE_PRESIGNED_URL} from '../../apollo-gqls/upload';
import {CREATE_DOG} from '../../apollo-gqls/dogs';
import {MCreateDog, MCreateDogVariables} from '../../__generated__/MCreateDog';
import SmallButton from '../components/SmallButton';
import DogProfilePhoto from '../components/profile-photo/DogProfilePhoto';
import Config from 'react-native-config';
import LoadingOverlay from '../components/loading/LoadingOverlay';

function EditDogProfileScreen() {
  const navigation = useNavigation<UseNavigationProp<'WalkTab'>>();
  const client = useApolloClient();
  const {control, formState, handleSubmit} = useForm<EditDogInputDto>();
  const [createDog, {loading: createDogProfileLoading}] = useMutation<
    MCreateDog,
    MCreateDogVariables
  >(CREATE_DOG);

  const [createPreSignedUrl, {loading: createPreSignedUrlLoading}] =
    useMutation<MCreatePreSignedUrls, MCreatePreSignedUrlsVariables>(
      CREATE_PRESIGNED_URL,
    );

  const [newPhoto, setNewPhoto] = useState<Asset>();

  const getBlob = async (fileUri: string) => {
    const resp = await fetch(fileUri);
    const imageBody = await resp.blob();
    return imageBody;
  };

  const uploadPhotoToS3 = async (file: Asset) => {
    try {
      const blob = await getBlob(file.uri!);
      const filename = `dogPhoto/${Date.now()}_${Math.random()}_${
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
      // console.log(awsUploadresult);
      if (awsUploadresult.status !== 200) {
        throw new Error('?????? ????????? ??????');
      }
      return Config.AWS_S3_ENDPOINT + '/' + filename;
    } catch (e) {
      throw new Error('?????? ????????? ??????');
    }
  };

  const onSubmit = async (formData: EditDogInputDto) => {
    //console.log(formData);
    try {
      const file = newPhoto ? await uploadPhotoToS3(newPhoto) : undefined;
      if (!formData.name) {
        return;
      }
      if (!file) {
        Alert.alert('?????? ??????', '????????? ????????? ?????????????????????.');
        return;
      }
      const res = await createDog({
        variables: {args: {name: formData.name, photo: file}},
      });
      // console.log(res);
      if (res.data?.createDog.error) {
        Alert.alert('??????', res.data?.createDog.error);
        return;
      }
      await Alert.alert('????????? ?????? ??????', '????????? ???????????? ?????????????????????.', [
        {text: '??????', onPress: () => navigation.goBack()},
      ]);
    } catch (e) {
      Alert.alert('??????', '????????? ????????? ????????? ????????? ??????????????????.');
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
    // console.log(result.assets?.[0]);
  };

  return (
    <>
      <ScrollView style={styles.outerWrapper}>
        <KeyboardAvoidingView
          //behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          behavior="padding"
          style={styles.wrapper}>
          <View style={styles.photoContainer}>
            <DogProfilePhoto size={130} url={newPhoto?.uri} />
            <SmallButton title="????????????" onPress={changeProfilePhoto} />
          </View>
          <View style={styles.inputWrapper}>
            <FormInputBox
              title="????????? ??????"
              name="name"
              control={control}
              rules={{
                required: '????????? ??????????????????.',
              }}
              errors={formState.errors.name?.message}
              maxLength={20}
            />
          </View>
          <BasicButton title="????????????" onPress={handleSubmit(onSubmit)} />
        </KeyboardAvoidingView>
      </ScrollView>
      {(createDogProfileLoading || createPreSignedUrlLoading) && (
        <LoadingOverlay />
      )}
    </>
  );
}
const styles = StyleSheet.create({
  outerWrapper: {
    backgroundColor: 'white',
    width: '100%',
    height: '100%',
  },
  wrapper: {
    backgroundColor: 'white',
    paddingVertical: 30,
    paddingHorizontal: 16,
    height: '100%',
  },
  photoContainer: {
    alignItems: 'center',
    height: 250,
    justifyContent: 'space-around',
  },
  inputWrapper: {
    height: 160,
    justifyContent: 'center',
  },
});

export default EditDogProfileScreen;
