import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiRequest, ApiClientError } from '../../api/client';
import { getFriendlyErrorMessage } from '../../utils/security';
import { Button, Card, Input } from '../../components/ui/primitives';

export const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [retryAfter, setRetryAfter] = useState<number>(0);

  const schema = z.object({
    email: z.string().email(t('auth.validation.emailInvalid')),
  });
  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (retryAfter <= 0) return;
    const timer = setInterval(() => {
      setRetryAfter((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [retryAfter]);

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    setSuccessMsg(null);
    try {
      await apiRequest('/v1/auth/forgot-password', {
        method: 'POST',
        body: values,
        skipAuthRefresh: true,
      });
      setSuccessMsg(t('auth.forgotSuccess'));
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 429 && err.retryAfterSeconds) {
        setRetryAfter(err.retryAfterSeconds);
      }
      setServerError(getFriendlyErrorMessage(err, t));
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="max-w-md w-full space-y-6">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-display font-bold text-fg">{t('auth.forgotTitle')}</h1>
          <p className="text-sm text-fg-muted">{t('auth.forgotSubtitle')}</p>
        </div>

        {serverError ? (
          <div role="alert" className="p-3 rounded-md border border-danger/40 bg-danger/5 text-xs font-medium text-danger">
            {serverError}
          </div>
        ) : null}

        {successMsg ? (
          <div role="status" className="p-3 rounded-md border border-success/40 bg-success/5 text-xs font-medium text-fg">
            {successMsg}
          </div>
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input
            label={t('auth.emailLabel')}
            type="email"
            placeholder={t('auth.emailPlaceholder')}
            error={errors.email?.message}
            {...register('email')}
          />
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isSubmitting}
            disabled={retryAfter > 0}
          >
            {retryAfter > 0 ? t('common.rateLimited', { seconds: retryAfter }) : t('auth.forgotButton')}
          </Button>
        </form>

        <div className="pt-4 border-t border-border text-xs flex justify-between">
          <Link to="/login" className="text-primary hover:underline">
            {t('auth.backToLogin')}
          </Link>
          <Link to="/reset-password" className="text-fg-muted hover:text-fg">
            {t('auth.resetTitle')}
          </Link>
        </div>
      </Card>
    </div>
  );
};

export const ResetPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const schema = z.object({
    token: z.string().min(1, t('auth.validation.tokenRequired')),
    new_password: z.string().min(8, t('auth.validation.passwordMin')),
  });
  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    setSuccessMsg(null);
    try {
      await apiRequest('/v1/auth/reset-password', {
        method: 'POST',
        body: values,
        skipAuthRefresh: true,
      });
      setSuccessMsg(t('auth.resetSuccess'));
    } catch (err) {
      setServerError(getFriendlyErrorMessage(err, t));
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="max-w-md w-full space-y-6">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-display font-bold text-fg">{t('auth.resetTitle')}</h1>
          <p className="text-sm text-fg-muted">{t('auth.resetSubtitle')}</p>
        </div>

        {serverError ? (
          <div role="alert" className="p-3 rounded-md border border-danger/40 bg-danger/5 text-xs font-medium text-danger">
            {serverError}
          </div>
        ) : null}

        {successMsg ? (
          <div role="status" className="p-3 rounded-md border border-success/40 bg-success/5 text-xs font-medium text-fg">
            {successMsg}
          </div>
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input
            label={t('auth.resetTokenLabel')}
            type="text"
            error={errors.token?.message}
            {...register('token')}
          />
          <Input
            label={t('auth.newPasswordLabel')}
            type="password"
            error={errors.new_password?.message}
            {...register('new_password')}
          />
          <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
            {t('auth.resetButton')}
          </Button>
        </form>

        <div className="pt-4 border-t border-border text-xs">
          <Link to="/login" className="text-primary hover:underline">
            {t('auth.backToLogin')}
          </Link>
        </div>
      </Card>
    </div>
  );
};
