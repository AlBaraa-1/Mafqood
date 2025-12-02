/**
 * Mafqood Mobile - Settings Screen
 * Language toggle, privacy, data management
 * Native-first design - clean and functional
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, borderRadius, typography, spacing, shadows, layout } from '../theme/theme';
import { useLanguage } from '../context/LanguageContext';
import { resetDatabase } from '../api/client';
import { Screen, Section } from '../components/ui';
import { SimpleHeader } from '../components/ui/Header';

export default function SettingsScreen() {
  const { t, language, setLanguage } = useLanguage();
  const queryClient = useQueryClient();

  const handleLanguageToggle = async () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    
    // Show restart prompt for RTL change
    Alert.alert(
      language === 'en' ? 'تغيير اللغة' : 'Change Language',
      language === 'en' 
        ? 'سيتم تغيير اللغة إلى العربية. قد تحتاج إلى إعادة تشغيل التطبيق للحصول على التخطيط الصحيح.'
        : 'Language will change to English. You may need to restart the app for proper layout.',
      [
        { text: t('cancel'), style: 'cancel' },
        { 
          text: language === 'en' ? 'تغيير' : 'Change',
          onPress: () => setLanguage(newLang),
        },
      ]
    );
  };

  const handleResetData = () => {
    Alert.alert(
      t('settings_reset_title'),
      t('settings_reset_confirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('settings_reset_button'),
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear server data
              await resetDatabase();
              // Clear local cache
              await AsyncStorage.clear();
              // Invalidate queries
              await queryClient.invalidateQueries();
              Alert.alert(t('success'), t('settings_reset_success'));
            } catch (error) {
              Alert.alert(t('error'), t('settings_reset_error'));
            }
          },
        },
      ]
    );
  };

  const handleOpenPrivacy = () => {
    Linking.openURL('https://mafqood.vercel.app/privacy-policy.html');
  };

  const handleOpenTerms = () => {
    Linking.openURL('https://mafqood.vercel.app/terms-of-service.html');
  };

  return (
    <Screen backgroundColor={colors.background.secondary} statusBarStyle="dark-content">
      {/* Header */}
      <SimpleHeader title={t('settings_title')} />

      {/* Language Section */}
      <Section title={t('settings_language')}>
        <TouchableOpacity style={styles.languageCard} onPress={handleLanguageToggle}>
          <View style={styles.languageRow}>
            {/* English */}
            <View style={[
              styles.languageOption, 
              language === 'en' && styles.languageOptionActive
            ]}>
              <Text style={styles.languageFlag}>🇬🇧</Text>
              <Text style={[
                styles.languageLabel,
                language === 'en' && styles.languageLabelActive,
              ]}>
                English
              </Text>
              {language === 'en' && (
                <Ionicons name="checkmark-circle" size={18} color={colors.primary.dark} />
              )}
            </View>

            {/* Divider */}
            <View style={styles.languageDivider} />

            {/* Arabic */}
            <View style={[
              styles.languageOption, 
              language === 'ar' && styles.languageOptionActive
            ]}>
              {language === 'ar' && (
                <Ionicons name="checkmark-circle" size={18} color={colors.primary.accent} />
              )}
              <Text style={[
                styles.languageLabel,
                language === 'ar' && styles.languageLabelActive,
              ]}>
                العربية
              </Text>
              <Text style={styles.languageFlag}>🇦🇪</Text>
            </View>
          </View>
          <Text style={styles.languageHint}>
            {t('settings_language_hint')}
          </Text>
        </TouchableOpacity>
      </Section>

      {/* Legal Section */}
      <Section title={t('settings_privacy')}>
        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem} onPress={handleOpenPrivacy}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: colors.status.infoBg }]}>
                <Ionicons name="shield-checkmark-outline" size={18} color={colors.status.info} />
              </View>
              <Text style={styles.menuItemText}>{t('settings_privacy_policy')}</Text>
            </View>
            <Ionicons name="open-outline" size={18} color={colors.text.light} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItem} onPress={handleOpenTerms}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: `${colors.primary.dark}10` }]}>
                <Ionicons name="document-text-outline" size={18} color={colors.primary.dark} />
              </View>
              <Text style={styles.menuItemText}>{t('settings_terms')}</Text>
            </View>
            <Ionicons name="open-outline" size={18} color={colors.text.light} />
          </TouchableOpacity>
        </View>
      </Section>

      {/* Data Section */}
      <Section title={t('settings_data')}>
        <TouchableOpacity style={styles.dangerCard} onPress={handleResetData}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: colors.status.errorBg }]}>
              <Ionicons name="trash-outline" size={18} color={colors.status.error} />
            </View>
            <View style={styles.dangerTextContainer}>
              <Text style={styles.dangerText}>{t('settings_reset_button')}</Text>
              <Text style={styles.dangerSubtext}>{t('settings_reset_desc')}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.status.error} />
        </TouchableOpacity>
      </Section>

      {/* About Footer */}
      <View style={styles.aboutFooter}>
        <Text style={styles.aboutLogo}>🔍 Mafqood</Text>
        <Text style={styles.aboutTagline}>{t('tagline')}</Text>
        <Text style={styles.aboutMeta}>v1.0.0 • {t('footer_rights')}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Language
  languageCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: layout.cardPadding,
    ...shadows.sm,
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  languageOptionActive: {
    backgroundColor: colors.background.tertiary,
  },
  languageFlag: {
    fontSize: 20,
  },
  languageLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  languageLabelActive: {
    color: colors.text.primary,
    fontWeight: typography.weights.semibold,
  },
  languageDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border.light,
    marginHorizontal: spacing.sm,
  },
  languageHint: {
    fontSize: typography.sizes.xs,
    color: colors.text.light,
    textAlign: 'center',
    marginTop: spacing.sm,
  },

  // Menu
  menuCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: layout.cardPadding,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginHorizontal: layout.cardPadding,
  },

  // Danger
  dangerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: layout.cardPadding,
    borderWidth: 1,
    borderColor: `${colors.status.error}20`,
    ...shadows.sm,
  },
  dangerTextContainer: {
    flex: 1,
  },
  dangerText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.status.error,
  },
  dangerSubtext: {
    fontSize: typography.sizes.xs,
    color: colors.text.light,
    marginTop: 2,
  },

  // About
  aboutFooter: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginTop: spacing.lg,
  },
  aboutLogo: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  aboutTagline: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  aboutMeta: {
    fontSize: typography.sizes.xs,
    color: colors.text.light,
  },
});
