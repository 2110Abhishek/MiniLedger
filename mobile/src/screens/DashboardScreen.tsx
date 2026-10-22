import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { User, Loan, Summary, LoanStatus } from '../types';
import { getSummary, getLoans, repayLoan } from '../services/loans';
import { SummaryCards } from '../components/SummaryCards';
import { LoanCard } from '../components/LoanCard';
import { RepayModal } from '../components/RepayModal';
import { ReceiptModal } from '../components/ReceiptModal';

interface DashboardScreenProps {
  user: User;
  onOpenAddLoan: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ user, onOpenAddLoan }) => {
  const { width } = useWindowDimensions();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [filter, setFilter] = useState<'all' | LoanStatus>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [selectedRepayLoan, setSelectedRepayLoan] = useState<Loan | null>(null);
  const [repaying, setRepaying] = useState(false);
  const [previewReceipt, setPreviewReceipt] = useState<{ url: string; loan: Loan } | null>(null);

  const loadData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const [sumData, loansData] = await Promise.all([
        getSummary(),
        getLoans(filter),
      ]);
      setSummary(sumData);
      setLoans(loansData);
    } catch (err: any) {
      setError(err.message || 'Failed to load lending dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  const handleConfirmRepay = async () => {
    if (!selectedRepayLoan) return;
    setRepaying(true);
    try {
      await repayLoan(selectedRepayLoan.id);
      setSelectedRepayLoan(null);
      await loadData(true);
    } catch (err: any) {
      alert(err.message || 'Failed to mark loan as repaid');
    } finally {
      setRepaying(false);
    }
  };

  const horizontalPadding = width >= 768 ? 24 : 16;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: horizontalPadding },
        ]}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#00D2FF"
          />
        }
      >
        <View style={styles.contentWrapper}>
          {/* Top Greeting & Action Banner */}
          <View style={styles.topBanner}>
            <View style={styles.greetingContainer}>
              <Text style={styles.greetingTitle}>
                Lending Overview
              </Text>
              <Text style={styles.greetingSubtitle}>
                Monitor active balances, settled loans & past-due amounts
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addLoanButton}
              onPress={onOpenAddLoan}
              accessibilityRole="button"
              accessibilityLabel="Add new loan entry"
            >
              <Text style={styles.addLoanButtonText}>+ Add Loan</Text>
            </TouchableOpacity>
          </View>

          {/* Error Alert with Retry */}
          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>⚠️ {error}</Text>
              <TouchableOpacity onPress={() => loadData()}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Summary Cards */}
          <SummaryCards summary={summary} loading={loading} />

          {/* Filter Tabs */}
          <View style={styles.filterContainer}>
            <View style={styles.filterScroll}>
              <TouchableOpacity
                style={[styles.filterPill, filter === 'all' && styles.filterPillActiveAll]}
                onPress={() => setFilter('all')}
              >
                <Text style={[styles.filterPillText, filter === 'all' && styles.filterPillTextActive]}>
                  All Loans
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterPill, filter === 'outstanding' && styles.filterPillActiveOutstanding]}
                onPress={() => setFilter('outstanding')}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    filter === 'outstanding' && styles.filterPillTextActive,
                  ]}
                >
                  Outstanding
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterPill,
                  filter === 'overdue' && styles.filterPillActiveNeonOverdue,
                ]}
                onPress={() => setFilter('overdue')}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    filter === 'overdue' && styles.filterPillTextActiveNeon,
                  ]}
                >
                  ⚠️ Overdue
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterPill,
                  filter === 'repaid' && styles.filterPillActiveRepaid,
                ]}
                onPress={() => setFilter('repaid')}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    filter === 'repaid' && styles.filterPillTextActiveRepaid,
                  ]}
                >
                  ✓ Repaid
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Loading Indicator */}
          {loading && !refreshing && (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color="#00D2FF" />
              <Text style={styles.loadingText}>Fetching financial records...</Text>
            </View>
          )}

          {/* Loans List */}
          {!loading && loans.length > 0 && (
            <View style={styles.loansList}>
              {loans.map((loan) => (
                <LoanCard
                  key={loan.id}
                  loan={loan}
                  onRepay={(target) => setSelectedRepayLoan(target)}
                  onViewReceipt={(url, target) => setPreviewReceipt({ url, loan: target })}
                />
              ))}
            </View>
          )}

          {/* Empty State */}
          {!loading && loans.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💳</Text>
              <Text style={styles.emptyTitle}>
                {filter === 'all'
                  ? 'No loans recorded yet'
                  : `No ${filter} loans found`}
              </Text>
              <Text style={styles.emptyText}>
                {filter === 'all'
                  ? 'Keep accurate records of money lent to friends and track repayments seamlessly.'
                  : `There are currently no loans under the "${filter}" filter.`}
              </Text>
              {filter === 'all' && (
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={onOpenAddLoan}
                >
                  <Text style={styles.emptyButtonText}>+ Record First Loan</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Confirmation Modal */}
      <RepayModal
        loan={selectedRepayLoan}
        visible={!!selectedRepayLoan}
        submitting={repaying}
        onConfirm={handleConfirmRepay}
        onCancel={() => setSelectedRepayLoan(null)}
      />

      {/* Full Receipt Preview Modal */}
      <ReceiptModal
        visible={!!previewReceipt}
        imageUrl={previewReceipt ? previewReceipt.url : null}
        loan={previewReceipt ? previewReceipt.loan : null}
        onClose={() => setPreviewReceipt(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#05070E',
  },
  scrollContent: {
    flexGrow: 1,
    width: '100%',
    paddingTop: 28,
    paddingBottom: 50,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 1280,
    alignSelf: 'center',
  },
  topBanner: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
    paddingTop: 4,
    paddingBottom: 6,
  },
  greetingContainer: {
    flex: 1,
    minWidth: 0,
  },
  greetingTitle: {
    color: '#F8FAFC',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: 32,
    marginBottom: 4,
  },
  greetingSubtitle: {
    color: '#8CA0BA',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  addLoanButton: {
    flexShrink: 0,
    backgroundColor: '#0066FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  addLoanButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  errorBanner: {
    backgroundColor: '#2A0815',
    borderWidth: 1.5,
    borderColor: '#FF1E56',
    borderRadius: 12,
    padding: 12,
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#FF1E56',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  errorBannerText: {
    color: '#FF6B8B',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  retryText: {
    color: '#00D2FF',
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 12,
  },
  filterContainer: {
    width: '100%',
    marginVertical: 14,
  },
  filterScroll: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterPill: {
    backgroundColor: '#0A1022',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#182444',
  },
  filterPillActiveAll: {
    backgroundColor: '#0066FF',
    borderColor: '#38BDF8',
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  filterPillActiveOutstanding: {
    backgroundColor: '#0284C7',
    borderColor: '#00D2FF',
    shadowColor: '#00D2FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  filterPillActiveNeonOverdue: {
    backgroundColor: '#FF1E56',
    borderColor: '#FFA8BD',
    shadowColor: '#FF1E56',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
  },
  filterPillActiveRepaid: {
    backgroundColor: '#00F5A0',
    borderColor: '#A7F3D0',
  },
  filterPillText: {
    color: '#8CA0BA',
    fontSize: 13,
    fontWeight: '700',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  filterPillTextActiveNeon: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  filterPillTextActiveRepaid: {
    color: '#052E2B',
    fontWeight: '900',
  },
  loansList: {
    width: '100%',
    marginTop: 6,
  },
  centerBox: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#00D2FF',
    fontSize: 14,
    marginTop: 12,
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: '#0A1022',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: '#182444',
    marginTop: 16,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#F8FAFC',
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptyText: {
    color: '#8CA0BA',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 22,
    maxWidth: 360,
  },
  emptyButton: {
    backgroundColor: '#0066FF',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
