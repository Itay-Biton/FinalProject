// components/dev/ApiDebugger.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { apiClient, userApi } from '../../api';
import Config from 'react-native-config';

const ApiDebugger = () => {
  const [connectionStatus, setConnectionStatus] =
    useState<string>('Testing...');
  const [serverInfo, setServerInfo] = useState<any>(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setConnectionStatus('🔍 Testing connection...');
      const result = await apiClient.testConnection();

      if (result.success) {
        setConnectionStatus('✅ Server reachable');
        setServerInfo(result.data);
      } else {
        setConnectionStatus(`❌ Connection failed: ${result.error}`);
        setServerInfo(null);
      }
    } catch (error) {
      setConnectionStatus(`🚨 Error: ${error}`);
      setServerInfo(null);
    }
  };

  const testRegistration = async () => {
    try {
      Alert.alert(
        'Test Registration',
        'This will attempt to register a test user. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Test',
            onPress: async () => {
              console.log('🧪 Testing user registration...');
              const result = await userApi.registerUser({
                email: 'test@example.com',
                password: 'password123',
                firstName: 'Test',
                lastName: 'User',
                phoneNumber: '+1234567890',
              });

              Alert.alert(
                'Registration Test Result',
                result.success
                  ? `✅ Success: ${JSON.stringify(result.data, null, 2)}`
                  : `❌ Failed: ${result.error}`,
              );
            },
          },
        ],
      );
    } catch (error) {
      Alert.alert('Error', `Test failed: ${error}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔧 API Debugger</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configuration</Text>
        <Text style={styles.info}>Base URL: {apiClient.getBaseURL()}</Text>
        <Text style={styles.info}>Timeout: {apiClient.getTimeout()}ms</Text>
        <Text style={styles.info}>
          Config.API_URL: {Config.API_URL || 'undefined'}
        </Text>
        <Text style={styles.info}>__DEV__: {__DEV__ ? 'true' : 'false'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Server Status</Text>
        <Text style={styles.status}>{connectionStatus}</Text>
        {serverInfo && (
          <Text style={styles.info}>
            Status: {serverInfo.status} {serverInfo.statusText}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>

        <TouchableOpacity style={styles.button} onPress={testConnection}>
          <Text style={styles.buttonText}>🔄 Test Connection</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testRegistration}>
          <Text style={styles.buttonText}>👤 Test Registration</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#FF9800' }]}
          onPress={() => {
            console.log('📋 Current API Client Config:');
            console.log('Base URL:', apiClient.getBaseURL());
            console.log('Timeout:', apiClient.getTimeout());
            console.log('Config.API_URL:', Config.API_URL);
            Alert.alert(
              'Debug Info',
              'Check console for detailed API configuration',
            );
          }}
        >
          <Text style={styles.buttonText}>📋 Log Config</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Common Issues & Solutions</Text>
        <Text style={styles.troubleshoot}>
          • Make sure your server is running{'\n'}• Check if port 3000 is
          accessible{'\n'}• Verify your .env file has API_URL set{'\n'}• For
          Android emulator, use 10.0.2.2 instead of localhost{'\n'}• For
          physical device, use your computer's IP address
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  info: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  status: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  troubleshoot: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default ApiDebugger;
