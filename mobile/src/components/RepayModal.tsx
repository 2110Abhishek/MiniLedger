import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Loan } from '../types';
import { formatINR } from '../services/loans';

interface RepayModalProps {
  loan: Loan | null;
  visible: boolean;
  submitting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const RepayModal: React.FC<RepayModalProps> = ({
  loan,
  visible,
  submitting,
  onConfirm,
  onCancel,
}) => {
  if (!loan) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>💰</Text>
          </View>

          <Text style={styles.title}>Confirm Repayment</Text>
          <Text style={styles.message}>
            Are you sure you want to mark the loan of{' '}
            <Text style={styles.highlight}>{formatINR(loan.amount)}</Text> to{' '}
            <Text style={styles.highlight}>{loan.friendName}</Text> as fully settled?
          </Text>
          <Text style={styles.note}>
            This action will update your lending totals in real-time.
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              disabled={submitting}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={onConfirm}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.confirmText}>Yes, Mark Repaid</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#000000DD',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#0A1022',
    borderRadius: 22,
    padding: 26,
    width: '100%',
    maxWidth: 420,
    borderWidth: 1.5,
    borderColor: '#182444',
    alignItems: 'center',
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0066FF20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#00D2FF',
  },
  icon: {
    fontSize: 30,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 21,
    fontWeight: '800',
    marginBottom: 10,
  },
  message: {
    color: '#CBD5E1',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  highlight: {
    color: '#00D2FF',
    fontWeight: '800',
  },
  note: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#0E1730',
    borderWidth: 1,
    borderColor: '#1E2C52',
  },
  cancelText: {
    color: '#8CA0BA',
    fontSize: 14,
    fontWeight: '700',
  },
  confirmButton: {
    backgroundColor: '#0066FF',
    borderWidth: 1,
    borderColor: '#38BDF8',
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
