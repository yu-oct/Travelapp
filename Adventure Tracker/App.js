import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import HomeScreen from './Screens/Homescreen';
import CreateScreen from './Screens/CreateScreen';
import LocationScreen from './Screens/LocationScreen';
import DetailScreen from './Screens/DetailScreen';
import EmergencyContactScreen from './Screens/setting'; 
import { StyleSheet } from 'react-native';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainStack = () => {
  return (
     <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#FDF5E6' }, 
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          cardStyle: { backgroundColor: '#B2DFDB' } 
        }}
      />
      <Stack.Screen 
        name="DetailScreen" 
        component={DetailScreen} 
        options={{ 
          cardStyle: { backgroundColor: '#E0F2F1' } 
        }}
      />
    </Stack.Navigator>
  );
};
export default function App() {
  return (
    <NavigationContainer>
     <Tab.Navigator
  screenOptions={{
    cardStyle: { backgroundColor: '#E0F2F1' } 
  }}
  tabBar={(props) => (
    <CustomTabBar {...props} />
  )}
>
  <Tab.Screen name="Main" component={MainStack} />
  <Tab.Screen name="CreateScreen" component={CreateScreen} />
  <Tab.Screen name="LocationScreen" component={LocationScreen} />
  <Tab.Screen name="EmergencyContactScreen" component={EmergencyContactScreen} />
</Tab.Navigator>
    </NavigationContainer>
  );
}


const CustomTabBar = ({ state, descriptors, navigation }) => {
  const routeName = state.routes[state.index].name; 
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#FDF5E6',
        height: 100, 
      }}
    >
      {routeName === 'Main' ? (
        <TouchableOpacity style={styles.tabButton} onPress={() => navigation.navigate('Home')}>
          <Ionicons name="home" size={32} color="#8B7D7B" />
          <Text style={styles.tabText}>Home</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.tabButton} onPress={() => navigation.navigate('Main')}>
          <Ionicons name="home-outline" size={32} color="#8B7D7B" />
          <Text style={styles.tabText}>Home</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.tabButton} onPress={() => navigation.navigate('CreateScreen')}>
        <Ionicons name="add-circle-outline" size={32} color="#8B7D7B" />
        <Text style={styles.tabText}>Create</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.tabButton} onPress={() => navigation.navigate('LocationScreen')}>
        <Ionicons name="location" size={32} color="#8B7D7B" />
        <Text style={styles.tabText}>Location</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.tabButton} onPress={() => navigation.navigate('EmergencyContactScreen')}>
        <Ionicons name="person" size={32} color="#8B7D7B" />
        <Text style={styles.tabText}>Setting</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column', 
  },
  tabText: {
    fontSize: 12,
    marginTop: 4, 
  },
});

