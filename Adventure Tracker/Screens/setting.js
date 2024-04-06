import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal, ScrollView } from 'react-native';
import * as Contacts from 'expo-contacts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card } from 'react-native-paper';

const EmergencyContactScreen = () => {
  const [contacts, setContacts] = useState([]);
  const [selectedContactIndex, setSelectedContactIndex] = useState(-1);
  const [emergencyContact, setEmergencyContact] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const getData = async () => {
      try {
        const savedData = await AsyncStorage.getItem('emergency_contact_data');
        if (savedData) {
          const { selectedContact, savedDeviceId } = JSON.parse(savedData);
          setEmergencyContact(selectedContact);
          setDeviceId(savedDeviceId);
        }
      } catch (error) {
        console.error('Error retrieving emergency contact data:', error);
      }
    };

    getData();
  }, []);

  const pickEmergencyContact = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Permission to access contacts was denied');
      return;
    }

    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers],
    });

    if (data.length === 0) {
      Alert.alert('No Contacts', 'No contacts available on your device');
      return;
    }

    setContacts(data);
    setModalVisible(true);
  };

  const handleSelectContact = async () => {
    if (selectedContactIndex >= 0) {
      const selectedContact = contacts[selectedContactIndex];
      setEmergencyContact(selectedContact);
      try {
        await AsyncStorage.setItem('emergency_contact_data', JSON.stringify({
          selectedContact,
          savedDeviceId: deviceId,
        }));
      } catch (error) {
        console.error('Error saving emergency contact data:', error);
      }
    }
    setModalVisible(false);
  };

  const clearEmergencyContact = async () => {
    setEmergencyContact(null);
    try {
      await AsyncStorage.removeItem('emergency_contact_data');
    } catch (error) {
      console.error('Error clearing emergency contact data:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        {emergencyContact ? (
          <View>
            <Text style={styles.label}>Selected Emergency Contact:</Text>
            <Text>{emergencyContact.name}</Text>
            <Text>{emergencyContact.phoneNumbers[0].number}</Text>
            <TouchableOpacity style={styles.button} onPress={clearEmergencyContact}>
              <Text style={styles.buttonText}>Clear Emergency Contact</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={styles.label}>No Emergency Contact Selected</Text>
            <TouchableOpacity style={styles.button} onPress={pickEmergencyContact}>
              <Text style={styles.buttonText}>Select Emergency Contact</Text>
            </TouchableOpacity>
          </View>
        )}
      </Card>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Select Emergency Contact</Text>
            <ScrollView style={styles.contactsList}>
              {contacts.map((contact, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.contactItem,
                    selectedContactIndex === index && styles.selectedContact,
                  ]}
                  onPress={() => setSelectedContactIndex(index)}
                >
                  <Text>{contact.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[styles.button, styles.selectButton]}
              onPress={handleSelectContact}
            >
              <Text style={styles.buttonText}>Select</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#E0F2F1',
  },
  card: {
    padding: 20,
    borderRadius: 10,
    elevation: 3,
    width: '100%',
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#8B7D7B',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 15,
  },
  contactsList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  contactItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  selectedContact: {
    backgroundColor: '#8B7D7B',
  },
  selectButton: {
    backgroundColor: '#8B7D7B',
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
});

export default EmergencyContactScreen;
