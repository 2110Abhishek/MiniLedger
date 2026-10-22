import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { User } from '../types';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <View style={styles.container}>
      <View style={styles.brandContainer}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoIcon}>₹</Text>
        </View>
        <View>
          <Text style={styles.brandTitle}>
            Mini<Text style={styles.brandHighlight}>Ledger</Text>
          </Text>
          <Text style={styles.brandSubtitle}>Personal Lending Tracker</Text>
        </View>
      </View>

      {user && (
        <View style={styles.userContainer}>
          <View style={styles.phoneBadge}>
            <Text style={styles.phoneIcon}>📱</Text>
            <Text style={styles.phoneText}>{user.phoneNumber}</Text>
          </View>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={onLogout}
            accessibilityLabel="Sign out"
            accessibilityRole="button"
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#070B18',
    paddingHorizontal: 20,
    paddingTop: 46,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#1A233D',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#0066FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  logoIcon: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
  },
  brandTitle: {
    color: '#F8FAFC',
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  brandHighlight: {
    color: '#00D2FF',
  },
  brandSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  phoneBadge: {
    backgroundColor: '#0B132B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E3A8A',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  phoneIcon: {
    fontSize: 11,
  },
  phoneText: {
    color: '#93C5FD',
    fontSize: 12,
    fontWeight: '700',
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#FF1E5615',
    borderWidth: 1,
    borderColor: '#FF1E56',
    shadowColor: '#FF1E56',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  logoutText: {
    color: '#FF1E56',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
