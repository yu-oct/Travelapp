import React from "react";
import styled from "styled-components/native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';

let today = new Date().toISOString().slice(0, 10);

export default function Header() {
  const navigation = useNavigation(); // 使用 useNavigation 获取导航对象

  return (
    <ComponentContainer>
      <HeaderList>{today}</HeaderList>
    </ComponentContainer>
  );
}

const ComponentContainer = styled.View`
  height: 100px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const HeaderList = styled.Text`
  color: black;
  font-family: poppins-bold;
  font-size: 20px;
  margin-right: 20px;
`;

const AddButton = styled.TouchableOpacity`
  width: 50px;
  justify-content: center;
  align-items: center;
  background-color: whitesmoke;
  margin-right: 20px;
  border-radius: 50px;
`;
