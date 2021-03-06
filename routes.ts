import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {CompositeNavigationProp, RouteProp} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {StackNavigationProp} from '@react-navigation/stack';
import {Dispatch, SetStateAction} from 'react';
import {TypenameAndId} from './apollo-setup';
import {LoginStrategy} from './__generated__/globalTypes';

type editProfileParam = {
  username: string | null | undefined;
  dogname: string | null | undefined;
  loginStrategy: LoginStrategy | undefined;
  id: string | null | undefined;
  photo: string | null | undefined;
};

export type AuthStackList = {
  AuthSelect: undefined;
  Login: {
    email: string | undefined;
    password: string | undefined;
    setAccessToken?: Dispatch<SetStateAction<string>>;
  };
  Join: undefined;
};

export type RootStackList = {
  Record: undefined;
  WalkHome: undefined;
  WalkRecords: undefined;
  Weather: undefined;
  Profile: undefined;
  Social: undefined;
  EditProfile: editProfileParam;
  EditDogProfile: undefined;
  Login: {
    email: string | undefined;
    password: string | undefined;
    setAccessToken?: Dispatch<SetStateAction<string>>;
  };
  Join: undefined;
};

export type WalkStackList = {
  WalkHome: undefined;
  Record: TypenameAndId | undefined;
  WalkRecords: undefined;
  Weather: undefined;
  EditDogProfile: undefined;
};

export type SnsStackList = {
  Social: undefined;
};

export type ProfileStackList = {
  Profile: undefined;
  EditProfile: editProfileParam;
};

export type RootTabNavigator = {
  WalkTab: undefined;
  ProfileTab: undefined;
  SocialTab: undefined;
  AuthTab: undefined;
};

export type UseNavigationProp<TabName extends keyof RootTabNavigator> =
  CompositeNavigationProp<
    BottomTabNavigationProp<RootTabNavigator, TabName>,
    StackNavigationProp<RootStackList>
  >;

export type RootRouteProps<RouteName extends keyof RootStackList> = RouteProp<
  RootStackList,
  RouteName
>;

export type AuthNavigationProp = StackNavigationProp<AuthStackList>;

export type AuthRouteProp<RouteName extends keyof AuthStackList> = RouteProp<
  AuthStackList,
  RouteName
>;

export type AuthScreenProps<RouteName extends keyof AuthStackList> =
  NativeStackScreenProps<AuthStackList, RouteName>;

export type RecordsScreenProps = NativeStackScreenProps<
  WalkStackList,
  'Record'
>;

export type WalkHomeScreenProps = NativeStackScreenProps<
  WalkStackList,
  'WalkHome'
>;

export type EditDogProfileScreenProps = NativeStackScreenProps<
  WalkStackList,
  'EditDogProfile'
>;
