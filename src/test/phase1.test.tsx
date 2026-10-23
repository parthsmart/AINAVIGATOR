import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { PreferencesProvider } from '../context/PreferencesContext';
import { ProfilePage } from '../pages/profile/ProfilePage';
import { AssessmentPage } from '../pages/assessment/AssessmentPage';
import { AssessmentResultsPage } from '../pages/assessment/AssessmentResultsPage';

function renderWithProviders(ui: React.ReactElement, initialEntries = ['/']) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return render(
    <PreferencesProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
      </QueryClientProvider>
    </PreferencesProvider>
  );
}

describe('Phase 1 — Profile, 30-Question Assessment, and Results', () => {
  it('renders ProfilePage with live completeness meter, missing sections list, and http/https link validation', async () => {
    renderWithProviders(<ProfilePage />, ['/profile']);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Alex Chen')).toBeInTheDocument();
    });

    // Initially all 8 sections are populated in mock data -> 100% complete
    expect(screen.getByText(/All profile sections are complete/i)).toBeInTheDocument();

    // Clear past work and hobbies to verify completeness meter drops and lists missing sections
    const pastWorkInput = screen.getByLabelText(/Past work, volunteering, or internship experience/i);
    fireEvent.change(pastWorkInput, { target: { value: '' } });

    await waitFor(() => {
      expect(screen.getByText(/Missing sections to improve accuracy:/i)).toBeInTheDocument();
      expect(screen.getByText(/Past work or internships/i)).toBeInTheDocument();
    });

    // Verify existing safe https record link has rel="noopener noreferrer"
    const certLink = screen.getByRole('link', { name: /NPTEL DSA Certificate/i });
    expect(certLink).toHaveAttribute('rel', 'noopener noreferrer');

    // Add a record with unsafe javascript: URL and verify Zod validation rejects it
    const urlInputs = screen.getAllByLabelText(/Verification link \(http\/https only\)/i);
    fireEvent.change(urlInputs[0], { target: { value: 'javascript:alert(1)' } });
    fireEvent.click(screen.getByRole('button', { name: /Save changes/i }));

    await waitFor(() => {
      expect(screen.getByText(/Links must start with http:\/\/ or https:\/\//i)).toBeInTheDocument();
    });

    // Fix the URL and save profile
    fireEvent.change(urlInputs[0], { target: { value: 'https://swayam.gov.in/verified-cert' } });
    fireEvent.change(pastWorkInput, { target: { value: 'Research Intern at IIT' } });
    fireEvent.click(screen.getByRole('button', { name: /Save changes/i }));

    await waitFor(() => {
      expect(screen.getByText(/Profile saved successfully/i)).toBeInTheDocument();
    });
  });

  it('handles ProfilePage error state and retry recovery', async () => {
    let shouldFail = true;
    server.use(
      http.get('*/v1/profile', () => {
        if (shouldFail) {
          return HttpResponse.json(
            { error: { code: 'SERVER_ERROR', message: 'Database unavailable' } },
            { status: 500 }
          );
        }
        return HttpResponse.json({
          user_id: '00000000-0000-0000-0000-000000000001',
          full_name: 'Recovered Student',
          education_level: 'class_11_12',
          year: 'Class 12',
          subjects_of_interest: ['Physics'],
          hobbies: ['Chess'],
          past_work: 'Science Club',
          projects: [],
          competitions: [],
          records: [],
          hours_per_day: 2,
          hours_per_week: 14,
          budget_level: 'low',
          timezone: 'Asia/Kolkata',
        });
      })
    );

    renderWithProviders(<ProfilePage />, ['/profile']);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    shouldFail = false;
    fireEvent.click(screen.getByRole('button', { name: /Try again/i }));

    await waitFor(() => {
      expect(screen.getByDisplayValue('Recovered Student')).toBeInTheDocument();
    });
  });

  it('resumes 30-question assessment draft, handles 422 MISSING_ANSWERS, autosaves remaining answers, and submits', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/assessment" element={<AssessmentPage />} />
        <Route path="/assessment/results" element={<AssessmentResultsPage />} />
      </Routes>,
      ['/assessment']
    );

    // Wait for questions and draft attempt (28 of 30 answered by default in MSW)
    await waitFor(() => {
      expect(screen.getByText(/28 of 30 questions answered/i)).toBeInTheDocument();
    });

    // Toggle to "1 at a time" mode and back to "5 per page"
    fireEvent.click(screen.getByRole('tab', { name: /1 at a time/i }));
    expect(screen.getByText(/#1 \/ 30/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: /5 per page/i }));

    // Open Review screen and attempt to submit with 2 missing answers -> triggers 422 MISSING_ANSWERS
    fireEvent.click(screen.getByRole('button', { name: /Review answers before submitting/i }));
    expect(screen.getByText(/You have 2 unanswered question\(s\)/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Submit completed assessment/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Please answer all highlighted questions before submitting \(2 missing\)/i)
      ).toBeInTheDocument();
    });

    // Jump to question #29 from review screen
    fireEvent.click(screen.getByRole('button', { name: /Answer question #29/i }));

    await waitFor(() => {
      expect(screen.getByText(/Question 29:/i)).toBeInTheDocument();
      expect(screen.getByText(/Question 30:/i)).toBeInTheDocument();
    });

    // Answer Question 29 and Question 30
    const q29Group = screen.getByRole('radiogroup', { name: /Question 29:/i });
    const q30Group = screen.getByRole('radiogroup', { name: /Question 30:/i });

    fireEvent.click(q29Group.querySelectorAll('button')[3]); // 4 · Agree
    fireEvent.click(q30Group.querySelectorAll('button')[4]); // 5 · Strongly Agree

    await waitFor(() => {
      expect(screen.getByText(/30 of 30 questions answered/i)).toBeInTheDocument();
      expect(screen.getByText(/All changes saved to draft/i)).toBeInTheDocument();
    });

    // Review and submit -> navigates to /assessment/results
    const reviewBtns = screen.getAllByRole('button', { name: /Review answers before submitting/i });
    fireEvent.click(reviewBtns[0]);

    expect(screen.getByText(/All 30 questions are answered and ready/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Submit completed assessment/i }));

    await waitFor(() => {
      expect(screen.getByText(/Your Career Interest Profile/i)).toBeInTheDocument();
    });
  });

  it('renders AssessmentResultsPage with Class 11-12 streams-first priority ordering, version history, Q&A states, XSS safety, and choose career action', async () => {
    const { container } = renderWithProviders(<AssessmentResultsPage />, ['/assessment/results']);

    await waitFor(() => {
      expect(screen.getByText(/Your Career Interest Profile/i)).toBeInTheDocument();
    });

    // Verify Holland code and guidance disclaimer
    expect(screen.getByText(/Holland RIASEC Code: IRC/i)).toBeInTheDocument();
    expect(screen.getByText(/Guidance, not a diagnosis/i)).toBeInTheDocument();

    // Default v2 is college -> Top 3 Compatible Careers appears BEFORE Recommended Streams
    const careersHeadingV2 = screen.getByRole('heading', { name: /Top 3 Compatible Careers/i });
    const streamsHeadingV2 = screen.getByRole('heading', {
      name: /Recommended Class 11–12 Streams & Subjects/i,
    });
    expect(
      careersHeadingV2.compareDocumentPosition(streamsHeadingV2) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();

    // Switch version selector to v1 (class_11_12)
    const versionSelect = screen.getByLabelText(/Attempt History \(Version\)/i);
    fireEvent.change(versionSelect, { target: { value: 'result-v1' } });

    await waitFor(() => {
      expect(screen.getByText(/Class 11–12 Baseline/i)).toBeInTheDocument();
    });

    // In v1 (class_11_12), Recommended Streams MUST appear BEFORE Top 3 Compatible Careers
    const streamsHeadingV1 = screen.getByRole('heading', {
      name: /Recommended Class 11–12 Streams & Subjects/i,
    });
    const careersHeadingV1 = screen.getByRole('heading', { name: /Top 3 Compatible Careers/i });
    expect(
      streamsHeadingV1.compareDocumentPosition(careersHeadingV1) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();

    // v1 also has ai_status === 'fallback', so verify fallback banner is shown
    expect(screen.getByText(/AI unavailable, showing a standard summary/i)).toBeInTheDocument();

    // Test "Choose this career" action
    const chooseBtns = screen.getAllByRole('button', { name: /Choose this career/i });
    fireEvent.click(chooseBtns[0]);

    await waitFor(() => {
      expect(screen.getByText(/Selected as target career/i)).toBeInTheDocument();
      expect(screen.getByText(/Target career updated in your profile/i)).toBeInTheDocument();
    });

    // Test follow-up Q&A:
    // 1. Out-of-scope question ("cricket")
    const qaInput = screen.getByPlaceholderText(/Why does Software Development Engineer/i);
    fireEvent.change(qaInput, { target: { value: 'Who will win the cricket match?' } });
    fireEvent.click(screen.getByRole('button', { name: /Ask question/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Out of scope — I can only answer vocational questions/i)
      ).toBeInTheDocument();
    });

    // 2. XSS payload question ("<img src=x onerror=alert(1)>") rendered safely as plain text
    fireEvent.change(qaInput, {
      target: { value: 'Explain <img src=x onerror=alert(1)> fit' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Ask question/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Q: Explain <img src=x onerror=alert\(1\)> fit/i)
      ).toBeInTheDocument();
    });
    expect(container.querySelector('img')).toBeNull();
  });
});
