import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Loan } from '../types';
import { formatINR, formatDate } from '../services/loans';
import { API_BASE_URL } from '../services/api';

interface LoanCardProps {
  loan: Loan;
  onRepay: (loan: Loan) => void;
  onViewReceipt: (receiptUrl: string, loan: Loan) => void;
}

export const LoanCard: React.FC<LoanCardProps> = ({ loan, onRepay, onViewReceipt }) => {
  const isRepaid = loan.isRepaid;
  const isOverdue = loan.isOverdue;

  const fullReceiptUrl = loan.receiptUrl
    ? loan.receiptUrl.startsWith('http')
      ? loan.receiptUrl
      : `${API_BASE_URL.replace('/api', '')}${loan.receiptUrl}`
    : null;

  return (
    <View
      style={[
        styles.card,
        isOverdue && styles.cardOverdue,
        isRepaid && styles.cardRepaid,
      ]}
      accessible={true}
      accessibilityLabel={`Loan to ${loan.friendName}, amount ${formatINR(loan.amount)}, status ${loan.status}`}
    >
      <View style={styles.topRow}>
        <View style={styles.friendInfo}>
          <View
            style={[
              styles.avatar,
              isRepaid ? styles.avatarRepaid : isOverdue ? styles.avatarOverdue : styles.avatarOutstanding,
            ]}
          >
            <Text
              style={[
                styles.avatarText,
                isRepaid ? styles.avatarTextRepaid : isOverdue ? styles.avatarTextOverdue : styles.avatarTextOutstanding,
              ]}
            >
              {loan.friendName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.friendName}>{loan.friendName}</Text>
            <Text style={styles.dateText}>
              {isRepaid ? (
                `Repaid: ${loan.repaidAt ? formatDate(loan.repaidAt) : 'Yes'}`
              ) : isOverdue ? (
                `⚠️ Due was ${formatDate(loan.dueDate)}`
              ) : (
                `Due: ${formatDate(loan.dueDate)}`
              )}
            </Text>
          </View>
        </View>

        <View style={styles.amountContainer}>
          <Text
            style={[
              styles.amount,
              isRepaid ? styles.amountRepaid : isOverdue ? styles.amountOverdue : styles.amountOutstanding,
            ]}
          >
            {formatINR(loan.amount)}
          </Text>
          <View
            style={[
              styles.statusBadge,
              isRepaid ? styles.statusRepaid : isOverdue ? styles.statusOverdue : styles.statusOutstanding,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isRepaid ? styles.statusTextRepaid : isOverdue ? styles.statusTextOverdue : styles.statusTextOutstanding,
              ]}
            >
              {isRepaid ? '✓ REPAID' : isOverdue ? '⚠️ OVERDUE' : '⏳ OUTSTANDING'}
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom actions row */}
      <View style={styles.bottomRow}>
        {fullReceiptUrl ? (
          <TouchableOpacity
            style={styles.receiptButton}
            onPress={() => onViewReceipt(fullReceiptUrl, loan)}
            accessibilityRole="button"
            accessibilityLabel="View receipt image"
          >
            <Image source={{ uri: fullReceiptUrl }} style={styles.receiptThumb} />
            <Text style={styles.receiptText}>Receipt 🔍</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholderSpace} />
        )}

        {!isRepaid && (
          <TouchableOpacity
            style={[styles.repayButton, isOverdue ? styles.repayButtonOverdue : styles.repayButtonRegular]}
            onPress={() => onRepay(loan)}
            accessibilityRole="button"
            accessibilityLabel={`Mark loan of ${formatINR(loan.amount)} as repaid`}
          >
            <Text style={styles.repayButtonText}>Mark as Repaid ✓</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#0A1022',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.2,
    borderColor: '#182444',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  cardOverdue: {
    borderColor: '#FF1E56',
    borderWidth: 1.8,
    backgroundColor: '#190812',
    shadowColor: '#FF1E56',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 6,
  },
  cardRepaid: {
    borderColor: '#0E444B',
    backgroundColor: '#06161B',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  avatarOutstanding: {
    backgroundColor: '#0066FF20',
    borderColor: '#0066FF60',
  },
  avatarRepaid: {
    backgroundColor: '#00F5A020',
    borderColor: '#00F5A060',
  },
  avatarOverdue: {
    backgroundColor: '#FF1E5625',
    borderColor: '#FF1E5680',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
  },
  avatarTextOutstanding: {
    color: '#00D2FF',
  },
  avatarTextRepaid: {
    color: '#00F5A0',
  },
  avatarTextOverdue: {
    color: '#FF1E56',
  },
  friendName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  dateText: {
    color: '#8CA0BA',
    fontSize: 12,
    marginTop: 3,
    fontWeight: '500',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  amountOutstanding: {
    color: '#00D2FF',
  },
  amountRepaid: {
    color: '#00F5A0',
  },
  amountOverdue: {
    color: '#FF1E56',
    textShadowColor: '#FF1E5660',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 5,
  },
  statusOutstanding: {
    backgroundColor: '#0066FF20',
    borderWidth: 1,
    borderColor: '#0066FF70',
  },
  statusRepaid: {
    backgroundColor: '#00F5A020',
    borderWidth: 1,
    borderColor: '#00F5A070',
  },
  statusOverdue: {
    backgroundColor: '#FF1E5630',
    borderWidth: 1.2,
    borderColor: '#FF1E56',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  statusTextOutstanding: {
    color: '#38BDF8',
  },
  statusTextRepaid: {
    color: '#00F5A0',
  },
  statusTextOverdue: {
    color: '#FFFFFF',
  },
  bottomRow: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1A233D',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeholderSpace: {
    flex: 1,
  },
  receiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0F1A36',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E3A8A',
  },
  receiptThumb: {
    width: 22,
    height: 22,
    borderRadius: 4,
  },
  receiptText: {
    color: '#93C5FD',
    fontSize: 12,
    fontWeight: '700',
  },
  repayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 3,
  },
  repayButtonRegular: {
    backgroundColor: '#0066FF',
    shadowColor: '#0066FF',
  },
  repayButtonOverdue: {
    backgroundColor: '#0066FF',
    shadowColor: '#0066FF',
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  repayButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
