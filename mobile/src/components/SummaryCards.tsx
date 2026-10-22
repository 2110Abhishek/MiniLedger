import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { Summary } from '../types';
import { formatINR } from '../services/loans';

interface SummaryCardsProps {
  summary: Summary | null;
  loading?: boolean;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
  const { width } = useWindowDimensions();
  const totalLent = summary ? formatINR(summary.totalLent) : '₹0.00';
  const totalRepaid = summary ? formatINR(summary.totalRepaid) : '₹0.00';
  const outstandingAmount = summary ? formatINR(summary.outstandingAmount) : '₹0.00';
  const overdueAmount = summary ? formatINR(summary.overdueAmount) : '₹0.00';

  const hasOverdue = summary ? parseFloat(summary.overdueAmount) > 0 : false;

  // Responsive column calculation
  // Desktop (> 860px): 4 cards in 1 row (flexBasis: '23.5%')
  // Tablet / Phone (<= 860px): 2 cards per row (flexBasis: '48%')
  // Small phone (< 340px): 1 card per row (flexBasis: '100%')
  const cardBasis = width > 860 ? '23.5%' : width < 340 ? '100%' : '48%';

  return (
    <View style={styles.grid}>
      {/* 1. Total Lent (Electric Blue theme) */}
      <View style={[styles.card, styles.cardLent, { flexBasis: cardBasis }]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel} numberOfLines={1}>Total Lent</Text>
          <View style={styles.pillLent}>
            <Text style={styles.pillTextLent}>ALL TIME</Text>
          </View>
        </View>
        <Text style={[styles.cardValue, styles.valueLent]} numberOfLines={1} adjustsFontSizeToFit>
          {totalLent}
        </Text>
        <Text style={styles.cardSub} numberOfLines={1}>Principal sum of loans</Text>
      </View>

      {/* 2. Total Repaid (Cyan / Mint theme) */}
      <View style={[styles.card, styles.cardRepaid, { flexBasis: cardBasis }]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel} numberOfLines={1}>Total Repaid</Text>
          <View style={styles.pillRepaid}>
            <Text style={styles.pillTextRepaid}>RECEIVED</Text>
          </View>
        </View>
        <Text style={[styles.cardValue, styles.valueRepaid]} numberOfLines={1} adjustsFontSizeToFit>
          {totalRepaid}
        </Text>
        <Text style={styles.cardSub} numberOfLines={1}>Fully settled balances</Text>
      </View>

      {/* 3. Outstanding Amount (Vibrant Sky Blue theme) */}
      <View style={[styles.card, styles.cardOutstanding, { flexBasis: cardBasis }]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel} numberOfLines={1}>Outstanding</Text>
          <View style={styles.pillOutstanding}>
            <Text style={styles.pillTextOutstanding}>ACTIVE</Text>
          </View>
        </View>
        <Text style={[styles.cardValue, styles.valueOutstanding]} numberOfLines={1} adjustsFontSizeToFit>
          {outstandingAmount}
        </Text>
        <Text style={styles.cardSub} numberOfLines={1}>Unsettled remaining</Text>
      </View>

      {/* 4. Overdue Amount (Vibrant Glowing NEON RED theme) */}
      <View
        style={[
          styles.card,
          styles.cardOverdue,
          hasOverdue && styles.cardOverdueNeonActive,
          { flexBasis: cardBasis },
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.cardLabel, hasOverdue && styles.cardLabelNeon]} numberOfLines={1}>
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
              numberOfLines={1}
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
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {overdueAmount}
        </Text>
        <Text style={[styles.cardSub, hasOverdue && styles.cardSubNeon]} numberOfLines={1}>
          {hasOverdue ? 'Action needed: Past due' : 'No past-due payments'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginVertical: 14,
  },
  card: {
    flexGrow: 1,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    minWidth: 140,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8CA0BA',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flexShrink: 1,
  },
  cardLabelNeon: {
    color: '#FF6B8B',
  },
  cardValue: {
    fontSize: 22,
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
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    flexShrink: 0,
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
    flexShrink: 0,
  },
  pillTextLent: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '800',
  },

  // 2. Repaid Card (Cyan / Mint)
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
    flexShrink: 0,
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
    flexShrink: 0,
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
