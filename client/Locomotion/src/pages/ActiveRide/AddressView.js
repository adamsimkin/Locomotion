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
    marginStart: 10,
  },
  name: {
    fontSize: 16,
    color: '#666666',
    marginStart: 10,
  },
  eta: {
    fontSize: 14,
    color: '#666666',
    marginStart: 10,
  },
  book: {
    height: 50,
    backgroundColor: '#00435c',
    borderBottomEndRadius: 10,
    borderBottomStartRadius: 10,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
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

export default (props) => {
  const [searchPickupText, setSearchPickupText] = useState(props.requestStopPoints.pickup && props.requestStopPoints.pickup.description);
  const [searchDropoffText, setSearchDropoffText] = useState(props.requestStopPoints.dropoff && props.requestStopPoints.dropoff.description);
  const [addressListItems, setAddressListItems] = useState(null);

  const setPlace = async (place) => {
    if(addressListItems.type === 'pickup') {
      setSearchPickupText(place.description);
    } else {
      setSearchDropoffText(place.description);
    }

    const { data } = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
      params: {
        key: process.env.GOOGLE_MAPS_API_KEY,
        placeid: place.place_id,
      }
    });

    console.log(data.result.geometry.location)

    if (props.onLocationSelect) {
      props.onLocationSelect({
        type: addressListItems.type,
        description: place.description,
        ...data.result.geometry.location
      })
    }
    setAddressListItems({
      type: addressListItems.type,
      list: [],
    })
  }

  const loadAddress = async (input) => {
    const { data } = await axios.get('https://maps.googleapis.com/maps/api/place/autocomplete/json', {
      params: {
        key: process.env.GOOGLE_MAPS_API_KEY,
        input,
      }
    });

    return data.predictions;
  }

  const setSearchValue = async (value, type) => {
    if (type === 'dropoff') {
      setSearchDropoffText(value);
    } else {
      setSearchPickupText(value);
    }

    setAddressListItems({
      type,
      list: await loadAddress(value),
    })
  }

  return (
    <View style={[styles.addressInputs]}>
      <SafeAreaView style={[styles.addressInputsHeader]}>
        <View>
          <View style={[styles.address, styles.originRow]}>
            <View style={{ position: 'absolute', left: 16, bottom: -1, justifyContent: 'center', alignItems: 'center', width: 20, height: '100%' }}>
              <View style={{ height: 0 }} />
              <View style={styles.originDot} />
              <View style={{ width: 1, flex: 1, backgroundColor: '#8aecff' }} />
            </View>
            <View>
              <TextInput style={[styles.addressText, , styles.addressTextInput]} value={searchPickupText} onChangeText={value => setSearchValue(value, 'pickup')} />
            </View>
          </View>
          <View style={styles.address}>
            <View style={{ position: 'absolute', left: 16, top: 0, justifyContent: 'center', alignItems: 'center', width: 20, height: '100%' }}>
              <View style={{ width: 1, flex: 1, backgroundColor: '#8aecff' }} />
              <View style={styles.destinationDot} />
            </View>
            <View>
              <TextInput style={[styles.addressText, styles.addressTextInput]} value={searchDropoffText} onChangeText={value => setSearchValue(value, 'dropoff')} />
            </View>
          </View>
        </View>
      </SafeAreaView>
      <View>
        {addressListItems && addressListItems.list && addressListItems.list.map(item => (
          <TouchableHighlight key={item.id} style={{
            borderBottomColor: '#f2f2f2',
            borderBottomWidth: 1,
          }} onPress={() => setPlace(item)} >
            <Text style={{
              padding: 18,
              fontSize: 16,
            }}>{item.description}</Text>
          </TouchableHighlight>
        ))}
      </View>
    </View>
  )
}