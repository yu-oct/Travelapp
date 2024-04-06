import React from "react";
import styled from "styled-components/native";

export default function Empty() {
  return (
    <ComponentContainer>
      <EmptyContent>
        <EmptyImage
          source={require("../assets/images/toms-rits-ryfptJi3fAM-unsplash.jpg")}
        />
        <EmptyText>Your Adventure Tracker.</EmptyText>
      </EmptyContent>
    </ComponentContainer>
  );
}

const ComponentContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;
const EmptyContent = styled.View`
  align-items: center;
`;

const EmptyText = styled.Text`
  color: #8B7D7B; 
  font-family: poppins-bold;
  font-size: 25px;
`;
const EmptyImage = styled.Image`
  width: 300px;
  height: 150px;
  margin-bottom: 20px;
`;

