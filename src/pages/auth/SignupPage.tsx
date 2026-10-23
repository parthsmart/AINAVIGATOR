import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { ApiClientError } from '../../api/client';
import { getFriendlyErrorMessage } from '../../utils/security';
import { Button, Card, Input, Select } from '../../components/ui/primitives';

export interface SignupPageProps {
  enableParentalConsentFlag?: boolean;
}

export const SignupPage: React.FC<SignupPageProps> = ({ enableParentalConsentFlag }) => {
  const { t } = useTranslation();
  const { signup, login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [retryAfter, setRetryAfter] = useState<number>(0);

  // Feature flag placeholder for future age & parental-consent verification step
  const isParentalConsentEnabled =
    enableParentalConsentFlag ??
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ENABLE_PARENTAL_CONSENT === 'true');

  const signupSchema = z.object({
    email: z.string().email(t('auth.validation.emailInvalid')),
    password: z.string().min(8, t('auth.validation.passwordMin')),
    education_level: z.enum(['class_11_12', 'college']),
    age_confirmed: z.boolean().optional(),
    parental_consent_email: z.string().optional(),
  });

  type SignupFormValues = z.infer<typeof signupSchema>;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      education_level: 'college',
      age_confirmed: false,
      parental_consent_email: '',
    },
  });

  useEffect(() => {
    if (retryAfter <= 0) return;
    const timer = setInterval(() => {
      setRetryAfter((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [retryAfter]);

  const onSubmit = async (values: SignupFormValues) => {
    setServerError(null);
    try {
      await signup(values);
      await login({ email: values.email, password: values.password });
      navigate('/dashboard');
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 422 && Object.keys(err.fieldErrors).length > 0) {
          Object.entries(err.fieldErrors).forEach(([field, msg]) => {
            if (field === 'email' || field === 'password' || field === 'education_level') {
              setError(field, { type: 'server', message: msg });
            }
          });
        }
        if (err.status === 429 && err.retryAfterSeconds) {
          setRetryAfter(err.retryAfterSeconds);
        }
      }
      setServerError(getFriendlyErrorMessage(err, t));
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="max-w-md w-full space-y-6">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-display font-bold text-fg">{t('auth.signupTitle')}</h1>
          <p className="text-sm text-fg-muted">{t('auth.signupSubtitle')}</p>
        </div>

        {serverError ? (
          <div role="alert" className="p-3 rounded-md border border-danger/40 bg-danger/5 text-xs font-medium text-danger">
            {serverError}
          </div>
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input
            label={t('auth.emailLabel')}
            type="email"
            autoComplete="email"
            placeholder={t('auth.emailPlaceholder')}
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label={t('auth.passwordLabel')}
            type="password"
            autoComplete="new-password"
            placeholder={t('auth.passwordPlaceholder')}
            error={errors.password?.message}
            {...register('password')}
          />

          <Select
            label={t('auth.educationLevelLabel')}
            options={[
              { value: 'class_11_12', label: t('auth.educationClass11_12') },
              { value: 'college', label: t('auth.educationCollege') },
            ]}
            error={errors.education_level?.message}
            {...register('education_level')}
          />

          {/* Clearly marked feature-flagged placeholder for future Age & Parental Consent step */}
          {isParentalConsentEnabled ? (
            <div
              data-testid="parental-consent-placeholder"
              className="p-4 rounded-md border border-border bg-surface-muted space-y-3"
            >
              <div className="text-xs font-semibold text-fg">{t('auth.parentalConsentTitle')}</div>
              <p className="text-xs text-fg-muted">{t('auth.parentalConsentDesc')}</p>
              <label className="flex items-center gap-2 text-xs text-fg">
                <input type="checkbox" {...register('age_confirmed')} className="rounded border-border" />
                <span>{t('auth.ageConfirmedLabel')}</span>
              </label>
              <Input
                label={t('auth.parentEmailLabel')}
                type="email"
                placeholder="parent@example.com"
                {...register('parental_consent_email')}
              />
            </div>
          ) : null}

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isSubmitting}
            disabled={retryAfter > 0}
          >
            {retryAfter > 0 ? t('common.rateLimited', { seconds: retryAfter }) : t('auth.signupButton')}
          </Button>
        </form>

        <div className="pt-4 border-t border-border text-xs text-fg-muted flex items-center justify-between">
          <span>{t('auth.haveAccount')}</span>
          <Link to="/login" className="font-medium text-primary hover:underline">
            {t('auth.loginButton')}
          </Link>
        </div>
      </Card>
    </div>
  );
};
