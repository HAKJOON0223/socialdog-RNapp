/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {useState} from 'react';
import {StatusBar, useColorScheme} from 'react-native';
import RecordingScreen from './screens/record/RecordingScreen';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {LogInScreen} from './screens/login/LoginScreen';
import {Provider} from 'react-redux';
import {applyMiddleware, createStore} from 'redux';
import rootReducer from './module';
import {routes} from './routes';
import WalkRecordsScreen from './screens/walk-records/WalkRecordsScreen';
import {User} from './module/auth';
import Profile from './screens/profile/Profile';
import Social from './screens/social/Social';
import {composeWithDevTools} from 'redux-devtools-extension';
import WheatherScrean from './screens/wheather/WheatherScreen';
import FAIcon from 'react-native-vector-icons/FontAwesome5';
import MIcon from 'react-native-vector-icons/MaterialIcons';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const store = createStore(rootReducer, composeWithDevTools(applyMiddleware()));

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [userData, setUserData] = useState<User>();

  return (
    <Provider store={store}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NavigationContainer>
        {!userData ? (
          <LogInScreen setUserData={setUserData} />
        ) : (
          <Tab.Navigator initialRouteName={routes.walkRecords}>
            <Tab.Screen
              name={routes.wheather}
              options={{
                headerShown: false,
                tabBarLabel: '산책',
                tabBarIcon: ({color, size}) => (
                  <FAIcon name="dog" color={color} size={size} />
                ),
              }}>
              {() => (
                <Stack.Navigator>
                  <Stack.Screen
                    name={routes.wheather}
                    component={WheatherScrean}
                  />
                  <Stack.Screen
                    name={routes.walkRecords}
                    component={WalkRecordsScreen}
                  />
                  <Stack.Screen
                    name={routes.record}
                    component={RecordingScreen}
                  />
                </Stack.Navigator>
              )}
            </Tab.Screen>
            <Tab.Screen
              name={routes.social}
              options={{
                headerShown: false,
                tabBarLabel: '친구들',
                tabBarIcon: ({color, size}) => (
                  <MIcon name="nature-people" color={color} size={size} />
                ),
              }}>
              {() => (
                <Stack.Navigator>
                  <Stack.Screen name={routes.social} component={Social} />
                </Stack.Navigator>
              )}
            </Tab.Screen>
            <Tab.Screen
              name={routes.profile}
              options={{
                headerShown: false,
                tabBarLabel: '프로필',
                tabBarIcon: ({color, size}) => (
                  <MIcon name="face" color={color} size={size} />
                ),
              }}>
              {() => (
                <Stack.Navigator>
                  <Stack.Screen name={routes.profile} component={Profile} />
                </Stack.Navigator>
              )}
            </Tab.Screen>
          </Tab.Navigator>
        )}
      </NavigationContainer>
    </Provider>
  );
};

export default App;
