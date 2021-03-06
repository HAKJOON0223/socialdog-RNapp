import React, {useEffect, useState} from 'react';
import {colors} from '../../../utils/colors';
import {gql, useLazyQuery, useMutation} from '@apollo/client';
import {regexEmail, regexPassword, regexVerifyCode} from '../../../utils/regex';
import {
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useForm, Controller} from 'react-hook-form';
import BasicButton from '../../components/BasicButton';
import {useNavigation} from '@react-navigation/native';
import {AuthNavigationProp} from '../../../routes';
import FormInputBox from '../../components/Input/FormInputBox';
import FormBtnInputBox from '../../components/Input/FormBtnInputBox';
import {
  MCreateLocalAccount,
  MCreateLocalAccountVariables,
} from '../../../__generated__/MCreateLocalAccount';
import {
  MCreateVerification,
  MCreateVerificationVariables,
} from '../../../__generated__/MCreateVerification';
import {
  MVerifyEmailAndCode,
  MVerifyEmailAndCodeVariables,
} from '../../../__generated__/MVerifyEmailAndCode';
import TermsTemplate from './TermsTemplate';
import AlertAsync from 'react-native-alert-async';
import TextComp from '../../components/TextComp';
import MaterialCommunityIcons from '../../components/Icons/MaterialCommunityIcons';
import {
  CHECK_VERIFICATION,
  CREATE_VERIFICATION,
  JOIN,
} from '../../../apollo-gqls/auth';
import LoadingOverlay from '../../components/loading/LoadingOverlay';

interface IJoinForm {
  email: string;
  password1: string;
  password2: string;
  code: string;
}

function LocalJoin() {
  const navigation = useNavigation<AuthNavigationProp>();
  const [enableVerify, setEnableVerify] = useState(false);
  const [enableEmail, setEnableEmail] = useState(true);
  const [verifyDone, setVerifyDone] = useState(false);
  const [paswordError, setPasswordError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [createAccount, {loading: createAccountLoading, error, data}] =
    useMutation<MCreateLocalAccount, MCreateLocalAccountVariables>(JOIN);

  const [createVerification, {loading: createVerificationLoading}] =
    useMutation<MCreateVerification, MCreateVerificationVariables>(
      CREATE_VERIFICATION,
    );

  const [verifyEmailandCode, {loading: verifyEmailAndCodeLoading}] =
    useLazyQuery<MVerifyEmailAndCode, MVerifyEmailAndCodeVariables>(
      CHECK_VERIFICATION,
    );

  const {
    handleSubmit,
    getValues,
    watch,
    trigger,
    setValue,
    formState,
    control,
  } = useForm<IJoinForm>({
    mode: 'onChange',
  });

  const sendVerifyCode = async () => {
    const result = await createVerification({
      variables: {email: getValues('email')},
    });
    if (result.data?.createVerification.ok) {
      setEnableVerify(true);
      setEnableEmail(false);
      Alert.alert(
        '????????? ?????? ??????.',
        '????????? ???????????? ???????????????, ?????? ???????????? ??????????????????.',
      );
    } else {
      Alert.alert(
        '????????? ?????? ??????',
        `${result.data?.createVerification.error}`,
      );
    }
  };

  const checkVerifyCode = async () => {
    const result = await verifyEmailandCode({
      variables: {email: getValues('email'), code: getValues('code')},
    });
    if (result.data?.verifyEmailAndCode.ok) {
      setEnableVerify(false);
      setVerifyDone(true);
      Alert.alert('?????? ??????.', '????????? ?????????????????????.');
    } else {
      console.log(result.error);
      console.log(result.data?.verifyEmailAndCode.error);
    }
  };

  const onSumbit = async ({email, password1, code}: IJoinForm) => {
    if (!(email && password1 && code && acceptTerms)) {
      return;
    }
    const result = await createAccount({
      variables: {args: {email: email, password: password1, code, acceptTerms}},
    });
    if (result.data?.createLocalAccount.ok) {
      await Alert.alert('??????????????????', '????????? ?????????????????????.', [
        {
          text: '????????? ????????????',
          onPress: () => {
            navigation.replace('Login', {email, password: password1});
          },
        },
      ]);
    } else {
      console.log(result.errors);
      Alert.alert(
        '???????????? ??????',
        result?.data?.createLocalAccount?.error || '??????????????? ??????????????????.',
      );
    }
  };

  const closeModal = () => {
    Alert.alert('??? ??????', '?????? ?????? ???????????? ??????????????????????', [
      {text: '?????????', onPress: () => false},
      {text: '???', onPress: () => setModalOpen(false)},
    ]);
  };

  const acceptTermsAndCloseModal = () => {
    setAcceptTerms(true);
    setModalOpen(false);
  };

  const openTermsModal = () => {
    setModalOpen(true);
  };

  return (
    <>
      <ScrollView style={styles.wrapper}>
        <KeyboardAvoidingView
          //behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          behavior="padding"
          style={styles.wrapper}>
          <FormBtnInputBox
            titleColor={colors.PWhite}
            input={{
              title: '?????????',
              control,
              errors: formState.errors.email?.message,
              name: 'email',
              rules: {
                required: '???????????? ??????????????????.',
                pattern: {
                  value: regexEmail,
                  message: '????????? ???????????? ??????????????????.',
                },
              },
              editable: enableEmail && !verifyDone,
            }}
            button={{
              buttonColor: colors.PWhite,
              disabled:
                Boolean(formState?.errors?.email?.message) ||
                !getValues('email') ||
                verifyDone,
              title: '????????? ??????',
              onPress: sendVerifyCode,
            }}
          />

          <FormBtnInputBox
            titleColor={colors.PWhite}
            input={{
              title: '????????????',
              control,
              errors: formState.errors.code?.message,
              name: 'code',
              rules: {
                pattern: {
                  value: regexVerifyCode,
                  message: '??????????????? 6???????????????.',
                },
              },
              editable: enableVerify && !verifyDone,
            }}
            button={{
              buttonColor: colors.PWhite,
              disabled:
                (!enableVerify &&
                  (Boolean(formState?.errors?.code?.message) ||
                    !getValues('code'))) ||
                verifyDone,
              title: '?????? ??????',
              onPress: checkVerifyCode,
            }}
          />

          <FormInputBox
            titleColor={colors.PWhite}
            title={'????????????'}
            control={control}
            rules={{
              required: '??????????????? ??????????????????',
              pattern: {
                value: regexPassword,
                message:
                  '??????????????? ?????? 8???, ?????? ????????? ??????, ????????? ?????? ?????????.',
              },
              validate: async () => {
                trigger('password2');
                return undefined;
              },
            }}
            name="password1"
            maxLength={20}
            secureTextEntry={true}
            errors={formState.errors.password1?.message}
          />
          <FormInputBox
            titleColor={colors.PWhite}
            title={'???????????? ??????'}
            control={control}
            rules={{
              required: '??????????????? ??????????????????',
              validate: value => {
                setPasswordError(watch('password1') !== value);
                return undefined;
              },
            }}
            name="password2"
            maxLength={20}
            secureTextEntry={true}
            errors={
              paswordError && Boolean(getValues('password2'))
                ? '??????????????? ???????????? ????????????.'
                : formState.errors.password2?.message
            }
          />
          <TouchableOpacity
            onPress={acceptTerms ? () => {} : openTermsModal}
            disabled={acceptTerms}
            style={styles.checkboxWrapper}>
            <TextComp text="?????? ????????????" size={20} color={colors.PWhite} />
            {acceptTerms ? (
              <MaterialCommunityIcons
                size={24}
                name="checkbox-marked-outline"
                color={colors.PWhite}
              />
            ) : (
              <MaterialCommunityIcons
                size={24}
                name="checkbox-blank-outline"
                color={colors.PWhite}
              />
            )}
          </TouchableOpacity>
          <>
            {!(
              Boolean(getValues('email')) &&
              Boolean(getValues('password1')) &&
              Boolean(getValues('password2')) &&
              Boolean(getValues('code')) &&
              acceptTerms &&
              !paswordError
            ) ? (
              <BasicButton
                style={styles.btnWrapper}
                disable={true}
                title="????????????"
                onPress={handleSubmit(onSumbit)}
              />
            ) : (
              <BasicButton
                fontColor={colors.PBlack}
                style={{...styles.btnWrapper, backgroundColor: 'white'}}
                disable={false}
                title="????????????"
                onPress={handleSubmit(onSumbit)}
              />
            )}
          </>
        </KeyboardAvoidingView>
      </ScrollView>
      {modalOpen && (
        <TermsTemplate
          nextStep={acceptTermsAndCloseModal}
          closeModal={closeModal}
        />
      )}
      {(createAccountLoading ||
        createVerificationLoading ||
        verifyEmailAndCodeLoading) && <LoadingOverlay />}
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: '10%',
    backgroundColor: colors.PBlue,
    paddingHorizontal: '5%',
    height: '100%',
  },
  rowBox: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  InputBox: {
    width: '100%',
    marginBottom: 15,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  shortInput: {
    width: '65%',
  },
  smallBtn: {
    width: '30%',
  },
  btnWrapper: {
    marginTop: 40,
  },
  checkboxWrapper: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});

export default LocalJoin;
