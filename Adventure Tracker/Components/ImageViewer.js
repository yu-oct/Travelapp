import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ImageViewer({ item }) {
  const [retrievedPhotoUri, setRetrievedPhotoUri] = useState("");

  useEffect(() => {
    if (item && item.photoUri) {
      getImage(item.photoUri);
    }
  }, [item]);

  const getImage = async (key) => {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        setRetrievedPhotoUri(JSON.parse(value));
      }
    } catch (error) {
      console.log("Error getting image:", error);
    }
  };

  return (
    <View style={styles.container}>
      {retrievedPhotoUri ? (
        <Image source={{ uri: retrievedPhotoUri }} style={styles.image} />
      ) : (
        <Text>Loading...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
});
