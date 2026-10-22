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
            placeholderTextColor="#475569"
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
              placeholderTextColor="#475569"
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
            placeholderTextColor="#475569"
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
              <Text style={styles.presetOverdueText}>⚠️ -7 Days (Overdue)</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Receipt Photo Upload */}
        <View style={styles.field}>
          <Text style={styles.label}>Attach Receipt / Agreement (Optional)</Text>
          {receiptUri ? (
            <View style={styles.receiptPreviewContainer}>
              <Image source={{ uri: receiptUri }} style={styles.receiptPreviewImage} />
              <View style={styles.receiptActions}>
                <Text style={styles.receiptAttachedText}>✓ Photo attached</Text>
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
              <Text style={styles.submitButtonText}>Saving Entry...</Text>
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
    backgroundColor: '#05070E',
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#0A1022',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    borderWidth: 1.2,
    borderColor: '#182444',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
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
    color: '#00D2FF',
    fontSize: 14,
    fontWeight: '700',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '800',
  },
  subtitle: {
    color: '#8CA0BA',
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
    fontWeight: '700',
    marginBottom: 8,
  },
  required: {
    color: '#FF1E56',
  },
  input: {
    backgroundColor: '#060B18',
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#1E2C52',
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#060B18',
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#1E2C52',
    overflow: 'hidden',
  },
  currencyBadge: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0066FF',
    borderRightWidth: 1,
    borderRightColor: '#38BDF8',
  },
  currencySymbol: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  amountInput: {
    flex: 1,
    color: '#00D2FF',
    fontSize: 18,
    fontWeight: '800',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  inputError: {
    borderColor: '#FF1E56',
  },
  errorText: {
    color: '#FF1E56',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '600',
  },
  presetsLabel: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 8,
    marginBottom: 6,
    fontWeight: '600',
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetButton: {
    backgroundColor: '#0E1730',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E3A8A',
  },
  presetText: {
    color: '#93C5FD',
    fontSize: 12,
    fontWeight: '700',
  },
  presetOverdueButton: {
    borderColor: '#FF1E56',
    backgroundColor: '#260814',
    shadowColor: '#FF1E56',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  presetOverdueText: {
    color: '#FF6B8B',
    fontSize: 12,
    fontWeight: '800',
  },
  uploadButton: {
    backgroundColor: '#060B18',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#1E3A8A',
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
    color: '#93C5FD',
    fontSize: 13,
    fontWeight: '700',
  },
  receiptPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#060B18',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1E3A8A',
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
    color: '#00F5A0',
    fontSize: 13,
    fontWeight: '700',
  },
  removeReceiptButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#FF1E5625',
    borderWidth: 1,
    borderColor: '#FF1E56',
    borderRadius: 6,
  },
  removeReceiptText: {
    color: '#FF1E56',
    fontSize: 12,
    fontWeight: '800',
  },
  submitButton: {
    backgroundColor: '#0066FF',
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
