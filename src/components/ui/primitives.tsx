import React, { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isSafeHttpUrl } from '../../utils/security';
import type { AiFieldStatus } from '../../hooks/usePollAiStatus';

// 1. Button (44px minimum touch target, visible focus ring, reduced-motion safe)
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading = false, className = '', children, disabled, ...props }, ref) => {
    const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
      primary: 'bg-primary text-primary-fg hover:opacity-95 focus-visible:ring-primary',
      secondary: 'bg-surface border border-border text-fg hover:bg-surface-muted focus-visible:ring-primary',
      ghost: 'bg-transparent text-fg hover:bg-surface-muted focus-visible:ring-primary',
      danger: 'bg-[#B91C1C] text-white hover:opacity-95 focus-visible:ring-danger',
    };
    const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
      sm: 'px-3.5 py-2 text-xs min-h-[44px]',
      md: 'px-4 py-2.5 text-sm min-h-[44px]',
      lg: 'px-5 py-3 text-base min-h-[48px]',
    };
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap shrink-0 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <span
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
            aria-hidden="true"
          />
        ) : null}
        <span>{children}</span>
      </button>
    );
  }
);
Button.displayName = 'Button';

// 2. IconButton (44x44px minimum touch target, mandatory ariaLabel)
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  ariaLabel: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  isLoading?: boolean;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ ariaLabel, variant = 'secondary', isLoading = false, className = '', children, disabled, ...props }, ref) => {
    const variants: Record<NonNullable<IconButtonProps['variant']>, string> = {
      primary: 'bg-primary text-primary-fg hover:opacity-95 focus-visible:ring-primary',
      secondary: 'bg-surface border border-border text-fg hover:bg-surface-muted focus-visible:ring-primary',
      ghost: 'bg-transparent text-fg hover:bg-surface-muted focus-visible:ring-primary',
      danger: 'bg-[#B91C1C] text-white hover:opacity-95 focus-visible:ring-danger',
    };
    return (
      <button
        ref={ref}
        type="button"
        aria-label={ariaLabel}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center rounded-md min-h-[44px] min-w-[44px] p-2.5 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <span
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
            aria-hidden="true"
          />
        ) : (
          children
        )}
      </button>
    );
  }
);
IconButton.displayName = 'IconButton';

// 3. Input (44px min height, AA placeholder & error contrast)
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className = '', ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || `input-${generatedId}`;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;
    return (
      <div className="space-y-1.5">
        <label htmlFor={inputId} className="block text-sm font-medium text-fg">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={`w-full rounded-md border px-3.5 py-2.5 text-sm bg-surface text-fg placeholder:text-fg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed ${
            error ? 'border-danger' : 'border-border'
          } ${className}`}
          {...props}
        />
        {hint && !error ? (
          <p id={hintId} className="text-xs text-fg-muted">
            {hint}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} role="alert" className="text-xs font-medium text-danger">
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = 'Input';

// 4. Textarea
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
  charCountText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, charCountText, id, className = '', rows = 3, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id || `textarea-${generatedId}`;
    const errorId = `${textareaId}-error`;
    const hintId = `${textareaId}-hint`;
    return (
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <label htmlFor={textareaId} className="block text-sm font-medium text-fg">
            {label}
          </label>
          {charCountText ? (
            <span className="text-xs font-mono tabular-nums text-fg-muted">{charCountText}</span>
          ) : null}
        </div>
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={`w-full rounded-md border px-3.5 py-2.5 text-sm bg-surface text-fg placeholder:text-fg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[88px] disabled:opacity-50 disabled:cursor-not-allowed ${
            error ? 'border-danger' : 'border-border'
          } ${className}`}
          {...props}
        />
        {hint && !error ? (
          <p id={hintId} className="text-xs text-fg-muted">
            {hint}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} role="alert" className="text-xs font-medium text-danger">
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

// 5. Select
export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
  hint?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, hint, id, className = '', ...props }, ref) => {
    const generatedId = useId();
    const selectId = id || `select-${generatedId}`;
    const errorId = `${selectId}-error`;
    const hintId = `${selectId}-hint`;
    return (
      <div className="space-y-1.5">
        <label htmlFor={selectId} className="block text-sm font-medium text-fg">
          {label}
        </label>
        <select
          ref={ref}
          id={selectId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={`w-full rounded-md border px-3.5 py-2.5 text-sm bg-surface text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed ${
            error ? 'border-danger' : 'border-border'
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {hint && !error ? (
          <p id={hintId} className="text-xs text-fg-muted">
            {hint}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} role="alert" className="text-xs font-medium text-danger">
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);
Select.displayName = 'Select';

// 6. Checkbox (44px minimum touch target row)
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  description?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error, id, className = '', ...props }, ref) => {
    const generatedId = useId();
    const checkboxId = id || `checkbox-${generatedId}`;
    const errorId = `${checkboxId}-error`;
    return (
      <div className="space-y-1">
        <label
          htmlFor={checkboxId}
          className={`flex items-center gap-3 min-h-[44px] px-3 py-2 rounded-md border bg-surface cursor-pointer select-none ${
            error ? 'border-danger' : 'border-border hover:bg-surface-muted'
          } ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        >
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            className="w-5 h-5 rounded-sm border-border text-primary focus:ring-2 focus:ring-primary shrink-0"
            {...props}
          />
          <span className="flex flex-col">
            <span className="text-sm font-medium text-fg">{label}</span>
            {description ? <span className="text-xs text-fg-muted">{description}</span> : null}
          </span>
        </label>
        {error ? (
          <p id={errorId} role="alert" className="text-xs font-medium text-danger">
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';

// 7. RadioGroup (44px touch target options)
export interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

export interface RadioGroupProps {
  label: string;
  name?: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

export const Radio: React.FC<RadioGroupProps> = ({
  label,
  options,
  value,
  onChange,
  disabled = false,
  error,
}) => {
  const generatedId = useId();
  const errorId = `radio-${generatedId}-error`;
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-fg">{label}</div>
      <div
        role="radiogroup"
        aria-label={label}
        aria-describedby={error ? errorId : undefined}
        className="space-y-2"
      >
        {options.map((opt) => {
          const isChecked = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={isChecked}
              disabled={disabled}
              onClick={() => onChange(opt.value)}
              className={`w-full flex items-center justify-between gap-3 min-h-[44px] px-3.5 py-2.5 rounded-md border text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:cursor-not-allowed ${
                isChecked
                  ? 'border-primary bg-primary text-primary-fg font-semibold'
                  : 'border-border bg-surface text-fg hover:bg-surface-muted'
              }`}
            >
              <span className="space-y-0.5">
                <span className="block text-sm">{opt.label}</span>
                {opt.description ? (
                  <span
                    className={`block text-xs ${
                      isChecked ? 'text-primary-fg' : 'text-fg-muted'
                    }`}
                  >
                    {opt.description}
                  </span>
                ) : null}
              </span>
              <span
                aria-hidden="true"
                className="font-mono text-xs tabular-nums shrink-0"
              >
                {isChecked ? '[x]' : '[ ]'}
              </span>
            </button>
          );
        })}
      </div>
      {error ? (
        <p id={errorId} role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
};

// 8a. Slider (Range control with 44px touch target and tabular value readout)
export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  unit?: string;
  error?: string;
}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ label, unit = '', error, id, min = 0, max = 100, value, className = '', ...props }, ref) => {
    const generatedId = useId();
    const sliderId = id || `slider-${generatedId}`;
    return (
      <div className={`space-y-1.5 ${className}`}>
        <div className="flex items-baseline justify-between gap-2">
          <label htmlFor={sliderId} className="text-sm font-medium text-fg">
            {label}
          </label>
          <span className="text-sm font-mono font-semibold tabular-nums text-fg">
            {value}
            {unit}
          </span>
        </div>
        <div className="flex items-center min-h-[44px]">
          <input
            ref={ref}
            id={sliderId}
            type="range"
            min={min}
            max={max}
            value={value}
            aria-invalid={Boolean(error)}
            className="w-full h-2 bg-surface-muted rounded-md appearance-none cursor-pointer accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
            {...props}
          />
        </div>
        {error ? (
          <p role="alert" className="text-xs font-medium text-danger">
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);
Slider.displayName = 'Slider';

// 8b. Likert (5-point psychometric scale without middle-dots, 44px touch targets)
export interface LikertProps {
  question: string;
  value?: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
  labels?: Record<number, string>;
}

export const Likert: React.FC<LikertProps> = ({
  question,
  value,
  onChange,
  disabled = false,
  labels,
}) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-3">
      <p className="text-base font-medium text-fg max-w-[60ch]">{question}</p>
      <div
        role="radiogroup"
        aria-label={question}
        className="grid grid-cols-1 sm:grid-cols-5 gap-2"
      >
        {[1, 2, 3, 4, 5].map((rating) => {
          const isSelected = value === rating;
          const labelText = labels?.[rating] || t(`assessment.scale.${rating}`);
          return (
            <button
              key={rating}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onChange(rating)}
              className={`px-3 py-2.5 text-xs font-medium rounded-md border text-left transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:cursor-not-allowed ${
                isSelected
                  ? 'border-primary bg-primary text-primary-fg font-semibold'
                  : 'border-border bg-surface text-fg hover:bg-surface-muted'
              }`}
            >
              {labelText}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// 9. Tabs (44px minimum touch height)
export interface TabItem {
  id: string;
  label: string;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  ariaLabel?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, ariaLabel = 'Tabs' }) => (
  <div
    role="tablist"
    aria-label={ariaLabel}
    className="inline-flex flex-wrap items-center gap-1 p-1 bg-surface-muted rounded-lg border border-border"
  >
    {tabs.map((tab) => {
      const isActive = tab.id === activeTab;
      return (
        <button
          key={tab.id}
          role="tab"
          type="button"
          disabled={tab.disabled}
          aria-selected={isActive}
          onClick={() => onChange(tab.id)}
          className={`px-3.5 py-2 text-xs font-medium rounded-md min-h-[44px] whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:cursor-not-allowed ${
            isActive ? 'bg-surface text-fg font-semibold border border-border' : 'text-fg-muted hover:text-fg'
          }`}
        >
          {tab.label}
        </button>
      );
    })}
  </div>
);

// 10. Modal / Sheet (Bottom sheet on mobile <640px, centered dialog on desktop >=640px)
export interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  variant?: 'modal' | 'sheet';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  onClose,
  children,
  variant = 'modal',
}) => {
  const { t } = useTranslation();
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className={`fixed inset-0 z-50 flex bg-black/60 ${
        variant === 'sheet'
          ? 'items-end sm:items-center justify-center p-0 sm:p-4'
          : 'items-end sm:items-center justify-center p-0 sm:p-4'
      }`}
    >
      <div className="bg-surface border border-border rounded-t-xl sm:rounded-lg max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
          <h2 id={titleId} className="text-lg font-display font-bold text-fg">
            {title}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label={t('common.close')}>
            {t('common.close')}
          </Button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export const Sheet: React.FC<Omit<ModalProps, 'variant'>> = (props) => (
  <Modal {...props} variant="sheet" />
);

// 11. Toast (Verb-matched confirmation, 44px close target)
export interface ToastProps {
  message: string | null;
  variant?: 'info' | 'success' | 'error';
  onDismiss?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, variant = 'info', onDismiss }) => {
  const { t } = useTranslation();
  if (!message) return null;
  const styles = {
    info: 'border-border bg-surface text-fg',
    success: 'border-success bg-surface text-fg',
    error: 'border-danger bg-surface text-danger',
  };
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-20 md:bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-2.5 rounded-lg border ${styles[variant]}`}
    >
      <span className="text-sm font-medium">{message}</span>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="text-xs font-medium text-fg-muted hover:text-fg underline min-h-[44px] px-2 whitespace-nowrap"
        >
          {t('common.close')}
        </button>
      ) : null}
    </div>
  );
};

// 12. Tooltip (Accessible keyboard focus + hover tooltip)
export interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();

  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span aria-describedby={open ? tooltipId : undefined}>{children}</span>
      {open ? (
        <span
          id={tooltipId}
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-40 px-3 py-1.5 rounded-md border border-border bg-surface text-xs font-medium text-fg whitespace-nowrap"
        >
          {content}
        </span>
      ) : null}
    </span>
  );
};

// 13. ProgressBar
export interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, max = 100, label }) => {
  const pct = Math.min(100, Math.max(0, Math.round((value / max) * 100)));
  return (
    <div className="space-y-1.5">
      {label ? (
        <div className="flex items-center justify-between text-xs text-fg-muted">
          <span>{label}</span>
          <span className="font-mono tabular-nums text-fg font-semibold">{pct}%</span>
        </div>
      ) : null}
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
        className="w-full h-2.5 bg-surface-muted rounded-sm overflow-hidden border border-border"
      >
        <div
          className="h-full bg-primary transition-all duration-150"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

// 14. ScoreRing (Always paired with factor breakdown & "Guidance, not a diagnosis" disclaimer)
export interface ScoreRingProps {
  score: number | null;
  label: string;
  breakdown?: Record<string, number>;
  nullFallbackText?: string;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({
  score,
  label,
  breakdown,
  nullFallbackText,
}) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm font-semibold text-fg">{label}</span>
        {score !== null && score !== undefined ? (
          <span className="text-2xl font-mono font-bold tabular-nums text-primary">
            {Math.round(score)}%
          </span>
        ) : (
          <span className="text-xs font-mono text-fg-muted">
            {nullFallbackText || t('app.notVerifiedYet')}
          </span>
        )}
      </div>
      {breakdown ? (
        <div className="space-y-1.5 pt-2 border-t border-border text-xs">
          {Object.entries(breakdown).map(([k, v]) => (
            <div key={k} className="flex items-center justify-between">
              <span className="text-fg-muted">{k}</span>
              <span className="font-mono font-medium tabular-nums text-fg">{v}%</span>
            </div>
          ))}
        </div>
      ) : null}
      <p className="text-xs text-fg-muted max-w-[60ch]">{t('app.guidanceDisclaimer')}</p>
    </div>
  );
};

// 15. Chip (44px touch target when interactive; safe http/https link with rel="noopener noreferrer")
export interface ChipProps {
  label: string;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  href?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  onClick,
  active = false,
  disabled = false,
  href,
}) => {
  if (href && isSafeHttpUrl(href)) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-md border border-border bg-surface text-xs font-medium text-primary hover:underline whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <span>{label}</span>
      </a>
    );
  }
  if (onClick) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={`px-3.5 py-2 min-h-[44px] text-xs font-medium rounded-md border whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:cursor-not-allowed ${
          active
            ? 'border-primary bg-primary text-primary-fg font-semibold'
            : 'border-border bg-surface text-fg hover:bg-surface-muted'
        }`}
      >
        {label}
      </button>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-sm border border-border bg-surface-muted text-xs font-mono text-fg whitespace-nowrap">
      {label}
    </span>
  );
};

// 16. Card (Flat White Tile / Slate Coach surface with 1px border, zero drop shadow)
export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div className={`bg-surface border border-border rounded-lg p-6 ${className}`} {...props}>
    {children}
  </div>
);

// 17. Skeleton
export const Skeleton: React.FC<{ className?: string; lines?: number }> = ({
  className = 'h-5 w-full',
  lines = 1,
}) => {
  const { t } = useTranslation();
  return (
    <div role="status" aria-label={t('common.loading')} className="space-y-2.5">
      {Array.from({ length: lines }).map((_, idx) => (
        <div
          key={idx}
          className={`animate-pulse bg-surface-muted border border-border/50 rounded-md ${className}`}
        />
      ))}
    </div>
  );
};

// 18. EmptyState (Invites a clear action)
export interface EmptyStateProps {
  title?: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
}) => {
  const { t } = useTranslation();
  return (
    <div className="border border-dashed border-border bg-surface rounded-lg p-8 space-y-3">
      <h3 className="text-base font-display font-semibold text-fg">
        {title || t('common.emptyTitle')}
      </h3>
      <p className="text-sm text-fg-muted max-w-[60ch]">{description}</p>
      {actionLabel && onAction ? (
        <div className="pt-2">
          <Button variant="secondary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
};

// 19. ErrorState (States what happened and how to fix it; never apologizes)
export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ title, message, onRetry }) => {
  const { t } = useTranslation();
  return (
    <div role="alert" className="border border-danger bg-surface rounded-lg p-6 space-y-3">
      <h3 className="text-base font-display font-semibold text-danger">
        {title || t('common.errorTitle')}
      </h3>
      <p className="text-sm text-fg max-w-[60ch]">{message}</p>
      {onRetry ? (
        <div>
          <Button variant="secondary" size="sm" onClick={onRetry}>
            {t('common.retry')}
          </Button>
        </div>
      ) : null}
    </div>
  );
};

// 20. Stepper (Direction 2 Signature: Junction Route Strip [DONE] / [NOW] / [NEXT] — zero middle-dots)
export interface StepperProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (index: number) => void;
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep, onStepClick }) => (
  <ol
    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs"
    aria-label="Junction route progress"
  >
    {steps.map((step, index) => {
      const isCurrent = index === currentStep;
      const isCompleted = index < currentStep;
      const statusTag = isCompleted ? '[DONE]' : isCurrent ? '[NOW]' : '[NEXT]';
      const content = (
        <>
          <span
            className={`font-mono tabular-nums font-bold shrink-0 ${
              isCurrent
                ? 'text-milestone'
                : isCompleted
                ? 'text-success'
                : 'text-fg-muted'
            }`}
          >
            {statusTag}
          </span>
          <span className={isCurrent ? 'font-semibold text-fg' : 'text-fg-muted'}>
            {step}
          </span>
        </>
      );

      return (
        <li key={step}>
          {onStepClick ? (
            <button
              type="button"
              onClick={() => onStepClick(index)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 min-h-[44px] rounded-md border text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isCurrent
                  ? 'border-primary bg-surface'
                  : 'border-border bg-surface-muted/50 hover:bg-surface'
              }`}
            >
              {content}
            </button>
          ) : (
            <div
              className={`flex items-center gap-2.5 px-3 py-2.5 min-h-[44px] rounded-md border ${
                isCurrent ? 'border-primary bg-surface' : 'border-border bg-surface-muted/50'
              }`}
            >
              {content}
            </div>
          )}
        </li>
      );
    })}
  </ol>
);

// 21. Timeline
export interface TimelineItem {
  id: string;
  title: string;
  subtitle?: string;
  status?: 'done' | 'in_progress' | 'todo';
}

export const Timeline: React.FC<{ items: TimelineItem[] }> = ({ items }) => (
  <ol className="space-y-4 border-l-2 border-primary pl-4">
    {items.map((item) => {
      const marker =
        item.status === 'done'
          ? '[DONE]'
          : item.status === 'in_progress'
          ? '[NOW]'
          : '[NEXT]';
      return (
        <li key={item.id} className="space-y-0.5">
          <div className="flex items-center gap-2 text-sm font-medium text-fg">
            <span className="font-mono text-xs text-primary">{marker}</span>
            <span>{item.title}</span>
          </div>
          {item.subtitle ? <div className="text-xs text-fg-muted">{item.subtitle}</div> : null}
        </li>
      );
    })}
  </ol>
);

// 22. DataLabel (value + last_verified + bracketed provenance; null -> "Not verified yet"; zero middle-dots)
export interface DataLabelProps {
  label: string;
  value: string | number | null | undefined;
  lastVerifiedAt?: string | null;
  provenance?: 'test_assessed' | 'self_reported' | 'verified';
}

export const DataLabel: React.FC<DataLabelProps> = ({
  label,
  value,
  lastVerifiedAt,
  provenance,
}) => {
  const { t } = useTranslation();
  const displayValue =
    value === null || value === undefined || value === ''
      ? t('app.notVerifiedYet')
      : String(value);

  return (
    <div className="py-2 border-b border-border/60 last:border-b-0 space-y-1">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-xs font-medium text-fg-muted">{label}</span>
        <span className="text-sm font-mono font-semibold text-fg tabular-nums text-right">
          {displayValue}
        </span>
      </div>
      {provenance || lastVerifiedAt ? (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-fg-muted">
          {provenance ? (
            <span className="font-mono">[{t(`app.provenance.${provenance}`)}]</span>
          ) : (
            <span />
          )}
          {lastVerifiedAt ? (
            <span>{t('app.lastVerifiedAt', { date: lastVerifiedAt })}</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

// Alias HonestFactDisplay to DataLabel for backward compatibility across existing screens
export const HonestFactDisplay = DataLabel;

// 23. SampleDataBanner
export interface SampleDataBannerProps {
  visible?: boolean;
  message?: string;
}

export const SampleDataBanner: React.FC<SampleDataBannerProps> = ({
  visible = true,
  message,
}) => {
  const { t } = useTranslation();
  if (!visible) return null;
  return (
    <div
      role="note"
      className="border border-milestone bg-surface rounded-lg px-4 py-3 text-xs font-medium text-fg flex items-center gap-2"
    >
      <span className="font-mono font-bold text-milestone">[DRAFT]</span>
      <span>{message || t('app.sampleDataBanner')}</span>
    </div>
  );
};

// 24. Pagination (44px touch targets, accessible navigation)
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const { t } = useTranslation();
  if (totalPages <= 1) return null;
  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between gap-4 pt-4 border-t border-border"
    >
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        {t('common.back')}
      </Button>
      <span className="text-xs font-mono tabular-nums text-fg">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        {t('common.continue')}
      </Button>
    </nav>
  );
};

// Supporting global banners: OfflineBanner & AiStatusBlock
export const OfflineBanner: React.FC<{ isOffline: boolean }> = ({ isOffline }) => {
  const { t } = useTranslation();
  if (!isOffline) return null;
  return (
    <div
      role="status"
      className="bg-surface border-b border-milestone px-4 py-2.5 text-xs font-medium text-fg text-center"
    >
      {t('app.offlineBanner')}
    </div>
  );
};

export const AiStatusBlock: React.FC<{ status: AiFieldStatus; text: string }> = ({
  status,
  text,
}) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-2 max-w-[60ch]">
      {status === 'pending' ? (
        <p className="text-xs text-fg-muted animate-pulse">{t('app.aiPendingNote')}</p>
      ) : null}
      {status === 'fallback' ? (
        <p role="note" className="text-xs font-medium text-milestone">
          {t('app.aiFallbackBanner')}
        </p>
      ) : null}
      <p className="text-sm text-fg leading-relaxed">{text}</p>
    </div>
  );
};
