# 🌸 BLOOM — A Learning Companion That Grows With A Girl

> **Tagline:** *"A learning companion that grows with a girl."*  
> **Target Audience:** Young girls aged 10–15 and first-time learners.

BLOOM is a mobile-first Progressive Web Application (PWA) designed to demystify puberty, first periods, and menstrual cycles through friendly 2D animated lessons, interactive quizzes, cycle tracking, and safe AI insights.

---

## 🌟 Key Features

1. **3 Core Sections + Home Screen**:
   - **Before My First Period (Learn)**: 4 levels covering body changes, puberty journey, hormone messengers, and the science of menstruation. Each level includes a 3-scene animated video and interactive quiz.
   - **My First Period (Prepare)**: 7 essential practical topics (what to do, pads, pad placement, changing, disposal, hygiene, and common symptoms) in English, Hindi, and Marathi.
   - **Understand My Cycle (Track + AI)**: Cycle dial, predicted next period as a DATE RANGE with irregularity notes, gentle non-diagnostic health nudges, and "Ask Bloom AI".
2. **2D Animated Girl Character (The Guide)**:
   - Consistent, warm, age-appropriate Indian girl character with twin pigtails, lovely kurta, blinking eyes, mouth movements synced to narration audio, and dynamic poses (`waving`, `pointing`, `holding-pad`, `calm`, `explaining`).
   - Prop animations for growth charts, hormone messengers, pad placement, and hygienic disposal.
3. **Multilingual (English, Hindi, Marathi)**:
   - Full 3-language switchability powered by `react-i18next`.
   - Typography powered by *Nunito* and *Noto Sans Devanagari*.
4. **Claymorphism Design System**:
   - Soft puffy 3D cards with radii of 28–36px, double soft shadows, pressed-in active states, and full dark mode.
5. **Pure TypeScript Cycle Mathematics**:
   - Deterministic mathematical functions for average cycle length, 4 phases, ovulation window, and date range spread prediction.
6. **Anthropic Claude AI Assistant with Child Safeguards**:
   - Netlify serverless function using `@anthropic-ai/sdk`.
   - Answers kept under 120 words, strictly non-diagnostic, no medicine suggestions, polite redirection for off-topic queries, and emergency safeguards with **Childline India 1098**.
   - Zero-downtime offline rule-based fallback.
7. **Privacy by Design (India DPDP Act 2023)**:
   - Parental consent verification for users under 18.
   - Guest mode (data stays on device only) + Supabase Cloud Auth.
   - "Permanently Delete My Data" right-to-erasure button.

---

## 📁 Repository Structure

```
bloom/
├── public/
│   ├── favicon.svg             # Blooming lotus SVG icon
│   ├── manifest.json           # Web App Manifest for PWA installation
│   ├── sw.js                   # Service Worker for offline asset caching
│   ├── locales/                # 100% synchronized translation JSONs
│   │   ├── en/translation.json # English dictionary
│   │   ├── hi/translation.json # Hindi dictionary
│   │   └── mr/translation.json # Marathi dictionary
│   └── audio/                  # Local narration MP3 audio directory
├── src/
│   ├── components/
│   │   ├── BloomGirl.tsx       # Reusable 2D animated girl SVG component
│   │   ├── SceneIllustrations.tsx # Topic-specific animated prop illustrations
│   │   ├── VideoPlayer.tsx     # Segmented progress player with TTS voice
│   │   ├── QuizModal.tsx       # Interactive step-by-step quiz component
│   │   ├── CycleDial.tsx       # 4-phase circular claymorphism dial
│   │   ├── CycleLogModal.tsx   # Period logging modal
│   │   ├── AskBloomAI.tsx      # Claude AI assistant with suggestions
│   │   ├── ConsentModal.tsx    # DPDP Act 2023 parental consent dialog
│   │   ├── Header.tsx          # 3-language switcher and dark mode toggle
│   │   └── BottomNav.tsx       # Mobile navigation bar
│   ├── views/
│   │   ├── HomeView.tsx        # Home dashboard with 3 numbered gradient tiles
│   │   ├── LearnView.tsx       # 4 levels of "Before My First Period"
│   │   ├── PrepareView.tsx     # 7 topics of "My First Period"
│   │   ├── CycleView.tsx       # Cycle tracker and AI insights
│   │   └── PrivacyView.tsx     # DPDP privacy and data erasure view
│   ├── utils/
│   │   ├── cycleMath.ts        # Pure TypeScript cycle calculations
│   │   ├── audioService.ts     # MP3 detection & Web Speech API fallback
│   │   ├── storage.ts          # Unified Supabase and LocalStorage layer
│   │   └── supabaseClient.ts   # Supabase client wrapper
│   └── tests/
│       ├── cycleMath.test.ts   # Unit tests for cycle math & phases
│       ├── i18nKeyParity.test.ts # Key parity test across EN, HI, MR
│       └── runAllTests.js      # All-in-one test suite runner
├── supabase/
│   └── schema.sql              # PostgreSQL schema with Row Level Security
├── netlify/
│   └── functions/
│       └── bloom-ai.ts         # Claude API serverless function
├── scripts/
│   └── generate-audio.js       # TTS script to pre-generate MP3 files
├── preview.html                # Zero-dependency standalone browser demo
├── netlify.toml                # Netlify deployment configuration
├── tailwind.config.js          # Claymorphism tokens & font configuration
└── vite.config.ts              # Vite configuration
```

---

## 🚀 Getting Started

### 1. Instant Zero-Dependency Browser Preview
Simply double-click or open **`preview.html`** in any modern web browser (Chrome, Edge, Safari, Firefox).  
It runs the full app with claymorphism styles, 2D character animations, quizzes, cycle tracker, and speech narration immediately!

### 2. Running the Full Vite + React App

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

3. Start development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## 🗄️ Supabase Setup (Click-by-Click)

1. Go to [supabase.com](https://supabase.com) and create an account or log in.
2. Click **New Project** and set a project name (e.g. `bloom-app`) and database password.
3. Once provisioned, open **SQL Editor** from the left navigation.
4. Click **New Query**, copy the contents of `supabase/schema.sql`, and click **Run**.  
   *This automatically creates the `profiles`, `cycles`, and `lesson_progress` tables, sets up Row Level Security (RLS) policies, and creates the DPDP data erasure function.*
5. Navigate to **Project Settings** → **API**:
   - Copy **Project URL** into `VITE_SUPABASE_URL` in `.env`.
   - Copy **anon public key** into `VITE_SUPABASE_ANON_KEY` in `.env`.
6. Navigate to **Authentication** → **Providers** → ensure **Email** is enabled.

---

## ☁️ Netlify Deployment (Click-by-Click)

1. Push your repository to GitHub or GitLab.
2. Log in to [netlify.com](https://netlify.com) and click **Add new site** → **Import an existing project**.
3. Select your repository.
4. Netlify will auto-detect settings from `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`
5. Click **Environment variables** and configure:
   - `ANTHROPIC_API_KEY`: Your Anthropic API Key (Claude)
   - `ANTHROPIC_MODEL`: `claude-3-5-sonnet-20241022`
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
6. Click **Deploy site**.

---

## 🧪 Testing

Run the test suite runner to verify cycle math and 100% translation key synchronization:
```bash
node src/tests/runAllTests.js
```

Run end-to-end tests with Playwright:
```bash
npx playwright test
```

---

## 🎙️ Audio Generation (Optional)

The app dynamically uses the **Web Speech API** on mobile devices to read narrations with natural female Indian voices (`hi-IN`, `mr-IN`, `en-IN`).

To pre-generate static `.mp3` files for offline deployment:
1. Set `GOOGLE_TTS_API_KEY` in `.env`.
2. Run:
   ```bash
   node scripts/generate-audio.js
   ```
This synthesizes audio files for each scene into `public/audio/{videoId}/{sceneIndex}.{lang}.mp3`.

---

## 🔍 Items Requiring Human Expert Review

Before clinical or broad public release, the following items require review by qualified human professionals:

1. **Medical Review of Health Content**:
   - Topics 3 to 7 of *My First Period* (pad placement mechanics, change intervals, disposal hygiene, bathing practices, and cramps relief) are currently marked `Needs Medical Review`. A pediatrician or adolescent gynecologist should formally review them.
2. **Native-Speaker Linguistic & Cultural Review**:
   - Hindi and Marathi translations should be reviewed by native female educators to ensure local adolescent idioms, comfort levels, and terminology resonate warmly without stigma.
3. **Legal Parental-Consent Review**:
   - The consent disclosure should undergo formal legal review by an Indian data protection attorney for alignment with notifications and rules published under the **India Digital Personal Data Protection (DPDP) Act 2023**.
