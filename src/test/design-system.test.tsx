import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axe from 'axe-core';
import { PreferencesProvider } from '../context/PreferencesContext';
import { AuthProvider } from '../context/AuthContext';
import { AppShell } from '../components/layout/AppShell';
import { DesignSystemPage } from '../pages/DesignSystemPage';

function renderDesignPage(initialEntry = '/design') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <PreferencesProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <MemoryRouter initialEntries={[initialEntry]}>
            <Routes>
              <Route element={<AppShell />}>
                <Route path="/design" element={<DesignSystemPage />} />
              </Route>
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </QueryClientProvider>
    </PreferencesProvider>
  );
}

describe('Direction 2 Design System (/design) — All 24 Components & Axe Audit', () => {
  it('renders all 24 components in filled state and transitions across loading, empty, and error states', async () => {
    renderDesignPage('/design');

    // Verify filled state and section headings
    expect(
      screen.getByRole('heading', { name: /Design System: Deccan Basalt & Metro Wayfinding/i })
    ).toBeInTheDocument();
    expect(screen.getByTestId('design-filled-state')).toBeInTheDocument();

    // Verify Responsive AppShell (Desktop sidebar + Mobile bottom navigation)
    expect(screen.getByRole('navigation', { name: /Mobile bottom navigation/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Desktop sidebar navigation/i)).toBeInTheDocument();

    // Verify Buttons & IconButtons
    expect(screen.getByRole('button', { name: 'Save profile' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Disabled button' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Bookmark career' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Disabled icon action' })).toBeDisabled();

    // Verify Input, Textarea, Select, Checkbox, Radio, Slider, Likert
    expect(screen.getByLabelText(/Student full name \(filled\)/i)).toHaveValue('Aarav Sharma');
    expect(screen.getByText(/Links must start with http:\/\/ or https:\/\//i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Project summary \(filled\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Education stage \(filled\)/i)).toHaveValue('college');
    expect(screen.getByLabelText(/Available study hours per week/i)).toHaveValue('15');
    expect(
      screen.getByRole('radiogroup', { name: /I enjoy debugging complex algorithmic problems/i })
    ).toBeInTheDocument();

    // Verify Stepper (Junction Route Strip [DONE], [NOW], [NEXT]), Timeline, Pagination
    expect(screen.getAllByText('[DONE]').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('[NOW]').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('[NEXT]').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Page 2 of 5')).toBeInTheDocument();

    // Verify DataLabel, ScoreRing, SampleDataBanner
    expect(screen.getByText('[DRAFT]')).toBeInTheDocument();
    expect(screen.getByText('[Test assessed]')).toBeInTheDocument();
    expect(screen.getByText('[Self-reported]')).toBeInTheDocument();
    expect(screen.getAllByText(/Not verified yet/i).length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText(/Guidance, not a diagnosis/i).length).toBeGreaterThanOrEqual(2);

    // Verify Tooltip on focus
    const tooltipTrigger = screen.getByRole('button', { name: /Hover or focus for tooltip/i });
    fireEvent.focus(tooltipTrigger.parentElement!);
    expect(screen.getByRole('tooltip')).toHaveTextContent(
      /Scores reflect current responses, not a fixed diagnosis/i
    );

    // Verify Modal and Sheet open/close
    fireEvent.click(screen.getByRole('button', { name: /Open modal \/ sheet/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Confirm schedule replan/i)).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    fireEvent.click(screen.getByRole('button', { name: /Open mobile sheet/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Apply filters/i }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    // Verify Verb-Matched Toast ("Save preference" -> "Preference saved.")
    fireEvent.click(screen.getByRole('button', { name: /Save preference/i }));
    expect(screen.getByText('Preference saved.')).toBeInTheDocument();

    // Switch to Loading, Empty, and Error page states
    fireEvent.click(screen.getByRole('tab', { name: /Loading state/i }));
    expect(screen.getByTestId('design-loading-state')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /Empty state/i }));
    expect(screen.getByTestId('design-empty-state')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /Error state/i }));
    expect(screen.getByTestId('design-error-state')).toBeInTheDocument();

    // Retry from Error state restores Filled state
    fireEvent.click(screen.getByRole('button', { name: /Try again/i }));
    expect(screen.getByTestId('design-filled-state')).toBeInTheDocument();
  });

  it('passes axe accessibility audit on /design with zero violations in both Light and Dark modes', async () => {
    const { container } = renderDesignPage('/design');

    // Run axe in Light mode (disable color-contrast in jsdom only if computed style lacks canvas, or run full suite)
    const lightResults = await axe.run(container, {
      rules: {
        // jsdom does not implement canvas 2D context for axe color-contrast calculation; contrast is verified in Playwright Chromium and CSS tokens
        'color-contrast': { enabled: false },
      },
    });
    expect(lightResults.violations).toEqual([]);

    // Toggle to Dark mode and run axe again
    const themeBtns = screen.getAllByRole('button', { name: /Dark mode/i });
    fireEvent.click(themeBtns[0]);

    const darkResults = await axe.run(container, {
      rules: {
        'color-contrast': { enabled: false },
      },
    });
    expect(darkResults.violations).toEqual([]);
  });
});
