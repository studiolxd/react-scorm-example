import { useState } from 'react';
import { ScormProvider } from '@studiolxd/react-scorm';
import type { ScormVersion } from '@studiolxd/react-scorm';
import { LifecycleSection } from './sections/LifecycleSection';
import { LearnerSection } from './sections/LearnerSection';
import { StatusSection } from './sections/StatusSection';
import { ScoreSection } from './sections/ScoreSection';
import './App.css';

export const TABS = [
  { id: 'lifecycle', label: 'Lifecycle', icon: '⏻' },
  { id: 'learner', label: 'Learner', icon: '◉' },
  { id: 'status', label: 'Status', icon: '◈' },
  { id: 'score', label: 'Score', icon: '◎' },
  { id: 'location', label: 'Location', icon: '◌' },
  { id: 'objectives', label: 'Objectives', icon: '◆' },
  { id: 'interactions', label: 'Interactions', icon: '◇' },
  { id: 'comments', label: 'Comments', icon: '◫' },
  { id: 'advanced', label: 'Advanced', icon: '⟡' },
] as const;

export type TabId = (typeof TABS)[number]['id'];

interface ScormDemoShellProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

function ScormDemoShell({ activeTab, onTabChange }: ScormDemoShellProps) {
  return (
    <div className="app-body">
      <nav className="tab-nav" aria-label="Demo sections">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => onTabChange(tab.id)}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            <span className="tab-icon" aria-hidden="true">
              {tab.icon}
            </span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      <main className="tab-content" id="tab-panel">
        {activeTab === 'lifecycle' && <LifecycleSection />}
        {activeTab === 'learner' && <LearnerSection />}
        {activeTab === 'status' && <StatusSection />}
        {activeTab === 'score' && <ScoreSection />}
        {(activeTab === 'location' ||
          activeTab === 'objectives' ||
          activeTab === 'interactions' ||
          activeTab === 'comments' ||
          activeTab === 'advanced') && (
          <div className="placeholder-section">
            <div className="placeholder-badge">Coming in next PR</div>
            <p className="placeholder-text">
              <code>{activeTab}</code> section will appear here.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  const [version, setVersion] = useState<ScormVersion>('1.2');
  const [activeTab, setActiveTab] = useState<TabId>('lifecycle');

  const handleVersionChange = (v: ScormVersion) => {
    setVersion(v);
    setActiveTab('lifecycle');
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-left">
          <div className="app-logo">
            <span className="logo-bracket">[</span>
            <span className="logo-name">react-scorm</span>
            <span className="logo-bracket">]</span>
          </div>
          <span className="app-tagline">interactive demo</span>
        </div>

        <div className="app-header-right">
          <span className="version-label">SCORM version</span>
          <div className="version-toggle" role="group" aria-label="SCORM version selector">
            <button
              className={`version-btn${version === '1.2' ? ' active' : ''}`}
              onClick={() => handleVersionChange('1.2')}
              aria-pressed={version === '1.2'}
            >
              1.2
            </button>
            <button
              className={`version-btn${version === '2004' ? ' active' : ''}`}
              onClick={() => handleVersionChange('2004')}
              aria-pressed={version === '2004'}
            >
              2004
            </button>
          </div>

          <div className="mock-badge">
            <span className="mock-dot" />
            mock mode
          </div>
        </div>
      </header>

      <ScormProvider
        key={version}
        version={version}
        options={{ noLmsBehavior: 'mock', debug: true }}
      >
        <ScormDemoShell activeTab={activeTab} onTabChange={setActiveTab} />
      </ScormProvider>
    </div>
  );
}
