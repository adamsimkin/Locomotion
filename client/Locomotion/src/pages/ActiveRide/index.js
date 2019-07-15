import React, { Component, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  TextInput,
  TouchableHighlight,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Polyline, Marker } from 'react-native-maps';
import polyline from '@mapbox/polyline';
import moment from 'moment';
import AddressView from './AddressView';

const styles = StyleSheet.create({
  addressInputs: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: '100%',
    width: '100%',
    backgroundColor: '#fff',
  },
  addressInputsHeader: {
    shadowOffset: { width: 0, height: 0, },
    shadowColor: '#04214f',
    shadowOpacity: 0.4,
    backgroundColor: '#fff',
    overflow: 'visible',
    height: null,
  },
  drawer: {
    position: 'absolute',
    bottom: 50,
    width: '90%',
    backgroundColor: '#fff',
    left: '5%',
    borderRadius: 10,
    shadowOffset: { width: 0, height: 0, },
    shadowColor: '#04214f',
    shadowOpacity: 0.4,
  },
  address: {
    minHeight: 50,
    paddingTop: 10,
    paddingBottom: 10,
    paddingStart: 24,
    alignItems: 'center',
    flexDirection: 'row',
  },
  addressTextInput: {
    marginStart: 16,
    minWidth: 200,
  },  
  originRow: {
    borderBottomColor: '#f2f2f2',
    borderBottomWidth: 1,
  },
  vehicleDot: {
    width: 20,
    height: 20,
    borderRadius: 20,
    borderColor: '#fff',
    borderWidth: 3,
    backgroundColor: '#2384ff',
    shadowOffset: { width: 0, height: 0, },
    shadowColor: '#04214f',
    shadowOpacity: 0.4,
    shadowRadius: 4.65,
  },
  stopPointDot: {
    width: 15,
    height: 15,
    borderRadius: 15,
    borderColor: '#fff',
    borderWidth: 3,
    backgroundColor: '#8ac1ff',
    shadowOffset: { width: 0, height: 0, },
    shadowColor: '#04214f',
    shadowOpacity: 0.4,
    shadowRadius: 4.65,
  },
  originDot: {
    width: 10,
    height: 10,
    backgroundColor: '#8ac1ff',
    borderRadius: 10,
  },
  destinationDot: {
    width: 10,
    height: 10,
    backgroundColor: '#02cc64',
    borderRadius: 10,
  },
  addressText: {
    fontSize: 18,
    color: '#666666',
    marginStart: 32,
    marginEnd: 16,
  },
  headerText: {
    fontSize: 18,
    color: '#666666',
    marginStart: 12,
  },
  name: {
    fontSize: 16,
    color: '#666666',
    marginStart: 10,
  },
  eta: {
    fontSize: 14,
    color: '#666666',
    marginStart: 32,
  },
  book: {
    height: 50,
    backgroundColor: '#666666',
    borderBottomEndRadius: 10,
    borderBottomStartRadius: 10,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  bookEnabled: {
    backgroundColor: '#00435c',
  },
  cancel: {
    height: 50,
    backgroundColor: 'red',
    borderBottomEndRadius: 10,
    borderBottomStartRadius: 10,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  bookText: {
    color: '#fff',
    fontSize: 18,
  }
});


function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

export default () => {
  const [activeRideState, setActiveRide] = useState(null);
  const [activeSpState, setActiveSp] = useState(null);
  const [stopPoints, setStopPoints] = useState(null);
  const [requestStopPoints, setRequestStopPoints] = useState({
    openEdit: false,
    // pickup: {
    //   description: 'My location',
    //   lat: 32.070100,
    //   lng: 34.763717,
    // }
  });
  
  useInterval(() => {
    fetch();
  }, 5000);

  const fetch = async (ignore) => {
    if (ignore) return true;
    const { data: activeRide } = await axios.get('http://localhost:8085/api/v1/users/6ee23529-d7c9-4240-8143-c2c2a69d3774/rides/active', { params: { activeRide: true } })
    if (activeRide) {
      console.log(activeRide.stop_points)
      const [ pickup, dropoff ] = activeRide.stop_points;
      setStopPoints({
        pickup,
        dropoff
      });
      let activeSp = activeRide.stop_points.find(sp => sp.state === 'pending');
      if (activeSp && activeSp.polyline) {
        activeSp = {
          ...activeSp,
          polyline: polyline.decode(activeSp.polyline).map(tuple => ({ latitude: tuple[0], longitude: tuple[1] }))
        };
        setActiveSp(activeSp);
        if (!activeRideState || activeRideState.state !== activeRide.state || activeSp.id !== activeSpState.id) {
          setTimeout(() => {
            this.map.fitToElements(true)
          }, 500)
        }
      }
      setActiveRide(activeRide);
    } else {
      setActiveSp(null);
      setActiveRide(null);
      setStopPoints(null);
    }
  }

  useEffect(() => {
    fetch();
  }, []);

  const readToBook = (state) => state &&
    state.dropoff && state.dropoff.lat &&
    state.pickup && state.pickup.lat;

  const onLocationSelect  = (location) => {
    const newState = {
      ...requestStopPoints,
      [location.type]: location,
    };
    newState.openEdit = !readToBook(newState);
    setRequestStopPoints(newState);
  }

  const openLocationSelect = (location) => {
    const newState = {
      ...requestStopPoints,
      openEdit: true,
    };
    setRequestStopPoints(newState);
  }

  const createRide = async () => {
    const ride = await axios.post('http://localhost:8085/api/v1/users/6ee23529-d7c9-4240-8143-c2c2a69d3774/rides', {
      pickupAddress: requestStopPoints.pickup.description,
      pickupLat: requestStopPoints.pickup.lat, 
      pickupLng: requestStopPoints.pickup.lng, 
      dropoffAddress: requestStopPoints.dropoff.description,
      dropoffLat: requestStopPoints.dropoff.lat, 
      dropoffLng: requestStopPoints.dropoff.lng, 
    })
  }

  const cancelRide = () => 
    axios.post('http://localhost:8085/api/v1/users/6ee23529-d7c9-4240-8143-c2c2a69d3774/cancel-active-ride')

  const inRide = activeRideState && activeRideState.status === 'active';
  const notOnBoard = !activeSpState || activeSpState.type !== 'dropoff';
  const readyToBook = readToBook(requestStopPoints);
    return (
      <View style={StyleSheet.absoluteFillObject}>
        <MapView
          style={StyleSheet.absoluteFillObject}
          followsUserLocation
          showsMyLocationButton
          showsUserLocation={!activeRideState || !activeRideState.vehicle}
          ref={(ref) => this.map = ref}
        >
          {activeSpState ?
            <Polyline
              strokeWidth={3}
              strokeColor={'#8ac1ff'}
              coordinates={activeSpState.polyline}
            /> : null}
          {activeSpState ?
            <Marker
              coordinate={activeSpState.polyline[activeSpState.polyline.length - 1]}
            >
              <View style={styles.stopPointDot} />
            </Marker>: null}
          {activeRideState && activeRideState.vehicle && activeRideState.vehicle.location ?
              <Marker
                coordinate={{ latitude: activeRideState.vehicle.location.lat, longitude: activeRideState.vehicle.location.lng }}
              >
                <View style={styles.vehicleDot} />
              </Marker> : null}
        </MapView>
        <View style={[ styles.drawer ]}>
          {activeRideState && activeRideState.status === 'active' ?
            <View style={[styles.address, styles.originRow]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerText}> {activeSpState && activeSpState.type === 'pickup' ? 'Driver on the way' : 'In-Ride'}  </Text>
                <View style={{ flex: 1, flexDirection: 'row', width: '100%', marginTop: 16 }}>
                  <View style={{flex: 1}}>
                    <Text style={styles.name}> Driver: </Text>
                    <Text style={styles.name}> {activeRideState.driver.first_name} {activeRideState.driver.last_name} </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}> {activeRideState.vehicle.model} ({activeRideState.vehicle.color})  </Text>
                    <Text style={styles.name}> {activeRideState.vehicle.license_number}  </Text>
                  </View>
                </View>
              </View>
            </View> : null}
          <TouchableHighlight onPress={() => openLocationSelect()}>
            <View style={[styles.address, styles.originRow]}>
              <View style={{ position: 'absolute', left: 16, bottom: -1, justifyContent: 'center', alignItems: 'center', width: 20, height: '100%' }}>
                <View style={styles.originDot} />
                <View style={{ width: 1, flex: 1, backgroundColor: '#8aecff' }} />
              </View>
              <View>
                <Text style={styles.addressText}>
                  {
                    (requestStopPoints && requestStopPoints.pickup && requestStopPoints.pickup.description) ||
                    (stopPoints && stopPoints.pickup && stopPoints && stopPoints.pickup.description) ||
                    'Choose Pickup'
                  }
                </Text>
                {stopPoints && stopPoints.pickup ? <Text style={styles.eta}>{moment(stopPoints.pickup.eta || stopPoints.pickup.completed_at).fromNow() }  </Text> : null }
              </View>
            </View>
          </TouchableHighlight>
          <TouchableHighlight onPress={() => openLocationSelect()}>
            <View style={styles.address}>
              <View style={{ position: 'absolute', left: 16, top: 0, justifyContent: 'center', alignItems: 'center', width: 20, height: '100%' }}>
                <View style={{ width: 1, flex: 1, backgroundColor: '#8aecff' }} />
                <View style={styles.destinationDot} />
              </View>
              <View>
                <Text style={styles.addressText}>
                  {
                    (requestStopPoints && requestStopPoints.dropoff && requestStopPoints.dropoff.description) ||
                    (stopPoints && stopPoints.dropoff && stopPoints.dropoff.description) ||
                    'Choose Dropoff'
                  }
                </Text>
                {stopPoints && stopPoints.dropoff ? <Text style={styles.eta}>{moment(stopPoints.dropoff.eta || stopPoints.dropoff.completed_at).fromNow()}  </Text> : null}
              </View>
            </View>
          </TouchableHighlight>
          {
            inRide ?
              notOnBoard ? 
                <TouchableHighlight onPress={() => cancelRide()}>
                  <View style={styles.cancel}>
                    <Text style={styles.bookText}> Cancel Ride </Text>
                  </View>
                </TouchableHighlight> : null
              :
              <TouchableHighlight onPress={() => readyToBook ? createRide() : null }>
                <View style={[styles.book, readyToBook ? styles.bookEnabled : null ]}>
                  <Text style={styles.bookText}> Lets ride </Text>
                </View>
              </TouchableHighlight>
          }
        </View>
        {
          requestStopPoints.openEdit ? 
            <AddressView onLocationSelect={(data) => onLocationSelect(data)} requestStopPoints={requestStopPoints} />
          : null
        }
      </View>
    )
}