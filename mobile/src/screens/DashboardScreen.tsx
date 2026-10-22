import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
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
      // Reload both summary and loan list to reflect immediate updates
      await loadData(true);
    } catch (err: any) {
      alert(err.message || 'Failed to mark loan as repaid');
    } finally {
      setRepaying(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#60A5FA"
          />
        }
      >
        {/* Top Greeting & Action Banner */}
        <View style={styles.topBanner}>
          <View>
            <Text style={styles.greetingTitle}>Overview</Text>
            <Text style={styles.greetingSubtitle}>
              Keep track of what you lent and what's due
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

        {/* Loans Section Header & Filter Tabs */}
        <View style={styles.loansSectionHeader}>
          <Text style={styles.sectionTitle}>Loan Records</Text>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterPill, filter === 'all' && styles.filterPillActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterPillText, filter === 'all' && styles.filterPillTextActive]}>
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, filter === 'outstanding' && styles.filterPillActive]}
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
              filter === 'overdue' && styles.filterPillActiveOverdue,
            ]}
            onPress={() => setFilter('overdue')}
          >
            <Text
              style={[
                styles.filterPillText,
                filter === 'overdue' && styles.filterPillTextActiveOverdue,
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

        {/* Loading Indicator */}
        {loading && !refreshing && (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Loading loans...</Text>
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
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyTitle}>
              {filter === 'all'
                ? 'No loans recorded yet'
                : `No ${filter} loans found`}
            </Text>
            <Text style={styles.emptyText}>
              {filter === 'all'
                ? 'Keep track of money lent to friends and relatives by creating your first entry.'
                : 'There are no loans matching this filter category.'}
            </Text>
            {filter === 'all' && (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={onOpenAddLoan}
              >
                <Text style={styles.emptyButtonText}>+ Create First Loan</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* Confirmation Modal for Marking as Repaid */}
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
    backgroundColor: '#090D16',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  topBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  greetingTitle: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  greetingSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 2,
  },
  addLoanButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  addLoanButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  errorBanner: {
    backgroundColor: '#7F1D1D30',
    borderWidth: 1,
    borderColor: '#DC2626',
    borderRadius: 12,
    padding: 12,
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorBannerText: {
    color: '#F87171',
    fontSize: 13,
    flex: 1,
  },
  retryText: {
    color: '#60A5FA',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 12,
  },
  loansSectionHeader: {
    marginTop: 18,
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  filterPill: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterPillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterPillActiveOverdue: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  filterPillActiveRepaid: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  filterPillText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  filterPillTextActiveOverdue: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  filterPillTextActiveRepaid: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  loansList: {
    marginTop: 4,
  },
  centerBox: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 12,
  },
  emptyState: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
    marginTop: 12,
  },
  emptyIcon: {
    fontSize: 42,
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 18,
    maxWidth: 320,
  },
  emptyButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
