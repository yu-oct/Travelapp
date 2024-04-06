import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, Image, Modal, TouchableWithoutFeedback, Keyboard, ScrollView, Alert } from 'react-native';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CreateScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [recordId, setRecordId] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Location permission denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      getAddress(location.coords.latitude, location.coords.longitude);
    } catch (error) {
      console.error('Error getting current location:', error);
    }
  };

  const getAddress = async (latitude, longitude) => {
    try {
      let addressResponse = await Location.reverseGeocodeAsync({ latitude, longitude, language: 'en' });
      setAddress(addressResponse[0].name || addressResponse[0].street);
      setCity(addressResponse[0].city);
      setRegion(addressResponse[0].region);
      setCountry(addressResponse[0].country);
      setLoading(false);
    } catch (error) {
      console.error('Error getting address:', error);
    }
  };

  const handleImagePick = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImages(prevImages => [...prevImages, result.assets[0].uri]);
    }
  };

  const handleCameraCapture = async () => {
    const { status } = await Camera.requestPermissionsAsync();
    if (status === 'granted') {
      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImages(prevImages => [...prevImages, result.assets[0].uri]);
      }
    }
  };

  const handleViewImage = (imageUri) => {
    setSelectedImage(imageUri);
    setShowModal(true);
  };

  const handleDeleteImage = (index) => {
    Alert.alert(
      'Delete Image',
      'Are you sure you want to delete this image?',
      [
        { text: 'Cancel', onPress: () => console.log('Cancel Pressed') },
        {
          text: 'OK',
          onPress: () => {
            setImages(prevImages => prevImages.filter((_, i) => i !== index));
          }
        }
      ]
    );
  };

  // 获取当前时间戳
  const timestamp = Date.now();
  
  // 转换为人类可读的日期格式
  const humanReadableDate = new Date(timestamp).toLocaleDateString();

  const generateRecordId = () => {
    return Math.random().toString();
  };

  const handleSubmit = async () => {
    const newRecordId = generateRecordId();

    // 设置 recordId 的值
    setRecordId(newRecordId);

    // 保存数据到本地存储，并传递时间戳
    await saveDataToLocal(newRecordId, timestamp);

    // 导航并传递到 Home 页面
    navigation.navigate('Home', { 
      recordId: newRecordId, 
      title, 
      content,
      location: `${address}, ${city}, ${region}, ${country}`, 
      images,
      timestamp,
      humanReadableDate
    });

    // 重置表单
    setTitle('');
    setContent('');
    setImages([]);
  };

  const saveDataToLocal = async (recordId, timestamp) => {
    try {
      const records = await AsyncStorage.getItem('records');
      const parsedRecords = records ? JSON.parse(records) : [];
      const locationString = `${address}, ${city}, ${region}, ${country}`;
      const newRecord = { 
        recordId, 
        title, 
        content, 
        location: locationString, 
        images, 
        timestamp,
        humanReadableDate
      };
      const updatedRecords = [...parsedRecords, newRecord];
      await AsyncStorage.setItem('records', JSON.stringify(updatedRecords));
    } catch (error) {
      console.error('Error storing record:', error);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1 }}>
        <ComponentContainer>
          <InputContainer>
            <Input
              placeholder="Title"
              onChangeText={setTitle}
              value={title}
            />
          </InputContainer>
          <ContentInput
            placeholder="Write your blog content here..."
            onChangeText={setContent}
            value={content}
            multiline={true}
          />
          <ImageButtonContainer>
            <ImageButton onPress={handleImagePick}>
              <Ionicons name="add-circle-outline" size={24} color="black" />
            </ImageButton>
            <ImageButton onPress={handleCameraCapture}>
              <Ionicons name="camera" size={24} color="black" />
            </ImageButton>
          </ImageButtonContainer>
          <ScrollView horizontal={true}>
            {images.map((image, index) => (
              <TouchableImage key={index} onPress={() => handleViewImage(image)} onLongPress={() => handleDeleteImage(index)}>
                <ThumbnailImage source={{ uri: image }} resizeMode="cover" />
              </TouchableImage>
            ))}
          </ScrollView>
          {loading ? (
            <ActivityIndicator size="large" color="#8B7D7B" />
          ) : (
            <AddressContainer>
              <AddressText>
                Address: {address}, {city}, {region}, {country}
              </AddressText>
            </AddressContainer>
          )}
          <SubmitButton onPress={handleSubmit}>
            <ButtonText>Create</ButtonText>
          </SubmitButton>
        </ComponentContainer>
        <Modal
          visible={showModal}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowModal(false)}
        >
          <ModalContainer>
            <TouchableWithoutFeedback onPress={() => setShowModal(false)}>
              <ModalImage
                source={{ uri: selectedImage }}
                resizeMode="contain"
              />
            </TouchableWithoutFeedback>
          </ModalContainer>
        </Modal>

      </View>
    </TouchableWithoutFeedback>
  );
}

const ComponentContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #E0F2F1; 
`;


const InputContainer = styled.View`
  margin-bottom: 20px;
  margin-top: 40px;
`;

const Input = styled.TextInput`
  font-family: poppins-regular;
  font-size: 20px;
  background-color: white;
  width: 300px;
  padding: 10px;
  border-radius: 10px;
`;

const ContentInput = styled.TextInput`
  font-family: poppins-regular;
  font-size: 18px;
  background-color: white;
  width: 300px;
  height: 200px;
  padding: 10px;
  border-radius: 10px;
  margin-bottom: 20px;
`;

const ImageButtonContainer = styled.View`
  flex-direction: row;
  margin-bottom: 20px;
`;

const ImageButton = styled.TouchableOpacity`
  width: 50px;
  height: 50px;
  justify-content: center;
  align-items: center;
  margin-right: 10px;
`;

const ThumbnailImage = styled.Image`
  width: 100px;
  height: 100px;
  margin-right: 10px;
`;

const TouchableImage = styled.TouchableOpacity`
  margin-right: 10px;
`;

const AddressContainer = styled.View`
  background-color: lightgray;
  padding: 10px;
  border-radius: 10px;
  margin-bottom: 10px;
`;

const AddressText = styled.Text`
  font-family: poppins-regular;
  font-size: 16px;
`;

const SubmitButton = styled.TouchableOpacity`
  width: 100px;
  height: 50px;
  justify-content: center;
  align-items: center;
  background-color:#8B7D7B;
  border-radius: 10px;
  margin-bottom: 40px;
`;

const ButtonText = styled.Text`
  color: white;
  font-family: poppins-bold;
  font-size: 18px;
`;

const ModalContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ModalImage = styled.Image`
  width: 300px;
  height: 300px;
`;
