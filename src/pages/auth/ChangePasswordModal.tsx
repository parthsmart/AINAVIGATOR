import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { apiRequest } from '../../api/client';
import { getFriendlyErrorMessage } from '../../utils/security';
import { Button, Input, Modal } from '../../components/ui/primitives';

export const ChangePasswordModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const schema = z.object({
    current_password: z.string().min(8, t('auth.validation.passwordMin')),
    new_password: z.string().min(8, t('auth.validation.passwordMin')),
  });
  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    setSuccessMsg(null);
    try {
      await apiRequest('/v1/auth/change-password', {
        method: 'POST',
        body: values,
      });
      setSuccessMsg(t('auth.passwordChangedSuccess'));
      reset();
    } catch (err) {
      setServerError(getFriendlyErrorMessage(err, t));
    }
  };

  return (
    <Modal isOpen={isOpen} title={t('auth.changePasswordTitle')} onClose={onClose}>
      <div className="space-y-4">
        <p className="text-xs text-fg-muted">{t('auth.changePasswordSubtitle')}</p>

        {serverError ? (
          <div role="alert" className="p-3 rounded-md border border-danger/40 text-xs text-danger">
            {serverError}
          </div>
        ) : null}

        {successMsg ? (
          <div role="status" className="p-3 rounded-md border border-success/40 text-xs text-fg">
            {successMsg}
          </div>
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input
            label={t('auth.currentPasswordLabel')}
            type="password"
            error={errors.current_password?.message}
            {...register('current_password')}
          />
          <Input
            label={t('auth.newPasswordLabel')}
            type="password"
            error={errors.new_password?.message}
            {...register('new_password')}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {t('common.save')}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
