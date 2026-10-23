import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePreferences } from '../context/PreferencesContext';
import {
  AiStatusBlock,
  Button,
  Card,
  Checkbox,
  Chip,
  DataLabel,
  EmptyState,
  ErrorState,
  IconButton,
  Input,
  Likert,
  Modal,
  Pagination,
  ProgressBar,
  Radio,
  SampleDataBanner,
  ScoreRing,
  Select,
  Sheet,
  Skeleton,
  Slider,
  Stepper,
  Tabs,
  Textarea,
  Timeline,
  Toast,
  Tooltip,
} from '../components/ui/primitives';

export const DesignSystemPage: React.FC = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme, language, setLanguage } = usePreferences();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialMode =
    (searchParams.get('state') as 'filled' | 'loading' | 'empty' | 'error') || 'filled';
  const [pageState, setPageState] = useState<'filled' | 'loading' | 'empty' | 'error'>(
    initialMode
  );

  const [inputVal, setInputVal] = useState('Aarav Sharma');
  const [textareaVal, setTextareaVal] = useState(
    'Building a distributed task scheduler in Python.'
  );
  const [selectVal, setSelectVal] = useState('college');
  const [checkedA, setCheckedA] = useState(true);
  const [checkedB, setCheckedB] = useState(false);
  const [radioVal, setRadioVal] = useState('pcm');
  const [sliderVal, setSliderVal] = useState(15);
  const [likertVal, setLikertVal] = useState<number>(4);
  const [activeTab, setActiveTab] = useState('all');
  const [stepIndex, setStepIndex] = useState(1);
  const [page, setPage] = useState(2);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleStateChange = (next: string) => {
    const mode = next as 'filled' | 'loading' | 'empty' | 'error';
    setPageState(mode);
    setSearchParams({ state: mode });
  };

  return (
    <div className="space-y-8">
      <Toast
        message={toastMsg}
        variant="success"
        onDismiss={() => setToastMsg(null)}
      />

      {/* Header & Page State / Theme / Locale Controls */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-1 max-w-[60ch]">
          <h1 className="text-2xl font-display font-bold text-fg">{t('design.title')}</h1>
          <p className="text-sm text-fg-muted">{t('design.subtitle')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Tabs
            ariaLabel={t('design.stateLabel')}
            activeTab={pageState}
            onChange={handleStateChange}
            tabs={[
              { id: 'filled', label: t('design.stateFilled') },
              { id: 'loading', label: t('design.stateLoading') },
              { id: 'empty', label: t('design.stateEmpty') },
              { id: 'error', label: t('design.stateError') },
            ]}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
          >
            {language === 'en' ? 'हिन्दी' : 'English'}
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={toggleTheme}>
            {theme === 'light' ? t('nav.themeDark') : t('nav.themeLight')}
          </Button>
        </div>
      </div>

      {/* Page-level Loading / Empty / Error / Filled states */}
      {pageState === 'loading' ? (
        <div className="space-y-6" data-testid="design-loading-state">
          <Skeleton lines={2} className="h-12 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton lines={4} className="h-28 w-full" />
            <Skeleton lines={4} className="h-28 w-full" />
          </div>
        </div>
      ) : pageState === 'empty' ? (
        <div data-testid="design-empty-state">
          <EmptyState
            description={t('design.emptyDescription')}
            actionLabel={t('design.resetView')}
            onAction={() => handleStateChange('filled')}
          />
        </div>
      ) : pageState === 'error' ? (
        <div data-testid="design-error-state">
          <ErrorState
            message={t('design.errorMessage')}
            onRetry={() => handleStateChange('filled')}
          />
        </div>
      ) : (
        <div className="space-y-8" data-testid="design-filled-state">
          {/* 01 Colour & Typography Tokens */}
          <section aria-labelledby="section-tokens" className="space-y-4">
            <h2 id="section-tokens" className="text-lg font-display font-bold text-fg">
              {t('design.tokensHeading')}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <Card className="p-4 space-y-1 bg-canvas">
                <div className="text-xs font-mono text-fg-muted">--color-canvas</div>
                <div className="text-sm font-semibold text-fg">Limestone / Basalt</div>
              </Card>
              <Card className="p-4 space-y-1 bg-surface">
                <div className="text-xs font-mono text-fg-muted">--color-surface</div>
                <div className="text-sm font-semibold text-fg">White Tile / Slate</div>
              </Card>
              <Card className="p-4 space-y-1 bg-primary text-primary-fg">
                <div className="text-xs font-mono text-primary-fg">--color-primary</div>
                <div className="text-sm font-semibold text-primary-fg">Konkan Teal</div>
              </Card>
              <Card className="p-4 space-y-1">
                <div className="text-xs font-mono text-fg-muted">--color-milestone</div>
                <div className="text-sm font-semibold text-milestone">Haldi Ochre</div>
              </Card>
              <Card className="p-4 space-y-1">
                <div className="text-xs font-mono text-fg-muted">--color-success</div>
                <div className="text-sm font-semibold text-success">Verified Signal</div>
              </Card>
              <Card className="p-4 space-y-1">
                <div className="text-xs font-mono text-fg-muted">--color-danger</div>
                <div className="text-sm font-semibold text-danger">Crimson Alert</div>
              </Card>
            </div>
          </section>

          {/* 02 Buttons, IconButtons, Chips & Tooltips */}
          <section aria-labelledby="section-buttons" className="space-y-4">
            <h2 id="section-buttons" className="text-lg font-display font-bold text-fg">
              {t('design.buttonsHeading')}
            </h2>
            <Card className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">Save profile</Button>
                <Button variant="secondary">Review answers</Button>
                <Button variant="ghost">Skip step</Button>
                <Button variant="danger">Delete draft</Button>
                <Button variant="primary" isLoading>
                  Saving profile
                </Button>
                <Button variant="secondary" disabled>
                  Disabled button
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border">
                <IconButton ariaLabel="Bookmark career" variant="primary">
                  <span className="font-mono text-xs">[+]</span>
                </IconButton>
                <IconButton ariaLabel="Filter options" variant="secondary">
                  <span className="font-mono text-xs">[=]</span>
                </IconButton>
                <IconButton ariaLabel="Close panel" variant="ghost">
                  <span className="font-mono text-xs">[x]</span>
                </IconButton>
                <IconButton ariaLabel="Remove item" variant="danger">
                  <span className="font-mono text-xs">[-]</span>
                </IconButton>
                <IconButton ariaLabel="Loading action" isLoading>
                  <span className="font-mono text-xs">[...]</span>
                </IconButton>
                <IconButton ariaLabel="Disabled icon action" disabled>
                  <span className="font-mono text-xs">[0]</span>
                </IconButton>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border">
                <Chip label="Information Technology" active onClick={() => {}} />
                <Chip label="Healthcare & Life Sciences" onClick={() => {}} />
                <Chip label="Disabled chip" disabled onClick={() => {}} />
                <Chip label="Static provenance tag" />
                <Chip label="NPTEL Portal" href="https://swayam.gov.in" />
                <Tooltip content="Scores reflect current responses, not a fixed diagnosis.">
                  <Button variant="secondary" size="sm">
                    Hover or focus for tooltip
                  </Button>
                </Tooltip>
              </div>
            </Card>
          </section>

          {/* 03 Form Controls */}
          <section aria-labelledby="section-inputs" className="space-y-4">
            <h2 id="section-inputs" className="text-lg font-display font-bold text-fg">
              {t('design.inputsHeading')}
            </h2>
            <Card className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Student full name (filled)"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  hint="Enter your name as shown on school records."
                />
                <Input
                  label="Verification URL (error state)"
                  value="ftp://invalid-link"
                  onChange={() => {}}
                  error="Links must start with http:// or https://"
                />
                <Input
                  label="Locked email (disabled)"
                  value="demo@career-navigator.io"
                  disabled
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
                <Textarea
                  label="Project summary (filled)"
                  value={textareaVal}
                  onChange={(e) => setTextareaVal(e.target.value)}
                  charCountText={`${textareaVal.length} / 500`}
                  hint="Describe what you built and the tools used."
                />
                <Textarea
                  label="Follow-up question (error state)"
                  value=""
                  onChange={() => {}}
                  error="Enter a question under 500 characters to continue."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border">
                <Select
                  label="Education stage (filled)"
                  value={selectVal}
                  onChange={(e) => setSelectVal(e.target.value)}
                  options={[
                    { value: 'class_11_12', label: 'Class 11–12 (Higher Secondary)' },
                    { value: 'college', label: 'College / Undergraduate' },
                  ]}
                />
                <Select
                  label="Stream selection (error state)"
                  value=""
                  onChange={() => {}}
                  error="Select an academic stream to continue."
                  options={[
                    { value: '', label: 'Select stream...' },
                    { value: 'pcm', label: 'Science (PCM)' },
                  ]}
                />
                <Select
                  label="Timezone (disabled)"
                  value="Asia/Kolkata"
                  disabled
                  options={[{ value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' }]}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border">
                <Checkbox
                  label="Include open-source courses"
                  description="Prioritize NPTEL and SWAYAM free tracks"
                  checked={checkedA}
                  onChange={(e) => setCheckedA(e.target.checked)}
                />
                <Checkbox
                  label="Guardian consent confirmed"
                  checked={checkedB}
                  onChange={(e) => setCheckedB(e.target.checked)}
                  error="Confirm guardian permission to proceed."
                />
                <Checkbox
                  label="Locked preference (disabled)"
                  checked
                  disabled
                  onChange={() => {}}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                <Radio
                  label="Preferred Class 11–12 stream"
                  value={radioVal}
                  onChange={setRadioVal}
                  options={[
                    {
                      value: 'pcm',
                      label: 'Science (PCM with Computer Science)',
                      description: 'Physics, Chemistry, Mathematics, Computer Science',
                    },
                    {
                      value: 'commerce',
                      label: 'Commerce with Mathematics',
                      description: 'Accountancy, Economics, Business Studies, Mathematics',
                    },
                  ]}
                />
                <div className="space-y-6">
                  <Slider
                    label="Available study hours per week"
                    min={1}
                    max={40}
                    value={sliderVal}
                    unit=" hrs/wk"
                    onChange={(e) => setSliderVal(Number(e.target.value))}
                  />
                  <Likert
                    question="I enjoy debugging complex algorithmic problems."
                    value={likertVal}
                    onChange={setLikertVal}
                  />
                </div>
              </div>
            </Card>
          </section>

          {/* 04 Navigation: Tabs, Junction Stepper, Timeline & Pagination */}
          <section aria-labelledby="section-nav" className="space-y-4">
            <h2 id="section-nav" className="text-lg font-display font-bold text-fg">
              {t('design.navigationHeading')}
            </h2>
            <Card className="space-y-6">
              <Tabs
                ariaLabel="Sample cluster tabs"
                activeTab={activeTab}
                onChange={setActiveTab}
                tabs={[
                  { id: 'all', label: 'All clusters' },
                  { id: 'it', label: 'Information Technology' },
                  { id: 'finance', label: 'Finance & Banking', disabled: true },
                ]}
              />

              <Stepper
                steps={[
                  'Basic details & education',
                  'Interests & experience',
                  'Projects & records',
                  'Schedule & budget',
                ]}
                currentStep={stepIndex}
                onStepClick={setStepIndex}
              />

              <Timeline
                items={[
                  {
                    id: 't1',
                    title: 'Phase 1: Programming Fundamentals',
                    subtitle: 'Completed Week 1–2 (11 hrs)',
                    status: 'done',
                  },
                  {
                    id: 't2',
                    title: 'Phase 2: Data Structures & Algorithms',
                    subtitle: 'Active Week 3 (12.5 usable hrs/wk)',
                    status: 'in_progress',
                  },
                  {
                    id: 't3',
                    title: 'Phase 3: Backend API Capstone',
                    subtitle: 'Scheduled Week 5–6',
                    status: 'todo',
                  },
                ]}
              />

              <Pagination
                currentPage={page}
                totalPages={5}
                onPageChange={setPage}
              />
            </Card>
          </section>

          {/* 05 Honest Data Display */}
          <section aria-labelledby="section-data" className="space-y-4">
            <h2 id="section-data" className="text-lg font-display font-bold text-fg">
              {t('design.dataHeading')}
            </h2>
            <SampleDataBanner visible />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="space-y-4">
                <ScoreRing
                  score={94}
                  label="Software Development Engineer"
                  breakdown={{
                    Investigative: 92,
                    Conventional: 78,
                    Realistic: 68,
                  }}
                />
              </Card>

              <Card className="space-y-4">
                <ScoreRing
                  score={null}
                  label="Unassessed Career Match"
                />
                <ProgressBar value={85} label="Profile data completeness" />
              </Card>

              <Card className="space-y-2">
                <DataLabel
                  label="Data Structures & Algorithms"
                  value="Advanced (88%)"
                  provenance="test_assessed"
                  lastVerifiedAt="2026-10-23"
                />
                <DataLabel
                  label="Current grade / year"
                  value="B.Tech 3rd Year"
                  provenance="self_reported"
                />
                <DataLabel
                  label="IIT Bombay closing cutoff"
                  value={null}
                />
                <AiStatusBlock
                  status="fallback"
                  text="Standard summary: Your profile aligns with structured backend engineering."
                />
              </Card>
            </div>
          </section>

          {/* 06 Overlays & States */}
          <section aria-labelledby="section-feedback" className="space-y-4">
            <h2 id="section-feedback" className="text-lg font-display font-bold text-fg">
              {t('design.feedbackHeading')}
            </h2>
            <Card className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsModalOpen(true)}
                >
                  {t('design.openModal')}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsSheetOpen(true)}
                >
                  Open mobile sheet
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => setToastMsg(t('design.toastSaved'))}
                >
                  {t('design.showToast')}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="space-y-2">
                  <div className="text-xs font-mono text-fg-muted">Skeleton state</div>
                  <Skeleton lines={3} className="h-5 w-full" />
                </Card>
                <EmptyState
                  title="No shortlisted careers yet"
                  description="Add up to 20 verified careers to compare salaries, exams, and colleges."
                  actionLabel="Explore careers"
                  onAction={() => {}}
                />
                <ErrorState
                  title="Could not load career catalog"
                  message="The request timed out on a slow connection. Check your network and try again."
                  onRetry={() => {}}
                />
              </div>
            </Card>
          </section>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        title="Confirm schedule replan"
        onClose={() => setIsModalOpen(false)}
      >
        <div className="space-y-4">
          <p className="text-sm text-fg max-w-[60ch]">
            Replanning preserves completed tasks and redistributes remaining items with a 15% buffer.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setIsModalOpen(false);
                setToastMsg('Schedule replanned.');
              }}
            >
              Replan schedule
            </Button>
          </div>
        </div>
      </Modal>

      <Sheet
        isOpen={isSheetOpen}
        title="Filter career catalog"
        onClose={() => setIsSheetOpen(false)}
      >
        <div className="space-y-4">
          <p className="text-sm text-fg">
            On mobile viewports, sheets anchor to the bottom edge for thumb reach.
          </p>
          <Button variant="primary" onClick={() => setIsSheetOpen(false)}>
            Apply filters
          </Button>
        </div>
      </Sheet>
    </div>
  );
};

export default DesignSystemPage;
