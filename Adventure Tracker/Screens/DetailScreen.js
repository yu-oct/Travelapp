import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, TouchableWithoutFeedback, Keyboard, Modal, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import { Camera } from 'expo-camera';

const DetailScreen = ({ route, navigation }) => {
  const { item } = route.params;
  const [editedTitle, setEditedTitle] = useState(item.title);
  const [editedContent, setEditedContent] = useState(item.content);
  const [images, setImages] = useState(item.images || []);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [cameraPermission, setCameraPermission] = useState(null);

  useEffect(() => {
    navigation.setOptions({
      title: item.title,
    });
    getPermissionsAsync();
  }, [item.title, navigation]);

  const getPermissionsAsync = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    setCameraPermission(status === 'granted');
  };

  const handleImagePick = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setImages(prevImages => [...prevImages, result.uri]);
    }
  };

  const handleCameraPick = async () => {
    if (cameraPermission !== 'granted') {
      Alert.alert('No access to camera', 'Please enable camera access in settings to use this feature.');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setImages(prevImages => [...prevImages, result.uri]);
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

const saveChanges = () => {
  const updatedItem = { ...item, title: editedTitle, content: editedContent, images: images };
  navigation.navigate('Home', { updatedRecords: updatedItem });
};


  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <Container>
            <InputContainer>
              <Input
                placeholder="Title"
                onChangeText={setEditedTitle}
                value={editedTitle}
              />
            </InputContainer>
            <ContentInput
              placeholder="Write your blog content here..."
              onChangeText={setEditedContent}
              value={editedContent}
              multiline={true}
            />
            <ImageButtonContainer>
              <ImageButton onPress={handleImagePick}>
                <Ionicons name="add-circle-outline" size={24} color="black" />
              </ImageButton>
              <CameraButton onPress={handleCameraPick}>
                <Ionicons name="camera-outline" size={24} color="black" />
              </CameraButton>
            </ImageButtonContainer>
            <ScrollView horizontal={true}>
              {images.map((image, index) => (
                <TouchableImage key={index} onPress={() => handleViewImage(image)} onLongPress={() => handleDeleteImage(index)}>
                  <ThumbnailImage source={{ uri: image }} resizeMode="cover" />
                </TouchableImage>
              ))}
            </ScrollView>
            <SaveButton onPress={saveChanges}>
              <ButtonText>Save</ButtonText>
            </SaveButton>
          </Container>
        </ScrollView>
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
};



const InputContainer = styled.View`
  margin-bottom: 20px;
`;

const Input = styled.TextInput`
  font-size: 20px;
  background-color: white;
  width: 100%;
  padding: 10px;
  border-radius: 10px;
`;

const ContentInput = styled.TextInput`
  font-size: 18px;
  background-color: white;
  width: 100%;
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

const CameraButton = styled.TouchableOpacity`
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

const SaveButton = styled.TouchableOpacity`
  width: 100px;
  height: 50px;
  justify-content: center;
  align-items: center;
  background-color: #8B7D7B;
  border-radius: 10px;
  margin-bottom: 40px;
  align-self: center;
`;

const Container = styled.View`
  flex: 1;
  padding: 20px;
  justify-content: flex-end; 
`;


const ButtonText = styled.Text`
  color: white;
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

export default DetailScreen;
