import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image } from 'react-native';
import { Loan } from '../types';
import { formatINR } from '../services/loans';

interface ReceiptModalProps {
  visible: boolean;
  imageUrl: string | null;
  loan: Loan | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  visible,
  imageUrl,
  loan,
  onClose,
}) => {
  if (!imageUrl || !loan) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Loan Receipt</Text>
              <Text style={styles.subtitle}>
                {loan.friendName} • {formatINR(loan.amount)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              accessibilityLabel="Close receipt preview"
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#000000EE',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#0A1022',
    borderRadius: 22,
    width: '100%',
    maxWidth: 500,
    maxHeight: '85%',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#182444',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#182444',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    color: '#00D2FF',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0E1730',
    borderWidth: 1,
    borderColor: '#1E2C52',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
  },
  imageContainer: {
    width: '100%',
    height: 400,
    backgroundColor: '#05070E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
