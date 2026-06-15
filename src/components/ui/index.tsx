import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ViewStyle,
  Modal, Pressable, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, typography, shadows } from '../../constants/theme';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default' | 'primary';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: colors.successLight, text: colors.success },
  warning: { bg: colors.warningLight, text: colors.warning },
  error: { bg: colors.errorLight, text: colors.error },
  info: { bg: colors.infoLight, text: colors.info },
  primary: { bg: colors.primaryLight, text: colors.primary },
  default: { bg: colors.surfaceAlt, text: colors.textSecondary },
};

export function Badge({ label, variant = 'default' }: BadgeProps) {
  const c = variantColors[variant];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.text }]}>{label}</Text>
    </View>
  );
}

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'default' | 'outlined';
}

export function Card({ children, onPress, style, variant = 'default' }: CardProps) {
  const cardStyle = [
    styles.card,
    variant === 'outlined' && styles.cardOutlined,
    style,
  ];
  const content = <View style={cardStyle}>{children}</View>;
  if (onPress) {
    return <TouchableOpacity onPress={onPress} activeOpacity={0.75}>{content}</TouchableOpacity>;
  }
  return content;
}

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  color?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function StatCard({ title, value, subtitle, color = colors.primary, icon }: StatCardProps) {
  return (
    <Card style={styles.statCard}>
      <View style={styles.statHeader}>
        {icon && (
          <View style={[styles.statIconWrap, { backgroundColor: `${color}18` }]}>
            <Ionicons name={icon} size={18} color={color} />
          </View>
        )}
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      {subtitle ? <Text style={styles.statSubtitle}>{subtitle}</Text> : null}
    </Card>
  );
}

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon = 'folder-open-outline', title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIconWrap}>
        <Ionicons name={icon} size={40} color={colors.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {message ? <Text style={styles.emptyMessage}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <TouchableOpacity style={styles.emptyBtn} onPress={onAction}>
          <Ionicons name="add" size={18} color={colors.white} />
          <Text style={styles.emptyBtnText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: { label: string; onPress: () => void };
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionLeft}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      {action ? (
        <TouchableOpacity style={styles.sectionActionBtn} onPress={action.onPress}>
          <Ionicons name="add-circle" size={16} color={colors.primary} />
          <Text style={styles.sectionAction}>{action.label}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

interface FabProps {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function Fab({ onPress, icon = 'add' }: FabProps) {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.85}>
      <Ionicons name={icon} size={28} color={colors.white} />
    </TouchableOpacity>
  );
}

interface FormModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function FormModal({ visible, title, onClose, children }: FormModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalKb}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              <TouchableOpacity onPress={onClose} hitSlop={12}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {children}
            </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  badgeText: { ...typography.caption, fontWeight: '600', fontSize: 12 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  cardOutlined: {
    borderWidth: 1,
    borderColor: colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  statCard: { flex: 1, minWidth: '46%' },
  statHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  statIconWrap: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statTitle: { ...typography.caption, color: colors.textSecondary, flex: 1 },
  statValue: { fontSize: 24, fontWeight: '700', letterSpacing: -0.5 },
  statSubtitle: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg },
  emptyIconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.sm, textAlign: 'center' },
  emptyMessage: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.lg },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.primary, paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2, borderRadius: borderRadius.full,
  },
  emptyBtnText: { color: colors.white, fontWeight: '600', fontSize: 15 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: spacing.md, marginTop: spacing.lg,
  },
  sectionLeft: { flex: 1 },
  sectionTitle: { ...typography.h3, color: colors.text },
  sectionSubtitle: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  sectionActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingTop: 2 },
  sectionAction: { ...typography.label, color: colors.primary },
  fab: {
    position: 'absolute', right: spacing.lg, bottom: spacing.lg,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    ...shadows.lg,
  },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  modalKb: { maxHeight: '90%' },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    maxHeight: '100%',
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.border, alignSelf: 'center',
    marginTop: spacing.sm, marginBottom: spacing.md,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: { ...typography.h2, color: colors.text },
});
