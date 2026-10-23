import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { apiRequest, type ApiSchemas } from '../../api/client';
import { isSafeHttpUrl, getFriendlyErrorMessage } from '../../utils/security';
import {
  Button,
  Card,
  Chip,
  ErrorState,
  Input,
  ProgressBar,
  Select,
  Skeleton,
  Stepper,
  Toast,
} from '../../components/ui/primitives';

const createProfileSchema = (t: (key: string) => string) =>
  z.object({
    full_name: z.string().min(1, t('profile.validation.nameRequired')),
    education_level: z.enum(['class_11_12', 'college']),
    year: z.string().min(1, t('profile.validation.yearRequired')),
    location: z.string().optional(),
    subjects_text: z.string().optional(),
    hobbies_text: z.string().optional(),
    past_work: z.string().optional(),
    projects: z.array(
      z.object({
        title: z.string().min(1, t('profile.validation.nameRequired')),
        description: z.string().optional(),
        link: z
          .string()
          .optional()
          .refine((val) => !val || val.trim() === '' || isSafeHttpUrl(val.trim()), {
            message: t('profile.validation.httpUrlInvalid'),
          }),
      })
    ),
    competitions: z.array(
      z.object({
        title: z.string().min(1, t('profile.validation.nameRequired')),
        outcome: z.string().optional(),
        year: z.string().optional(),
      })
    ),
    records: z.array(
      z.object({
        title: z.string().min(1, t('profile.validation.nameRequired')),
        url: z.string().refine((val) => isSafeHttpUrl(val.trim()), {
          message: t('profile.validation.httpUrlInvalid'),
        }),
        category: z.string().optional(),
      })
    ),
    hours_per_day: z.coerce.number().min(0.5, t('profile.validation.hoursInvalid')).max(16),
    hours_per_week: z.coerce.number().min(1, t('profile.validation.hoursInvalid')).max(100),
    budget_level: z.enum(['low', 'medium', 'high']),
    timezone: z.string().min(1),
  });

type ProfileFormValues = z.infer<ReturnType<typeof createProfileSchema>>;

function parseCommaList(input?: string): string[] {
  if (!input) return [];
  return input
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [activeStep, setActiveStep] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: () => apiRequest<ApiSchemas['ProfileResponse']>('/v1/profile'),
  });

  const schema = createProfileSchema(t);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: '',
      education_level: 'college',
      year: '',
      location: '',
      subjects_text: '',
      hobbies_text: '',
      past_work: '',
      projects: [],
      competitions: [],
      records: [],
      hours_per_day: 2,
      hours_per_week: 14,
      budget_level: 'medium',
      timezone: 'Asia/Kolkata',
    },
  });

  const projectsArray = useFieldArray({ control, name: 'projects' });
  const competitionsArray = useFieldArray({ control, name: 'competitions' });
  const recordsArray = useFieldArray({ control, name: 'records' });

  useEffect(() => {
    if (profileQuery.data) {
      const p = profileQuery.data;
      reset({
        full_name: p.full_name || '',
        education_level: p.education_level || 'college',
        year: p.year || p.grade_level || '',
        location: p.location || '',
        subjects_text: (p.subjects_of_interest || []).join(', '),
        hobbies_text: (p.hobbies || []).join(', '),
        past_work: p.past_work || '',
        projects: (p.projects || []).map((proj) => ({
          title: proj.title,
          description: proj.description || '',
          link: proj.link || '',
        })),
        competitions: (p.competitions || []).map((comp) => ({
          title: comp.title,
          outcome: comp.outcome || '',
          year: comp.year || '',
        })),
        records: (p.records || []).map((rec) => ({
          title: rec.title,
          url: rec.url,
          category: rec.category || '',
        })),
        hours_per_day: p.hours_per_day ?? 2,
        hours_per_week: p.hours_per_week ?? 14,
        budget_level: p.budget_level || 'medium',
        timezone: p.timezone || 'Asia/Kolkata',
      });
    }
  }, [profileQuery.data, reset]);

  const updateMutation = useMutation({
    mutationFn: (payload: ApiSchemas['ProfileUpdateRequest']) =>
      apiRequest<ApiSchemas['ProfileResponse']>('/v1/profile', {
        method: 'PUT',
        body: payload,
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(['profile'], updated);
      setToastMessage(t('profile.savedToast'));
    },
  });

  const watched = watch();

  const sectionStatus = [
    {
      key: 'basic',
      label: t('profile.sections.basic'),
      complete: Boolean(watched.full_name?.trim() && watched.year?.trim()),
    },
    {
      key: 'subjects',
      label: t('profile.sections.subjects'),
      complete: parseCommaList(watched.subjects_text).length > 0,
    },
    {
      key: 'hobbies',
      label: t('profile.sections.hobbies'),
      complete: parseCommaList(watched.hobbies_text).length > 0,
    },
    {
      key: 'pastWork',
      label: t('profile.sections.pastWork'),
      complete: Boolean(watched.past_work?.trim()),
    },
    {
      key: 'projects',
      label: t('profile.sections.projects'),
      complete: (watched.projects || []).length > 0,
    },
    {
      key: 'competitions',
      label: t('profile.sections.competitions'),
      complete: (watched.competitions || []).length > 0,
    },
    {
      key: 'records',
      label: t('profile.sections.records'),
      complete: (watched.records || []).length > 0,
    },
    {
      key: 'schedule',
      label: t('profile.sections.schedule'),
      complete: Boolean(watched.hours_per_day > 0 && watched.hours_per_week > 0 && watched.timezone),
    },
  ];

  const completedCount = sectionStatus.filter((s) => s.complete).length;
  const completenessPercent = Math.round((completedCount / sectionStatus.length) * 100);
  const missingSections = sectionStatus.filter((s) => !s.complete);

  if (profileQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton lines={2} className="h-12 w-full" />
        <Skeleton lines={4} className="h-32 w-full" />
      </div>
    );
  }

  if (profileQuery.isError) {
    return (
      <ErrorState
        message={getFriendlyErrorMessage(profileQuery.error, t)}
        onRetry={() => profileQuery.refetch()}
      />
    );
  }

  const onSubmit = (values: ProfileFormValues) => {
    const payload: ApiSchemas['ProfileUpdateRequest'] = {
      full_name: values.full_name.trim(),
      education_level: values.education_level,
      year: values.year.trim(),
      location: values.location?.trim() || '',
      subjects_of_interest: parseCommaList(values.subjects_text),
      hobbies: parseCommaList(values.hobbies_text),
      past_work: values.past_work?.trim() || '',
      projects: values.projects.map((p) => ({
        title: p.title.trim(),
        description: p.description?.trim() || '',
        link: p.link?.trim() || undefined,
      })),
      competitions: values.competitions.map((c) => ({
        title: c.title.trim(),
        outcome: c.outcome?.trim() || '',
        year: c.year?.trim() || undefined,
      })),
      records: values.records.map((r) => ({
        title: r.title.trim(),
        url: r.url.trim(),
        category: r.category?.trim() || undefined,
      })),
      hours_per_day: Number(values.hours_per_day),
      hours_per_week: Number(values.hours_per_week),
      budget_level: values.budget_level,
      timezone: values.timezone,
    };
    updateMutation.mutate(payload);
  };

  const steps = [
    t('profile.step1Title'),
    t('profile.step2Title'),
    t('profile.step3Title'),
    t('profile.step4Title'),
  ];

  return (
    <div className="space-y-8">
      <Toast
        message={toastMessage}
        variant="success"
        onDismiss={() => setToastMessage(null)}
      />

      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-display font-bold text-fg">{t('profile.title')}</h1>
          <p className="text-sm text-fg-muted">{t('profile.subtitle')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/assessment"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-fg hover:opacity-95 min-h-[42px]"
          >
            {t('profile.takeAssessmentCta')}
          </Link>
          <Link
            to="/assessment/results"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md border border-border bg-surface text-fg hover:bg-surface-muted min-h-[42px]"
          >
            {t('profile.viewResultsCta')}
          </Link>
        </div>
      </div>

      {/* Completeness Meter Card */}
      <Card className="space-y-4">
        <ProgressBar value={completenessPercent} label={t('profile.completenessTitle')} />
        {missingSections.length === 0 ? (
          <p className="text-xs font-medium text-success">{t('profile.completenessComplete')}</p>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-medium text-fg-muted">{t('profile.missingSectionsTitle')}</p>
            <ul className="flex flex-wrap gap-2" aria-label={t('profile.missingSectionsTitle')}>
              {missingSections.map((sec) => (
                <li
                  key={sec.key}
                  className="text-xs px-2.5 py-1 rounded-md bg-surface-muted border border-border text-fg"
                >
                  {sec.label}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* Onboarding Stepper */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Stepper steps={steps} currentStep={activeStep} />
        <div className="flex items-center gap-2">
          {steps.map((label, idx) => (
            <button
              key={label}
              type="button"
              onClick={() => setActiveStep(idx)}
              className={`px-2.5 py-1 text-xs rounded-md border ${
                activeStep === idx
                  ? 'border-primary bg-primary/10 text-fg font-semibold'
                  : 'border-border text-fg-muted hover:text-fg'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {/* Step 1: Basic Details & Education */}
        <Card className="space-y-4">
          <h2 className="text-lg font-display font-bold text-fg">{t('profile.step1Title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('profile.fullNameLabel')}
              error={errors.full_name?.message}
              {...register('full_name')}
            />
            <Select
              label={t('profile.educationLevelLabel')}
              error={errors.education_level?.message}
              options={[
                { value: 'class_11_12', label: t('auth.educationClass11_12') },
                { value: 'college', label: t('auth.educationCollege') },
              ]}
              {...register('education_level')}
            />
            <Input
              label={t('profile.yearLabel')}
              placeholder={t('profile.yearPlaceholder')}
              error={errors.year?.message}
              {...register('year')}
            />
            <Input
              label={t('profile.locationLabel')}
              error={errors.location?.message}
              {...register('location')}
            />
          </div>
        </Card>

        {/* Step 2: Interests, Hobbies & Experience */}
        <Card className="space-y-4">
          <h2 className="text-lg font-display font-bold text-fg">{t('profile.step2Title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('profile.subjectsLabel')}
              placeholder={t('profile.subjectsPlaceholder')}
              error={errors.subjects_text?.message}
              {...register('subjects_text')}
            />
            <Input
              label={t('profile.hobbiesLabel')}
              placeholder={t('profile.hobbiesPlaceholder')}
              error={errors.hobbies_text?.message}
              {...register('hobbies_text')}
            />
          </div>
          <Input
            label={t('profile.pastWorkLabel')}
            placeholder={t('profile.pastWorkPlaceholder')}
            error={errors.past_work?.message}
            {...register('past_work')}
          />
        </Card>

        {/* Step 3: Projects, Competitions & Records */}
        <Card className="space-y-6">
          <h2 className="text-lg font-display font-bold text-fg">{t('profile.step3Title')}</h2>

          {/* Projects */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-fg">{t('profile.projectsTitle')}</h3>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => projectsArray.append({ title: '', description: '', link: '' })}
              >
                {t('profile.addProject')}
              </Button>
            </div>
            {projectsArray.fields.map((field, index) => (
              <div
                key={field.id}
                className="p-4 rounded-md border border-border bg-surface-muted/40 space-y-3"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input
                    label={t('profile.projectTitleLabel')}
                    error={errors.projects?.[index]?.title?.message}
                    {...register(`projects.${index}.title`)}
                  />
                  <Input
                    label={t('profile.projectDescLabel')}
                    error={errors.projects?.[index]?.description?.message}
                    {...register(`projects.${index}.description`)}
                  />
                  <Input
                    label={t('profile.projectLinkLabel')}
                    error={errors.projects?.[index]?.link?.message}
                    {...register(`projects.${index}.link`)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  {watched.projects?.[index]?.link && isSafeHttpUrl(watched.projects[index].link || '') ? (
                    <Chip
                      label={watched.projects[index].title || watched.projects[index].link || 'Link'}
                      href={watched.projects[index].link}
                    />
                  ) : (
                    <span />
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => projectsArray.remove(index)}
                  >
                    {t('common.remove')}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Competitions */}
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-fg">{t('profile.competitionsTitle')}</h3>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => competitionsArray.append({ title: '', outcome: '', year: '' })}
              >
                {t('profile.addCompetition')}
              </Button>
            </div>
            {competitionsArray.fields.map((field, index) => (
              <div
                key={field.id}
                className="p-4 rounded-md border border-border bg-surface-muted/40 space-y-3"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input
                    label={t('profile.competitionTitleLabel')}
                    error={errors.competitions?.[index]?.title?.message}
                    {...register(`competitions.${index}.title`)}
                  />
                  <Input
                    label={t('profile.competitionOutcomeLabel')}
                    error={errors.competitions?.[index]?.outcome?.message}
                    {...register(`competitions.${index}.outcome`)}
                  />
                  <Input
                    label={t('profile.competitionYearLabel')}
                    error={errors.competitions?.[index]?.year?.message}
                    {...register(`competitions.${index}.year`)}
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => competitionsArray.remove(index)}
                  >
                    {t('common.remove')}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Academic Records & Links */}
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-fg">{t('profile.recordsTitle')}</h3>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => recordsArray.append({ title: '', url: '', category: 'Certificate' })}
              >
                {t('profile.addRecord')}
              </Button>
            </div>
            {recordsArray.fields.map((field, index) => (
              <div
                key={field.id}
                className="p-4 rounded-md border border-border bg-surface-muted/40 space-y-3"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    label={t('profile.recordTitleLabel')}
                    error={errors.records?.[index]?.title?.message}
                    {...register(`records.${index}.title`)}
                  />
                  <Input
                    label={t('profile.recordUrlLabel')}
                    error={errors.records?.[index]?.url?.message}
                    {...register(`records.${index}.url`)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  {watched.records?.[index]?.url && isSafeHttpUrl(watched.records[index].url) ? (
                    <Chip
                      label={watched.records[index].title || watched.records[index].url}
                      href={watched.records[index].url}
                    />
                  ) : (
                    <span />
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => recordsArray.remove(index)}
                  >
                    {t('common.remove')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Step 4: Schedule, Budget & Timezone */}
        <Card className="space-y-4">
          <h2 className="text-lg font-display font-bold text-fg">{t('profile.step4Title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="number"
              step="0.5"
              label={t('profile.hoursPerDayLabel')}
              error={errors.hours_per_day?.message}
              {...register('hours_per_day')}
            />
            <Input
              type="number"
              step="1"
              label={t('profile.hoursPerWeekLabel')}
              error={errors.hours_per_week?.message}
              {...register('hours_per_week')}
            />
            <Select
              label={t('profile.budgetLevelLabel')}
              error={errors.budget_level?.message}
              options={[
                { value: 'low', label: t('profile.budgetLow') },
                { value: 'medium', label: t('profile.budgetMedium') },
                { value: 'high', label: t('profile.budgetHigh') },
              ]}
              {...register('budget_level')}
            />
            <Select
              label={t('profile.timezoneLabel')}
              error={errors.timezone?.message}
              options={[
                { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
                { value: 'UTC', label: 'UTC' },
              ]}
              {...register('timezone')}
            />
          </div>
        </Card>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {activeStep > 0 ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
              >
                {t('common.back')}
              </Button>
            ) : null}
            {activeStep < steps.length - 1 ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setActiveStep((s) => Math.min(steps.length - 1, s + 1))}
              >
                {t('common.continue')}
              </Button>
            ) : null}
          </div>

          <Button type="submit" isLoading={updateMutation.isPending}>
            {t('common.save')}
          </Button>
        </div>
      </form>
    </div>
  );
};
