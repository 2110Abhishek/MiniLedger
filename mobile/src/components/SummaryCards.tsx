import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Summary } from '../types';
import { formatINR } from '../services/loans';

interface SummaryCardsProps {
  summary: Summary | null;
  loading?: boolean;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary, loading }) => {
  const totalLent = summary ? formatINR(summary.totalLent) : '₹0.00';
  const totalRepaid = summary ? formatINR(summary.totalRepaid) : '₹0.00';
  const outstandingAmount = summary ? formatINR(summary.outstandingAmount) : '₹0.00';
  const overdueAmount = summary ? formatINR(summary.overdueAmount) : '₹0.00';

  const hasOverdue = summary ? parseFloat(summary.overdueAmount) > 0 : false;

  return (
    <View style={styles.grid}>
      {/* Total Lent */}
      <View style={[styles.card, styles.cardLent]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel}>Total Lent</Text>
          <View style={[styles.pill, styles.pillLent]}>
            <Text style={styles.pillTextLent}>All Time</Text>
          </View>
        </View>
        <Text style={styles.cardValue}>{totalLent}</Text>
        <Text style={styles.cardSub}>Principal sum of all loans</Text>
      </View>

      {/* Total Repaid */}
      <View style={[styles.card, styles.cardRepaid]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel}>Total Repaid</Text>
          <View style={[styles.pill, styles.pillRepaid]}>
            <Text style={styles.pillTextRepaid}>Received</Text>
          </View>
        </View>
        <Text style={[styles.cardValue, styles.valueRepaid]}>{totalRepaid}</Text>
        <Text style={styles.cardSub}>Fully settled loans</Text>
      </View>

      {/* Outstanding Amount */}
      <View style={[styles.card, styles.cardOutstanding]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel}>Outstanding</Text>
          <View style={[styles.pill, styles.pillOutstanding]}>
            <Text style={styles.pillTextOutstanding}>Active</Text>
          </View>
        </View>
        <Text style={[styles.cardValue, styles.valueOutstanding]}>{outstandingAmount}</Text>
        <Text style={styles.cardSub}>Remaining balance</Text>
      </View>

      {/* Overdue Amount (Highlighted with accessible warning treatment) */}
      <View
        style={[
          styles.card,
          styles.cardOverdue,
          hasOverdue && styles.cardOverdueActive,
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.labelWithIcon}>
            <Text style={[styles.cardLabel, hasOverdue && styles.cardLabelOverdue]}>
              Overdue Amount
            </Text>
          </View>
          <View
            style={[
              styles.pill,
              hasOverdue ? styles.pillOverdueActive : styles.pillOverdueInactive,
            ]}
          >
            <Text
              style={[
                styles.pillTextOverdue,
                hasOverdue ? styles.pillTextOverdueActive : styles.pillTextOverdueInactive,
              ]}
            >
              {hasOverdue ? '⚠️ ACTION REQ.' : '✓ None'}
            </Text>
          </View>
        </View>
        <Text
          style={[
            styles.cardValue,
            hasOverdue ? styles.valueOverdueActive : styles.valueOverdueInactive,
          ]}
        >
          {overdueAmount}
        </Text>
        <Text style={[styles.cardSub, hasOverdue && styles.cardSubOverdue]}>
          {hasOverdue ? 'Passed repayment date' : 'No overdue loans'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginVertical: 14,
  },
  card: {
    flexBasis: '47.8%',
    flexGrow: 1,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  cardLabelOverdue: {
    color: '#FDA4AF',
  },
  cardValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
    marginVertical: 2,
    letterSpacing: -0.5,
  },
  cardSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  cardSubOverdue: {
    color: '#FCA5A5',
  },
  pill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  // Lent card
  cardLent: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  pillLent: {
    backgroundColor: '#334155',
  },
  pillTextLent: {
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '700',
  },
  // Repaid card
  cardRepaid: {
    backgroundColor: '#064E3B15',
    borderColor: '#05966940',
  },
  valueRepaid: {
    color: '#10B981',
  },
  pillRepaid: {
    backgroundColor: '#05966925',
  },
  pillTextRepaid: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '700',
  },
  // Outstanding card
  cardOutstanding: {
    backgroundColor: '#1E293B',
    borderColor: '#2563EB40',
  },
  valueOutstanding: {
    color: '#38BDF8',
  },
  pillOutstanding: {
    backgroundColor: '#0284C720',
  },
  pillTextOutstanding: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '700',
  },
  // Overdue card
  cardOverdue: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  cardOverdueActive: {
    backgroundColor: '#7F1D1D20',
    borderColor: '#DC2626',
    borderWidth: 1.5,
  },
  valueOverdueInactive: {
    color: '#94A3B8',
  },
  valueOverdueActive: {
    color: '#EF4444',
  },
  pillOverdueInactive: {
    backgroundColor: '#334155',
  },
  pillTextOverdue: {
    fontSize: 10,
    fontWeight: '700',
  },
  pillTextOverdueInactive: {
    color: '#94A3B8',
  },
  pillOverdueActive: {
    backgroundColor: '#DC2626',
  },
  pillTextOverdueActive: {
    color: '#FFFFFF',
  },
});
