/**
 * Mafqood Mobile - Item Card Component
 * Displays reported items with their matches
 */

import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, fontSize, fontWeight, spacing, shadows } from '../theme/theme';
import { Item, Match } from '../types/itemTypes';
import { useLanguage } from '../context/LanguageContext';
import MatchCard from './MatchCard';

interface ItemCardProps {
  item: Item;
  matches: Match[];
  onMatchPress?: (match: Match) => void;
}

export default function ItemCard({ item, matches, onMatchPress }: ItemCardProps) {
  const { t } = useLanguage();

  const hasHighMatch = matches.some(m => m.similarity >= 75);
  const formattedDate = item.timestamp.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <View style={[
      styles.container,
      hasHighMatch && styles.highlightContainer,
    ]}>
      {/* High Match Indicator */}
      {hasHighMatch && (
        <View style={styles.highMatchIndicator}>
          <Ionicons name="sparkles" size={14} color={colors.text.white} />
          <Text style={styles.highMatchText}>{t('matches_high_match_badge')}</Text>
        </View>
      )}

      <View style={styles.content}>
        {/* Left: Item Details */}
        <View style={styles.itemSection}>
          {/* Image */}
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />

          {/* Details */}
          <View style={styles.details}>
            {/* Type Badge + Match Count */}
            <View style={styles.badges}>
              <View style={[
                styles.typeBadge,
                item.type === 'lost' ? styles.lostBadge : styles.foundBadge,
              ]}>
                <Text style={styles.typeBadgeText}>
                  {item.type === 'lost' ? `🔍 ${t('matches_lost_badge')}` : `✅ ${t('matches_found_badge')}`}
                </Text>
              </View>
              {matches.length > 0 && (
                <View style={styles.matchCountBadge}>
                  <Text style={styles.matchCountText}>
                    {matches.length} {matches.length === 1 ? t('matches_match_count') : t('matches_match_count_plural')}
                  </Text>
                </View>
              )}
            </View>

            {/* Description */}
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>

            {/* Meta */}
            <View style={styles.metaRow}>
              <Ionicons name="location" size={14} color={colors.primary.accent} />
              <Text style={styles.metaText}>{item.where}</Text>
              {item.specificPlace && (
                <Text style={styles.metaSubText}>• {item.specificPlace}</Text>
              )}
            </View>

            <View style={styles.metaRow}>
              <Ionicons name="time" size={14} color={colors.primary.dark} />
              <Text style={styles.metaText}>{item.when}</Text>
            </View>

            <View style={styles.metaRow}>
              <Ionicons name="calendar" size={14} color={colors.primary.accent} />
              <Text style={styles.metaSubText}>{t('matches_reported')} {formattedDate}</Text>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Right: Matches Section */}
        <View style={styles.matchesSection}>
          {matches.length > 0 ? (
            <>
              <View style={styles.matchesHeader}>
                <View style={styles.matchesTitleRow}>
                  <Ionicons name="sparkles" size={16} color={colors.primary.accent} />
                  <Text style={styles.matchesTitle}>{t('matches_ai_discovered')}</Text>
                </View>
                {hasHighMatch && (
                  <View style={styles.strongSimilarityBadge}>
                    <Text style={styles.strongSimilarityText}>⚡ Strong</Text>
                  </View>
                )}
              </View>

              <View style={styles.matchesList}>
                {matches.slice(0, 3).map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    compact
                    onPress={onMatchPress ? () => onMatchPress(match) : undefined}
                  />
                ))}
              </View>

              {matches.length > 3 && (
                <TouchableOpacity style={styles.viewAllButton}>
                  <Text style={styles.viewAllText}>
                    View all {matches.length} →
                  </Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={styles.noMatches}>
              <View style={styles.noMatchesIcon}>
                <Ionicons name="search" size={24} color={colors.text.light} />
              </View>
              <Text style={styles.noMatchesTitle}>{t('matches_no_matches_title')}</Text>
              <Text style={styles.noMatchesDesc}>{t('matches_no_matches_desc')}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.border.light,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    ...shadows.lg,
  },
  highlightContainer: {
    borderColor: colors.primary.accent,
    backgroundColor: `${colors.primary.accent}05`,
  },
  highMatchIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary.accent,
    paddingVertical: spacing.sm,
  },
  highMatchText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.text.white,
  },
  content: {
    padding: spacing.lg,
  },
  itemSection: {
    flexDirection: 'row',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  details: {
    flex: 1,
    marginLeft: spacing.md,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  lostBadge: {
    backgroundColor: colors.primary.dark,
  },
  foundBadge: {
    backgroundColor: colors.primary.accent,
  },
  typeBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.text.white,
  },
  matchCountBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: `${colors.primary.accent}15`,
    borderWidth: 1,
    borderColor: `${colors.primary.accent}30`,
  },
  matchCountText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.primary.accent,
  },
  description: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  metaText: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    fontWeight: fontWeight.semibold,
  },
  metaSubText: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.lg,
  },
  matchesSection: {
    minHeight: 100,
  },
  matchesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  matchesTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  matchesTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.primary.dark,
  },
  strongSimilarityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: `${colors.primary.accent}15`,
    borderWidth: 1,
    borderColor: `${colors.primary.accent}30`,
  },
  strongSimilarityText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.primary.accent,
  },
  matchesList: {},
  viewAllButton: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
    backgroundColor: `${colors.primary.accent}10`,
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: `${colors.primary.accent}30`,
  },
  viewAllText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.primary.accent,
  },
  noMatches: {
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border.light,
  },
  noMatchesIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: `${colors.primary.accent}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  noMatchesTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  noMatchesDesc: {
    fontSize: fontSize.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});
