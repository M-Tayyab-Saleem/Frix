# WINNING_STRATEGY.md — How to Score Maximum Points
## Google Antigravity Hackathon | Challenge 2

> This document exists to keep every decision aligned with what judges actually score.
> Read it when you're unsure which feature to build next.

---

## Score Breakdown & What Frontend Controls

| Criterion | Weight | What Judges Want to See | Frontend Responsibility |
|---|---|---|---|
| Antigravity Integration | 20% | Orchestration evidence, reasoning traces | **Trace timeline on AgentThinkingScreen. Trace accordion on ResultsScreen.** |
| Matching & Decision Quality | 25% | Clear ranking rationale, multi-factor scoring | **Score bars, reasoning text, "Why this ranking?" accordion** |
| Multilingual Robustness | 15% | Urdu / Roman Urdu / English all work | **Language chip auto-detection, graceful display of all scripts** |
| Scheduling, Pricing, Workflow | 15% | End-to-end booking simulation | **Execution log animation, receipt card, follow-up display** |
| Dispute Handling & Reliability | 15% | Fallback scenarios, dispute resolution | **DisputeScreen with resolution simulation** |
| Innovation & UX | 10% | Polished UI, creative use of AI | **AgentThinkingScreen design, overall visual quality** |

---

## The Five Things That Win This Hackathon

### 1. Make the AI Visible (Antigravity + Agentic Reasoning = 40% combined)

Judges are looking for evidence that AI is doing real work, not just a form with pretty results. The `AgentThinkingScreen` is where you win or lose this.

**Do:**
- Animate each agent step appearing in sequence (IntentParser → ProviderFinder → Ranker → Booking → FollowUp)
- Show actual summary text from the trace: *"Scored 8 providers. Distance weighted 40%. Ali AC Services wins at 0.93"*
- Make the screen feel like watching a command-line AI agent work

**Don't:**
- Show a spinner and jump to results
- Use a loading screen with a static "Analyzing..." message
- Hide the trace data that the backend worked hard to produce

### 2. Show the Ranking Rationale Explicitly (Matching = 25%)

Judges will specifically look for how the AI chose one provider over another.

**Do:**
- Show score bars (0–100%) for every provider
- Display the `reasoning` field verbatim from the backend
- Include an expandable "Why this ranking?" section with factor weights

**Don't:**
- Just show a list of providers sorted by score without explanation
- Say "Best Match" without justifying it

### 3. Demonstrate End-to-End Booking (Scheduling/Pricing = 15%)

The word "simulation" in the challenge means: show the execution happening, not just the result.

**Do:**
- Animate the execution log line by line (slot reserved → ID generated → provider notified → reminder scheduled)
- Show a professional receipt card with confirmation ID, slot, provider, and estimated cost
- Show the follow-up reminder scheduled

**Don't:**
- Just navigate to a "Booking Confirmed" static screen
- Skip the intermediate steps

### 4. Handle Disputes (Dispute Handling = 15%)

Most teams will miss this criterion entirely. If you build it, you instantly differentiate.

**Do:**
- Build DisputeScreen with issue type selection
- Simulate AI resolution: "Agent reviewed your case. Refund of PKR 500 issued."
- Show a "flag provider" outcome that would affect their ranking

**Don't:**
- Skip this screen (you lose 15% of the score)
- Make it a dead end with no resolution

### 5. Show Multilingual Input Working (15%)

The demo video should explicitly show all three languages.

**Do:**
- In the demo: type a Roman Urdu prompt → show `language_detected: roman_urdu` in the intent card
- Paste an Urdu prompt in Arabic script → show it renders correctly and `language_detected: urdu`
- Show the language chip updating in real time as you type

**Don't:**
- Only show English in the demo
- Show garbage characters for Urdu text

---

## Demo Video Script (Optimized for Scoring)

**[0:00–0:20] — Hook:** *"Finding a plumber in Islamabad means 10 WhatsApp messages and 2 missed calls. Watch how AI can fix that in 4 seconds."*

**[0:20–0:50] — Roman Urdu Input:**
Type: *"AC bilkul kaam nahi kar raha, kal subah G-13 mein technician chahiye"*
Show language chip update to ROMAN URDU in real time.
Tap "Find Service."

**[0:50–1:40] — AgentThinkingScreen:**
Let the whole animation play. Don't skip ahead. Say out loud which agent is doing what.
*"Notice the Ranker agent is now scoring 8 providers using distance, rating, and availability."*

**[1:40–2:20] — ResultsScreen:**
Tap "Why this ranking?" accordion. Show score bars. Read the reasoning text.
*"The AI chose Ali AC Services not just because it's closest — it's the combination of 4.7 rating, specialized AC repair experience, and low cancellation rate."*

**[2:20–2:50] — BookingConfirmScreen:**
Watch execution log animate. Show the confirmation ID.
*"The booking is simulated end-to-end — slot reserved, provider notified, SMS queued, reminder scheduled."*

**[2:50–3:20] — DisputeScreen:**
Navigate to My Bookings. Open the booking. Tap "Report Issue."
Select "Price Dispute." Submit. Show the AI resolution.
*"The agent reviewed the case and issued a PKR 500 refund — this is the dispute workflow."*

**[3:20–3:50] — Agent Trace Logs (optional but powerful):**
Show the terminal or `logs/*.jsonl` file. Explain the trace structure.
*"Every decision is logged — from language detection confidence to provider ranking rationale."*

**[3:50–4:00] — Close:** *"End-to-end. Request to booking to dispute resolution. All agentic."*

---

## What to Cut If You Run Out of Time

**NEVER cut:**
- AgentThinkingScreen animation
- Score bars + reasoning on ResultsScreen
- ExecutionLog animation on BookingConfirmScreen
- DisputeScreen (even a basic version)

**Cut first if needed:**
- Voice input (cool but not scored)
- Map view (nice-to-have)
- Profile screen (judges don't care)
- Complex onboarding (a single screen is enough)
- Real location detection (hardcode G-13 as default)

---

## Common Hackathon Mistakes to Avoid

| Mistake | Why It Hurts | Fix |
|---|---|---|
| Beautiful UI, no AI reasoning visible | Fails Antigravity + Agentic criteria (40%) | Add AgentThinkingScreen and trace accordion |
| Only English in demo | Fails Multilingual criterion (15%) | Show Roman Urdu and Urdu in demo video |
| Static "Booked!" screen | Fails Simulation criterion (15%) | Build ExecutionLogView animation |
| No dispute scenario | Fails Dispute Handling (15%) | Build basic DisputeScreen |
| Backend not running during demo | Total failure | Implement mock fallback in `orchestrate()` |
| App crashes on demo device | Terrible impression | Test on real Android device, not just simulator |
| Over-engineered auth | Wastes time, zero scoring value | Keep auth minimal or bypassed |

---

## Day-Before-Submission Checklist

### Core Flow
- [ ] RequestScreen accepts text input in all 3 languages
- [ ] Language chip auto-detects correctly
- [ ] AgentThinkingScreen fires real API call and animates 5 steps
- [ ] ResultsScreen shows 3 ranked providers with score bars
- [ ] "Why this ranking?" accordion shows trace data
- [ ] BookingConfirmScreen execution log animates
- [ ] Receipt card shows confirmation ID, slot, provider, reminder time
- [ ] DisputeScreen submits and shows resolution

### Demo Readiness
- [ ] App tested on a real Android phone (not just simulator)
- [ ] Backend running and reachable from the phone (check IP, not localhost)
- [ ] Mock fallback works (`EXPO_PUBLIC_USE_MOCK=true`) as backup
- [ ] Three test prompts ready: English, Urdu, Roman Urdu
- [ ] Demo video recorded (screen record + voiceover)
- [ ] logs/*.jsonl available to show in video

### Submission
- [ ] README.md covers: architecture, Antigravity usage, API contract, assumptions
- [ ] Agent trace logs included in submission ZIP
- [ ] Demo video is 3–5 min (not shorter, not longer)
- [ ] All mock data is clearly labeled as simulated

---

## Architecture Slide Content (for README / Video)

```
User (Urdu / Roman Urdu / English)
         │
         ▼
[React Native Mobile App]
    RequestScreen ──────────────────────────►  POST /orchestrate
    AgentThinkingScreen (trace animation)  ◄── OrchestrateResponse
    ResultsScreen (ranked providers)
    BookingConfirmScreen (execution log)
    DisputeScreen (resolution flow)
         │
         ▼
[FastAPI Backend — Google Antigravity]
    Orchestrator Agent
         ├── IntentParser Agent    (multilingual NLP)
         ├── ProviderFinder Agent  (mock provider DB)
         ├── Ranker Agent          (multi-factor scoring)
         ├── Booking Agent         (confirmation simulation)
         └── FollowUp Agent        (reminder scheduling)
         │
         ▼
    JSONL Trace Logs  +  OpenAI Trace Dashboard
```
