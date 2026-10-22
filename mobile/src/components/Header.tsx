import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { User } from '../types';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 520;

  return (
    <View style={styles.outerWrapper}>
      <View style={styles.container}>
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>₹</Text>
          </View>
          <View style={styles.brandTextWrapper}>
            <Text style={styles.brandTitle}>
              Mini<Text style={styles.brandHighlight}>Ledger</Text>
            </Text>
            {!isSmallScreen && (
              <Text style={styles.brandSubtitle}>Personal Lending Tracker</Text>
            )}
          </View>
        </View>

        {user && (
          <View style={styles.userContainer}>
            <View style={styles.phoneBadge}>
              <Text style={styles.phoneIcon}>📱</Text>
              <Text style={styles.phoneText}>
                {isSmallScreen && user.phoneNumber.length >= 10
                  ? `...${user.phoneNumber.slice(-5)}`
                  : user.phoneNumber}
              </Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  outerWrapper: {
    width: '100%',
    backgroundColor: '#070B18',
    borderBottomWidth: 1,
    borderBottomColor: '#1A233D',
  },
  container: {
    width: '100%',
    maxWidth: 1040,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
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
    fontSize: 22,
    fontWeight: '900',
  },
  brandTextWrapper: {
    minWidth: 0,
    flexShrink: 1,
  },
  brandTitle: {
    color: '#F8FAFC',
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  brandHighlight: {
    color: '#00D2FF',
  },
  brandSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '500',
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  phoneBadge: {
    backgroundColor: '#0B132B',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E3A8A',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  phoneIcon: {
    fontSize: 11,
  },
  phoneText: {
    color: '#93C5FD',
    fontSize: 11,
    fontWeight: '700',
  },
  logoutButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
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
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
