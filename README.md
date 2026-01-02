# Healthcare Risk Scoring System

A small TypeScript utility that fetches paginated patient data from an external API, scores patients by simple clinical risk rules, and submits an assessment summary. The implementation is resilient to common real-world API issues (rate limiting, transient 5xx errors) via retries with exponential backoff and jitter.

---

## 🔍 Features

- Fetches paginated patient records and processes them page-by-page.
- Identifies patients with fever, high overall risk, and basic data-quality issues.
- Robust API client behavior:
  - Retries up to **5** attempts for transient errors (HTTP 429, 500, 503).
  - Respects `Retry-After` header when provided.
  - Uses exponential backoff with jitter between attempts.

---

## ⚙️ Requirements

- Node.js (v18+ recommended; the repository references Node v24 in package metadata)
- npm or yarn
- TypeScript (installed via project dev/peer dependencies)

---

## 🚀 Quick start

1. Install dependencies

```bash
npm install
```

2. Create a `.env` in the project root with your API key

```ini
API_KEY=your_api_key_here
```

3. Run directly with `ts-node` (recommended for development):

```bash
npx ts-node index.ts
```

Or compile then run:

```bash
npx tsc
node index.js
```

If `API_KEY` is valid, the script will fetch patient pages, log progress, and eventually POST a results summary to `/api/submit-assessment`.

---

## 📄 Behavior details

- `fetchPatientsFromAPI` and `fetchDataFromAPI` both implement retry logic:
  - `retryCount` is set to **5**.
  - On HTTP 429, the client checks `Retry-After` (supports both seconds and HTTP-date) and waits accordingly, otherwise uses exponential backoff.
  - On HTTP 500/503 or network errors, it retries with exponential backoff plus randomized jitter to reduce thundering herd effects.
  - After exhausting retries, the function throws an error indicating failure.

- `submitResult` currently performs a single POST. If your environment may experience transient failures on submission, consider applying the same retry/backoff pattern used for fetching.

