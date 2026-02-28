/**
 * LifecycleSection — demonstrates the SCORM session lifecycle.
 *
 * Covers:
 *   api.initialize()  — starts the SCORM session (must be called first)
 *   api.commit()      — flushes pending data to the LMS
 *   api.terminate()   — ends the SCORM session
 *   useScormAutoTerminate() — optional hook for automatic cleanup on unmount
 *
 * Also displays the live ScormStatus object returned by useScorm().
 */
import { useScorm } from '@studiolxd/react-scorm';
import type { Result, ScormError } from '@studiolxd/react-scorm';
import { useState } from 'react';

type BoolResult = Result<true, ScormError>;

export function LifecycleSection() {
  const { api, status } = useScorm();
  const [log, setLog] = useState<string[]>([]);

  /** Append a line to the result log. */
  const addLog = (line: string) => setLog((prev) => [...prev, line]);

  /** Wrap an API call with logging. */
  const call = (label: string, fn: () => BoolResult) => {
    if (!api) { addLog('✗ api is null — ScormProvider not ready'); return; }
    const result = fn();
    if (result.ok) {
      addLog(`✓ ${label} → ${JSON.stringify(result.value)}`);
    } else {
      addLog(`✗ ${label} → ${result.error.message} (code ${result.error.code})`);
    }
  };

  return (
    <div className="section">
      <div className="section-header">
        <h2 className="section-title">Lifecycle Management</h2>
        <p className="section-description">
          Every SCORM session follows a strict lifecycle:{' '}
          <strong>Initialize → interact → Commit → Terminate</strong>. The library never
          auto-initializes; you explicitly control when the session starts and ends.
        </p>
      </div>

      {/* ── Live status ─────────────────────────────────── */}
      <div className="feature-block">
        <div className="feature-block-title">Live ScormStatus</div>
        <div className="status-grid">
          <div className="status-item">
            <span className="status-item-label">version</span>
            <span className="status-item-value">{status.version}</span>
          </div>
          <div className="status-item">
            <span className="status-item-label">apiFound</span>
            <span className={`status-item-value ${String(status.apiFound)}`}>
              {String(status.apiFound)}
            </span>
          </div>
          <div className="status-item">
            <span className="status-item-label">initialized</span>
            <span className={`status-item-value ${String(status.initialized)}`}>
              {String(status.initialized)}
            </span>
          </div>
          <div className="status-item">
            <span className="status-item-label">terminated</span>
            <span className={`status-item-value ${String(status.terminated)}`}>
              {String(status.terminated)}
            </span>
          </div>
          <div className="status-item">
            <span className="status-item-label">noLmsBehavior</span>
            <span className="status-item-value">{status.noLmsBehavior}</span>
          </div>
        </div>
      </div>

      {/* ── Manual lifecycle buttons ─────────────────────── */}
      <div className="feature-block">
        <div className="feature-block-title">Session Lifecycle</div>
        <div className="controls">
          <button
            className="btn btn-primary"
            onClick={() => call('api.initialize()', () => api!.initialize())}
            disabled={status.initialized || status.terminated}
          >
            Initialize
          </button>
          <button
            className="btn"
            onClick={() => call('api.commit()', () => api!.commit())}
            disabled={!status.initialized || status.terminated}
          >
            Commit
          </button>
          <button
            className="btn btn-danger"
            onClick={() => call('api.terminate()', () => api!.terminate())}
            disabled={!status.initialized || status.terminated}
          >
            Terminate
          </button>
          <button
            className="btn"
            onClick={() => setLog([])}
            disabled={log.length === 0}
          >
            Clear log
          </button>
        </div>

        {log.length > 0 && (
          <div className={`result ${log[log.length - 1].startsWith('✓') ? 'ok' : 'error'}`}>
            {log.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        )}

        <details className="code-details">
          <summary>Code example</summary>
          <pre>{`import { ScormProvider, useScorm } from '@studiolxd/react-scorm';

function Lesson() {
  const { api, status } = useScorm();

  const start = () => {
    const r = api!.initialize();
    if (r.ok) console.log('Session started');
    else console.error(r.error.message);
  };

  return (
    <button onClick={start} disabled={status.initialized}>
      Start lesson
    </button>
  );
}`}</pre>
        </details>
      </div>

      {/* ── Auto-terminate hook ──────────────────────────── */}
      <div className="feature-block">
        <div className="feature-block-title">
          useScormAutoTerminate{' '}
          <span className="badge badge-both">opt-in hook</span>
        </div>
        <p className="section-description">
          An alternative to manual lifecycle management: call{' '}
          <code>useScormAutoTerminate()</code> in your root lesson component and the hook
          handles <code>initialize()</code> on mount, <code>commit()</code> + <code>terminate()</code>{' '}
          on unmount, page unload (<code>beforeunload</code> / <code>pagehide</code>), and the
          Page Lifecycle <code>freeze</code> event automatically.
        </p>

        <details className="code-details" style={{ marginTop: 14 }}>
          <summary>Code example</summary>
          <pre>{`import { useScormAutoTerminate } from '@studiolxd/react-scorm';

// Drop this into your root lesson component.
// It auto-initializes, auto-commits, and auto-terminates.
function CourseContent() {
  useScormAutoTerminate({
    trackSessionTime: true,  // set cmi session time before terminate
    handleUnload: true,      // listen to beforeunload / pagehide
    handleFreeze: true,      // listen to Page Lifecycle freeze event
  });

  return <LessonContent />;
}`}</pre>
        </details>
      </div>
    </div>
  );
}
