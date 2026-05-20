# AUDIT QUICK-FIX REFERENCE
## One-line fix for every check that can fail
### Read this alongside the audit report — find your CHECK ID, apply the fix

---

## SECTION 1 — Dependencies
| Check | Fix |
|---|---|
| 1.1 | Remove the added package from package.json and delete from node_modules |
| 1.2 | Restore original version string in package.json, run `npm install` |
| 1.3 | Restore original expo SDK version in app.json |

## SECTION 2 — Karachi Migration
| Check | Fix |
|---|---|
| 2.1 | `grep -r "Islamabad\|G-13\|33\.65" src backend --include="*.ts" --include="*.tsx" --include="*.py"` then remove each match |
| 2.2 | Add more providers to MOCK_PROVIDERS until count = 40, use coordinates from karachiAreas list |
| 2.3 | Add at least 4 providers per missing category |
| 2.4 | Rename any placeholder provider names to real Pakistani business names |
| 2.5 | Update mockResponse.ts intent.location, all provider locations to Karachi areas |
| 2.6 | Create `src/constants/karachiAreas.ts` with the 20-area array from KARACHI_MIGRATION_PROMPT.md |
| 2.7 | Change fallback in orchestrator.ts to `{ area: 'DHA Phase 6', city: 'Karachi', lat: 24.7920, lng: 67.0645 }` |
| 2.8 | In `src/types/api.ts` rename `sector: string` to `area: string` in UserLocation interface, then grep for all `.sector` usages |

## SECTION 3 — Types
| Check | Fix |
|---|---|
| 3.1 | Add missing field to OrchestrateRequest in api.ts |
| 3.2 | Change `language_detected: string` to `language_detected: 'english' \| 'urdu' \| 'roman_urdu'` |
| 3.3 | Add missing field to Provider interface; change string types to number for distance_km, rating, score |
| 3.4 | Rename `confirmationId` to `confirmation_id` in BookingResult AND everywhere it's accessed |
| 3.5 | Rename `reminderAt` to `reminder_at` in FollowUpResult AND everywhere it's accessed |
| 3.6 | Rename `topProviders` to `top_providers` in OrchestrateResponse AND every access site |
| 3.7 | Replace every `: any` with the proper type |
| 3.8 | Fix navigation param: `BookingDetail: { confirmationId: string }` not `bookingId` |

## SECTION 4 — API Client
| Check | Fix |
|---|---|
| 4.1 | `const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';` |
| 4.2 | `const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';` |
| 4.3 | Add `: Promise<OrchestrateResponse>` return type to orchestrate() |
| 4.4 | Add `method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(req)` |
| 4.5 | `if (!res.ok) throw new Error(\`API error \${res.status}\`);` |
| 4.6 | Wrap getMockResponse in `return new Promise(resolve => setTimeout(() => resolve(mock), 1200))` |
| 4.7 | Add `await new Promise(r => setTimeout(r, 3500))` before returning mock (ensures animation plays) |

## SECTION 5 — Navigation
| Check | Fix |
|---|---|
| 5.1 | Remove all supabase/auth imports from RootNavigator; render MainTabNavigator unconditionally |
| 5.2 | Update tab names to: Request, MyBookings, Providers, FollowUps in MainTabNavigator |
| 5.3 | Register missing screen: `<Stack.Screen name="X" component={XScreen} />` |
| 5.4 | Add `options={{ headerShown: false }}` to AgentThinking and BookingConfirm screens |
| 5.5 | Add `options={{ gestureEnabled: false }}` to AgentThinking screen |
| 5.6 | `mv src/navigation/MainNavigator.tsx src/_archive/MainNavigator.tsx` |

## SECTION 6 — AgentThinkingScreen
| Check | Fix |
|---|---|
| 6.1 | Move orchestrate() call inside `useEffect(() => { ... }, [])` |
| 6.2 | Set exact delays: 600, 1400, 2400, 3200, 3800, 4400ms |
| 6.3 | Implement dual-condition: `if (apiResponse && animationDone) navigation.replace('Results', { response: apiResponse })` |
| 6.4 | After API responds: `setStepSummaries(response.trace.steps.map(s => s.summary))` |
| 6.5 | Wrap orchestrate() in try/catch; render error card on catch; add retry and "Use demo data" buttons |
| 6.6 | Set root `<View style={{ flex: 1, backgroundColor: '#0D1117' }}>` + import LinearGradient |
| 6.7 | Add `<Text>{route.params.userPrompt}</Text>` in a styled card |
| 6.8 | Keep AGENT_STEPS names as hardcoded strings; only .summary comes from trace.steps[n] |

## SECTION 7 — RequestScreen
| Check | Fix |
|---|---|
| 7.1 | Move `setDetectedLang(detectLanguage(text))` inside the `onChangeText` handler |
| 7.2 | `<Chip active={detectedLang === 'english'} label="EN" />` for each chip |
| 7.3 | `disabled={prompt.trim().length < 5}` on the submit button |
| 7.4 | Change to `navigation.navigate('AgentThinking', {...})` (NOT replace) |
| 7.5 | Add `currentTime: new Date().toISOString()` to navigation params |
| 7.6 | Change fallback: `{ area: 'DHA Phase 6', city: 'Karachi', lat: 24.7920, lng: 67.0645 }` |
| 7.7 | `import { useUserLocation } from '@/features/map/hooks/useUserLocation'; const { coords } = useUserLocation();` |
| 7.8 | `const { recentRequests } = useOrchestratorStore(); recentRequests.map(r => <Chip ... />)` |

## SECTION 8 — ResultsScreen
| Check | Fix |
|---|---|
| 8.1 | Change to `response.top_providers.map((provider, i) => <ProviderCard key={provider.name} ... />)` |
| 8.2 | Pass `showReasoning={true}` to ProviderCard; render `<Text>{provider.reasoning}</Text>` inside card |
| 8.3 | Render `response.intent.service_type`, `.location`, `.time_window`, `.language_detected` in intent card |
| 8.4 | `const langLabel = { roman_urdu: 'Roman Urdu', urdu: 'اردو', english: 'English' }[response.intent.language_detected]` |
| 8.5 | `const confidence = response.recommended.score >= 0.8 ? 'HIGH' : score >= 0.6 ? 'MEDIUM' : 'LOW'` |
| 8.6 | `<TraceAccordion trace={response.trace} />` at bottom of ResultsScreen |
| 8.7 | `navigation.navigate('BookingConfirm', { provider: response.recommended, response })` (include full response) |
| 8.8 | Add `<TouchableOpacity onPress={() => { store.clearCurrent(); navigation.navigate('MainTabs'); }}>New Request</TouchableOpacity>` |

## SECTION 9 — ScoreBar + ProviderCard
| Check | Fix |
|---|---|
| 9.1 | Internal: `const pct = Math.round(props.score * 100);` — input is 0–1, multiply internally |
| 9.2 | `const color = score >= 0.8 ? '#0F9D58' : score >= 0.6 ? '#F9AB00' : '#D93025';` |
| 9.3 | `const width = useSharedValue(0); useEffect(() => { width.value = withTiming(score, { duration: 800 }) }, [score])` |
| 9.4 | `if (isRecommended) apply borderColor: '#F9AB00', borderWidth: 1.5; render 'AI RECOMMENDS' badge` |
| 9.5 | `<View style={styles.avatar}><Text>{provider.name[0].toUpperCase()}</Text></View>` |
| 9.6 | `<TouchableOpacity onPress={onBook}>Book Now</TouchableOpacity>` and `<TouchableOpacity onPress={onDetail}>Details</TouchableOpacity>` |

## SECTION 10 — BookingConfirmScreen
| Check | Fix |
|---|---|
| 10.1 | `import { ExecutionLogView } from '@/components/ExecutionLogView'; <ExecutionLogView steps={...} />` |
| 10.2 | Build steps: `[\`Slot reserved: \${formatSlot(response.booking.slot)}\`, \`Booking ID: \${response.booking.confirmation_id}\`, ...]` |
| 10.3 | `useEffect(() => { addBooking(response.booking); }, []);` — runs immediately on mount |
| 10.4 | `const [showReceipt, setShowReceipt] = useState(false);` → `<ExecutionLogView onComplete={() => setShowReceipt(true)} />` |
| 10.5 | `navigation.navigate('BookingDetail', { confirmationId: response.booking.confirmation_id })` |

## SECTION 11 — DisputeScreen
| Check | Fix |
|---|---|
| 11.1 | Add all 5 chips: ['No-show', 'Late Arrival', 'Quality Issue', 'Price Dispute', 'Other'] |
| 11.2 | `disabled={selectedIssue === null}` on Submit button |
| 11.3 | `<Text>...flagged {route.params.providerName} for review...</Text>` in resolution card |
| 11.4 | `<Text>Booking: {route.params.confirmationId}</Text>` in header |
| 11.5 | `setShowReviewing(true); setTimeout(() => { setShowReviewing(false); setShowResolution(true); }, 2000);` |
| 11.6 | `<TouchableOpacity onPress={() => Alert.alert('Support', 'Agent will contact you in 24h')}>Escalate</TouchableOpacity>` |

## SECTION 12 — Location + Map
| Check | Fix |
|---|---|
| 12.1 | `import { useUserLocation } from '@/features/map/hooks/useUserLocation';` at top of RequestScreen |
| 12.2 | Create `src/utils/findNearestArea.ts` with haversineKm and findNearestArea functions |
| 12.3 | Replace screen navigation with `<Modal visible={mapModalVisible} animationType="slide">` |
| 12.4 | Set `initialRegion={{ latitude: 24.8607, longitude: 67.0099, latitudeDelta: 0.2, longitudeDelta: 0.2 }}` |
| 12.5 | Remove draggable Marker; add `position: 'absolute', centered crosshair View`; use `onRegionChangeComplete` |
| 12.6 | `setUserLocation({ area: nearest.area, city: 'Karachi', lat: pendingLocation.lat, lng: pendingLocation.lng })` |

## SECTION 13 — Voice
| Check | Fix |
|---|---|
| 13.1 | Add at minimum: `onPress={() => { setIsRecording(!isRecording); }` |
| 13.2 | Add recording state: `isRecording ? styles.micActive : styles.micIdle` with red pulsing animation |
| 13.3 | Add `// Voice approach: C (keyboard fallback via expo-av)` comment at top of voice handler |
| 13.4 | Do not add any voice package — use existing expo-av or keyboard fallback only |

## SECTION 14 — Backend
| Check | Fix |
|---|---|
| 14.1 | Add `def haversine_km(lat1, lng1, lat2, lng2): R=6371; ...` to tools.py |
| 14.2 | Verify formula: `d = haversine_km(24.792, 67.0645, 24.9197, 67.1134)` should print ~14.5 |
| 14.3 | Update `def find_providers(service_type: str, location: str, user_lat: float, user_lng: float):` |
| 14.4 | Inside find_providers loop: `p['distance_km'] = haversine_km(user_lat, user_lng, p['lat'], p['lng'])` |
| 14.5 | Add `user_lat: float` and `user_lng: float` to ServiceIntent Pydantic model in intent.py |
| 14.6 | Add to api.py: `from fastapi.middleware.cors import CORSMiddleware; app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])` |
| 14.7 | In .env: `OPENAI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/` and `MODEL_NAME=gemini-2.0-flash` |
| 14.8 | Add `'lat': 24.7920, 'lng': 67.0645` to every provider dict in mock_data.py |
| 14.9 | Check Pydantic model field names are snake_case; remove any `alias=` config that returns camelCase |
| 14.10 | Verify all 5 agents are in orchestrator.py handoff list |

## SECTION 15 — Colors
| Check | Fix |
|---|---|
| 15.1 | Create `src/constants/colors.ts` with the full Colors object from cursorrules.md |
| 15.2 | Replace hardcoded hex with `Colors.primary`, `Colors.agentBlue`, etc. |
| 15.3 | Move multi-property inline styles to StyleSheet.create() |
| 15.4 | Add `const styles = StyleSheet.create({})` at bottom of every screen/component file |

## SECTION 16 — Store
| Check | Fix |
|---|---|
| 16.1 | `import { create } from 'zustand';` (v5 syntax) |
| 16.2 | Change all STORAGE_KEYS values from `karvaan_*` to `servisai_*` |
| 16.3 | In addBooking: `storage.set(STORAGE_KEYS.BOOKINGS, JSON.stringify(next));` before `set({ bookings: next })` |
| 16.4 | In store init: `const saved = storage.getString(STORAGE_KEYS.BOOKINGS); const bookings = saved ? JSON.parse(saved) : [];` |
