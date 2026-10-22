import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { verifyOtp, sendOtp } from '../services/auth';
import { User } from '../types';

interface OtpScreenProps {
  phoneNumber: string;
  onSuccess: (user: User) => void;
  onBack: () => void;
}

export const OtpScreen: React.FC<OtpScreenProps> = ({ phoneNumber, onSuccess, onBack }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(30);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const maskedPhone = phoneNumber.length >= 10
    ? `${phoneNumber.slice(0, 3)} ${'•'.repeat(5)} ${phoneNumber.slice(-4)}`
    : phoneNumber;

  const handleVerify = async () => {
    setErrorMessage(null);
    const cleanOtp = otp.trim();

    if (!cleanOtp) {
      setErrorMessage('Please enter the 6-digit OTP code');
      return;
    }

    if (!/^\d{6}$/.test(cleanOtp)) {
      setErrorMessage('OTP must be exactly 6 digits');
      return;
    }

    setLoading(true);
    try {
      const response = await verifyOtp(phoneNumber, cleanOtp);
      onSuccess(response.user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed. Please check the OTP and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return;
    setErrorMessage(null);
    setResending(true);
    try {
      await sendOtp(phoneNumber);
      setResendCooldown(30);
      setOtp('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <TouchableOpacity style={styles.backRow} onPress={onBack}>
            <Text style={styles.backArrow}>←</Text>
            <Text style={styles.backText}>Change Phone Number</Text>
          </TouchableOpacity>

          {/* Key Icon Badge */}
          <View style={styles.keyBadge}>
            <Text style={styles.keyIcon}>🔑</Text>
          </View>

          <Text style={styles.title}>Enter Verification Code</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit OTP sent to{' '}
            <Text style={styles.maskedNumber}>{maskedPhone}</Text>
          </Text>

          {/* OTP Input */}
          <View style={styles.form}>
            <Text style={styles.label}>6-Digit OTP</Text>
            <View style={[styles.inputBox, errorMessage ? styles.inputBoxError : null]}>
              <TextInput
                style={styles.otpInput}
                placeholder="123456"
                placeholderTextColor="#64748B"
                keyboardType="number-pad"
                value={otp}
                onChangeText={(text) => {
                  setOtp(text);
                  if (errorMessage) setErrorMessage(null);
                }}
                maxLength={6}
                editable={!loading}
                autoFocus={true}
                accessibilityLabel="6-digit OTP input"
              />
            </View>

            {errorMessage && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleVerify}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Verify OTP and Sign In"
            >
              {loading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={styles.submitButtonText}>Verifying...</Text>
                </View>
              ) : (
                <Text style={styles.submitButtonText}>Verify & Sign In ✓</Text>
              )}
            </TouchableOpacity>

            {/* Resend Action */}
            <View style={styles.resendContainer}>
              <Text style={styles.resendNotice}>Didn't receive code?</Text>
              <TouchableOpacity
                onPress={handleResend}
                disabled={resendCooldown > 0 || resending}
              >
                <Text
                  style={[
                    styles.resendAction,
                    (resendCooldown > 0 || resending) && styles.resendActionDisabled,
                  ]}
                >
                  {resending
                    ? 'Sending...'
                    : resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : 'Resend OTP'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Terminal Reminder Box */}
            <View style={styles.terminalBox}>
              <Text style={styles.terminalTitle}>🖥️ Terminal Output</Text>
              <Text style={styles.terminalText}>
                As specified in the PRD, the mock OTP has been printed in the server terminal output! Look for the 🔑 banner.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 440,
    borderWidth: 1,
    borderColor: '#1E293B',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  backRow: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  backArrow: {
    color: '#60A5FA',
    fontSize: 16,
    fontWeight: '700',
  },
  backText: {
    color: '#60A5FA',
    fontSize: 13,
    fontWeight: '600',
  },
  keyBadge: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#05966920',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#05966940',
  },
  keyIcon: {
    fontSize: 28,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 26,
    lineHeight: 20,
  },
  maskedNumber: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
  form: {
    width: '100%',
  },
  label: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputBox: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputBoxError: {
    borderColor: '#EF4444',
  },
  otpInput: {
    color: '#F8FAFC',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 12,
    textAlign: 'center',
    width: '100%',
    height: '100%',
  },
  errorContainer: {
    marginTop: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#059669',
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },
  resendNotice: {
    color: '#64748B',
    fontSize: 13,
  },
  resendAction: {
    color: '#60A5FA',
    fontSize: 13,
    fontWeight: '700',
  },
  resendActionDisabled: {
    color: '#475569',
  },
  terminalBox: {
    marginTop: 24,
    backgroundColor: '#0B132B',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  terminalTitle: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  terminalText: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 17,
  },
});
