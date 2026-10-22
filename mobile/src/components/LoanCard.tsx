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

  // Resolve receipt full URL if relative
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
                `Due on ${formatDate(loan.dueDate)}`
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
            <Text style={styles.receiptText}>View Receipt 🔍</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholderSpace} />
        )}

        {!isRepaid && (
          <TouchableOpacity
            style={styles.repayButton}
            onPress={() => onRepay(loan)}
            accessibilityRole="button"
            accessibilityLabel={`Mark loan of ${formatINR(loan.amount)} as repaid`}
          >
            <Text style={styles.repayButtonText}>Mark as Repaid</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardOverdue: {
    borderColor: '#DC2626',
    borderWidth: 1.5,
    backgroundColor: '#1E293B',
  },
  cardRepaid: {
    borderColor: '#05966940',
    backgroundColor: '#0F172A',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOutstanding: {
    backgroundColor: '#2563EB20',
  },
  avatarRepaid: {
    backgroundColor: '#05966920',
  },
  avatarOverdue: {
    backgroundColor: '#DC262625',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
  },
  avatarTextOutstanding: {
    color: '#60A5FA',
  },
  avatarTextRepaid: {
    color: '#34D399',
  },
  avatarTextOverdue: {
    color: '#F87171',
  },
  friendName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  dateText: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  amountOutstanding: {
    color: '#F8FAFC',
  },
  amountRepaid: {
    color: '#10B981',
  },
  amountOverdue: {
    color: '#EF4444',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
  },
  statusOutstanding: {
    backgroundColor: '#1E3A8A40',
    borderWidth: 1,
    borderColor: '#2563EB50',
  },
  statusRepaid: {
    backgroundColor: '#064E3B40',
    borderWidth: 1,
    borderColor: '#05966950',
  },
  statusOverdue: {
    backgroundColor: '#7F1D1D40',
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextOutstanding: {
    color: '#93C5FD',
  },
  statusTextRepaid: {
    color: '#6EE7B7',
  },
  statusTextOverdue: {
    color: '#FCA5A5',
  },
  bottomRow: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#33415550',
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
    backgroundColor: '#33415540',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  receiptThumb: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  receiptText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  repayButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  repayButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
