/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {useCallback, useEffect, useState} from 'react';
import {
  Alert,
  AppRegistry,
  Linking,
  PermissionsAndroid,
  Platform,
  StatusBar,
  useColorScheme,
} from 'react-native';
import RecordingScreen from './screens/record/RecordingScreen';
import {NavigationContainer, useFocusEffect} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {LogInScreen} from './screens/login/LoginScreen';
import {Provider} from 'react-redux';
import {applyMiddleware, createStore} from 'redux';
import rootReducer from './module';
import {routes} from './routes';
import WalkRecordsScreen from './screens/walk-records/WalkRecordsScreen';
import {User} from './module/auth';
import Social from './screens/social/Social';
import {composeWithDevTools} from 'redux-devtools-extension';
import FAIcon from 'react-native-vector-icons/FontAwesome5';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import {check, PERMISSIONS, request} from 'react-native-permissions';
import GeolocationComponent from './screens/components/GeolocationComponent';
import {SafeAreaView} from 'react-native-safe-area-context';
import WeatherScreen from './screens/weather/WeatherScreen';
import {ApolloClient, ApolloProvider, InMemoryCache} from '@apollo/client';
import {storeData} from './utils/asyncStorage';
import {USER_ACCESS_TOKEN, USER_REFRESH_TOKEN} from './utils/constants';

// Initialize Apollo Client
const client = new ApolloClient({
  uri: 'http://121.154.94.120/graphql',
  cache: new InMemoryCache(),
});

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const store = createStore(rootReducer, composeWithDevTools(applyMiddleware()));

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [userData, setUserData] = useState<User>();
  const [locationPermission, setLocationPermission] = useState(false);

  const androidHasPermission = async () => {
    return await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
    );
  };

  const getAndroidLocationPermission = async () => {
    if (await androidHasPermission()) {
      setLocationPermission(true);
      return true;
    } else {
      const result = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      if (result === 'granted') {
        setLocationPermission(true);
        Alert.alert(
          '백그라운드 위치정보.',
          `정상적인 위치정보 수집을 위해, 추가로 위치정보를 항상 허용으로 설정해주세요`,
          [
            {
              text: '괜찮아요',
              onPress: () => {},
              style: 'cancel',
            },
            {
              text: '설정하기',
              onPress: () => {
                Linking.openSettings();
              },
            },
          ],
        );
      } else {
        Alert.alert(
          '백그라운드 위치정보.',
          `위치정보 권한이 없으면, 관련 서비스를 이용하실 수 업습니다.`,
          [
            {
              text: '확인',
            },
          ],
        );
      }
    }
  };

  const checkIosLocationPermission = async () => {
    const always = await check(PERMISSIONS.IOS.LOCATION_ALWAYS);
    const whenUse = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
    console.log(always, whenUse);
    if (always === 'granted' || whenUse === 'granted') {
      setLocationPermission(true);
    } else {
      Alert.alert(
        '백그라운드 위치정보.',
        `정상적인 위치 수집을 위해, 위치정보를 항상 허용으로 설정해주세요`,
        [
          {
            text: '알겠어요',
            onPress: () => {
              request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE)
                .then(result => {
                  console.log(result);
                  if (result !== 'blocked') {
                    setLocationPermission(true);
                  }
                })
                .catch(error => console.log(error));
            },
          },
        ],
      );
    }
  };

  useEffect(() => {
    if (Platform.OS === 'android') {
      getAndroidLocationPermission();
    } else {
      checkIosLocationPermission();
    }
  }, []);

  // useEffect(() => {
  //   storeData({key: USER_ACCESS_TOKEN, value: null});
  //   storeData({key: USER_REFRESH_TOKEN, value: null});
  // }, []);

  function Walk() {
    return (
      <Stack.Navigator>
        <Stack.Screen name={routes.weather} component={WeatherScreen} />
        <Stack.Screen name={routes.walkRecords} component={WalkRecordsScreen} />
        <Stack.Screen name={routes.record} component={RecordingScreen} />
      </Stack.Navigator>
    );
  }

  function Sns() {
    return (
      <Stack.Navigator>
        <Stack.Screen name={routes.social} component={Social} />
      </Stack.Navigator>
    );
  }

  function Profile() {
    return (
      <Stack.Navigator>
        <Stack.Screen name={routes.profile} component={Profile} />
      </Stack.Navigator>
    );
  }

  return (
    <ApolloProvider client={client}>
      <Provider store={store}>
        <SafeAreaView style={{height: '100%'}}>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

          {locationPermission && <GeolocationComponent />}
          <NavigationContainer>
            {!userData ? (
              <LogInScreen setUserData={setUserData} />
            ) : (
              <Tab.Navigator>
                <Tab.Screen
                  name={routes.weather}
                  component={Walk}
                  options={{
                    headerShown: false,
                    tabBarLabel: '산책',
                    tabBarIcon: ({color, size}) => (
                      <FAIcon name="dog" color={color} size={size} />
                    ),
                  }}></Tab.Screen>

                <Tab.Screen
                  name={routes.social}
                  component={Sns}
                  options={{
                    headerShown: false,
                    tabBarLabel: '친구들',
                    tabBarIcon: ({color, size}) => (
                      <MIcon name="nature-people" color={color} size={size} />
                    ),
                  }}></Tab.Screen>

                <Tab.Screen
                  name={routes.profile}
                  component={Profile}
                  options={{
                    headerShown: false,
                    tabBarLabel: '프로필',
                    tabBarIcon: ({color, size}) => (
                      <MIcon name="face" color={color} size={size} />
                    ),
                  }}></Tab.Screen>
              </Tab.Navigator>
            )}
          </NavigationContainer>
        </SafeAreaView>
      </Provider>
    </ApolloProvider>
  );
};

export default App;
