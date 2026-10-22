import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { createLoan, uploadReceiptImage } from '../services/loans';
import { Loan } from '../types';

interface AddLoanScreenProps {
  onSuccess: (newLoan: Loan) => void;
  onCancel: () => void;
}

export const AddLoanScreen: React.FC<AddLoanScreenProps> = ({ onSuccess, onCancel }) => {
  const [friendName, setFriendName] = useState('');
  const [amount, setAmount] = useState('');
  
  // Default to 14 days from today
  const defaultDueDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  };

  const [dueDate, setDueDate] = useState(defaultDueDate());
  const [receiptUri, setReceiptUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setDaysFromToday = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setDueDate(d.toISOString().split('T')[0]);
    if (errors.dueDate) {
      setErrors((prev) => ({ ...prev, dueDate: '' }));
    }
  };

  const setPastOverdueDate = () => {
    // 7 days ago -> immediately overdue
    const d = new Date();
    d.setDate(d.getDate() - 7);
    setDueDate(d.toISOString().split('T')[0]);
    if (errors.dueDate) {
      setErrors((prev) => ({ ...prev, dueDate: '' }));
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setReceiptUri(result.assets[0].uri);
      }
    } catch (err) {
      Alert.alert('Image Picker Error', 'Unable to pick image. Please try again.');
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!friendName.trim()) {
      newErrors.friendName = 'Friend name is required';
    } else if (friendName.trim().length > 100) {
      newErrors.friendName = 'Friend name cannot exceed 100 characters';
    }

    const cleanAmount = amount.trim();
    if (!cleanAmount) {
      newErrors.amount = 'Amount is required';
    } else if (!/^(0|[1-9]\d*)(\.\d{1,2})?$/.test(cleanAmount)) {
      newErrors.amount = 'Amount must be a valid positive number (max 2 decimal places)';
    } else {
      const num = parseFloat(cleanAmount);
      if (num <= 0) {
        newErrors.amount = 'Amount must be greater than zero';
      } else if (num > 999999999.99) {
        newErrors.amount = 'Amount exceeds maximum permitted limit';
      }
    }

    if (!dueDate.trim()) {
      newErrors.dueDate = 'Due date is required';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate.trim())) {
      newErrors.dueDate = 'Date must be formatted as YYYY-MM-DD';
    } else {
      const d = new Date(`${dueDate.trim()}T00:00:00`);
      if (isNaN(d.getTime())) {
        newErrors.dueDate = 'Please enter a valid calendar date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      let uploadedReceiptUrl: string | null = null;
      if (receiptUri) {
        uploadedReceiptUrl = await uploadReceiptImage(receiptUri);
      }

      const created = await createLoan({
        friendName: friendName.trim(),
        amount: parseFloat(amount.trim()).toFixed(2),
        dueDate: dueDate.trim(),
        receiptUrl: uploadedReceiptUrl,
      });

      onSuccess(created);
    } catch (err: any) {
      Alert.alert('Loan Creation Failed', err.message || 'Unable to record loan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onCancel} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Record Loan</Text>
          <View style={{ width: 60 }} />
        </View>

        <Text style={styles.subtitle}>
          Record money lent to a friend or family member
        </Text>

        {/* Friend Name */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Friend's Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.friendName ? styles.inputError : null]}
            placeholder="e.g. Rahul Sharma"
            placeholderTextColor="#64748B"
            value={friendName}
            onChangeText={(text) => {
              setFriendName(text);
              if (errors.friendName) setErrors((prev) => ({ ...prev, friendName: '' }));
            }}
            maxLength={100}
            editable={!loading}
            accessibilityLabel="Friend's Name"
          />
          {errors.friendName && <Text style={styles.errorText}>⚠️ {errors.friendName}</Text>}
        </View>

        {/* Amount in INR */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Amount Lent <Text style={styles.required}>*</Text>
          </Text>
          <View style={[styles.amountRow, errors.amount ? styles.inputError : null]}>
            <View style={styles.currencyBadge}>
              <Text style={styles.currencySymbol}>₹</Text>
            </View>
            <TextInput
              style={styles.amountInput}
              placeholder="5000.00"
              placeholderTextColor="#64748B"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={(text) => {
                setAmount(text);
                if (errors.amount) setErrors((prev) => ({ ...prev, amount: '' }));
              }}
              editable={!loading}
              accessibilityLabel="Loan amount in Rupees"
            />
          </View>
          {errors.amount && <Text style={styles.errorText}>⚠️ {errors.amount}</Text>}
        </View>

        {/* Due Date */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Repayment Due Date <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.dueDate ? styles.inputError : null]}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#64748B"
            value={dueDate}
            onChangeText={(text) => {
              setDueDate(text);
              if (errors.dueDate) setErrors((prev) => ({ ...prev, dueDate: '' }));
            }}
            editable={!loading}
            accessibilityLabel="Due date YYYY-MM-DD"
          />
          {errors.dueDate && <Text style={styles.errorText}>⚠️ {errors.dueDate}</Text>}

          {/* Quick Date Presets */}
          <Text style={styles.presetsLabel}>Quick presets:</Text>
          <View style={styles.presetRow}>
            <TouchableOpacity
              style={styles.presetButton}
              onPress={() => setDaysFromToday(7)}
            >
              <Text style={styles.presetText}>+7 Days</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.presetButton}
              onPress={() => setDaysFromToday(15)}
            >
              <Text style={styles.presetText}>+15 Days</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.presetButton}
              onPress={() => setDaysFromToday(30)}
            >
              <Text style={styles.presetText}>+30 Days</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.presetButton, styles.presetOverdueButton]}
              onPress={setPastOverdueDate}
            >
              <Text style={styles.presetOverdueText}>-7 Days (Overdue)</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Receipt Photo Upload (Optional Bonus) */}
        <View style={styles.field}>
          <Text style={styles.label}>Attach Receipt / Agreement (Optional)</Text>
          {receiptUri ? (
            <View style={styles.receiptPreviewContainer}>
              <Image source={{ uri: receiptUri }} style={styles.receiptPreviewImage} />
              <View style={styles.receiptActions}>
                <Text style={styles.receiptAttachedText}>✓ Receipt photo attached</Text>
                <TouchableOpacity
                  style={styles.removeReceiptButton}
                  onPress={() => setReceiptUri(null)}
                >
                  <Text style={styles.removeReceiptText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handlePickImage}
              disabled={loading}
              accessibilityLabel="Upload receipt photo"
            >
              <Text style={styles.uploadIcon}>📷</Text>
              <Text style={styles.uploadText}>Select Receipt Photo (PNG / JPG)</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Save loan entry"
        >
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={styles.submitButtonText}>Saving Loan...</Text>
            </View>
          ) : (
            <Text style={styles.submitButtonText}>Save Loan Entry ✓</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#090D16',
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    borderWidth: 1,
    borderColor: '#1E293B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  backButtonText: {
    color: '#60A5FA',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 24,
    textAlign: 'center',
  },
  field: {
    marginBottom: 18,
  },
  label: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  input: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#F8FAFC',
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  currencyBadge: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#334155',
    borderRightWidth: 1,
    borderRightColor: '#475569',
  },
  currencySymbol: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
  },
  amountInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },
  presetsLabel: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 8,
    marginBottom: 6,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetButton: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  presetText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  presetOverdueButton: {
    borderColor: '#DC262650',
    backgroundColor: '#7F1D1D20',
  },
  presetOverdueText: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '600',
  },
  uploadButton: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#334155',
    borderStyle: 'dashed',
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  uploadIcon: {
    fontSize: 24,
  },
  uploadText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  receiptPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 12,
  },
  receiptPreviewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  receiptActions: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptAttachedText: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '600',
  },
  removeReceiptButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#DC262620',
    borderRadius: 6,
  },
  removeReceiptText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
