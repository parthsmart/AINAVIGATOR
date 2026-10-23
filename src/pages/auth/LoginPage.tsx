import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { ApiClientError } from '../../api/client';
import { getFriendlyErrorMessage } from '../../utils/security';
import { Button, Card, Input } from '../../components/ui/primitives';

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [retryAfter, setRetryAfter] = useState<number>(0);

  const loginSchema = z.object({
    email: z.string().email(t('auth.validation.emailInvalid')),
    password: z.string().min(8, t('auth.validation.passwordMin')),
  });

  type LoginFormValues = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'demo@career-navigator.io',
      password: 'DemoAccount@2026!',
    },
  });

  useEffect(() => {
    if (retryAfter <= 0) return;
    const timer = setInterval(() => {
      setRetryAfter((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [retryAfter]);

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      await login(values);
      navigate('/dashboard');
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 422 && Object.keys(err.fieldErrors).length > 0) {
          Object.entries(err.fieldErrors).forEach(([field, msg]) => {
            if (field === 'email' || field === 'password') {
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
          <h1 className="text-2xl font-display font-bold text-fg">{t('auth.loginTitle')}</h1>
          <p className="text-sm text-fg-muted">{t('auth.loginSubtitle')}</p>
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
            autoComplete="current-password"
            placeholder={t('auth.passwordPlaceholder')}
            error={errors.password?.message}
            {...register('password')}
          />

          <div className="flex items-center justify-between text-xs">
            <Link to="/forgot-password" className="text-primary hover:underline">
              {t('auth.forgotLink')}
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isSubmitting}
            disabled={retryAfter > 0}
          >
            {retryAfter > 0 ? t('common.rateLimited', { seconds: retryAfter }) : t('auth.loginButton')}
          </Button>
        </form>

        <div className="pt-4 border-t border-border text-xs text-fg-muted flex items-center justify-between">
          <span>{t('auth.noAccount')}</span>
          <Link to="/signup" className="font-medium text-primary hover:underline">
            {t('auth.signupButton')}
          </Link>
        </div>
      </Card>
    </div>
  );
};
