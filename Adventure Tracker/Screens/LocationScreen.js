import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Alert, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Card, Text } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';

const LocationScreen = () => {
  const [deviceId, setDeviceId] = useState(null);
  const [locations, setLocations] = useState([]);
  const [initialRegion, setInitialRegion] = useState(null);
  const [failedSendCount, setFailedSendCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Simulate a delay of 2 seconds
        await new Promise(resolve => setTimeout(resolve, 2000));

        const storedDeviceId = await AsyncStorage.getItem('deviceId');
        if (storedDeviceId) {
          setDeviceId(storedDeviceId);
          startLocationUpdates(storedDeviceId);
        } else {
          console.error('Device ID not found in AsyncStorage');
        }

        const storedLocations = await AsyncStorage.getItem('locations');
        if (storedLocations) {
          setLocations(JSON.parse(storedLocations));
        }
      } catch (error) {
        console.error('Error fetching data from AsyncStorage:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchInitialLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.error('Permission to access location was denied');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        setInitialRegion({
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } catch (error) {
        console.error('Error fetching initial location:', error);
      }
    };

    fetchInitialLocation();
  }, []);

  const startLocationUpdates = async (deviceId) => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setLocations([{ latitude, longitude, timestamp: new Date().toLocaleString() }]);

      sendLocation(deviceId, latitude, longitude, new Date().toLocaleString());

      const intervalId = setInterval(async () => {
        const newLocation = await Location.getCurrentPositionAsync({});
        const { latitude: newLatitude, longitude: newLongitude } = newLocation.coords;
        setLocations(prevLocations => [{ latitude: newLatitude, longitude: newLongitude, timestamp: new Date().toLocaleString() }, ...prevLocations]);
        sendLocation(deviceId, newLatitude, newLongitude, new Date().toLocaleString());
      }, 30* 60 * 1000);

      return () => clearInterval(intervalId);
    } catch (error) {
      console.error('Error starting location updates:', error);
    }
  };

  const sendLocation = async (deviceId, latitude, longitude, timestamp) => {
    console.log('Sending location data to the server:', { deviceId, latitude, longitude, timestamp });
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Sending location data timed out'));
        }, 5000); // 设置超时时间为 5 秒
      });

      const sendLocationPromise = fetch('http://10.26.12.64:3000/api/device-location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deviceId, latitude, longitude, timestamp: new Date().toISOString() }),
      });

      // 使用 Promise.race 来设置超时
      await Promise.race([timeoutPromise, sendLocationPromise]);

      console.log('Location sent successfully.');
      setFailedSendCount(0);
    } catch (error) {
      console.error('Failed to send location:', error);
      setFailedSendCount(prevCount => prevCount + 1);

      if (failedSendCount === 2) {
        Alert.alert(
          'Failed to Send Location',
          'Failed to send location data to the server. Please check your internet connection. Consider sending an SMS to your emergency contact.',
          [{ text: 'OK', onPress: () => sendEmergencySMS(latitude, longitude) }]
        );
      }
    }
  };

  const sendEmergencySMS = async (latitude, longitude) => {
    try {
      const isAvailable = await SMS.isAvailableAsync();
      if (isAvailable) {
        const message = `Emergency: Unable to send location. Last known coordinates - Latitude: ${latitude}, Longitude: ${longitude}`;
        const recipients = ['447706218252'];
        const { result } = await SMS.sendSMSAsync(recipients, message);
        if (result === SMS.SentStatus.Sent) {
          console.log('Emergency SMS sent successfully.');
        } else {
          console.error('Failed to send emergency SMS.');
        }
      } else {
        console.error('SMS is not available on this device.');
      }
    } catch (error) {
      console.error('Error sending emergency SMS:', error);
    }
  };

  const handleSendSMS = async () => {
    const location = locations[0];
    if (location) {
      const { latitude, longitude } = location;
      sendEmergencySMS(latitude, longitude);
    } else {
      console.error('No location available to send emergency SMS.');
    }
  };

  const renderCardItem = useCallback(({ item }) => (
    <Card containerStyle={styles.card}>
      <Text style={styles.cardText}>Device ID: {deviceId}</Text>
      <Text style={styles.cardText}>Latitude: {item.latitude}</Text>
      <Text style={styles.cardText}>Longitude: {item.longitude}</Text>
      <Text style={styles.cardText}>Timestamp: {item.timestamp}</Text>
    </Card>
  ), [deviceId]);

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        {initialRegion && (
          <MapView style={styles.map} initialRegion={initialRegion}>
            {locations.map((location, index) => (
              <Marker
                key={index}
                coordinate={{ latitude: location.latitude, longitude: location.longitude }}
                title={`Device ID: ${deviceId}`}
                description={`Timestamp: ${location.timestamp}`}
              />
            ))}
          </MapView>
        )}
      </View>
      <View style={styles.contentContainer}>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#8B7D7B" />
          </View>
        ) : (
          <View style={styles.cardContainer}>
            <FlatList
              data={locations}
              renderItem={renderCardItem}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        )}
      </View>
      <TouchableOpacity style={styles.button} onPress={handleSendSMS}>
        <Text style={styles.buttonText}>Send Emergency SMS</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F2F1',
  },
  mapContainer: {
    flex: 2,
  },
  map: {
    flex: 1,
  },
  cardContainer: {
    flex: 1,
  },
  card: {
    width: '90%',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    elevation: 2,
  },
  cardText: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#8B7D7B',
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 5,
    margin: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LocationScreen;
