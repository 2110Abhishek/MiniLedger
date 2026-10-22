import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  ActivityIndicator,
  Text,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { User, Loan } from './src/types';
import { getStoredUser, logout } from './src/services/auth';
import { getAuthToken } from './src/services/api';
import { Header } from './src/components/Header';
import { LoginScreen } from './src/screens/LoginScreen';
import { OtpScreen } from './src/screens/OtpScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { AddLoanScreen } from './src/screens/AddLoanScreen';

// Ensure body/html/root are completely dark on web with zero white margins
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const existingStyle = document.getElementById('miniledger-web-reset');
  if (!existingStyle) {
    const style = document.createElement('style');
    style.id = 'miniledger-web-reset';
    style.textContent = `
      html, body, #root {
        background-color: #05070E !important;
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        min-height: 100vh !important;
        height: 100% !important;
        overflow-x: hidden !important;
      }
    `;
    document.head.appendChild(style);
  }
}

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'add-loan'>('dashboard');

  useEffect(() => {
    async function checkAuth() {
      try {
        const token = await getAuthToken();
        const user = await getStoredUser();
        if (token && user) {
          setCurrentUser(user);
        }
      } catch (err) {
        console.error('Error restoring session:', err);
      } finally {
        setInitializing(false);
      }
    }
    checkAuth();
  }, []);

  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
    setPendingPhone(null);
    setCurrentView('dashboard');
  };

  const handleOtpSent = (phoneNumber: string) => {
    setPendingPhone(phoneNumber);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setPendingPhone(null);
    setCurrentView('dashboard');
  };

  if (initializing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Initializing MiniLedger...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      {/* Authenticated View */}
      {currentUser ? (
        <View style={styles.mainContainer}>
          <Header user={currentUser} onLogout={handleLogout} />

          {currentView === 'dashboard' ? (
            <DashboardScreen
              user={currentUser}
              onOpenAddLoan={() => setCurrentView('add-loan')}
            />
          ) : (
            <AddLoanScreen
              onSuccess={(newLoan: Loan) => {
                setCurrentView('dashboard');
              }}
              onCancel={() => setCurrentView('dashboard')}
            />
          )}
        </View>
      ) : (
        /* Unauthenticated View */
        <View style={styles.authContainer}>
          {pendingPhone ? (
            <OtpScreen
              phoneNumber={pendingPhone}
              onSuccess={handleLoginSuccess}
              onBack={() => setPendingPhone(null)}
            />
          ) : (
            <LoginScreen onOtpSent={handleOtpSent} />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#05070E',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#05070E',
  },
  authContainer: {
    flex: 1,
    backgroundColor: '#05070E',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#05070E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#00D2FF',
    fontSize: 14,
    marginTop: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
