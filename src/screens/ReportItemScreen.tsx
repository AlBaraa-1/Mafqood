/**
 * Mafqood Mobile - Report Item Screen
 * Unified screen for reporting both lost and found items
 * Native-first design with clean form layout
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, borderRadius, typography, spacing, shadows, layout } from '../theme/theme';
import { useLanguage } from '../context/LanguageContext';
import { ItemFormData, whereOptions, whenOptions, MatchResult, Match, BottomTabParamList } from '../types/itemTypes';
import { submitLostItem, submitFoundItem, buildImageUrl } from '../api/client';
import { MATCH_THRESHOLD, HIGH_MATCH_THRESHOLD } from '../api/config';
import { Screen, Header, Card, Section, SegmentedControl } from '../components/ui';
import { PrimaryButton, SecondaryButton } from '../components/ui/Buttons';
import ImagePickerField from '../components/ImagePickerField';
import SelectField from '../components/SelectField';
import TextInput from '../components/TextInput';
import MatchCard from '../components/MatchCard';

type ReportType = 'lost' | 'found';

type RouteParams = {
  Report: { type?: ReportType };
};

export default function ReportItemScreen() {
  const { t } = useLanguage();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'Report'>>();
  
  // Get initial type from navigation params
  const initialType = route.params?.type || 'lost';
  const [reportType, setReportType] = useState<ReportType>(initialType);

  // Update type when navigation params change
  useEffect(() => {
    if (route.params?.type) {
      setReportType(route.params.type);
    }
  }, [route.params?.type]);

  const [formData, setFormData] = useState<ItemFormData>({
    image: null,
    where: '',
    specificPlace: '',
    when: '',
    description: '',
  });

  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLost = reportType === 'lost';
  const accentColor = isLost ? colors.primary.dark : colors.primary.accent;

  // Config based on type
  const config = {
    lost: {
      title: t('lost_page_title'),
      subtitle: t('lost_page_subtitle'),
      icon: 'search-outline' as const,
      photoLabel: t('lost_form_item_photo'),
      whereLabel: t('lost_form_where_question'),
      whenLabel: t('lost_form_when_question'),
      wherePlaceholder: t('lost_form_location_type_placeholder'),
      whenPlaceholder: t('lost_form_time_frame_placeholder'),
      specificPlaceLabel: t('lost_form_specific_place'),
      specificPlacePlaceholder: t('lost_form_specific_place_placeholder'),
      descLabel: t('lost_form_notes_label'),
      descPlaceholder: t('lost_form_notes_placeholder'),
      submitText: t('lost_form_submit'),
      submittingText: t('lost_form_submitting'),
      modalTitle: t('modal_lost_title'),
      modalSubtitle: t('modal_lost_subtitle'),
      modalScanned: t('modal_lost_scanned'),
    },
    found: {
      title: t('found_page_title'),
      subtitle: t('found_page_subtitle'),
      icon: 'hand-left-outline' as const,
      photoLabel: t('found_form_item_photo'),
      whereLabel: t('found_form_where_question'),
      whenLabel: t('found_form_when_question'),
      wherePlaceholder: t('found_form_location_type_placeholder'),
      whenPlaceholder: t('found_form_time_frame_placeholder'),
      specificPlaceLabel: t('found_form_specific_place'),
      specificPlacePlaceholder: t('found_form_specific_place_placeholder'),
      descLabel: t('found_form_notes_label'),
      descPlaceholder: t('found_form_notes_placeholder'),
      submitText: t('found_form_submit'),
      submittingText: t('found_form_submitting'),
      modalTitle: t('modal_found_title'),
      modalSubtitle: t('modal_found_subtitle'),
      modalScanned: t('modal_found_scanned'),
    },
  };

  const currentConfig = config[reportType];

  const handleSubmit = async () => {
    // Validation
    if (!formData.image) {
      setError(t('error_image_required'));
      return;
    }
    if (!formData.where) {
      setError(t('error_location_required'));
      return;
    }
    if (!formData.when) {
      setError(t('error_time_required'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        file: formData.image,
        title: formData.description || `${isLost ? 'Lost' : 'Found'} item at ${formData.where}`,
        description: formData.description || undefined,
        locationType: formData.where,
        locationDetail: formData.specificPlace || undefined,
        timeFrame: formData.when,
      };

      const submitFn = isLost ? submitLostItem : submitFoundItem;
      const response = await submitFn(payload);
      setMatches(response.matches);
      setShowSuccessModal(true);

      // Reset form
      setFormData({
        image: null,
        where: '',
        specificPlace: '',
        when: '',
        description: '',
      });
    } catch (err) {
      console.error(`Error submitting ${reportType} item:`, err);
      setError(err instanceof Error ? err.message : t('error_generic'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMatches = matches.filter(m => m.similarity >= MATCH_THRESHOLD);

  const convertToMatch = (matchResult: MatchResult): Match => ({
    id: matchResult.item.id.toString(),
    item: {
      id: matchResult.item.id.toString(),
      type: isLost ? 'found' : 'lost',
      imageUrl: buildImageUrl(matchResult.item.image_url),
      where: matchResult.item.location_type || 'Unknown',
      specificPlace: matchResult.item.location_detail || undefined,
      when: matchResult.item.time_frame || 'Unknown',
      description: matchResult.item.description || matchResult.item.title || t('no_description'),
      timestamp: new Date(matchResult.item.created_at),
    },
    similarity: Math.round(matchResult.similarity * 100),
    status: matchResult.similarity >= HIGH_MATCH_THRESHOLD ? 'high' : 'possible',
  });

  // Form validation state
  const isFormValid = formData.image && formData.where && formData.when;

  // Calculate progress
  const progress = [
    formData.image ? 1 : 0,
    formData.where && formData.when ? 1 : 0,
    0, // Submit step
  ].reduce((a, b) => a + b, 0);

  const progressSteps = [
    { key: 'photo', label: t('how_step1_title'), icon: 'camera-outline' as const },
    { key: 'details', label: t('detail_location'), icon: 'location-outline' as const },
    { key: 'submit', label: t('submit'), icon: 'checkmark-outline' as const },
  ];

  return (
    <Screen
      backgroundColor={colors.background.secondary}
      statusBarStyle="dark-content"
      keyboardAvoiding
    >
      {/* Header with type toggle */}
      <View style={styles.headerContainer}>
        <Header
          title={currentConfig.title}
          subtitle={currentConfig.subtitle}
          icon={currentConfig.icon}
          variant="transparent"
        />
        
        {/* Type Toggle */}
        <View style={styles.toggleContainer}>
          <SegmentedControl
            segments={[
              { 
                key: 'lost', 
                label: t('matches_lost_badge'),
                icon: <Ionicons name="search-outline" size={14} color={reportType === 'lost' ? colors.text.white : colors.text.secondary} />
              },
              { 
                key: 'found', 
                label: t('matches_found_badge'),
                icon: <Ionicons name="hand-left-outline" size={14} color={reportType === 'found' ? colors.text.white : colors.text.secondary} />
              },
            ]}
            selectedKey={reportType}
            onSelect={(key: string) => setReportType(key as ReportType)}
            accentColor={accentColor}
          />
        </View>
      </View>

      {/* Progress Steps */}
      <View style={styles.progressContainer}>
        {progressSteps.map((step, index) => (
          <React.Fragment key={step.key}>
            <View style={styles.progressStep}>
              <View style={[
                styles.progressDot,
                index < progress && { backgroundColor: accentColor },
              ]}>
                <Ionicons 
                  name={step.icon} 
                  size={14} 
                  color={index < progress ? colors.text.white : colors.text.tertiary} 
                />
              </View>
              <Text style={[
                styles.progressLabel,
                index < progress && styles.progressLabelActive,
              ]}>
                {step.label}
              </Text>
            </View>
            {index < progressSteps.length - 1 && (
              <View style={[
                styles.progressLine,
                index < progress - 1 && { backgroundColor: accentColor },
              ]} />
            )}
          </React.Fragment>
        ))}
      </View>

      {/* Form */}
      <Section padded style={styles.formSection}>
        <Card variant="default" padding="md">
          {/* Image Upload */}
          <ImagePickerField
            value={formData.image}
            onChange={(image) => setFormData(prev => ({ ...prev, image }))}
            label={currentConfig.photoLabel}
            required
          />

          {/* Location Select */}
          <SelectField
            value={formData.where}
            onChange={(where) => setFormData(prev => ({ ...prev, where }))}
            options={whereOptions}
            placeholder={currentConfig.wherePlaceholder}
            label={currentConfig.whereLabel}
            required
            icon={<Ionicons name="location" size={16} color={accentColor} />}
          />

          {/* Time Frame Select */}
          <SelectField
            value={formData.when}
            onChange={(when) => setFormData(prev => ({ ...prev, when }))}
            options={whenOptions}
            placeholder={currentConfig.whenPlaceholder}
            label={currentConfig.whenLabel}
            required
            icon={<Ionicons name="time" size={16} color={accentColor} />}
          />

          {/* Specific Place (Optional) */}
          <TextInput
            value={formData.specificPlace}
            onChangeText={(specificPlace) => setFormData(prev => ({ ...prev, specificPlace }))}
            placeholder={currentConfig.specificPlacePlaceholder}
            label={currentConfig.specificPlaceLabel}
            icon={<Ionicons name="pin-outline" size={16} color={colors.text.tertiary} />}
          />

          {/* Description (Optional) */}
          <TextInput
            value={formData.description}
            onChangeText={(description) => setFormData(prev => ({ ...prev, description }))}
            placeholder={currentConfig.descPlaceholder}
            label={currentConfig.descLabel}
            multiline
            numberOfLines={3}
            icon={<Ionicons name="document-text-outline" size={16} color={colors.text.tertiary} />}
          />

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color={colors.status.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Submit Button */}
          {isLost ? (
            <PrimaryButton
              title={isSubmitting ? currentConfig.submittingText : currentConfig.submitText}
              onPress={handleSubmit}
              loading={isSubmitting}
              disabled={isSubmitting || !isFormValid}
              fullWidth
              size="lg"
              icon="sparkles"
            />
          ) : (
            <SecondaryButton
              title={isSubmitting ? currentConfig.submittingText : currentConfig.submitText}
              onPress={handleSubmit}
              loading={isSubmitting}
              disabled={isSubmitting || !isFormValid}
              fullWidth
              size="lg"
              icon="sparkles"
            />
          )}
        </Card>
      </Section>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onViewMatches={() => {
          setShowSuccessModal(false);
          navigation.navigate('Matches' as never);
        }}
        config={currentConfig}
        matches={filteredMatches}
        convertToMatch={convertToMatch}
        accentColor={accentColor}
        t={t}
      />
    </Screen>
  );
}

// Success Modal Component
function SuccessModal({
  visible,
  onClose,
  onViewMatches,
  config,
  matches,
  convertToMatch,
  accentColor,
  t,
}: {
  visible: boolean;
  onClose: () => void;
  onViewMatches: () => void;
  config: { modalTitle: string; modalSubtitle: string; modalScanned: string };
  matches: MatchResult[];
  convertToMatch: (m: MatchResult) => Match;
  accentColor: string;
  t: (key: string) => string;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Modal Header */}
          <View style={[styles.modalHeader, { backgroundColor: accentColor }]}>
            <TouchableOpacity style={styles.modalClose} onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text.white} />
            </TouchableOpacity>
            <View style={styles.modalHeaderContent}>
              <View style={styles.modalIconContainer}>
                <Ionicons name="checkmark-circle" size={32} color={accentColor} />
              </View>
              <Text style={styles.modalTitle}>{config.modalTitle}</Text>
              <Text style={styles.modalSubtitle}>{config.modalSubtitle}</Text>
            </View>
          </View>

          {/* Modal Body */}
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <Text style={styles.modalText}>{config.modalScanned}</Text>

            {/* Next Steps */}
            <View style={[styles.nextStepsContainer, { backgroundColor: `${accentColor}10` }]}>
              <Text style={styles.nextStepsTitle}>{t('modal_lost_what_next')}</Text>
              
              {[
                { num: '1', title: t('modal_lost_step1_title'), desc: t('modal_lost_step1_desc') },
                { num: '2', title: t('modal_lost_step2_title'), desc: t('modal_lost_step2_desc') },
                { num: '3', title: t('modal_lost_step3_title'), desc: t('modal_lost_step3_desc') },
              ].map((step, index) => (
                <View key={index} style={styles.nextStep}>
                  <View style={[styles.nextStepNumber, { backgroundColor: accentColor }]}>
                    <Text style={styles.nextStepNumberText}>{step.num}</Text>
                  </View>
                  <View style={styles.nextStepContent}>
                    <Text style={styles.nextStepTitle}>{step.title}</Text>
                    <Text style={styles.nextStepDesc}>{step.desc}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Matches Found */}
            {matches.length > 0 && (
              <>
                <View style={[styles.matchesFoundBanner, { borderColor: accentColor }]}>
                  <Text style={styles.matchesFoundText}>
                    {t('modal_matches_found_message').replace('{count}', matches.length.toString())}
                  </Text>
                </View>
                <View style={styles.matchesPreview}>
                  {matches.slice(0, 2).map((matchResult) => (
                    <MatchCard
                      key={matchResult.item.id}
                      match={convertToMatch(matchResult)}
                      compact
                    />
                  ))}
                </View>
              </>
            )}
          </ScrollView>

          {/* Modal Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.modalSecondaryButton} onPress={onClose}>
              <Text style={styles.modalSecondaryButtonText}>{t('modal_close')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalPrimaryButton, { backgroundColor: accentColor }]} 
              onPress={onViewMatches}
            >
              <Text style={styles.modalPrimaryButtonText}>{t('modal_view_matches')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Header
  headerContainer: {
    paddingBottom: spacing.sm,
  },
  toggleContainer: {
    paddingHorizontal: layout.screenPadding,
    marginTop: spacing.sm,
  },

  // Progress
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.md,
  },
  progressStep: {
    alignItems: 'center',
  },
  progressDot: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  progressLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    fontWeight: typography.weights.medium,
  },
  progressLabelActive: {
    color: colors.text.primary,
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: colors.border.light,
    marginHorizontal: spacing.sm,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.full,
  },

  // Form
  formSection: {
    marginTop: spacing.xs,
  },

  // Error
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.errorBg,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  errorText: {
    flex: 1,
    color: colors.status.error,
    fontSize: typography.sizes.sm,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: layout.screenPadding,
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  modalHeader: {
    padding: spacing.lg,
  },
  modalClose: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 1,
    padding: spacing.xs,
  },
  modalHeaderContent: {
    alignItems: 'center',
    paddingTop: spacing.sm,
  },
  modalIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.white,
    marginBottom: spacing.xs,
  },
  modalSubtitle: {
    fontSize: typography.sizes.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  modalBody: {
    padding: spacing.lg,
  },
  modalText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  nextStepsContainer: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  nextStepsTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  nextStep: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  nextStepNumber: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextStepNumberText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text.white,
  },
  nextStepContent: {
    flex: 1,
  },
  nextStepTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  nextStepDesc: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    lineHeight: 16,
  },
  matchesFoundBanner: {
    backgroundColor: colors.primary.accentLight,
    borderWidth: 2,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  matchesFoundText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primary.dark,
    textAlign: 'center',
  },
  matchesPreview: {
    marginTop: spacing.xs,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  modalSecondaryButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
  },
  modalSecondaryButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
  },
  modalPrimaryButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  modalPrimaryButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.white,
  },
});
