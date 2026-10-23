import React, { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiRequest, ApiClientError, type ApiSchemas } from '../../api/client';
import { getFriendlyErrorMessage } from '../../utils/security';
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  ProgressBar,
  Skeleton,
  Tabs,
} from '../../components/ui/primitives';

const PAGE_SIZE_PAGED = 5;

export const AssessmentPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'paged' | 'single'>('paged');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [autosaveState, setAutosaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [missingServerIds, setMissingServerIds] = useState<string[]>([]);

  const questionsQuery = useQuery({
    queryKey: ['assessment-questions'],
    queryFn: () => apiRequest<ApiSchemas['QuestionsListResponse']>('/v1/assessment/questions'),
  });

  const attemptQuery = useQuery({
    queryKey: ['assessment-attempt'],
    queryFn: () => apiRequest<ApiSchemas['AttemptResponse']>('/v1/assessment/attempt'),
  });

  useEffect(() => {
    if (attemptQuery.data?.answers) {
      setAnswers(attemptQuery.data.answers);
    }
  }, [attemptQuery.data]);

  const saveAnswersMutation = useMutation({
    mutationFn: (updatedAnswers: Record<string, number>) =>
      apiRequest<ApiSchemas['AttemptResponse']>('/v1/assessment/answers', {
        method: 'PUT',
        body: { answers: updatedAnswers },
      }),
    onMutate: () => {
      setAutosaveState('saving');
    },
    onSuccess: () => {
      setAutosaveState('saved');
    },
  });

  const submitMutation = useMutation({
    mutationFn: () =>
      apiRequest<ApiSchemas['AssessmentResultResponse']>('/v1/assessment/submit', {
        method: 'POST',
      }),
    onSuccess: () => {
      navigate('/assessment/results');
    },
    onError: (err) => {
      if (err instanceof ApiClientError && err.status === 422 && err.fieldErrors?.missing_question_ids) {
        const ids = err.fieldErrors.missing_question_ids
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean);
        setMissingServerIds(ids);
        setIsReviewMode(true);
      }
    },
  });

  if (questionsQuery.isLoading || attemptQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton lines={2} className="h-14 w-full" />
        <Skeleton lines={5} className="h-24 w-full" />
      </div>
    );
  }

  if (questionsQuery.isError || attemptQuery.isError) {
    const err = questionsQuery.error || attemptQuery.error;
    return (
      <ErrorState
        message={getFriendlyErrorMessage(err, t)}
        onRetry={() => {
          questionsQuery.refetch();
          attemptQuery.refetch();
        }}
      />
    );
  }

  const questions = questionsQuery.data?.questions || [];
  if (questions.length === 0) {
    return <EmptyState description={t('common.emptyTitle')} />;
  }

  const totalQuestions = questions.length;
  const answeredCount = questions.filter((q) => answers[q.id] !== undefined).length;
  const unansweredQuestions = questions.filter((q) => answers[q.id] === undefined);

  const handleSelectOption = (questionId: string, value: number) => {
    const next = { ...answers, [questionId]: value };
    setAnswers(next);
    setMissingServerIds((prev) => prev.filter((id) => id !== questionId));
    saveAnswersMutation.mutate(next);
  };

  const stepSize = mode === 'paged' ? PAGE_SIZE_PAGED : 1;
  const visibleQuestions = questions.slice(currentIndex, currentIndex + stepSize);

  const handleJumpToQuestion = (orderIndex: number) => {
    setIsReviewMode(false);
    if (mode === 'paged') {
      const pageStart = Math.floor(orderIndex / PAGE_SIZE_PAGED) * PAGE_SIZE_PAGED;
      setCurrentIndex(pageStart);
    } else {
      setCurrentIndex(orderIndex);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-display font-bold text-fg">{t('assessment.title')}</h1>
          <p className="text-sm text-fg-muted">{t('assessment.subtitle')}</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-fg-muted" aria-live="polite">
            {autosaveState === 'saving'
              ? t('assessment.autosaveSaving')
              : autosaveState === 'saved'
              ? t('assessment.autosaveSaved')
              : t('assessment.autosaveIdle')}
          </span>
          <Tabs
            ariaLabel="Question display mode"
            activeTab={mode}
            onChange={(m) => {
              setMode(m as 'paged' | 'single');
              setCurrentIndex(0);
            }}
            tabs={[
              { id: 'paged', label: t('assessment.modePaged') },
              { id: 'single', label: t('assessment.modeSingle') },
            ]}
          />
        </div>
      </div>

      <Card className="space-y-3">
        <ProgressBar
          value={answeredCount}
          max={totalQuestions}
          label={t('assessment.progressLabel', { answered: answeredCount, total: totalQuestions })}
        />
        <div className="flex justify-end">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setIsReviewMode(!isReviewMode)}
          >
            {isReviewMode ? t('assessment.backToQuestions') : t('assessment.reviewButton')}
          </Button>
        </div>
      </Card>

      {missingServerIds.length > 0 ? (
        <div
          role="alert"
          className="border border-danger/50 bg-danger/10 rounded-lg p-4 text-sm font-medium text-danger"
        >
          {t('assessment.missingAnswersServerError', { count: missingServerIds.length })}
        </div>
      ) : null}

      {isReviewMode ? (
        <Card className="space-y-6">
          <div className="space-y-1 border-b border-border pb-4">
            <h2 className="text-lg font-display font-bold text-fg">{t('assessment.reviewTitle')}</h2>
            <p className="text-sm text-fg-muted">{t('assessment.reviewSubtitle')}</p>
            {unansweredQuestions.length > 0 ? (
              <p className="text-xs font-medium text-warning">
                {t('assessment.unansweredWarning', { count: unansweredQuestions.length })}
              </p>
            ) : (
              <p className="text-xs font-medium text-success">{t('assessment.allAnsweredReady')}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {questions.map((q, idx) => {
              const val = answers[q.id];
              const isMissingHighlighted = missingServerIds.includes(q.id) || val === undefined;
              return (
                <div
                  key={q.id}
                  className={`p-3 rounded-md border flex items-center justify-between gap-3 ${
                    isMissingHighlighted
                      ? 'border-warning bg-warning/5'
                      : 'border-border bg-surface'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-mono text-fg-muted">
                      #{q.order} · {q.dimension}
                    </div>
                    <div className="text-xs text-fg line-clamp-1">{q.text}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {val !== undefined ? (
                      <span className="text-xs font-mono font-semibold text-primary">
                        {val}/5
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-warning">
                        {t('assessment.unansweredBadge')}
                      </span>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleJumpToQuestion(idx)}
                    >
                      {t('assessment.JumpToQuestion', { order: q.order })}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsReviewMode(false)}
            >
              {t('assessment.backToQuestions')}
            </Button>
            <Button
              type="button"
              onClick={() => submitMutation.mutate()}
              isLoading={submitMutation.isPending}
            >
              {t('assessment.submitButton')}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {visibleQuestions.map((q) => {
            const currentVal = answers[q.id];
            const isMissingServer = missingServerIds.includes(q.id);
            return (
              <Card
                key={q.id}
                className={`space-y-4 ${isMissingServer ? 'border-danger' : ''}`}
              >
                <div className="flex items-center justify-between text-xs text-fg-muted">
                  <span className="font-mono font-semibold">
                    #{q.order} / {totalQuestions}
                  </span>
                  <span>{q.dimension}</span>
                </div>
                <p className="text-base font-medium text-fg">{q.text}</p>
                <div
                  role="radiogroup"
                  aria-label={q.text}
                  className="grid grid-cols-1 sm:grid-cols-5 gap-2"
                >
                  {[1, 2, 3, 4, 5].map((rating) => {
                    const isSelected = currentVal === rating;
                    return (
                      <button
                        key={rating}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => handleSelectOption(q.id, rating)}
                        className={`px-3 py-2.5 text-xs font-medium rounded-md border text-left transition-colors min-h-[42px] ${
                          isSelected
                            ? 'border-primary bg-primary text-primary-fg font-semibold'
                            : 'border-border bg-surface text-fg hover:bg-surface-muted'
                        }`}
                      >
                        {t(`assessment.scale.${rating}`)}
                      </button>
                    );
                  })}
                </div>
              </Card>
            );
          })}

          <div className="flex flex-wrap items-center justify-between gap-4">
            <Button
              type="button"
              variant="secondary"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((i) => Math.max(0, i - stepSize))}
            >
              {t('common.back')}
            </Button>

            <div className="flex items-center gap-3">
              {currentIndex + stepSize < totalQuestions ? (
                <Button
                  type="button"
                  onClick={() =>
                    setCurrentIndex((i) => Math.min(totalQuestions - 1, i + stepSize))
                  }
                >
                  {t('common.continue')}
                </Button>
              ) : (
                <Button type="button" onClick={() => setIsReviewMode(true)}>
                  {t('assessment.reviewButton')}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
