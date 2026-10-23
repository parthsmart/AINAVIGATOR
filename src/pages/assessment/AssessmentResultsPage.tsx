import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiRequest, type ApiSchemas } from '../../api/client';
import { getFriendlyErrorMessage } from '../../utils/security';
import {
  AiStatusBlock,
  Button,
  Card,
  EmptyState,
  ErrorState,
  ScoreRing,
  Select,
  Skeleton,
  Toast,
} from '../../components/ui/primitives';

export const AssessmentResultsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [localQaItems, setLocalQaItems] = useState<
    Record<string, ApiSchemas['AssessmentQAResponse'][]>
  >({});
  const [chosenCareerIds, setChosenCareerIds] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const resultsQuery = useQuery({
    queryKey: ['assessment-results'],
    queryFn: () => apiRequest<ApiSchemas['AssessmentResultResponse'][]>('/v1/assessment/results'),
  });

  const askMutation = useMutation({
    mutationFn: ({ resultId, question }: { resultId: string; question: string }) =>
      apiRequest<ApiSchemas['AssessmentQAResponse']>(
        `/v1/assessment/results/${encodeURIComponent(resultId)}/ask`,
        {
          method: 'POST',
          body: { question },
        }
      ),
    onSuccess: (response, variables) => {
      setLocalQaItems((prev) => ({
        ...prev,
        [variables.resultId]: [...(prev[variables.resultId] || []), response],
      }));
      setQuestionText('');
    },
  });

  const chooseCareerMutation = useMutation({
    mutationFn: ({ resultId, careerId }: { resultId: string; careerId: string }) =>
      apiRequest<ApiSchemas['ChooseCareerResponse']>(
        `/v1/assessment/results/${encodeURIComponent(resultId)}/choose`,
        {
          method: 'POST',
          body: { career_id: careerId },
        }
      ),
    onSuccess: (data) => {
      setChosenCareerIds((prev) => ({
        ...prev,
        [data.result_id]: data.chosen_career_id,
      }));
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setToastMessage(t('results.careerChosenToast'));
    },
  });

  if (resultsQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton lines={2} className="h-14 w-full" />
        <Skeleton lines={4} className="h-40 w-full" />
      </div>
    );
  }

  if (resultsQuery.isError) {
    return (
      <ErrorState
        message={getFriendlyErrorMessage(resultsQuery.error, t)}
        onRetry={() => resultsQuery.refetch()}
      />
    );
  }

  const results = resultsQuery.data || [];
  if (results.length === 0) {
    return (
      <EmptyState
        description={t('common.emptyTitle')}
        actionLabel={t('results.retakeButton')}
        onAction={() => navigate('/assessment')}
      />
    );
  }

  const activeResult =
    results.find((r) => r.id === selectedVersionId) || results[0];

  const isClass11_12 = activeResult.education_level === 'class_11_12';
  const combinedQa = [
    ...(activeResult.qa_thread || []),
    ...(localQaItems[activeResult.id] || []),
  ];
  const currentChosenCareer =
    chosenCareerIds[activeResult.id] ?? activeResult.chosen_career_id;

  const topDimensionScore = Math.max(
    ...Object.values(activeResult.dimension_scores || { Investigative: 85 })
  );

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = questionText.trim();
    if (!trimmed || trimmed.length > 500) return;
    askMutation.mutate({ resultId: activeResult.id, question: trimmed });
  };

  const streamsSection = (
    <section aria-labelledby="streams-heading" className="space-y-4">
      <div className="space-y-1">
        <h2 id="streams-heading" className="text-lg font-display font-bold text-fg">
          {t('results.streamsFirstTitle')}
        </h2>
        <p className="text-xs text-fg-muted">{t('results.streamsFirstSubtitle')}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeResult.recommended_streams.map((stream) => (
          <Card key={stream.stream_name} className="space-y-3 border-primary/40">
            <h3 className="text-base font-display font-bold text-fg">{stream.stream_name}</h3>
            <p className="text-xs text-fg-muted">{stream.reason}</p>
            <div className="text-xs">
              <span className="font-semibold text-fg">{t('results.streamSubjectsLabel')} </span>
              <span className="text-fg-muted">{stream.subjects.join(', ')}</span>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );

  const careersSection = (
    <section aria-labelledby="careers-heading" className="space-y-4">
      <h2 id="careers-heading" className="text-lg font-display font-bold text-fg">
        {t('results.topCareersTitle')}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {activeResult.recommended_careers.slice(0, 3).map((career) => {
          const isChosen = currentChosenCareer === career.career_id;
          return (
            <Card key={career.career_id} className="space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-fg-muted">
                  <span>{career.cluster}</span>
                  <span className="font-mono font-bold text-primary">
                    {t('results.matchScoreLabel', { score: career.match_score })}
                  </span>
                </div>
                <h3 className="text-base font-display font-bold text-fg">{career.title}</h3>
                <p className="text-xs text-fg-muted leading-relaxed">{career.reason}</p>
              </div>

              <div className="pt-3 border-t border-border">
                {isChosen ? (
                  <span className="inline-block text-xs font-semibold text-success">
                    {t('results.chosenCareerBadge')}
                  </span>
                ) : (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    isLoading={chooseCareerMutation.isPending}
                    onClick={() =>
                      chooseCareerMutation.mutate({
                        resultId: activeResult.id,
                        careerId: career.career_id,
                      })
                    }
                  >
                    {t('results.chooseCareerButton')}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );

  return (
    <div className="space-y-8">
      <Toast
        message={toastMessage}
        variant="success"
        onDismiss={() => setToastMessage(null)}
      />

      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-display font-bold text-fg">{t('results.title')}</h1>
          <p className="text-sm font-mono font-semibold text-primary">
            {activeResult.holland_code} — {activeResult.holland_label}
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="w-64">
            <Select
              label={t('results.versionSelectorLabel')}
              value={activeResult.id}
              onChange={(e) => setSelectedVersionId(e.target.value)}
              options={results.map((r) => ({
                value: r.id,
                label: t('results.versionOption', {
                  version: r.version,
                  date: r.created_at.slice(0, 10),
                }),
              }))}
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/assessment')}
          >
            {t('results.retakeButton')}
          </Button>
        </div>
      </div>

      {/* Holland Code & Explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="space-y-4">
          <ScoreRing
            score={topDimensionScore}
            label={`${t('results.hollandCodeTitle')}: ${activeResult.holland_code}`}
            breakdown={activeResult.dimension_scores}
          />
        </Card>

        <Card className="space-y-4">
          <h2 className="text-sm font-display font-bold text-fg">{t('results.traitsTitle')}</h2>
          <ul className="space-y-1.5 text-xs text-fg">
            {activeResult.traits.map((trait) => (
              <li key={trait} className="flex items-center gap-2">
                <span aria-hidden="true" className="text-primary">•</span>
                <span>{trait}</span>
              </li>
            ))}
          </ul>

          <h2 className="text-sm font-display font-bold text-fg pt-2 border-t border-border">
            {t('results.skillsTitle')}
          </h2>
          <ul className="flex flex-wrap gap-2 text-xs">
            {activeResult.skills.map((skill) => (
              <li
                key={skill}
                className="px-2.5 py-1 rounded-md bg-surface-muted border border-border text-fg"
              >
                {skill}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="space-y-4">
          <AiStatusBlock status={activeResult.ai_status} text={activeResult.explanation} />
        </Card>
      </div>

      {/* Class 11-12 sees Recommended Streams/Subjects FIRST before Top 3 Careers */}
      {isClass11_12 ? (
        <>
          {streamsSection}
          {careersSection}
        </>
      ) : (
        <>
          {careersSection}
          {streamsSection}
        </>
      )}

      {/* Follow-up Q&A Thread per Result */}
      <Card className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-display font-bold text-fg">{t('results.qaTitle')}</h2>
          <p className="text-xs text-fg-muted">{t('results.qaSubtitle')}</p>
        </div>

        <form onSubmit={handleAskSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <label htmlFor="qa-question-input" className="block text-sm font-medium text-fg">
              {t('results.qaTitle')}
            </label>
            <textarea
              id="qa-question-input"
              rows={3}
              maxLength={500}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value.slice(0, 500))}
              placeholder={t('results.qaPlaceholder')}
              className="w-full rounded-md border border-border px-3.5 py-2 text-sm bg-surface text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            <div className="flex items-center justify-between text-xs text-fg-muted">
              <span>{t('results.qaCharCount', { count: questionText.length })}</span>
              <Button
                type="submit"
                size="sm"
                disabled={questionText.trim().length === 0 || questionText.length > 500}
                isLoading={askMutation.isPending}
              >
                {t('results.qaSendButton')}
              </Button>
            </div>
          </div>
        </form>

        {combinedQa.length === 0 ? (
          <p className="text-xs text-fg-muted">{t('results.qaEmpty')}</p>
        ) : (
          <div className="space-y-4 pt-4 border-t border-border">
            {combinedQa.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-md border border-border bg-surface-muted/40 space-y-2"
              >
                <div className="text-xs font-semibold text-fg">Q: {item.question}</div>
                {item.ai_status === 'out_of_scope' ? (
                  <p role="note" className="text-xs font-medium text-warning">
                    {t('results.qaOutOfScopeNote')}
                  </p>
                ) : item.ai_status === 'fallback' ? (
                  <AiStatusBlock status="fallback" text={item.answer} />
                ) : (
                  <p className="text-sm text-fg">{item.answer}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
