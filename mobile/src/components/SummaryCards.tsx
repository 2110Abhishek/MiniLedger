import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Summary } from '../types';
import { formatINR } from '../services/loans';

interface SummaryCardsProps {
  summary: Summary | null;
  loading?: boolean;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
  const totalLent = summary ? formatINR(summary.totalLent) : '₹0.00';
  const totalRepaid = summary ? formatINR(summary.totalRepaid) : '₹0.00';
  const outstandingAmount = summary ? formatINR(summary.outstandingAmount) : '₹0.00';
  const overdueAmount = summary ? formatINR(summary.overdueAmount) : '₹0.00';

  const hasOverdue = summary ? parseFloat(summary.overdueAmount) > 0 : false;

  return (
    <View style={styles.grid}>
      {/* 1. Total Lent (Electric Blue theme) */}
      <View style={[styles.card, styles.cardLent]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel}>Total Lent</Text>
          <View style={styles.pillLent}>
            <Text style={styles.pillTextLent}>ALL TIME</Text>
          </View>
        </View>
        <Text style={[styles.cardValue, styles.valueLent]}>{totalLent}</Text>
        <Text style={styles.cardSub}>Principal sum of loans</Text>
      </View>

      {/* 2. Total Repaid (Cyan / Mint theme) */}
      <View style={[styles.card, styles.cardRepaid]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel}>Total Repaid</Text>
          <View style={styles.pillRepaid}>
            <Text style={styles.pillTextRepaid}>RECEIVED</Text>
          </View>
        </View>
        <Text style={[styles.cardValue, styles.valueRepaid]}>{totalRepaid}</Text>
        <Text style={styles.cardSub}>Fully settled balances</Text>
      </View>

      {/* 3. Outstanding Amount (Vibrant Sky Blue theme) */}
      <View style={[styles.card, styles.cardOutstanding]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel}>Outstanding</Text>
          <View style={styles.pillOutstanding}>
            <Text style={styles.pillTextOutstanding}>ACTIVE</Text>
          </View>
        </View>
        <Text style={[styles.cardValue, styles.valueOutstanding]}>{outstandingAmount}</Text>
        <Text style={styles.cardSub}>Unsettled remaining</Text>
      </View>

      {/* 4. Overdue Amount (Vibrant Glowing NEON RED theme) */}
      <View
        style={[
          styles.card,
          styles.cardOverdue,
          hasOverdue && styles.cardOverdueNeonActive,
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.cardLabel, hasOverdue && styles.cardLabelNeon]}>
            Overdue Amount
          </Text>
          <View
            style={[
              styles.pill,
              hasOverdue ? styles.pillNeonRedActive : styles.pillNeonRedInactive,
            ]}
          >
            <Text
              style={[
                styles.pillText,
                hasOverdue ? styles.pillTextNeonActive : styles.pillTextNeonInactive,
              ]}
            >
              {hasOverdue ? '⚠️ OVERDUE' : '✓ CLEAR'}
            </Text>
          </View>
        </View>
        <Text
          style={[
            styles.cardValue,
            hasOverdue ? styles.valueNeonRedActive : styles.valueNeonRedInactive,
          ]}
        >
          {overdueAmount}
        </Text>
        <Text style={[styles.cardSub, hasOverdue && styles.cardSubNeon]}>
          {hasOverdue ? 'Action needed: Due date passed' : 'No past-due payments'}
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
    marginVertical: 16,
  },
  card: {
    flexBasis: '47.8%',
    flexGrow: 1,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8CA0BA',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardLabelNeon: {
    color: '#FF6B8B',
  },
  cardValue: {
    fontSize: 23,
    fontWeight: '900',
    color: '#F8FAFC',
    marginVertical: 2,
    letterSpacing: -0.5,
  },
  cardSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
    fontWeight: '500',
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // 1. Lent Card (Electric Blue)
  cardLent: {
    backgroundColor: '#0A1128',
    borderColor: '#1E3A8A',
  },
  valueLent: {
    color: '#FFFFFF',
  },
  pillLent: {
    backgroundColor: '#0066FF20',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#0066FF60',
  },
  pillTextLent: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '800',
  },

  // 2. Repaid Card (Cyan / Emerald)
  cardRepaid: {
    backgroundColor: '#061A1D',
    borderColor: '#0E444B',
  },
  valueRepaid: {
    color: '#00F5A0',
  },
  pillRepaid: {
    backgroundColor: '#00F5A020',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#00F5A060',
  },
  pillTextRepaid: {
    color: '#00F5A0',
    fontSize: 10,
    fontWeight: '800',
  },

  // 3. Outstanding Card (Cyber Blue)
  cardOutstanding: {
    backgroundColor: '#0A1535',
    borderColor: '#0284C7',
    borderWidth: 1.2,
  },
  valueOutstanding: {
    color: '#00D2FF',
  },
  pillOutstanding: {
    backgroundColor: '#00D2FF20',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#00D2FF70',
  },
  pillTextOutstanding: {
    color: '#00D2FF',
    fontSize: 10,
    fontWeight: '800',
  },

  // 4. Overdue Card (NEON RED Glowing)
  cardOverdue: {
    backgroundColor: '#0E111E',
    borderColor: '#262D4A',
  },
  cardOverdueNeonActive: {
    backgroundColor: '#1E0A14',
    borderColor: '#FF1E56',
    borderWidth: 1.8,
    shadowColor: '#FF1E56',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.65,
    shadowRadius: 14,
    elevation: 8,
  },
  valueNeonRedInactive: {
    color: '#8CA0BA',
  },
  valueNeonRedActive: {
    color: '#FF1E56',
    textShadowColor: '#FF1E5680',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  pillNeonRedInactive: {
    backgroundColor: '#1A2238',
  },
  pillTextNeonInactive: {
    color: '#64748B',
  },
  pillNeonRedActive: {
    backgroundColor: '#FF1E56',
    shadowColor: '#FF1E56',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  pillTextNeonActive: {
    color: '#FFFFFF',
  },
  cardSubNeon: {
    color: '#FF94AB',
    fontWeight: '600',
  },
});
