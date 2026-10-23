import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { apiRequest, type ApiSchemas } from '../api/client';
import { usePreferences } from '../context/PreferencesContext';
import { usePollAiStatus } from '../hooks/usePollAiStatus';
import { getFriendlyErrorMessage } from '../utils/security';
import {
  AiStatusBlock,
  Button,
  Card,
  EmptyState,
  ErrorState,
  HonestFactDisplay,
  ProgressBar,
  ScoreRing,
  Skeleton,
  Stepper,
  Tabs,
  Timeline,
} from '../components/ui/primitives';

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { hideStreaks, setHideStreaks } = usePreferences();
  const [activeCluster, setActiveCluster] = useState<string>('all');

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: () => apiRequest<ApiSchemas['ProfileResponse']>('/v1/profile'),
  });

  const careersQuery = useQuery({
    queryKey: ['careers', activeCluster],
    queryFn: () =>
      apiRequest<ApiSchemas['CareersListResponse']>(
        activeCluster === 'all'
          ? '/v1/careers'
          : `/v1/careers?cluster=${encodeURIComponent(activeCluster)}`
      ),
  });

  const aiSummary = usePollAiStatus({
    initialStatus: 'ready',
    initialText:
      'Your Investigative-Realistic-Conventional (IRC) profile pairs analytical systems thinking with structured engineering execution.',
    fallbackText:
      'Standard summary: Your profile aligns with technical problem-solving and structured engineering workflows.',
    pollFn: async () => ({
      status: 'ready',
      text: 'Your Investigative-Realistic-Conventional (IRC) profile pairs analytical systems thinking with structured engineering execution.',
    }),
  });

  if (profileQuery.isLoading || careersQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton lines={3} className="h-16 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton lines={1} className="h-44 w-full" />
          <Skeleton lines={1} className="h-44 w-full" />
          <Skeleton lines={1} className="h-44 w-full" />
        </div>
      </div>
    );
  }

  if (profileQuery.isError || careersQuery.isError) {
    const err = profileQuery.error || careersQuery.error;
    return (
      <ErrorState
        message={getFriendlyErrorMessage(err, t)}
        onRetry={() => {
          profileQuery.refetch();
          careersQuery.refetch();
        }}
      />
    );
  }

  const profile = profileQuery.data;
  const careers = careersQuery.data?.items || [];
  const hasDraftCareers = careers.some((c) => c.status === 'draft');

  return (
    <div className="space-y-8">
      {hasDraftCareers ? (
        <div role="note" className="border border-warning/40 bg-warning/10 rounded-lg px-4 py-3 text-xs font-medium text-fg">
          {t('app.sampleDataBanner')}
        </div>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-display font-bold text-fg">
            {t('dashboard.welcome', { name: profile?.full_name || 'Student' })}
          </h1>
          <p className="text-sm text-fg-muted">{t('dashboard.subtitle')}</p>
        </div>

        <div className="flex items-center gap-3">
          {!hideStreaks ? (
            <div className="text-right">
              <div className="text-xs text-fg-muted">{t('dashboard.streakLabel')}</div>
              <div className="text-sm font-mono font-semibold tabular-nums text-fg">
                {t('dashboard.streakDays', { count: 7 })}
              </div>
            </div>
          ) : null}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setHideStreaks(!hideStreaks)}
          >
            {hideStreaks ? t('dashboard.showStreaksToggle') : t('dashboard.hideStreaksToggle')}
          </Button>
        </div>
      </div>

      <Stepper
        steps={[
          t('nav.profile'),
          t('nav.careers'),
          t('nav.skills'),
          t('nav.roadmap'),
          t('nav.portfolio'),
        ]}
        currentStep={0}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="space-y-4">
          <ScoreRing
            score={92}
            label={t('dashboard.compatibilityCardTitle')}
            breakdown={{
              Investigative: 92,
              Conventional: 78,
              Realistic: 68,
              Enterprising: 52,
            }}
          />
        </Card>

        <Card className="space-y-4">
          <HonestFactDisplay
            label={t('auth.educationLevelLabel')}
            value={profile?.grade_level}
            provenance="self_reported"
          />
          <HonestFactDisplay
            label="Python & Data Structures"
            value="Advanced (88%)"
            provenance="test_assessed"
            lastVerifiedAt="2026-10-23"
          />
          <HonestFactDisplay
            label="College Cutoff Benchmark"
            value={null}
          />
          <ProgressBar value={75} label="Profile Completeness" />
        </Card>

        <Card className="space-y-4">
          <AiStatusBlock status={aiSummary.status} text={aiSummary.text} />
          <Timeline
            items={[
              {
                id: 'step-1',
                title: 'RIASEC Assessment Completed',
                subtitle: 'Holland Code: IRC · Verified',
                status: 'done',
              },
              {
                id: 'step-2',
                title: 'Software Development Engineer Roadmap',
                subtitle: 'Phase 1 in progress · 15 hrs/wk',
                status: 'in_progress',
              },
            ]}
          />
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-display font-bold text-fg">{t('nav.careers')}</h2>
          <Tabs
            ariaLabel="Career cluster filter"
            activeTab={activeCluster}
            onChange={setActiveCluster}
            tabs={[
              { id: 'all', label: t('dashboard.filterAll') },
              { id: 'Information Technology', label: t('dashboard.filterIT') },
              { id: 'Healthcare & Life Sciences', label: t('dashboard.filterData') },
            ]}
          />
        </div>

        {careers.length === 0 ? (
          <EmptyState
            description={t('dashboard.emptyCareers')}
            actionLabel={t('dashboard.filterAll')}
            onAction={() => setActiveCluster('all')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {careers.map((career) => (
              <Card key={career.id} className="space-y-3 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="text-xs text-fg-muted flex items-center gap-1.5">
                    <span>{career.cluster}</span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {career.last_verified_at
                        ? t('app.lastVerifiedAt', { date: career.last_verified_at })
                        : t('app.notVerifiedYet')}
                    </span>
                  </div>
                  <h3 className="text-base font-display font-bold text-fg">{career.title}</h3>
                  <p className="text-xs text-fg-muted leading-relaxed">{career.overview}</p>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                  <span className="font-mono tabular-nums text-fg">
                    {career.salary_min_inr && career.salary_max_inr
                      ? `₹${Math.round(career.salary_min_inr / 100000)}–${Math.round(
                          career.salary_max_inr / 100000
                        )} LPA (approx.)`
                      : t('app.notVerifiedYet')}
                  </span>
                  <span className="font-mono font-semibold tabular-nums text-primary">
                    {career.compatibility_score !== null && career.compatibility_score !== undefined
                      ? `${Math.round(career.compatibility_score)}%`
                      : t('app.notVerifiedYet')}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
