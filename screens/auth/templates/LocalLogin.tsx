import React, {Dispatch, SetStateAction, useEffect, useState} from 'react';
import {KeyboardAvoidingView, ScrollView, StyleSheet, View} from 'react-native';
import {colors} from '../../../utils/colors';
import {gql, useMutation} from '@apollo/client';
import {useForm} from 'react-hook-form';
import {regexEmail, regexPassword} from '../../../utils/regex';
import BasicButton from '../../components/BasicButton';
import {storeData} from '../../../utils/asyncStorage';
import {USER_ACCESS_TOKEN, USER_REFRESH_TOKEN} from '../../../utils/constants';
import {useNavigation, useRoute} from '@react-navigation/native';
import {
  AuthNavigationProp,
  AuthRouteProp,
  UseNavigationProp,
} from '../../../routes';
import FormInputBox from '../../components/Input/FormInputBox';
import {
  MLocalLogin,
  MLocalLoginVariables,
} from '../../../__generated__/MLocalLogin';
import {mVLoginState, mVUserAccessToken} from '../../../apollo-setup';
import {Alert} from 'react-native';
import {LOCAL_LOGIN} from '../../../apollo-gqls/auth';
import TermsTemplate from './TermsTemplate';
import AlertAsync from 'react-native-alert-async';
import LoadingOverlay from '../../components/loading/LoadingOverlay';

interface ILoginForm {
  email: string;
  password: string;
}

function LocalLogin() {
  const [modalOpen, setModalOpen] = useState(false);
  const route = useRoute<AuthRouteProp<'Login'>>();
  const [login, {loading: loginLoading}] = useMutation<
    MLocalLogin,
    MLocalLoginVariables
  >(LOCAL_LOGIN);
  const navigation = useNavigation<UseNavigationProp<'AuthTab'>>();
  const {handleSubmit, setValue, getValues, formState, control} =
    useForm<ILoginForm>({
      mode: 'onBlur',
    });

  const saveTokens = async ({localLogin}: MLocalLogin) => {
    if (localLogin.accessToken && localLogin.refreshToken) {
      await storeData({key: USER_ACCESS_TOKEN, value: localLogin.accessToken});
      await storeData({
        key: USER_REFRESH_TOKEN,
        value: localLogin.refreshToken,
      });
    }
  };

  const onSumbit = async ({acceptTerms = false}) => {
    const {email, password} = getValues();
    const res = await login({
      variables: {args: {email, password, acceptTerms}},
    });
    if (res.data?.localLogin.error) {
      Alert.alert('????????? ??????', res.data?.localLogin.error);
    }
    if (res.data?.localLogin.acceptTerms === false) {
      await AlertAsync('?????? ??????', '?????? ????????? ????????? ?????? ?????? ??? ?????????');
      setModalOpen(true);
    }
    if (res.data?.localLogin && res.data.localLogin.accessToken) {
      await saveTokens(res.data);
      mVLoginState(true);
      mVUserAccessToken(res.data.localLogin.accessToken);
    }
  };

  const moveToJoin = () => {
    navigation.push('Join');
  };

  const closeTermTemplate = () => {
    setModalOpen(false);
  };

  useEffect(() => {
    if (route?.params?.email && route?.params?.password) {
      //console.log(route.params);
      setValue('email', route.params.email);
      setValue('password', route.params.password);
    }
  }, [route]);

  return (
    <>
      <ScrollView style={styles.wrapper}>
        <KeyboardAvoidingView
          //behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          behavior="padding"
          style={styles.wrapper}>
          <View style={styles.formWrapper}>
            <FormInputBox
              titleColor={colors.PWhite}
              title={'?????????'}
              name={'email'}
              control={control}
              rules={{
                required: '???????????? ??????????????????.',
                pattern: {
                  value: regexEmail,
                  message: '????????? ???????????? ??????????????????.',
                },
              }}
              errors={formState.errors.email?.message}
            />
            <FormInputBox
              titleColor={colors.PWhite}
              title={'????????????'}
              name={'password'}
              control={control}
              rules={{
                required: '??????????????? ??????????????????',
                pattern: {
                  value: regexPassword,
                  message:
                    '??????????????? ?????? 8???, ?????? ????????? ??????, ????????? ?????? ?????????.',
                },
              }}
              secureTextEntry
              errors={formState.errors.password?.message}
            />
            <BasicButton
              title="?????????"
              onPress={handleSubmit(() => onSumbit({}))}
              fontColor={colors.PBlue}
              fontWeight={'600'}
              style={styles.buttonStyle}
            />
          </View>
          <View style={styles.joinButtonWrapper}>
            <BasicButton
              title="????????????"
              onPress={moveToJoin}
              fontColor={colors.PBlue}
              fontWeight={'600'}
              style={styles.buttonStyle}
            />
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
      {modalOpen && (
        <TermsTemplate
          nextStep={handleSubmit(() => onSumbit({acceptTerms: true}))}
          closeModal={closeTermTemplate}
        />
      )}

      {loginLoading && <LoadingOverlay />}
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: '100%',
    width: '100%',
    backgroundColor: colors.PBlue,
    paddingHorizontal: '5%',
  },
  formWrapper: {
    width: '100%',
    height: 500,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonStyle: {
    marginTop: 20,
    backgroundColor: colors.PWhite,
    color: colors.PBlue,
  },
  joinButtonWrapper: {
    width: '100%',
    backgroundColor: colors.PBlue,
    justifyContent: 'flex-end',
    paddingBottom: '20%',
  },
});

export default LocalLogin;
