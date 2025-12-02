/**
 * Mafqood Mobile - Home Screen
 * Native mobile dashboard with quick actions
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { colors, borderRadius, typography, spacing, shadows, layout } from '../theme/theme';
import { useLanguage } from '../context/LanguageContext';
import { BottomTabParamList } from '../types/itemTypes';
import { Screen, Card, Section } from '../components/ui';

type NavigationProp = BottomTabNavigationProp<BottomTabParamList>;

export default function HomeScreen() {
  const { t } = useLanguage();
  const navigation = useNavigation<NavigationProp>();

  const features = [
    { icon: 'flash-outline' as const, label: t('badge_instant') },
    { icon: 'shield-checkmark-outline' as const, label: t('badge_privacy') },
    { icon: 'sparkles-outline' as const, label: t('badge_ai') },
  ];

  return (
    <Screen backgroundColor={colors.background.secondary} statusBarStyle="dark-content">
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Ionicons name="search" size={20} color={colors.text.white} />
          </View>
          <Text style={styles.logoText}>{t('app_title')}</Text>
        </View>
        <Text style={styles.tagline}>{t('tagline')}</Text>
      </View>

      {/* Main CTAs */}
      <Section padded style={styles.ctaSection}>
        <TouchableOpacity
          style={[styles.ctaCard, styles.ctaLost]}
          onPress={() => navigation.navigate('Report', { type: 'lost' })}
          activeOpacity={0.85}
        >
          <View style={styles.ctaIconContainer}>
            <Ionicons name="search-outline" size={28} color={colors.text.white} />
          </View>
          <View style={styles.ctaContent}>
            <Text style={styles.ctaTitle}>{t('home_cta_lost')}</Text>
            <Text style={styles.ctaSubtitle}>{t('lost_page_subtitle')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.ctaCard, styles.ctaFound]}
          onPress={() => navigation.navigate('Report', { type: 'found' })}
          activeOpacity={0.85}
        >
          <View style={styles.ctaIconContainer}>
            <Ionicons name="hand-left-outline" size={28} color={colors.text.white} />
          </View>
          <View style={styles.ctaContent}>
            <Text style={styles.ctaTitle}>{t('home_cta_found')}</Text>
            <Text style={styles.ctaSubtitle}>{t('found_page_subtitle')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>
      </Section>

      {/* Quick Features */}
      <Section padded title={t('home_how_it_works_title')} style={styles.featuresSection}>
        <View style={styles.featuresRow}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureChip}>
              <Ionicons name={feature.icon} size={16} color={colors.primary.accent} />
              <Text style={styles.featureText}>{feature.label}</Text>
            </View>
          ))}
        </View>

        {/* How it works - compact */}
        <Card variant="outlined" padding="md" style={styles.stepsCard}>
          <StepItem number="1" icon="camera-outline" text={t('how_step1_desc')} />
          <StepItem number="2" icon="location-outline" text={t('home_step_2_desc')} />
          <StepItem number="3" icon="sparkles-outline" text={t('how_step2_desc')} />
          <StepItem number="4" icon="notifications-outline" text={t('how_step3_desc')} isLast />
        </Card>
      </Section>

      {/* Quick action to view matches */}
      <Section padded>
        <TouchableOpacity 
          style={styles.matchesPromo}
          onPress={() => navigation.navigate('Matches')}
          activeOpacity={0.8}
        >
          <View style={styles.matchesPromoIcon}>
            <Ionicons name="git-compare-outline" size={20} color={colors.primary.accent} />
          </View>
          <View style={styles.matchesPromoContent}>
            <Text style={styles.matchesPromoTitle}>{t('matches_page_title')}</Text>
            <Text style={styles.matchesPromoSubtitle}>{t('matches_dashboard_subtitle')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.text.light} />
        </TouchableOpacity>
      </Section>
    </Screen>
  );
}

// Compact step component
function StepItem({ 
  number, 
  icon, 
  text, 
  isLast = false 
}: { 
  number: string; 
  icon: keyof typeof Ionicons.glyphMap; 
  text: string; 
  isLast?: boolean;
}) {
  return (
    <View style={[styles.stepItem, !isLast && styles.stepItemBorder]}>
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>{number}</Text>
      </View>
      <Ionicons name={icon} size={18} color={colors.primary.dark} style={styles.stepIcon} />
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Header
  header: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary.dark,
  },
  tagline: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginLeft: 40, // Align with logo text
  },

  // CTAs
  ctaSection: {
    marginTop: spacing.sm,
  },
  ctaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  ctaLost: {
    backgroundColor: colors.primary.dark,
  },
  ctaFound: {
    backgroundColor: colors.primary.accent,
  },
  ctaIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  ctaContent: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.white,
    marginBottom: 2,
  },
  ctaSubtitle: {
    fontSize: typography.sizes.xs,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 16,
  },

  // Features section
  featuresSection: {
    marginTop: spacing.sm,
  },
  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary.accentLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  featureText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.primary.dark,
  },

  // Steps card
  stepsCard: {
    gap: 0,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  stepItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.dark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  stepNumberText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text.white,
  },
  stepIcon: {
    marginRight: spacing.sm,
  },
  stepText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },

  // Matches promo
  matchesPromo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  matchesPromoIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  matchesPromoContent: {
    flex: 1,
  },
  matchesPromoTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  matchesPromoSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
  },
});
