import React from 'react';
import { Translation } from 'react-i18next';
import { Button, Card } from './ui/primitives';

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch() {
    // Intentionally never log user messages, tokens, or PII
  }

  render() {
    if (this.state.hasError) {
      return (
        <Translation>
          {(t) => (
            <div className="min-h-screen flex items-center justify-center p-6 bg-canvas text-fg">
              <Card className="max-w-md w-full space-y-4">
                <h1 className="text-lg font-display font-bold text-danger">{t('common.errorTitle')}</h1>
                <p className="text-sm text-fg-muted">{t('errors.unexpected')}</p>
                <Button
                  variant="primary"
                  onClick={() => {
                    this.setState({ hasError: false });
                  }}
                >
                  {t('common.retry')}
                </Button>
              </Card>
            </div>
          )}
        </Translation>
      );
    }

    return this.props.children;
  }
}
