# Instructions — Setting Up & Running Frix Locally

This guide walks you through running both the **backend** (FastAPI + AI agents) and the **frontend** (Karvaan React Native app) on your local machine.

---

## Prerequisites

| Tool | Required Version | Purpose |
|---|---|---|
| **Python** | ≥ 3.12 | Backend runtime |
| **uv** | Latest | Python package manager (replaces pip/venv) |
| **Node.js** | ≥ 18.x | Frontend build toolchain |
| **npm** | ≥ 9.x | Frontend package manager |
| **Expo CLI** | (via npx) | React Native development server |
| **Git** | Latest | Version control |

### Optional

| Tool | Purpose |
|---|---|
| Android Studio / Xcode | Run the mobile app on emulator/simulator |
| Expo Go (mobile app) | Run on a physical device without native build |

---

## 1. Clone the Repository

```bash
git clone https://github.com/M-Tayyab-Saleem/Frix.git
cd Frix
```

---

## 2. Backend Setup (`backend/`)

### 2.1 — Navigate to the backend directory

```bash
cd backend
```

### 2.2 — Create a `.env` file

Copy the example and fill in your API key:

```bash
# Create .env from scratch (the .gitignore excludes .env* files)
```

Your `.env` file should contain:

```env
# Required — an OpenAI-compatible API key
OPENAI_API_KEY=sk-your-key-here

# Optional — point to a different LLM provider (e.g., Gemini via OpenAI-compatible endpoint)
OPENAI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/

# Optional — override default model names
MODEL_NAME=gpt-4.1
SMALL_MODEL_NAME=gpt-4.1-mini
```

> **Using Gemini instead of OpenAI?** Set `OPENAI_BASE_URL` to Google's OpenAI-compatible endpoint and use a Gemini API key as `OPENAI_API_KEY`. Set `MODEL_NAME=gemini-2.0-flash` and `SMALL_MODEL_NAME=gemini-2.0-flash`.

### 2.3 — Install Python dependencies

```bash
uv sync
```

This creates a `.venv/` virtual environment and installs all dependencies from `pyproject.toml`.

### 2.4 — Start the FastAPI server

```bash
uv run uvicorn app.api:app --reload --host 0.0.0.0 --port 8000
```

Or equivalently:

```bash
uv run fastapi dev
```

The server starts at `http://localhost:8000`.

### 2.5 — Verify the server is running

```bash
curl http://localhost:8000/health
```

Expected response:

```json
{"status": "ok"}
```

### 2.6 — API documentation

FastAPI auto-generates interactive API docs:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

## 3. Testing the Backend

### 3.1 — Quick smoke test (English)

```bash
curl -X POST http://localhost:8000/orchestrate \
  -H "Content-Type: application/json" \
  -d '{
    "user_prompt": "I need an AC technician in DHA Phase 6 tomorrow morning",
    "user_location": {"area": "DHA Phase 6", "city": "Karachi", "lat": 24.792, "lng": 67.0645}
  }'
```

### 3.2 — Roman Urdu test

```bash
curl -X POST http://localhost:8000/orchestrate \
  -H "Content-Type: application/json" \
  -d '{
    "user_prompt": "Mujhe kal subah DHA Phase 6 mein AC technician chahiye",
    "user_location": {"area": "DHA Phase 6", "city": "Karachi", "lat": 24.792, "lng": 67.0645}
  }'
```

### 3.3 — Urdu script test

```bash
curl -X POST http://localhost:8000/orchestrate \
  -H "Content-Type: application/json" \
  -d '{
    "user_prompt": "مجھے کل صبح ڈی ایچ اے فیز 6 میں اے سی ٹیکنیشن چاہیے",
    "user_location": {"area": "DHA Phase 6", "city": "Karachi", "lat": 24.792, "lng": 67.0645}
  }'
```

### 3.4 — Using the included test script

```bash
# Start the server first, then in a separate terminal:
uv run python test_orchestrator.py
```

### 3.5 — Expected response structure

Every successful response contains:

| Field | Type | Description |
|---|---|---|
| `intent` | `ServiceIntent` | Parsed service type, location, time window, language |
| `top_providers` | `RankedProvider[]` | Top 3 providers with scores and reasoning |
| `recommended` | `RankedProvider` | The #1 recommended provider |
| `booking` | `BookingResult` | Confirmation ID, slot, message |
| `followup` | `ReminderResult` | Reminder time, channel, message |
| `trace` | `TraceResponse` | Workflow ID and step summaries |
| `error` | `string \| null` | Error message if degraded |

---

## 4. Frontend Setup (`karvaan/`)

### 4.1 — Navigate to the frontend directory

```bash
cd karvaan
```

### 4.2 — Install Node.js dependencies

```bash
npm install
```

### 4.3 — Configure the API endpoint

The app reads the backend URL from an environment variable. Create a `.env` file in the `karvaan/` directory:

```env
# Point to your local backend
EXPO_PUBLIC_API_URL=http://localhost:8000

# Set to "true" to use mock responses without a running backend
EXPO_PUBLIC_USE_MOCK=false
```

> **No backend running?** Set `EXPO_PUBLIC_USE_MOCK=true` to use the built-in mock response. The app will simulate a 4-second delay and return hardcoded results.

### 4.4 — Start the Expo development server

```bash
npx expo start --dev-client
```

Or for web preview:

```bash
npm run web
```

### 4.5 — Run on a device or emulator

| Platform | Command |
|---|---|
| **Android** | `npm run android` (requires Android Studio + emulator) |
| **iOS** | `npm run ios` (requires Xcode + simulator, macOS only) |
| **Web** | `npm run web` (opens in browser) |

### 4.6 — Custom fonts

The app uses Noto Serif and Manrope fonts. If font files are missing from `assets/fonts/`, the app still renders but logs a warning. Download them with:

```bash
powershell -File assets/fonts/download-fonts.ps1
```

---

## 5. Running the Full Stack Together

1. **Terminal 1** — Start the backend:
   ```bash
   cd backend
   uv run uvicorn app.api:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Terminal 2** — Start the frontend:
   ```bash
   cd karvaan
   npx expo start --dev-client
   ```

3. Make sure `EXPO_PUBLIC_API_URL` points to your backend (use your machine's local IP if testing on a physical device, e.g., `http://192.168.1.100:8000`).

4. Open the app on your device/emulator/browser and submit a service request.

---

## 6. Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `OPENAI_API_KEY` | **Yes** | — | OpenAI or Gemini API key |
| `OPENAI_BASE_URL` | No | OpenAI default | Override for Gemini or other providers |
| `MODEL_NAME` | No | `gpt-4.1` | Model for IntentParser + Ranker |
| `SMALL_MODEL_NAME` | No | `gpt-4.1-mini` | Model for ProviderFinder, Booking, FollowUp |
| `HOST` | No | `127.0.0.1` | Server bind address |
| `PORT` | No | `8000` | Server port |

### Frontend (`karvaan/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `EXPO_PUBLIC_API_URL` | No | `http://localhost:8000` | Backend URL |
| `EXPO_PUBLIC_USE_MOCK` | No | `false` | Enable mock mode (no backend needed) |

---

## 7. Troubleshooting

| Issue | Solution |
|---|---|
| `uv sync` fails | Ensure Python ≥ 3.12 is installed and `uv` is up to date (`uv self update`) |
| `ModuleNotFoundError: agents` | Run commands via `uv run ...` to use the virtual environment |
| Server returns 500 | Check that `OPENAI_API_KEY` is set and valid in `backend/.env` |
| Frontend can't reach backend | Use `0.0.0.0` as host for the backend; use your local IP (not `localhost`) in `EXPO_PUBLIC_API_URL` when testing on a physical device |
| Font loading warnings | Run the font download script or set `EXPO_PUBLIC_USE_MOCK=true` to skip fonts |
| `AbortError` / timeout on frontend | The default timeout is 60 seconds; ensure the backend is responsive and the LLM API key has quota |
