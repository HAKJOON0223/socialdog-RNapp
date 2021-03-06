import React, {useCallback, useEffect, useState} from 'react';
import {Alert, Image, StyleSheet, Text, View} from 'react-native';
import RNMapView, {Marker, Polyline, PROVIDER_GOOGLE} from 'react-native-maps';
import {useFocusEffect} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../module';
import BtnRecord from './components/BtnRecord';
import TimerComp from './components/TimerComp';
import BtnPause from './components/BtnPause';
import {timerFormatKor, trimMilSec} from '../../utils/dataformat/timeformat';
import {colors} from '../../utils/colors';
import {gql, useApolloClient, useMutation, useQuery} from '@apollo/client';
import {
  MCreateWalk,
  MCreateWalkVariables,
} from '../../__generated__/MCreateWalk';
import Foundation from '../components/Icons/Foundation';
import {QMe} from '../../__generated__/QMe';
import {ME} from '../../apollo-gqls/auth';
import * as lzstring from 'lz-string';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';
import {geolocationConfig} from '../components/GeolocationComponent';
import {RecordsScreenProps} from '../../routes';
import {CREATE_WALK} from '../../apollo-gqls/walks';
import {setGeolocation} from '../../module/geolocation';
import {storeData} from '../../utils/asyncStorage';
import AlertAsync from 'react-native-alert-async';
import {GpsFilter} from '../../utils/filter/gpsFilter';

interface latlngObj {
  latitude: number;
  longitude: number;
}

const gpsFilter = new GpsFilter({round: 3, prevWeight: 0.3});

function RecordingScreen({route, navigation}: RecordsScreenProps) {
  const [location, setLocation] = useState<latlngObj | null>(null);
  const [locations, setLocations] = useState<latlngObj[]>([]);
  const [mapZoom, setMapZoom] = useState<number>(17);
  const [recording, setRecording] = useState(false);
  const [pause, setPause] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>();
  const [timer, setTimer] = useState<number>(0);
  const {data} = useQuery<QMe>(ME);
  const user = data?.me.data;
  const dispatch = useDispatch();
  const geolocaton = useSelector(
    (state: RootState) => state.geolocation.geolocation,
  );
  const client = useApolloClient();
  const isParamExsist = Boolean(route.params?.id.length);
  //console.log(`${route.params?.__typename}:${route.params?.id}`);
  const dogData = isParamExsist
    ? client.readFragment({
        id: `${route.params?.__typename}:${route.params?.id}`,
        fragment: gql`
          fragment dogs on Dogs {
            id
            name
            photo
          }
        `,
      })
    : null;

  // console.log(dogData);

  const [createWalk, {error: createWalkError}] = useMutation<
    MCreateWalk,
    MCreateWalkVariables
  >(CREATE_WALK);

  const startRecording = async () => {
    gpsFilter.clearFilter();
    setRecording(true);
    setStartTime(Date.now());
    startForegroundNotification();
  };

  const toggleRecording = () => {
    setPause(prev => !prev);
  };

  const saveRecordingAndReset = async () => {
    const willSave = await AlertAsync(
      '???????????? ??????',
      '????????? ????????? ?????????????????????????',
      [
        {text: '?????????', onPress: () => false},
        {text: '???', onPress: () => true},
      ],
    );

    if (willSave === false) {
      return;
    }

    try {
      const now = Date.now();
      // ????????? ???????????? ????????? ?????? ?????? ?????????.
      const simplifiedRecord = locations.map(val => [
        +val.latitude.toFixed(6),
        +val.longitude.toFixed(6),
      ]);
      //console.log(simplifiedRecord);

      // ???????????? ??????, ????????? ???????????? ?????????
      const stringData = JSON.stringify(simplifiedRecord);

      // ??????.
      const compressed = lzstring.compressToEncodedURIComponent(stringData);
      if (!startTime) {
        throw new Error();
      }
      const res = await createWalk({
        variables: {
          args: {
            startTime: trimMilSec(startTime),
            walkingTime: timer,
            finishTime: trimMilSec(now),
            walkRecord: compressed,
            dogId: dogData?.id ? dogData.id : null,
          },
        },
      });
      if (res.data?.createWalk.error) {
        console.log(res.data?.createWalk.error);
        Alert.alert('??????', '????????? ??????????????????.');
        return;
      }
      setRecording(false);
      setPause(false);
      setTimer(0);
      setLocations([]);
      gpsFilter.clearFilter();
    } catch (e) {
      console.log(e);
    }
  };

  const stopRecording = () => {
    navigation.goBack();
  };

  const startGeolocationSubscribe = async () => {
    BackgroundGeolocation.start();
  };

  const removeGeolocationListener = useCallback(() => {
    BackgroundGeolocation.removeAllListeners();
  }, []);

  const stopGeolocationSubscribe = () => {
    BackgroundGeolocation.stop();
  };

  const startForegroundNotification = useCallback(() => {
    BackgroundGeolocation.configure({
      ...geolocationConfig,
      startForeground: true,
      notificationsEnabled: true,
    });
  }, []);
  const stopForegroundNotification = useCallback(() => {
    BackgroundGeolocation.configure({
      ...geolocationConfig,
      startForeground: false,
      notificationsEnabled: false,
    });
  }, []);

  const getLocation = async () => {
    BackgroundGeolocation.getCurrentLocation(
      async location => {
        //console.log('geoComp:', location);
        const geoObj = {
          latitude: location.latitude,
          longitude: location.longitude,
        };
        dispatch(setGeolocation(geoObj));
        setLocation(geoObj);
        await storeData({
          key: 'LOCATION',
          value: geoObj,
        });
      },
      error => {
        console.log(error);
        Alert.alert('Error', '??????????????? ??????????????? ??????????????????.');
      },
      {
        maximumAge: 0,
        enableHighAccuracy: false,
      },
    );
  };

  useEffect(() => {
    if (geolocaton?.latitude && geolocaton.longitude && !location) {
      setLocation({...geolocaton});
    }
  }, [geolocaton]);

  useEffect(() => {
    startRecording();
    getLocation();
    startGeolocationSubscribe();
    return () => {
      stopGeolocationSubscribe();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      BackgroundGeolocation.removeAllListeners();
      BackgroundGeolocation.on('location', location => {
        //console.log(Platform.OS, location);
        if (location.accuracy >= 20) {
          return;
        }

        const [latitude, longitude] = gpsFilter.filterNewData([
          location.latitude,
          location.longitude,
        ]);
        // const {latitude, longitude} = location;
        if (!pause && recording) {
          setLocations(prev => {
            return prev.concat([
              {
                latitude,
                longitude,
              },
            ]);
          });
        }
        setLocation({
          latitude,
          longitude,
        });
        // console.log(position);
      });
    }, [recording, pause]),
  );

  useFocusEffect(
    useCallback(() => {
      if (timer > 10800) {
        saveRecordingAndReset();
        Alert.alert('?????? ??????', '?????? ????????????????????? 3??????????????? :(');
      }
    }, [timer]),
  );

  useEffect(() => {
    const onBackPress = (e: any) => {
      setPause(true);
      Alert.alert(
        '????????? ?????????????',
        `${timerFormatKor(timer)} ?????? ???????????????.`,
        [
          {
            text: '?????????',
            style: 'cancel',
            onPress: () => {
              setPause(false);
            },
          },
          {
            text: '???',
            style: 'default',
            onPress: async () => {
              await saveRecordingAndReset();
              await stopForegroundNotification();
              navigation.dispatch(e.data.action);
            },
          },
        ],
      );
    };
    navigation.addListener('beforeRemove', e => {
      // Prevent default behavior of leaving the screen
      e.preventDefault();
      onBackPress(e);
    });
    return () => {
      navigation.removeListener('beforeRemove', onBackPress);
    };
  }, [navigation, timer]);

  return (
    <>
      {location ? (
        <RNMapView
          onRegionChangeComplete={region => {
            setMapZoom(
              Math.ceil(Math.log(360 / region.longitudeDelta) / Math.LN2),
            );
          }}
          onPanDrag={e => console.log(e.target)}
          provider={PROVIDER_GOOGLE}
          style={{flex: 7}}
          initialCamera={{
            altitude: 15000,
            center: location,
            heading: 0,
            pitch: 0,
            zoom: mapZoom,
          }}
          camera={{
            altitude: 15000,
            center: location,
            heading: 0,
            pitch: 0,
            zoom: mapZoom,
          }}>
          <Marker coordinate={location} anchor={{x: 0.5, y: 0.5}}>
            <View style={styles.walkMarker}>
              {dogData?.photo ? (
                <Image
                  source={{uri: dogData?.photo}}
                  style={{width: 30, height: 30}}
                />
              ) : (
                <Foundation name="guide-dog" size={30} />
              )}
            </View>
          </Marker>
          <Polyline
            coordinates={locations}
            strokeColor={colors.PBlue} // fallback for when `strokeColors` is not supported by the map-provider
            strokeWidth={5}
          />
        </RNMapView>
      ) : (
        <View
          style={{
            flex: 7,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text>??????????????? ???????????? ????????????....</Text>
        </View>
      )}
      <View style={styles.ButtonWrapper}>
        <TimerComp
          recording={recording}
          pause={pause}
          timer={timer}
          setTimer={setTimer}
        />
        <BtnRecord
          recording={recording}
          startRecording={startRecording}
          stopRecording={stopRecording}
          pause={pause}
        />
        <BtnPause
          toggleRecording={toggleRecording}
          pause={pause}
          recording={recording}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  ButtonWrapper: {
    flex: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'white',
  },
  markerWrapper: {
    position: 'relative',
    overflow: 'visible',
  },
  walkMarker: {
    overflow: 'hidden',
    width: 35,
    height: 35,
    borderRadius: 20,
    backgroundColor: 'white',
    borderColor: colors.PBlue,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default RecordingScreen;
