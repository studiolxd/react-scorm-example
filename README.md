# `@studiolxd/react-scorm` — Interactive Demo

An interactive, fully working example application that demonstrates every feature of the
[`@studiolxd/react-scorm`](https://www.npmjs.com/package/@studiolxd/react-scorm) library.

Built with **React 19 + TypeScript + Vite**. Runs entirely in the browser using the library's
**mock mode** — no Learning Management System (LMS) required.

---

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## What This Demo Shows

The app has a **SCORM version switcher** in the header (1.2 / 2004). Switching versions
remounts the `ScormProvider` with the new version, resetting all state. This lets you compare
the behavior of both SCORM standards side-by-side.

### 9 Demo Sections

| Tab | Features demonstrated |
|-----|-----------------------|
| **Lifecycle** | `initialize()`, `commit()`, `terminate()`, live `ScormStatus`, `useScormAutoTerminate` |
| **Learner** | `getLearnerId()`, `getLearnerName()`, `getLaunchData()`, `getMode()`, `getCredit()`, `getEntry()`, `getMasteryScore()` |
| **Status** | `setComplete()`, `setIncomplete()`, `setPassed()`, `setFailed()`, `getCompletionStatus()`, `getSuccessStatus()` |
| **Score** | `setScore({ raw, min, max, scaled? })`, `getScore()`, `getPreferences()`, `setPreference()` |
| **Location** | `setLocation()`, `getLocation()`, `setSuspendData()`, `getSuspendData()`, `setSessionTime()`, `getTotalTime()`, `setExit()` |
| **Objectives** | `setObjective()`, `getObjective()`, `getObjectiveCount()` — form adapts to 1.2/2004 |
| **Interactions** | `recordInteraction()` via a live 4-question quiz with visual correct/incorrect feedback |
| **Comments** | `addLearnerComment()`, `getLearnerCommentCount()`, `getLmsCommentCount()` |
| **Advanced** | `getRaw()`, `setRaw()`, `setProgressMeasure()`, `setNavRequest()`, `getNavRequestValid()`, `formatScorm12Time()`, `formatScorm2004Time()` |

---

## About Mock Mode

The app uses `noLmsBehavior: 'mock'` in `ScormProvider`. This activates an in-memory SCORM
API that behaves like a real LMS — no server required. All data is stored in memory and lost
on page refresh.

```tsx
// App.tsx
<ScormProvider
  key={version}           // remounts on version change → fresh state
  version={version}       // "1.2" | "2004"
  options={{ noLmsBehavior: 'mock', debug: true }}
>
  {/* all components that call useScorm() go here */}
</ScormProvider>
```

---

## Library Overview

`@studiolxd/react-scorm` is a headless TypeScript/React SCORM runtime library.

### Core Concepts

**1. Provider + Hook**

```tsx
import { ScormProvider, useScorm } from '@studiolxd/react-scorm';

// Wrap your app (or lesson root)
function Root() {
  return (
    <ScormProvider version="2004" options={{ noLmsBehavior: 'mock' }}>
      <Lesson />
    </ScormProvider>
  );
}

// Consume anywhere inside the provider
function Lesson() {
  const { api, status } = useScorm();
  // api: IScormApi | null
  // status: ScormStatus
}
```

**2. Explicit Lifecycle**

The library never auto-initializes. You call `api.initialize()` when your lesson starts:

```tsx
useEffect(() => {
  if (!api) return;
  api.initialize();
  return () => { api.terminate(); };
}, [api]);
```

Or use the opt-in auto-terminate hook:

```tsx
import { useScormAutoTerminate } from '@studiolxd/react-scorm';

function Lesson() {
  // Auto-initializes on mount, auto-terminates on unmount/unload
  useScormAutoTerminate({ trackSessionTime: true });
}
```

**3. Result-Based Error Handling**

Every API method returns a `Result<T, ScormError>` — no thrown exceptions:

```tsx
const r = api.setScore({ raw: 85, min: 0, max: 100 });

if (r.ok) {
  console.log('Score saved');
} else {
  console.error(`SCORM error ${r.error.code}: ${r.error.message}`);
}
```

**4. Version-Agnostic API**

The same method names work for both SCORM 1.2 and 2004. The library maps to the correct
CMI paths internally:

```tsx
// Works identically for 1.2 and 2004
api.setComplete();
api.setPassed();
api.setScore({ raw: 90, min: 0, max: 100 });
api.setLocation('chapter-3');
api.setSuspendData(JSON.stringify(myState));
```

### Key API Methods

#### Lifecycle
```tsx
api.initialize()   // → Result<true, ScormError>
api.commit()       // → Result<true, ScormError>
api.terminate()    // → Result<true, ScormError>
```

#### Status
```tsx
api.setComplete()          // → Result<string, ScormError>
api.setIncomplete()        // → Result<string, ScormError>
api.setPassed()            // → Result<string, ScormError>
api.setFailed()            // → Result<string, ScormError>
api.getCompletionStatus()  // → Result<string, ScormError>
api.getSuccessStatus()     // → Result<string, ScormError>
```

#### Score
```tsx
api.setScore({ raw, min, max, scaled? })  // → Result<true, ScormError>
api.getScore()                            // → Result<ScoreData, ScormError>
```

#### Location & State
```tsx
api.setLocation(value)    // → Result<string, ScormError>
api.getLocation()         // → Result<string, ScormError>
api.setSuspendData(data)  // → Result<string, ScormError>
api.getSuspendData()      // → Result<string, ScormError>
api.setSessionTime(ms)    // → Result<string, ScormError>  (takes milliseconds)
```

#### Objectives
```tsx
api.setObjective(index, record)  // → Result<true, ScormError>
api.getObjective(index)          // → Result<ObjectiveRecord, ScormError>
api.getObjectiveCount()          // → Result<number, ScormError>
```

#### Interactions
```tsx
api.recordInteraction(index, {
  id: 'q1',
  type: 'choice',
  learnerResponse: 'A',
  correctResponses: ['A'],
  result: 'correct',
})  // → Result<true, ScormError>
```

#### Comments
```tsx
api.addLearnerComment(text, location?, timestamp?)  // → Result<true, ScormError>
api.getLearnerCommentCount()                        // → Result<number, ScormError>
```

#### Raw Escape Hatch
```tsx
api.getRaw('cmi.learner_id')          // → Result<string, ScormError>
api.setRaw('cmi.progress_measure', '0.75')  // → Result<string, ScormError>
```

#### SCORM 2004 Only
```tsx
api.setProgressMeasure(0.75)          // no-op in 1.2
api.setNavRequest('continue')
api.getNavRequestValid('continue')
```

### SCORM 1.2 vs 2004 Cheat Sheet

| Feature | SCORM 1.2 | SCORM 2004 |
|---------|-----------|------------|
| Completion + pass | Single `lesson_status` | Separate `completion_status` + `success_status` |
| Scaled score | Not available | `cmi.score.scaled` (-1 to 1) |
| Suspend data max | 4,096 chars | 64,000 chars |
| Session time format | `HH:MM:SS.SS` | `PT#H#M#S` (ISO 8601) |
| Progress measure | Not available | `cmi.progress_measure` (0–1) |
| Navigation | Not available | ADL nav requests |
| Comments | Single string | Indexed array with location + timestamp |
| Learner ID path | `cmi.core.student_id` | `cmi.learner_id` |

---

## Project Structure

```
src/
├── main.tsx                   # Vite entry point (standard)
├── App.tsx                    # Version switcher + ScormProvider + tab navigation
├── App.css                    # Dark design system (CSS custom properties)
├── index.css                  # Global reset + IBM Plex font import
└── sections/
    ├── LifecycleSection.tsx   # initialize / commit / terminate
    ├── LearnerSection.tsx     # learner info + course metadata
    ├── StatusSection.tsx      # completion + success status
    ├── ScoreSection.tsx       # score reporting + preferences
    ├── LocationSection.tsx    # bookmark + suspend data + session time
    ├── ObjectivesSection.tsx  # SCORM objectives
    ├── InteractionsSection.tsx # quiz interactions
    ├── CommentsSection.tsx    # learner + LMS comments
    └── AdvancedSection.tsx    # raw API + 2004 features + time utils
```

### Design System (App.css)

The app uses CSS custom properties for a consistent dark theme:

```css
--bg            /* #0a0c10 — page background */
--bg-card       /* #111318 — card background */
--accent        /* #34d399 — emerald, primary accent */
--accent-2004   /* #a78bfa — violet, SCORM 2004-only features */
--text          /* #e2e8f0 — primary text */
--text-muted    /* #64748b — secondary text */
--font-ui       /* IBM Plex Sans */
--font-mono     /* IBM Plex Mono */
```

Reusable CSS classes: `.section`, `.feature-block`, `.controls`, `.field`, `.field-input`,
`.btn`, `.btn-primary`, `.btn-danger`, `.result.ok`, `.result.error`, `.badge-12`, `.badge-2004`,
`.status-grid`, `.status-item`, `.note`, `details.code-details`.

---

## CI

GitHub Actions runs on every PR and push to `main`:

```yaml
# .github/workflows/ci.yml
- npm run lint    # ESLint
- npm run build   # TypeScript check (tsc -b) + Vite build
```

---

## License

MIT — see [LICENSE](./LICENSE).
