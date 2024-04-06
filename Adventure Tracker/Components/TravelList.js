import React from 'react';
import { View, Text, Image, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import Swipeout from 'react-native-swipeout';

export default function TravelList({ item, deleteItem }) {
  const navigation = useNavigation();
  const { recordId, title, content, location, images, timestamp, humanReadableDate } = item;

  const handleDetailPress = () => {
    navigation.navigate('DetailScreen', { item });
  };

  const swipeoutBtns = [
    {
      text: 'Delete',
      backgroundColor: 'red',
      onPress: () => deleteItem(item.id)
    }
  ];

  return (
    <Swipeout right={swipeoutBtns} autoClose={true} style={styles.swipeoutStyle}>
      <ListContainer onPress={handleDetailPress}>
        <ThumbnailContainer>
          {images.length > 0 ? (
            <ThumbnailImage source={{ uri: images[0] }} />
          ) : (
            <NoImageIcon source={require('../assets/images/toms-rits-ryfptJi3fAM-unsplash.jpg')} />
          )}
        </ThumbnailContainer>
        <CardContent>
          <TextItem>{title}</TextItem>
          {location && (
            <TextLocation>{location}</TextLocation>
          )}
          <TextDate>{humanReadableDate}</TextDate>
        </CardContent>
      </ListContainer>
    </Swipeout>
  );
}

const ListContainer = styled.TouchableOpacity`
  background-color: whitesmoke;
  height: auto;
  width: 370px;
  border-radius: 10px;
  flex-direction: row;
  justify-content: space-between;
  padding: 15px;
  margin-bottom: 15px;
`;

const ThumbnailContainer = styled.View`
  width: 80px;
  height: 80px;
  justify-content: center;
  align-items: center;
  margin-right: 10px; /* Add margin to the right */
`;

const ThumbnailImage = styled.Image`
  width: 80px;
  height: 80px;
  border-radius: 10px;
`;

const NoImageIcon = styled(Image)`
  width: 80px;
  height: 80px;
  border-radius: 10px;
`;

const CardContent = styled.View`
  flex: 1;
`;

const TextItem = styled.Text`
  color: black;
  font-size: 20px;
  font-family: poppins-regular;
`;

const TextLocation = styled.Text`
  color: goldenrod;
  font-size: 16px;
  font-family: poppins-regular;
`;

const TextDate = styled.Text`
  color: gray;
  font-size: 14px;
  font-family: poppins-regular;
`;

const styles = {
  swipeoutStyle: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    margin: 0,
    padding: 0,
    height: 'auto' // 设置高度为自动调整
  }
};

