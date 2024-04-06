import React, { useState, useEffect } from "react";
import { View, StatusBar, FlatList, Alert } from "react-native";
import styled from "styled-components/native";
import TravelList from "../Components/TravelList";
import Empty from "../Components/Empty";
import Header from "../Components/Header";
import * as Font from "expo-font";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
const getFonts = () =>
  Font.loadAsync({
    "poppins-regular": require("../assets/fonts/Poppins/Poppins-Regular.ttf"),
    "poppins-bold": require("../assets/fonts/Poppins/Poppins-Bold.ttf"),
  });

const HomeScreen = ({ navigation, route }) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [data, setData] = useState([]);
  const [locationPermission, setLocationPermission] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [deviceId, setDeviceId] = useState(null);

  useEffect(() => {
    const generateDeviceId = async () => {
      try {
        let storedDeviceId = await AsyncStorage.getItem('deviceId');
        if (!storedDeviceId) {
          storedDeviceId = generateUniqueDeviceId();
          await AsyncStorage.setItem('deviceId', storedDeviceId);
        }
        console.log('Generated deviceId:', storedDeviceId); 
        setDeviceId(storedDeviceId);
      } catch (error) {
        console.error('Error clearing old deviceId:', error);
      }
    };
    
    generateDeviceId();
  }, []);

useEffect(() => {
  const fetchData = async () => {
    try {
      console.log("Fetching data from AsyncStorage...");
      const value = await AsyncStorage.getItem('records');
      if (value !== null) {
        console.log("Retrieved data from AsyncStorage:", value);
        const records = JSON.parse(value);
        console.log("Parsed records:", records);
        setData(records);
        console.log("Setting data to retrieved records:", records);
      } else {
        console.log("No data found in AsyncStorage.");
      }
    } catch (error) {
      console.error("Failed to fetch data from AsyncStorage:", error);
    }
  };

  fetchData();
}, []);




  useEffect(() => {
    getFonts().then(() => {
      setFontsLoaded(true);
    }).catch(error => console.error(error));
  }, []);

  useEffect(() => {
    const requestLocationPermission = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
    };

    requestLocationPermission();
  }, []);

  useEffect(() => {
  if (route.params && route.params.recordId) {
    const {
      recordId,
      title,
      content,
      location,
      images,
      timestamp,
      humanReadableDate
    } = route.params;

    const newRecord = {
      id: recordId, 
      title,
      content,
      location,
      images, 
      timestamp, 
      humanReadableDate 
    };

    setData(prevData => [...prevData, newRecord]); 
  }
}, [route.params]);


useEffect(() => {
  const updatedRecords = route.params?.updatedRecords;
  if (updatedRecords) {
    const updatedData = data.map(record => {
      if (record.id === updatedRecords.id) { 
        return updatedRecords;
      } else {
        return record;
      }
    });
    setData(updatedData);


    AsyncStorage.setItem('records', JSON.stringify(updatedData))
      .then(() => {
        console.log('Updated records saved successfully.');
      })
      .catch(error => {
        console.error('Error saving updated records:', error);
      });
  }
}, [route.params?.updatedRecords]);


  useEffect(() => {
    if (locationPermission === 'granted') {
      (async () => {
        try {
          let location = await Location.getCurrentPositionAsync({});
          setCurrentLocation(location.coords);
        } catch (error) {
          console.error('Error getting current location:', error);
        }
      })();
    }
  }, [locationPermission]);

  useEffect(() => {
    console.log('Current data:', data);
  }, [data]);

  const storeData = async (id, value) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(id, jsonValue);
    } catch (e) {
      console.log("storeData failure");
      console.log(e);
    }
  };

  const confirmDelete = (id) => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this item?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel'
        },
        { text: 'Delete', onPress: () => deleteItem(id) }
      ],
      { cancelable: false }
    );
  };

 const deleteItem = async (recordId) => {
  const updatedData = data.filter((item) => item.id !== recordId);
  console.log('Data before deletion:', data);
  setData(updatedData);
  console.log('Data after deletion:', updatedData);
  try {
    await AsyncStorage.setItem('records', JSON.stringify(updatedData));
    const newStoredData = await AsyncStorage.getItem('records');
    console.log('New stored data:', newStoredData);
  } catch (error) {
    console.log('Error updating AsyncStorage:', error);
  }
};


  return (
    <ComponentContainer>
      <View>
        <StatusBar barStyle="light-content" backgroundColor="midnightblue" />
      </View>
      <View>
       <FlatList
  data={data}
  extraData={data}
  ListHeaderComponent={() => <Header />}
  ListEmptyComponent={() => <Empty />}
  idExtractor={(item) => item.id}
  renderItem={({ item }) => (
    <TravelList
  item={item}
  deleteItem={() => confirmDelete(item.id)}
/>

  )}
  keyExtractor={(item, index) => index.toString()}
/>

      </View>
    </ComponentContainer>
  );
}

const ComponentContainer = styled.View`
  background-color:white;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  backgroundColor: '#E0F2F1'；
`;

const generateUniqueDeviceId = () => {
  const timestamp = new Date().getTime();
  const randomPart = Math.random().toString(36).substr(2, 5);
  const deviceId = `device_${timestamp}_${randomPart}`;
  return deviceId;
};

export default HomeScreen;
