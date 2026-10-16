import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lightweight .env file loader (no external dependencies needed)
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const raw = fs.readFileSync(envPath, 'utf8');
    raw.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
          process.env[key] = val;
        }
      }
    });
  } else {
    console.warn('[ENV] No .env file found. Creating default .env template...');
    const defaultEnv = `# Google Gemini API Key (Free at: https://aistudio.google.com/app/apikey)\nGEMINI_API_KEY=your_gemini_api_key_here\n# OpenAI ChatGPT API Key\nOPENAI_API_KEY=your_openai_api_key_here\nPORT=8080\nGEMINI_MODEL=gemini-2.5-flash\nOPENAI_MODEL=gpt-4o-mini\n`;
    fs.writeFileSync(envPath, defaultEnv, 'utf8');
  }
}

loadEnv();

const PORT = parseInt(process.env.PORT || '8080', 10);
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

// MIME types for static files
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.txt': 'text/plain; charset=utf-8'
};

// System prompt defining Bloom's identity and safety guidelines
const BLOOM_SYSTEM_PROMPT = `You are Bloom, a warm, caring, empathetic women's health and menstrual cycle assistant designed for girls and young women. You communicate like a supportive, knowledgeable older sister.

STRICT INSTRUCTIONS:
1. Language: Reply in the EXACT same language that the user writes or speaks in:
   - If the user writes/speaks in English, reply in natural, encouraging English.
   - If the user writes/speaks in Hindi, reply in natural Hindi using the Devanagari script (हिन्दी).
   - If the user writes/speaks in Marathi, reply in natural Marathi using the Devanagari script (मराठी).
2. Tone & Length: Keep answers concise (2 to 4 short, digestible paragraphs), gentle, reassuring, and completely free of confusing medical jargon.
3. Scope & Wellness: Provide general menstrual wellness, hygiene, cycle education, nutrition, and home comfort remedies only. Never provide a clinical medical diagnosis or prescribe prescription medication.
4. Doctor Referral: If the user describes severe, unbearable, or unusual pain, continuous heavy bleeding (soaking through a pad every 1 to 2 hours), high fever, or symptoms lasting over 7 days, warmly encourage them to speak with a caring doctor, healthcare provider, or a trusted parent/guardian.`;

// Call Google Gemini API
function callGeminiAPI(apiKey, payload) {
  return new Promise((resolve, reject) => {
    const { prompt, transcript, phase, cycleDay, avgCycleLength, crampsLevel, flowLevel, language, history } = payload;
    const userQuery = prompt || transcript || '';

    if (!userQuery.trim()) {
      return reject(new Error('Question prompt cannot be empty.'));
    }

    const phaseNames = ['Menstrual Phase', 'Follicular (Fresh Start) Phase', 'Ovulation (Peak Energy) Phase', 'Luteal (Slow Down) Phase'];
    const crampsDesc = ['None', 'Mild', 'Moderate', 'Severe'];
    const flowDesc = ['Low', 'Medium', 'Heavy'];

    const userCycleContext = `[User Cycle Context: Phase=${phaseNames[phase] || 'Menstrual'}, Day=${cycleDay || 1} of ${avgCycleLength || 28}, Cramps=${crampsDesc[crampsLevel] || 'Mild'}, Flow=${flowDesc[flowLevel] || 'Medium'}, Active App Language=${language || 'en'}]`;

    // Build multi-turn contents array for Gemini with strict role alternation
    const contents = [];
    let expectedRole = 'user';

    if (Array.isArray(history)) {
      for (const msg of history) {
        const text = (msg.content || msg.text || '').trim();
        if (!text) continue;
        if (text.startsWith("Hi friend! I'm Bloom") || text.startsWith("नमस्ते") || text.startsWith("नमस्कार")) continue;
        const role = (msg.role === 'user' || msg.sender === 'user') ? 'user' : 'model';

        // Skip if this is the current query that was already added to history
        if (role === 'user' && text.toLowerCase() === userQuery.toLowerCase().trim()) continue;

        if (role === expectedRole) {
          contents.push({ role, parts: [{ text }] });
          expectedRole = expectedRole === 'user' ? 'model' : 'user';
        }
      }
    }

    // Ensure the last message before current question is 'model' so appending the user question keeps alternation
    while (contents.length > 0 && contents[contents.length - 1].role === 'user') {
      contents.pop();
    }

    // Ensure the first message is 'user'
    while (contents.length > 0 && contents[0].role !== 'user') {
      contents.shift();
    }

    // Append latest user message with cycle context
    contents.push({
      role: 'user',
      parts: [
        {
          text: `${userCycleContext}\nUser Question: ${userQuery}`
        }
      ]
    });

    const geminiRequestBody = JSON.stringify({
      systemInstruction: {
        parts: [{ text: BLOOM_SYSTEM_PROMPT }]
      },
      contents: contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        topP: 0.95
      }
    });

    const primaryModel = process.env.GEMINI_MODEL || GEMINI_MODEL || 'gemini-2.5-flash';

    const sendRequest = (modelToUse) => {
      const urlPath = `/v1beta/models/${encodeURIComponent(modelToUse)}:generateContent?key=${encodeURIComponent(apiKey)}`;

      const reqOptions = {
        hostname: 'generativelanguage.googleapis.com',
        port: 443,
        path: urlPath,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(geminiRequestBody)
        }
      };

      const req = https.request(reqOptions, (res) => {
        let responseBody = '';
        res.on('data', chunk => { responseBody += chunk; });
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(responseBody);
          } catch (e) {
            return reject(new Error(`Invalid JSON response from Google Gemini API (Status ${res.statusCode}): ${responseBody.slice(0, 150)}`));
          }

          if (res.statusCode >= 200 && res.statusCode < 300) {
            const parts = parsed.candidates?.[0]?.content?.parts || [];
            let candidateText = '';
            const nonThought = parts.filter(p => !p.thought && p.text);
            if (nonThought.length > 0) {
              candidateText = nonThought.map(p => p.text).join('\n').trim();
            } else if (parts.length > 0) {
              candidateText = parts.map(p => p.text).filter(Boolean).join('\n').trim();
            }

            if (candidateText) {
              resolve(candidateText);
            } else if (parsed.promptFeedback?.blockReason) {
              reject(new Error(`Gemini response blocked: ${parsed.promptFeedback.blockReason}`));
            } else {
              reject(new Error('Gemini API returned an empty response.'));
            }
          } else if (res.statusCode === 404 && modelToUse !== 'gemini-flash-latest') {
            console.warn(`[GEMINI] Model ${modelToUse} returned 404, falling back to gemini-flash-latest...`);
            sendRequest('gemini-flash-latest');
          } else {
            const errMsg = parsed.error?.message || `Google API HTTP error ${res.statusCode}`;
            reject(new Error(errMsg));
          }
        });
      });

      req.on('error', (err) => {
        reject(new Error(`Network request to Google Gemini failed: ${err.message}`));
      });

      req.setTimeout(25000, () => {
        req.destroy();
        reject(new Error('Request to Google Gemini API timed out after 25 seconds.'));
      });

      req.write(geminiRequestBody);
      req.end();
    };

    sendRequest(primaryModel);
  });
}

// Call OpenAI ChatGPT API
function callOpenAIAPI(apiKey, payload) {
  return new Promise((resolve, reject) => {
    const { prompt, transcript, phase, cycleDay, avgCycleLength, crampsLevel, flowLevel, language, history } = payload;
    const userQuery = prompt || transcript || '';

    if (!userQuery.trim()) {
      return reject(new Error('Question prompt cannot be empty.'));
    }

    const phaseNames = ['Menstrual Phase', 'Follicular (Fresh Start) Phase', 'Ovulation (Peak Energy) Phase', 'Luteal (Slow Down) Phase'];
    const crampsDesc = ['None', 'Mild', 'Moderate', 'Severe'];
    const flowDesc = ['Low', 'Medium', 'Heavy'];
    const userCycleContext = `[User Cycle Context: Phase=${phaseNames[phase] || 'Menstrual'}, Day=${cycleDay || 1} of ${avgCycleLength || 28}, Cramps=${crampsDesc[crampsLevel] || 'Mild'}, Flow=${flowDesc[flowLevel] || 'Medium'}, Active App Language=${language || 'en'}]`;

    const messages = [
      {
        role: 'system',
        content: `${BLOOM_SYSTEM_PROMPT}\n\nCurrent User Cycle Context:\n${userCycleContext}`
      }
    ];

    if (Array.isArray(history)) {
      history.slice(-8).forEach(msg => {
        const role = (msg.role === 'user' || msg.sender === 'user') ? 'user' : 'assistant';
        const text = msg.content || msg.text || '';
        if (text) {
          messages.push({ role, content: text });
        }
      });
    }

    messages.push({ role: 'user', content: userQuery });

    const openAiRequestBody = JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: messages,
      temperature: 0.7,
      max_tokens: 800
    });

    const reqOptions = {
      hostname: 'api.openai.com',
      port: 443,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(openAiRequestBody)
      }
    };

    const req = https.request(reqOptions, (res) => {
      let responseBody = '';
      res.on('data', chunk => { responseBody += chunk; });
      res.on('end', () => {
        let parsed;
        try {
          parsed = JSON.parse(responseBody);
        } catch (e) {
          return reject(new Error(`Invalid JSON from OpenAI (Status ${res.statusCode}): ${responseBody.slice(0, 150)}`));
        }

        if (res.statusCode >= 200 && res.statusCode < 300) {
          const candidateText = parsed.choices?.[0]?.message?.content;
          if (candidateText) {
            resolve(candidateText);
          } else {
            reject(new Error('OpenAI returned an empty response.'));
          }
        } else {
          const errMsg = parsed.error?.message || `OpenAI HTTP error ${res.statusCode}`;
          reject(new Error(errMsg));
        }
      });
    });

    req.on('error', (err) => {
      reject(new Error(`Network request to OpenAI failed: ${err.message}`));
    });

    req.setTimeout(25000, () => {
      req.destroy();
      reject(new Error('Request to OpenAI API timed out after 25 seconds.'));
    });

    req.write(openAiRequestBody);
    req.end();
  });
}

// =============================================================
// BUILT-IN CYCLE-AWARE WOMEN'S HEALTH INTELLIGENCE ENGINE
// Seamlessly provides caring, medically sound, cycle-aware replies
// across 25+ health domains in English, Hindi, Hinglish, and Marathi.
// Guarantees Bloom ALWAYS provides distinct, relevant, and empathetic
// answers even when offline or without Gemini API key.
// =============================================================
function getBuiltinBloomReply(payload = {}) {
  const { prompt, transcript, phase, cycleDay, crampsLevel, flowLevel, language } = payload;
  const rawQ = (prompt || transcript || '').trim();
  const q = rawQ.toLowerCase();

  // Detect language: check explicit parameter, Devanagari characters, or Hinglish indicators
  const hasDevanagari = /[\u0900-\u097F]/.test(rawQ);
  let lang = 'en';
  if (language === 'hi' || language === 'mr') {
    lang = language;
  } else if (hasDevanagari) {
    if (/[ळ]|आहे|नाही|कसे|कधी|होतेय|पाहिजे|दुखतंय/.test(rawQ)) {
      lang = 'mr';
    } else {
      lang = 'hi';
    }
  }

  const phaseNames = {
    en: ['Menstrual Phase', 'Follicular (Fresh Start) Phase', 'Ovulation (Peak Vitality) Phase', 'Luteal (Rest & Restore) Phase'],
    hi: ['माहवारी चरण (मेंस्ट्रुअल फेज)', 'फॉलिक्युलर चरण (नई ऊर्जा)', 'ओव्यूलेशन चरण (चरम ऊर्जा)', 'लुटियल चरण (विश्राम समय)'],
    mr: ['मासिक पाळीचा टप्पा', 'फॉलिक्युलर टप्पा (नवा उत्साह)', 'ओव्ह्युलेशन टप्पा (स्त्रीबीज निर्मिती)', 'ल्युटियल टप्पा (विश्रांती काळ)']
  };

  const curDay = cycleDay || 1;
  const curPhaseIdx = (typeof phase === 'number' && phase >= 0 && phase <= 3) ? phase : 0;
  const curPhaseName = (phaseNames[lang] && phaseNames[lang][curPhaseIdx]) || phaseNames.en[curPhaseIdx];
  const isSevereCramps = crampsLevel === 3;
  const isHeavyFlow = flowLevel === 2;

  const matches = (words) => words.some(w => {
    const lw = w.toLowerCase();
    if (lw.includes(' ') || lw.length > 5 || /[\u0900-\u097F]/.test(lw)) {
      return q.includes(lw);
    }
    const reg = new RegExp(`(^|[^a-zA-Z0-9])${lw}([^a-zA-Z0-9]|$)`, 'i');
    return reg.test(q);
  });

  // 1. GREETINGS & INTRO (Checked first)
  if (matches(['who are you', 'what is bloom', 'kaun ho', 'kon aahes', 'help me', 'namaste', 'namaskar', 'नमस्ते', 'हेलो', 'कोण आहेस', 'हाय', 'kya hal', 'how are you']) || (q === 'hi' || q === 'hello' || q === 'hey')) {
    if (lang === 'hi') {
      return `नमस्ते प्यारी सहेली! मैं ब्लूम हूँ—आपकी अपनी बड़ी बहन और मेंस्ट्रुअल वेलनेस गाइड।\n\nआप चक्र के दिन ${curDay} (${curPhaseName}) पर हैं। मुझसे माहवारी, ऐंठन, खानपान, पैड्स, मूड, त्वचा, या शरीर में आने वाले किसी भी बदलाव के बारे में बेझिझक पूछें। मैं हमेशा आपकी बात सुनने और मार्गदर्शन करने के लिए यहाँ हूँ!`;
    }
    if (lang === 'mr') {
      return `नमस्कार मैत्रिणी! मी ब्लूम आहे—तुझी मोठी बहीण आणि मासिक पाळीची खास मैत्रीण.\n\nतू सध्या चक्राच्या दिवस ${curDay} (${curPhaseName}) वर आहेस. पोटदुखी, आहार, सॅनिटरी पॅड्स, मनस्थिती किंवा शरीरातील बदलांविषयी कोणताही प्रश्न मला निसंकोच विचार. मी सदैव तुझ्या मदतीसाठी हजर आहे!`;
    }
    return `Hi sweet friend! I'm Bloom—your caring big-sister guide for menstrual health and body wellness. You are currently on Day ${curDay} of your cycle (${curPhaseName}).\n\nFeel free to ask me anything about period cramps, mood swings, diet, hygiene, pads, or any changes in your growing body. I'm always right here for you!`;
  }

  // 2. GRATITUDE / THANKS
  if (matches(['thank', 'thanks', 'dhanyawad', 'shukriya', 'aabhar', 'धन्यवाद', 'शुक्रिया', 'आभार', 'accha laga', 'mast'])) {
    if (lang === 'hi') {
      return `आपका बहुत-बहुत स्वागत है सहेली! मुझे खुशी है कि मैं आपकी मदद कर सकी। अपने स्वास्थ्य का ध्यान रखें, खूब पानी पिएं और जब भी कोई सवाल या परेशानी हो, मुझसे बेझिझक पूछें!`;
    }
    if (lang === 'mr') {
      return `अगं स्वागत आहे तुझं मैत्रिणी! मला खूप आनंद झाला की मी तुला मदत करू शकले. स्वतःची छान काळजी घे आणि कधीही काही शंका असल्यास हक्काने विचार!`;
    }
    return `You are so welcome, friend! I'm so glad I could bring you some comfort and clarity today. Take gentle care of yourself, stay hydrated, and ask me whenever you need support!`;
  }

  // 3. HEADACHE / MIGRAINE (Checked before general pain)
  if (matches(['headache', 'head ache', 'migraine', 'head hurt', 'सर दर्द', 'सिर दर्द', 'सिर में दर्द', 'सर में दर्द', 'माथा', 'डोके', 'डोकेदुखी', 'sir dard', 'sar dard', 'sar me dard', 'sir me dard', 'matha dukh'])) {
    if (lang === 'hi') {
      return `सहेली, चक्र के दौरान या उससे ठीक पहले सिरदर्द होना काफी आम है। इसे 'हार्मोनल सिरदर्द' कहते हैं, जो एस्ट्रोजन हार्मोन के उतार-चढ़ाव, तनाव या पानी की कमी के कारण होता है।\n\nसिरदर्द से तुरंत राहत के आसान तरीके:\n• एक बड़ा गिलास गुनगुना पानी या नींबू पानी धीरे-धीरे पिएं—अक्सर डिहाइड्रेशन सिरदर्द का मुख्य कारण होता है।\n• माथे और गर्दन के पिछले हिस्से पर ठंडे पानी की पट्टी या आइस पैक 10-15 मिनट के लिए रखें।\n• कमरे की तेज लाइट और फोन स्क्रीन को बंद करें और 15-20 मिनट के लिए शांत कमरे में आंखें बंद करके लेटें।\n• अदरक की हल्की गुनगुनी चाय पिएं, यह सिर की नसों की सूजन को शांत करती है।\n\n⚠️ यदि सिरदर्द बहुत तेज हो, धुंधला दिखाई दे या बार-बार उल्टी आए, तो कृपया माँ को बताएं और डॉक्टर से परामर्श लें।`;
    }
    if (lang === 'mr') {
      return `मैत्रिणी, पाळीच्या दिवसांत किंवा त्याआधी डोकेदुखी (Hormonal headache) होणे अगदी सामान्य आहे. एस्ट्रोजेन हार्मोन्सचे प्रमाण बदलल्यामुळे किंवा अपुऱ्या पाण्यामुळे असे होते.\n\nडोकेदुखी कमी करण्यासाठी सोपे उपाय:\n• लगेच १-२ ग्लास कोमट पाणी किंवा लिंबू सरबत प्या.\n• कपाळावर आणि मानेवर थंड पाण्याची पट्टी १०-१५ मिनिटे ठेवा.\n• मोबाईलची स्क्रीन बंद करून अंधाऱ्या खोलीत शांत विश्रांती घ्या.\n• आल्याचा हलका चहा प्या, यामुळे डोक्याच्या नसा शांत होतात.\n\n⚠️ जर डोकेदुखी खूप असह्य असेल तर डॉक्टरांचा सल्ला नक्की घ्या.`;
    }
    return `Hormonal headaches and cycle-related migraines are very common! They happen when estrogen shifts rapidly, or from slight dehydration, stress, and lack of sleep.\n\nSoothing steps for quick relief:\n• Drink a tall glass of water or electrolyte water immediately—dehydration is the #1 trigger.\n• Place a cool, damp washcloth or cold compress across your forehead or back of your neck for 10–15 minutes.\n• Dim bright overhead lights, put screens away, and rest your eyes in a quiet room.\n• Sip warm ginger tea, which naturally eases inflammatory tension.\n\n⚠️ If a headache is unusually severe, throbbing on one side with vision spots or nausea, let a guardian know and consult a doctor.`;
  }

  // 4. BACK PAIN / LOWER BACK / SPINE (Checked before general cramps)
  if (matches(['back pain', 'backache', 'back ache', 'lower back', 'spine', 'कमर दर्द', 'कमर में दर्द', 'पीठ दर्द', 'कंबर दुखी', 'कंबर दुखणे', 'kamar dard', 'kamar me dard', 'pith dard', 'kambar'])) {
    if (lang === 'hi') {
      return `कमर के निचले हिस्से में दर्द होना चक्र के बदलावों का एक जाना-माना लक्षण है। गर्भाशय के आसपास की मांसपेशियां खिंचने और पेल्विक हिस्से में रक्तसंचार बढ़ने से कमर पर दबाव पड़ता है।\n\nकमर दर्द से राहत के बेहतरीन उपाय:\n• कमर के निचले हिस्से पर 15-20 मिनट के लिए गर्म पानी की थैली (हीटिंग पैड) लगाएं।\n• 'कैट-काउ स्ट्रेच' (Cat-Cow pose) या करवट लेकर दोनों घुटनों के बीच तकिया रखकर लेटें—इससे रीढ़ की हड्डी को तुरंत आराम मिलता है।\n• अधिक देर तक एक ही जगह झुककर न बैठें; आरामदायक सहारे वाली कुर्सी या बिस्तर का इस्तेमाल करें।\n• गुनगुने तिल या नारियल तेल से हल्की मालिश भी बहुत राहत देती है।`;
    }
    if (lang === 'mr') {
      return `पाळीच्या काळात किंवा आधी कंबर दुखणे (Lower back ache) खूप मुलींना जाणवते. गर्भाशयाच्या आकुंचनाचा ताण पाठीच्या मणक्यावर पडल्यामुळे हे होते.\n\nकंबरदुखीवर आरामदायी उपाय:\n• कंबरेवर गरम पाण्याच्या पिशवीने १५ मिनिटे शेक घ्या.\n• झोपताना दोन गुडघ्यांमध्ये उशी ठेवा, यामुळे मणक्यावरील ताण कमी होतो.\n• वाकून जास्त वेळ बसू नका, पाठीला आधार देऊन बसा.\n• हलक्या हाताने कोमट तेलाने मालिश केल्यास स्नायू शिथिल होतात.`;
    }
    return `Lower back ache is a classic cycle symptom! Prostaglandins that cause the uterus to contract radiate into the pelvic nerve pathways, creating a dull ache in your lower spine.\n\nEffective comfort steps:\n• Apply a warm heating pad across your lower back for 15–20 minutes.\n• Sleep on your side with a plush pillow between your knees to align your hips and spine.\n• Practice gentle Cat-Cow stretches or Child's Pose on a soft mat.\n• Avoid heavy lifting and slouching for long periods today.`;
  }

  // 4A. LEG PAIN / CALF PAIN / THIGH ACHE (Checked before general cramps)
  if (matches(['leg pain', 'legs ache', 'leg', 'legs', 'pair dard', 'pairo me dard', 'pair me dard', 'taang', 'tango me dard', 'pindli', 'calf', 'calves', 'thigh', 'thighs', 'पैर दर्द', 'पैरों में दर्द', 'टांगों में दर्द', 'पिंडलियों में दर्द', 'पाय दुखणे', 'पायात वेदना', 'मांडी दुखणे', 'pair dukh', 'pairo me'])) {
    if (lang === 'hi') {
      return `सहेली, माहवारी के समय पैरों, जांघों और पिंडलियों में दर्द या भारीपन होना काफी आम लक्षण है। गर्भाशय में संकुचन पैदा करने वाले 'प्रोस्टाग्लैंडिन्स' रसायन पेल्विक नसों के जरिए रीढ़ और पैरों की नसों तक खिंचाव पैदा करते हैं, साथ ही मैग्नीशियम का स्तर गिरने से मांसपेशियों में जकड़न होती है।\n\nपैरों के दर्द से तुरंत राहत के बेहतरीन उपाय:\n• **हल्की गुनगुनी मालिश:** सरसों, तिल या नारियल तेल को हल्का गुनगुना करके पिंडलियों और पैरों के तलवों पर 5-10 मिनट मालिश करें।\n• **पैरों को ऊपर उठाना (Legs Up):** बिस्तर पर लेटकर पैरों के नीचे 1-2 मुलायम तकिए रखें ताकि वे दिल के स्तर से थोड़े ऊपर रहें—इससे रक्तसंचार सुधरता है और भारीपन कम होता है।\n• **गर्म पानी का सेक:** पैरों पर गर्म पानी की थैली रखें या बाल्टी में गुनगुने पानी में थोड़ा सेंधा नमक डालकर 10 मिनट पैर डुबोकर रखें (Warm Foot Soak)।\n• **केला या खजूर लें:** इनमें मैग्नीशियम और पोटैशियम होता है जो मांसपेशियों की ऐंठन को रोकता है।\n\n⚠️ यदि पैर में अचानक तेज सूजन, लाली या एक तरफा असहनीय दर्द हो तो डॉक्टर को अवश्य दिखाएं।`;
    }
    if (lang === 'mr') {
      return `पाळीच्या काळात पाय, मांड्या किंवा पोटऱ्या दुखणे (Leg cramps) हे गर्भाशयाच्या आकुंचनामुळे नसांवर पडणाऱ्या ताणामुळे होते.\n\nपायदुखी कमी करण्यासाठी सोपे उपाय:\n• **कोमट तेलाने मालिश:** पायाच्या पोटऱ्यांना आणि तळव्यांना कोमट तेलाने हलकी मालिश करा.\n• **पायाखाली उशी ठेवा:** झोपताना पायाखाली १-२ उशा ठेवा, यामुळे पायांमधील सूज आणि जडपणा कमी होतो.\n• **कोमट पाण्याचा शेक:** गरम पाण्याच्या पिशवीने पायांना शेक द्या किंवा कोमट पाण्यात थोडे मीठ टाकून पाय ठेवा.\n• **केळे किंवा सुकामेवा खा:** यात पोटॅशियम असते जे स्नायूंना आराम देते.`;
    }
    return `Leg aches, calf cramps, and heavy thighs during your period are very common! The prostaglandins responsible for uterine contractions also radiate along the femoral and pelvic nerve network into your lower limbs, while temporary drops in magnesium can make muscles knot up.\n\nQuick relief for leg pain:\n• **Elevate your legs:** Place 1–2 pillows under your calves while lying down to encourage healthy circulation and relieve pooling pressure.\n• **Warm foot soak or heating pad:** Soak feet in warm water with Epsom salt, or place a warm compress across your thighs and calves for 15 minutes.\n• **Gentle oil massage:** Warm coconut or mustard oil gently massaged onto calves relaxes tight muscle fibers.\n• **Magnesium & Potassium boost:** Snack on a banana, a handful of almonds, or pumpkin seeds to relax leg muscles naturally.\n\n⚠️ If you experience sudden unilateral leg swelling, warmth, or localized redness, please consult a healthcare provider.`;
  }

  // 4B. BODY ACHE / BADAN DARD / MUSCLE PAIN (Checked before general cramps)
  if (matches(['body pain', 'body ache', 'badan dard', 'badan me dard', 'pure sharir me dard', 'muscle ache', 'whole body', 'शरीर दर्द', 'बदन दर्द', 'अंगदुखी', 'पूर्ण शरीर दुखणे', 'ang dard', 'badan'])) {
    if (lang === 'hi') {
      return `सहेली, पूरे बदन में दर्द और मांसपेशियों में जकड़न महसूस होना माहवारी के समय 'सिस्टेमिक प्रोस्टाग्लैंडिन्स' के रक्त में फैलने के कारण होता है। आपका शरीर आंतरिक नवीनीकरण के लिए काफी ऊर्जा खर्च कर रहा होता है।\n\nबदन दर्द से राहत के आरामदायक उपाय:\n• **गुनगुने पानी से स्नान:** हल्के गर्म पानी से नहाने से पूरे शरीर की नसें और मांसपेशियां तुरंत शिथिल हो जाती हैं।\n• **हल्दी वाला गुनगुना दूध:** सोने से पहले एक कप हल्दी वाला दूध पिएं—हल्दी प्राकृतिक सूजन-रोधी (Anti-inflammatory) होती है जो बदन दर्द को दूर करती है।\n• **भरपूर हाइड्रेशन:** दिन भर गुनगुना पानी या नींबू-पानी पिएं।\n• **पूरा विश्राम:** आज भारी काम या कठिन व्यायाम से बचें और 8-9 घंटे की भरपूर नींद लें।`;
    }
    if (lang === 'mr') {
      return `मासिक पाळीच्या काळात अंगदुखी किंवा सर्व अंगात वेदना होणे (Body ache) हे शरीरातील हार्मोन्सच्या बदलांमुळे होते.\n\nआराम मिळण्यासाठी उपाय:\n• **कोमट पाण्याने आंघोळ:** यामुळे संपूर्ण शरीराला आणि स्नायूंना लगेच आराम मिळतो.\n• **हळदीचे कोमट दूध:** रात्री झोपण्यापूर्वी हळदीचे दूध प्या, हे शरीरातील वेदना कमी करते.\n• **भरपूर पाणी आणि विश्रांती:** आज शरीराला ताण देणारी कामे टाळा आणि पूर्ण विश्रांती घ्या.`;
    }
    return `Full body aches and generalized muscle soreness occur because circulating prostaglandins trigger low-grade inflammatory responses as your cycle shifts.\n\nRestorative relief for body aches:\n• **Warm shower or bath:** Warm water soothes your peripheral nervous system and relaxes tension throughout all major muscle groups.\n• **Turmeric golden milk:** Sip a warm mug of milk with a pinch of turmeric and black pepper—curcumin is a powerful natural anti-inflammatory.\n• **Gentle hydration:** Sip warm water with lemon or herbal teas continuously throughout the day.\n• **Deep restorative rest:** Allow yourself 8–9 hours of sleep and step away from demanding physical chores today.`;
  }

  // 5. BREAST TENDERNESS / SORENESS / CHEST
  if (matches(['breast', 'nipple', 'tender breast', 'स्तन', 'छाती', 'छाती में दर्द', 'स्तनात वेदना', 'breast pain', 'breast sore', 'chhati me dard'])) {
    if (lang === 'hi') {
      return `माहवारी से पहले या ओव्यूलेशन के आसपास स्तनों में भारीपन, संवेदनशीलता या हल्का दर्द होना बिल्कुल सामान्य है। इसे 'साइक्लिकल मास्टैल्जिया' कहते हैं, जो प्रोजेस्टेरोन और एस्ट्रोजन हार्मोन्स के कारण दूध नलिकाओं में अस्थायी सूजन से होता है।\n\nआराम के उपाय:\n• एक आरामदायक, बिना वायर वाली कॉटन ब्रा या स्पोर्ट्स ब्रा पहनें जो अच्छा सहारा दे।\n• कैफीन (कॉफी, चाय, कोला) और ज्यादा नमक वाले चिप्स कम लें, क्योंकि ये शरीर में पानी रोकते हैं।\n• हल्के हाथ से गर्म या ठंडी सिकाई करें।\n• याद रखें: माहवारी शुरू होने के 1-2 दिन बाद यह संवेदनशीलता अपने आप ठीक हो जाती है।`;
    }
    if (lang === 'mr') {
      return `पाळी येण्यापूर्वी स्तनात जडपणा किंवा हलके दुखणे (Breast tenderness) जाणवणे अतिशय स्वाभाविक आहे. हार्मोन्सच्या वाढत्या प्रमाणामुळे हे घडते.\n\nउपाय:\n• आरामदायक, बिना वायरची सुती ब्रा वापरा.\n• चहा, कॉफी आणि जास्त खारट पदार्थ कमी खा.\n• पाळी सुरू झाल्यानंतर १-२ दिवसांत हा त्रास स्वतःहून कमी होतो.`;
    }
    return `Breast tenderness or swelling is very common, especially in the week before your period (Luteal phase) or around Ovulation! Rising progesterone causes breast tissue to temporarily hold extra fluid.\n\nWays to find relief:\n• Wear a soft, supportive wireless cotton bra or sports bra (avoid tight underwires).\n• Reduce excess sodium (chips, packaged snacks) and caffeine, which contribute to water retention.\n• Apply a warm washcloth or take a warm shower.\n• Don't worry—this tenderness naturally resolves as soon as your cycle resets.`;
  }

  // 6. NAUSEA, VOMITING & DIZZINESS / FAINTING
  if (matches(['nausea', 'vomit', 'puke', 'throw up', 'dizzy', 'dizziness', 'faint', 'lighthead', 'चक्कर', 'उल्टी', 'जी घबराना', 'घबराहट', 'मलबे', 'चकरावणे', 'उलटी', 'chakkar', 'ulti', 'ji ghabrana', 'ghabrahat', 'chakkar aana'])) {
    if (lang === 'hi') {
      return `चक्कर आना, जी मिचलाना या उल्टी महसूस होना डिहाइड्रेशन, खाली पेट रहने या माहवारी हार्मोन्स (प्रोस्टाग्लैंडिन्स) के पेट पर असर के कारण हो सकता है।\n\nतुरंत राहत के लिए:\n• यदि चक्कर आ रहे हों, तो तुरंत बैठ जाएं या लेट जाएं और पैरों को थोड़ा ऊपर उठाएं। अचानक खड़े न हों।\n• नींबू-पानी में चुटकी भर काला नमक और चीनी मिलाकर घूंट-घूंट करके पिएं।\n• अदरक का छोटा टुकड़ा चबाएं या सौंफ का पानी पिएं—यह उल्टी की भावना को शांत करता है।\n• खाली पेट न रहें; हल्का बिस्कुट, केला या टोस्ट खाएं।\n\n⚠️ यदि चक्कर के साथ बेहोशी आए या लगातार उल्टी हो, तो तुरंत डॉक्टर को दिखाएं।`;
    }
    if (lang === 'mr') {
      return `चक्कर येणे किंवा मळमळणे (Nausea & Dizziness) हे शरीरातील रक्तातील साखर कमी झाल्यामुळे किंवा हार्मोन्समुळे होऊ शकते.\n\nकाय करावे:\n• चक्कर आल्यास लगेच खाली बसा किंवा झोपा, घाईघाईने उठू नका.\n• लिंबू सरबत किंवा ग्लुकोजचे पाणी हळूहळू प्या.\n• आल्याचा तुकडा किंवा बडीशेप तोंडात ठेवा, मळमळ थांबते.\n• रिकाम्या पोटी राहू नका; हलके बिस्कीट किंवा केळे खा.\n\n⚠️ खूप जास्त चक्कर किंवा उलट्या झाल्यास डॉक्टरांना दाखवा.`;
    }
    return `Dizziness or nausea during your cycle can happen due to blood sugar dips, prostaglandins affecting the stomach, or temporary blood pressure shifts.\n\nQuick soothing steps:\n• If feeling lightheaded, sit down or lie down immediately with your feet slightly elevated. Never stand up quickly.\n• Sip cool lemonade with a pinch of salt and sugar, or coconut water, to replenish electrolytes.\n• Nibble on dry crackers, toast, or a banana to settle your tummy.\n• Chew on a small slice of fresh ginger or sip peppermint tea to combat nausea.\n\n⚠️ If dizziness leads to fainting or persistent vomiting, contact a doctor promptly.`;
  }

  // 7. WHITE DISCHARGE / VAGINAL FLUID / ITCHING
  if (matches(['discharge', 'white fluid', 'mucus', 'itching', 'burning', 'white discharge', 'डिस्चार्ज', 'सफेद पानी', 'सफेद प्रदर', 'खुजली', 'जलन', 'पांढरा स्त्राव', 'पांढरा पाणी', 'खाज', 'safed pani', 'safed pradar', 'chikna pani', 'khujli', 'jalan'])) {
    if (lang === 'hi') {
      return `साफ, पारदर्शी या हल्का सफेद स्राव (White discharge) पूरी तरह स्वस्थ और सामान्य होता है। यह योनि को प्राकृतिक रूप से साफ, नम और संक्रमण-मुक्त रखता है। ओव्यूलेशन (दिन 12-16) के समय यह कच्चे अंडे की सफेदी जैसा खिंचने वाला हो जाता है।\n\nस्वस्थ रहने के नियम:\n• हमेशा सूती (कॉटन) अंडरवियर पहनें और उसे सूखा रखें।\n• केवल सादे गुनगुने पानी से बाहरी सफाई करें। कभी भी सुगंधित साबुन या डिओडोरेंट न लगाएं।\n\n⚠️ डॉक्टर को कब दिखाएं:\n• यदि स्राव का रंग पीला, हरा या दही जैसा गाढ़ा (curdy) हो।\n• यदि तेज खुजली, जलन, दाने या दुर्गंध हो। ऐसी स्थिति में एक साधारण डॉक्टर परामर्श से यह तुरंत ठीक हो जाता है।`;
    }
    if (lang === 'mr') {
      return `पांढरा किंवा पारदर्शक स्त्राव (White discharge) होणे हे निरोगी शरीराचे आणि वाढत्या वयाचे स्वाभाविक लक्षण आहे. हे योनीमार्गाची नैसर्गिक स्वच्छता राखते.\n\nकाळजी कशी घ्यावी:\n• नेहमी सुती (कॉटन) अंतर्वस्त्रे वापरा आणि ती कोरडी ठेवा.\n• फक्त स्वच्छ पाण्याने धुवा, सुगंधी साबण वापरू नका.\n\n⚠️ डॉक्टरांकडे कधी जावे:\n• जर स्त्राव पिवळसर किंवा हिरवट असेल.\n• जर तीव्र खाज, जळजळ किंवा वास येत असेल.`;
    }
    return `Clear, milky-white, or stretchy cervical fluid (white discharge) is completely healthy and a sign your body is cleaning and protecting itself! Around ovulation, it naturally becomes stretchy like raw egg-whites; closer to your period, it becomes thicker and lotion-like.\n\nHealthy habits:\n• Wear breathable 100% cotton underwear and change daily.\n• Wash externally with plain warm water only. Never use scented soaps, douches, or intimate perfumes.\n\n⚠️ When to consult a doctor:\n• If discharge turns yellow, greenish, or chunky like cottage cheese.\n• If it is accompanied by strong itching, burning, redness, or a foul odor.`;
  }

  // 8. DELAYED / MISSED / LATE PERIOD / IRREGULARITY
  if (matches(['delay', 'delayed', 'late period', 'period late', 'is late', 'dates late', 'running late', 'missed period', 'period missed', 'irregular period', 'not coming', 'देरी', 'अनियमित', 'पीरियड लेट', 'तारीख निकल', 'मिस', 'कधी येईल', 'उशीर', 'पाळी आली नाही', 'nahi aaya', 'nahi aayi', 'der se', 'tarikh nikal', 'date nikal', 'chadh gaya'])) {
    if (lang === 'hi') {
      return `सहेली, मासिक धर्म में कुछ दिनों या हफ्तों की देरी होना बहुत आम है, विशेषकर किशोरावस्था और शुरुआती वर्षों में (शुरुआती 2-3 वर्षों में हार्मोन्स पूरी तरह नियमित नहीं होते)।\n\nदेरी होने के आम कारण:\n• मानसिक तनाव, स्कूल या परीक्षा का दबाव, नींद की कमी।\n• हाल ही में कोई बुखार, सर्दी या बीमारी होना।\n• खानपान या वजन में अचानक बदलाव, या बहुत ज्यादा दौड़भाग।\n• हार्मोन्स का प्राकृतिक रूप से परिपक्व होना।\n\nक्या करें:\n• बिल्कुल चिंता न करें—तनाव लेने से माहवारी और देर हो सकती है!\n• रोज 8 घंटे की अच्छी नींद लें, गुनगुना पानी पिएं और पौष्टिक खाना खाएं।\n• यदि पिछले 3 महीने (90 दिन) से माहवारी बिल्कुल न आई हो, तो किसी महिला डॉक्टर (गाइनेकोलॉजिस्ट) से चेकअप कराना उचित रहता है।`;
    }
    if (lang === 'mr') {
      return `मासिक पाळीची तारीख काही दिवस किंवा आठवडे पुढे जाणे अगदी सामान्य आहे, विशेषतः सुरुवातीच्या काही वर्षांत.\n\nउशीर होण्याची कारणे:\n• अभ्यासाचा किंवा परीक्षांचा ताण, अपुरी झोप.\n• नुकताच झालेला आजारपण किंवा औषधोपचार.\n• हार्मोन्स अजून शरीरात स्थिर होत असतात.\n\nकाय करावे:\n• ताण घेऊ नका, शांत राहा.\n• चांगला सकस आहार घ्या आणि ८ तास झोप घ्या.\n• जर सलग ३ महिने पाळी आली नाही, तर डॉक्टरांचा सल्ला घ्या.`;
    }
    return `Period variations and late dates are very common, especially in teens and young women! During the first 2–4 years of having periods, hormonal rhythms are still finding their steady groove.\n\nCommon reasons for delays:\n• Stress (exams, emotional events, schedule changes) delays the brain signal for ovulation.\n• Recent sickness, fever, or antibiotic medications.\n• Changes in sleep, travel, or nutritional intake.\n\nWhat to do:\n• Don't panic—worrying about a late period actually produces cortisol, which can delay it even more!\n• Prioritize 8 hours of restorative sleep, drink warm water, and eat wholesome meals.\n• If your period has been missing for over 90 days consecutively, warmly speak with a gynaecologist.`;
  }

  // 9. HEAVY FLOW / CLOTS / BLEEDING
  if (matches(['heavy flow', 'heavy bleed', 'blood clot', 'clot', 'soak', 'flood', 'रक्त', 'खून', 'प्रवाह', 'स्त्राव', 'थक्के', 'खूप रक्त', 'रक्ताचे गोळे', 'heavy', 'bleed', 'bahut zyada khoon', 'zyada flow', 'khoon ke thakke'])) {
    if (lang === 'hi') {
      return `माहवारी के पहले 1-2 दिनों में रक्तस्राव (Flow) भारी होना आम है, क्योंकि गर्भाशय संचित अस्तर को बाहर निकाल रहा होता है। कभी-कभी छोटे-छोटे रक्त के थक्के (सिक्के से छोटे) दिखना भी सामान्य है।\n\nसुरक्षा व स्वास्थ्य के उपाय:\n• हर 4 से 6 घंटे में पैड जरूर बदलें, ताकि ताजगी और स्वच्छता बनी रहे।\n• खून की कमी न हो, इसके लिए आयरन से भरपूर चीजें खाएं: गुड़-चना, पालक, चुकंदर, अनार, दालें और सूखे मेवे।\n• दिन भर खूब पानी और तरल पदार्थ पिएं।\n\n⚠️ डॉक्टर को कब दिखाएं:\n• यदि आपको हर 1-2 घंटे में पूरी तरह भीगा हुआ पैड बदलना पड़ रहा हो।\n• यदि 7 दिनों से अधिक समय तक लगातार भारी रक्तस्राव जारी रहे, या बड़े थक्के आएं।`;
    }
    if (lang === 'mr') {
      return `पाळीच्या पहिल्या २ दिवसांत रक्तप्रवाह (Flow) जास्त असणे आणि बारीक रक्ताच्या गुठळ्या दिसणे नैसर्गिक आहे.\n\nमहत्त्वाचे उपाय:\n• स्वच्छतेसाठी दर ४ ते ६ तासांनी सॅनिटरी पॅड नक्की बदला.\n• अशक्तपणा टाळण्यासाठी गूळ, शेंगदाणे, पालक, बीट आणि डाळिंब खा.\n• भरपूर पाणी प्या आणि जड कामे करू नका.\n\n⚠️ जर १-२ तासांत पॅड पूर्ण ओला होत असेल, तर डॉक्टरांचा सल्ला नक्की घ्या.`;
    }
    return `A heavier flow during the first 24–48 hours is very common as your body sheds the plush uterine lining. Small jelly-like clots (smaller than a coin) are also normal.\n\nEssential care tips:\n• Change your pad every 4 to 6 hours to stay fresh and prevent bacterial buildup.\n• Replenish lost iron with nourishing foods: spinach, lentils, jaggery, beetroot, raisins, and pomegranate.\n• Stay well-hydrated with warm fluids.\n\n⚠️ Medical guidance: If you are soaking through a maxi pad every 1 to 2 hours consecutively, or passing clots larger than a large coin, consult a healthcare provider.`;
  }

  // 10. LIGHT FLOW / SPOTTING / BROWN BLOOD
  if (matches(['light flow', 'scanty', 'spotting', 'brown blood', 'brown discharge', 'हल्का रक्त', 'कम खून', 'स्पॉटिंग', 'ब्राउन डिस्चार्ज', 'कमी रक्त', 'kam bleeding', 'halka flow', 'brown pani'])) {
    if (lang === 'hi') {
      return `हल्का रक्तस्राव (Light flow) या भूरे रंग का स्राव (Brown discharge) देखना बिल्कुल सामान्य हो सकता है:\n\nयह क्यों होता है:\n• चक्र के अंतिम दिनों में पुराना खून हवा के संपर्क में आने से भूरा (Oxidized) हो जाता है।\n• किशोरावस्था में हार्मोन्स के कम-ज्यादा होने पर प्रवाह कभी हल्का, कभी भारी हो सकता है।\n• तनाव या कम वजन के कारण भी कभी-कभी हल्का स्राव होता है।\n\nस्वस्थ सुझाव:\n• पैंटी लाइनर या हल्का पैड इस्तेमाल करें और स्वच्छता बनाए रखें।\n• संतुलित पौष्टिक भोजन लें और अपने चक्र को ब्लूम में नियमित ट्रैक करें।`;
    }
    if (lang === 'mr') {
      return `कमी रक्तस्त्राव (Light flow) किंवा तपकिरी रंगाचा स्त्राव (Brown discharge) होणे हे जुने रक्त शरीराबाहेर पडण्याचे लक्षण आहे.\n\n• पाळीच्या शेवटी रक्त ऑक्सिडाईज झाल्यामुळे त्याचा रंग तपकिरी होतो, यात घाबरण्याचे कारण नाही.\n• सकस आहार घ्या आणि पुरेशी विश्रांती घ्या.`;
    }
    return `Having a lighter flow or noticing dark brown spotting is usually completely harmless!\n\nWhy it happens:\n• Brown discharge is simply older blood that took a little longer to leave the uterus and oxidized.\n• In developing cycles, lower estrogen levels can result in lighter, shorter periods.\n• Spotting can also happen around ovulation (mid-cycle).\n\nKeep tracking in Bloom and nourish yourself with warm meals!`;
  }

  // 11. PERIOD CRAMPS & PELVIC PAIN (PHASE-AWARE ENGINE!)
  if (matches(['cramp', 'cramps', 'period pain', 'menstrual pain', 'pelvic pain', 'lower belly', 'lower abdomen', 'stomach pain', 'tummy pain', 'belly pain', 'ऐंठन', 'मरोड़', 'माहवारी का दर्द', 'पीरियड दर्द', 'पेट दर्द', 'पेट में दर्द', 'पोटदुखी', 'पोटात दुखणे', 'pet dard', 'pet me dard', 'cramping'])) {
    // A. Menstrual Phase (Days 1-5): Real menstrual cramps due to prostaglandins
    if (curPhaseIdx === 0) {
      if (lang === 'hi') {
        return `सहेली, आपकी स्थिति को मैं भली-भांति समझती हूँ। आप चक्र के दिन ${curDay} (${curPhaseName}) पर हैं। इस समय गर्भाशय की मांसपेशियां प्राकृतिक रूप से प्रोस्टाग्लैंडिन्स की वजह से सिकुड़ती हैं ताकि अस्तर बाहर आ सके, जिसके कारण पेट और पेल्विक हिस्से में ऐंठन या दर्द होता है।\n\nतुरंत राहत के आसान उपाय:\n• पेट के निचले हिस्से या कमर पर 15-20 मिनट के लिए गर्म पानी की थैली (हीटिंग पैड) रखें—गर्मी मांसपेशियों को तुरंत आराम देती है।\n• थोड़ी सी अदरक और अजवाइन की गुनगुनी चाय या गर्म पानी पिएं।\n• 'बालासन' (Child's Pose) या करवट लेकर पैरों को मोड़कर लेटें, जिससे पेल्विक दबाव कम होता है।\n\n${isSevereCramps ? '⚠️ ध्यान दें: आपने तीव्र दर्द दर्ज किया है। यदि दर्द बहुत असहनीय हो या रोजमर्रा के काम न करने दे, तो कृपया डॉक्टर से अवश्य परामर्श लें।' : 'खुद को भरपूर आराम दें और दिन भर खूब पानी पिएं। सब ठीक हो जाएगा!'}`;
      }
      if (lang === 'mr') {
        return `मैत्रिणी, पाळीच्या दिवस ${curDay} (${curPhaseName}) वर पोटात कळा येणे स्वाभाविक आहे. या काळात गर्भाशयाचे स्नायू आकुंचन पावतात.\n\nवेदना कमी करण्यासाठी सोपे उपाय:\n• पोटावर किंवा कंबरेवर गरम पाण्याच्या पिशवीने १५-२० मिनिटे शेक घ्या.\n• आलं किंवा ओव्याचे कोमट पाणी प्या.\n• 'बालासन' किंवा हलके स्ट्रेचिंग करा.\n\n${isSevereCramps ? '⚠️ सूचना: खूप जास्त असह्य वेदना असल्यास डॉक्टरांचा सल्ला नक्की घ्या.' : 'भरपूर विश्रांती घे आणि पाणी पी, काळजी करू नकोस!'}`;
      }
      return `I hear you, friend. You are currently on Day ${curDay} in your Menstrual Phase (${curPhaseName}). Your uterus gently contracts via natural prostaglandins to release its inner lining, which creates those uncomfortable cramps.\n\nSoothing relief steps:\n• Place a warm heating pad or hot water bottle on your lower abdomen for 15–20 minutes.\n• Sip warm ginger tea or warm water with a pinch of carom seeds (ajwain).\n• Rest in Child's Pose (Balasana) or lie on your side with a pillow between your knees.\n\n${isSevereCramps ? '⚠️ Note: You reported severe cramps. If pain disrupts school or sleep, speak to a doctor alongside your parents.' : 'Take it easy today and drink plenty of warm fluids!'}`;
    }

    // B. Follicular Phase (Days 6-12): Period is over! Cramping is gut/gas or mild follicle growth
    if (curPhaseIdx === 1) {
      if (lang === 'hi') {
        return `सहेली, आप अभी चक्र के दिन ${curDay} (${curPhaseName}) पर हैं। इस चरण में आपकी माहवारी समाप्त हो चुकी होती है और गर्भाशय की नई परत धीरे-धीरे बन रही होती है, जबकि अंडाशय में नए फॉलिकल्स विकसित हो रहे होते हैं।\n\nदिन ${curDay} पर पेट या पेल्विक हिस्से में भारीपन या दर्द के मुख्य कारण:\n• पाचन संबंधी गैस या कब्ज (हार्मोनल बदलाव आंतों की गति को प्रभावित करते हैं)।\n• ओव्यूलेशन के निकट आने पर अंडाशय में फॉलिकल्स का बढ़ना।\n\nतुरंत राहत के उपाय:\n• 1-2 गिलास गुनगुना पानी पिएं और जीरा या सौंफ का पानी लें—यह पेट के भारीपन को शांत करता है।\n• 15 मिनट की धीमी सैर करें और हल्का, सुपाच्य भोजन लें।\n• पेट पर गर्म पानी की थैली से हल्का सेक लें।\n• यदि दर्द बहुत तेज या असहनीय हो, तो कृपया डॉक्टर से जांच करवाएं।`;
      }
      if (lang === 'mr') {
        return `मैत्रिणी, तू सध्या चक्राच्या दिवस ${curDay} (${curPhaseName}) वर आहेस. या टप्प्यात पाळीचे रक्तस्त्राव संपलेले असते आणि गर्भाशयाचे नवीन अस्तर तयार होत असते.\n\nया दिवसांत पोटात जाणवणाऱ्या त्रासाची कारणे:\n• पोटातील गॅस, अपचन किंवा बद्धकोष्ठता.\n• ओव्ह्युलेशन जवळ येत असल्याने स्त्रीबीज तयार होण्याची नैसर्गिक हालचाल.\n\nउपाय:\n• जिरे किंवा बडीशेपचे कोमट पाणी प्या.\n• हलकी फेरफटका मारा आणि पचायला हलके जेवण घ्या.`;
      }
      return `On Day ${curDay} of your cycle, you are in the Follicular Phase (${curPhaseName})! Your period bleeding has already wrapped up, and your body is now nurturing new follicles in the ovaries while gently rebuilding the uterine lining.\n\nWhy you might feel belly discomfort on Day ${curDay}:\n• Digestive bloating or gas (hormone shifts subtly alter gut motility).\n• Early follicular awakening as your body prepares towards ovulation.\n\nComforting remedies:\n• Sip warm cumin (jeera) or fennel (saunf) tea to ease tummy bloating.\n• Go for a relaxing 15-minute walk and stay hydrated.\n• Eat warm, light meals and allow your body to build its natural energy!`;
    }

    // C. Ovulation Phase (Days 13-16): Mittelschmerz / Ovulation pain
    if (curPhaseIdx === 2) {
      if (lang === 'hi') {
        return `सहेली, आप चक्र के दिन ${curDay} (${curPhaseName}) पर हैं। इस समय पेट के एक तरफ हल्का दर्द या मरोड़ होना 'ओव्यूलेशन पेन' (Mittelschmerz) कहलाता है। जब अंडाशय से परिपक्व अंडा निकलता है, तो पेल्विक हिस्से में हल्का खिंचाव महसूस हो सकता है। यह सामान्य है और कुछ घंटों में ठीक हो जाता है।\n\nआराम के उपाय: गुनगुना पानी पिएं, हल्का सेक लें और ज्यादा तनाव न लें।`;
      }
      if (lang === 'mr') {
        return `मैत्रिणी, तू चक्राच्या दिवस ${curDay} (${curPhaseName}) वर आहेस. या काळात पोटाच्या एका बाजूला हलकी कळ येणे हे ओव्ह्युलेशनचे (स्त्रीबीज बाहेर पडण्याचे) नैसर्गिक लक्षण आहे.\n\nउपाय: भरपूर पाणी प्या आणि पोटावर कोमट पाण्याची पिशवी ठेवा, थोड्याच वेळात बरे वाटेल.`;
      }
      return `You are on Day ${curDay} in your Ovulation Phase (${curPhaseName}). Mild lower belly cramping or a one-sided twinge right now is known as 'Mittelschmerz'—the natural sensation of an ovary releasing a mature egg! It usually lasts a few hours to a day and is completely harmless.\n\nStay hydrated and rest with a warm compress!`;
    }

    // D. Luteal Phase (Days 17-28+): Premenstrual cramps / PMS
    if (lang === 'hi') {
      return `सहेली, आप चक्र के दिन ${curDay} (${curPhaseName}) पर हैं। अगली माहवारी आने से पहले गर्भाशय में प्रोस्टाग्लैंडिन्स का स्तर बढ़ने लगता है, जिसके कारण पेट और कमर में हल्का दर्द या भारीपन (PMS Cramps) महसूस हो सकता है।\n\nआराम के उपाय:\n• पेट पर गर्म पानी की थैली से सेक करें।\n• नमक वाले चिप्स कम खाएं और मैग्नीशियम युक्त डार्क चॉकलेट या केला लें।\n• गुनगुने पानी से स्नान करें और पूरी नींद लें।`;
    }
    if (lang === 'mr') {
      return `तू सध्या दिवस ${curDay} (${curPhaseName}) वर आहेस. पुढील पाळी येण्यापूर्वी पोटावर आणि कंबरेवर ताण येणे (PMS Cramps) सामान्य आहे.\n\nउपाय: पोटावर गरम पाण्याचा शेक घ्या, मीठ कमी खा आणि भरपूर विश्रांती घ्या.`;
    }
    return `Currently on Day ${curDay} of your cycle (${curPhaseName}), you are in the Luteal phase. Pre-menstrual cramps happen as progesterone drops and prostaglandins begin preparing for the next cycle.\n\nWarm heating pads, warm ginger tea, and plenty of sleep will bring deep relief!`;
  }

  // 11B. UNCLASSIFIED GENERAL PAIN (When user says 'pain', 'dard', 'dukh' without specifying organ)
  if (matches(['pain', 'ache', 'hurts', 'dard', 'dukh', 'taklif', 'दर्द', 'वेदना', 'दुख'])) {
    if (lang === 'hi') {
      return `सहेली, मैं आपकी परेशानी समझ सकती हूँ। माहवारी के दौरान शरीर के अलग-अलग हिस्सों में दर्द होना आम है।\n\nकृपया मुझे थोड़ा और बताएं कि आपको दर्द कहाँ महसूस हो रहा है:\n• **पेट या पेल्विक ऐंठन:** गर्म पानी की थैली से सेक करें और अदरक की चाय पिएं।\n• **कमर या रीढ़ में दर्द:** करवट लेकर घुटनों के बीच तकिया रखकर लेटें।\n• **पैरों या पिंडलियों में दर्द:** हल्के गुनगुने तेल से मालिश करें और पैरों को तकिए पर ऊपर उठाकर रखें।\n• **सिरदर्द:** भरपूर पानी पिएं और शांत, अंधेरे कमरे में 15 मिनट आंखें बंद करके लेटें।\n• **पूरे बदन में दर्द:** गुनगुने पानी से नहाएं और हल्दी वाला दूध लें।\n\n⚠️ यदि दर्द अचानक बहुत तेज, असहनीय हो या उल्टी/चक्कर आए तो तुरंत माँ को बताएं और डॉक्टर से परामर्श लें।`;
    }
    if (lang === 'mr') {
      return `मैत्रिणी, पाळीच्या काळात शरीरात वेगवेगळ्या ठिकाणी वेदना होणे सामान्य आहे. तुला नक्की कुठे त्रास होत आहे ते मला सांग:\n• **पोटात कळा:** पोटावर गरम पाण्याचा शेक घ्या.\n• **कंबरदुखी:** पाठीला विश्रांती द्या आणि झोपताना गुडघ्यात उशी ठेवा.\n• **पायदुखी:** कोमट तेलाने मालिश करा आणि पाय उंचावर ठेवा.\n• **डोकेदुखी:** भरपूर पाणी प्या आणि शांत खोलीत विश्रांती घ्या.\n\n⚠️ जर वेदना खूप असह्य असतील तर डॉक्टरांचा सल्ला नक्की घ्या.`;
    }
    return `I hear you, sweet friend! Aches and pains can shift across different areas during your cycle. To help give you the best comfort:\n\n• **Lower belly cramps:** Apply a warm heating pad and sip warm ginger tea.\n• **Lower back ache:** Lie on your side with a plush pillow between your knees.\n• **Leg or calf pain:** Elevate your legs on cushions and gently massage with warm oil.\n• **Headache:** Hydrate immediately with cool water and rest in a dark, quiet room.\n• **Whole body ache:** Take a warm shower and enjoy warm turmeric milk.\n\n⚠️ If pain is severe, sudden, or unmanageable with rest, speak with a doctor.`;
  }

  // 12. BLOATING / GAS / CONSTIPATION / ACIDITY
  if (matches(['bloat', 'gas', 'acidity', 'constipat', 'loose motion', 'diarrhea', 'पेट फूलना', 'गैस', 'एसिडिटी', 'कब्ज', 'दस्त', 'अपचन', 'पोट फुगणे', 'पोटात गॅस', 'pet phoolna', 'badhazmi', 'kabz'])) {
    if (lang === 'hi') {
      return `माहवारी के आसपास पेट फूला हुआ (Bloated) लगना या गैस होना बहुत आम है। प्रोजेस्टेरोन हार्मोन आंतों की गति को धीमा कर देता है, जिससे पेट में भारीपन महसूस होता है।\n\nआराम पाने के सरल उपाय:\n• जीरा, सौंफ या पुदीने का गुनगुना पानी घूंट-घूंट करके पिएं—यह गैस को तुरंत बाहर निकालता है।\n• बहुत अधिक नमकीन चिप्स, समोसे, तली चीजें और कोल्ड ड्रिंक्स से बचें।\n• एक बार में ज्यादा खाने की जगह हल्का और सुपाच्य भोजन (जैसे मूंग दाल खिचड़ी) लें।\n• भोजन के बाद 10 मिनट की धीमी सैर जरूर करें।`;
    }
    if (lang === 'mr') {
      return `पाळीच्या काळात पोट फुगल्यासारखे वाटणे (Bloating) किंवा गॅस होणे खूप सामान्य आहे.\n\nपोट हलके ठेवण्यासाठी उपाय:\n• जिरे आणि ओव्याचे कोमट पाणी प्या.\n• जास्त मीठ, तळलेले पदार्थ आणि शीतपेये टाळा.\n• पचायला हलके असणारे जेवण (जसे की मूग डाळ खिचडी किंवा सूप) घ्या.`;
    }
    return `Tummy puffiness and bloating are classic symptoms during cycle shifts! Progesterone naturally slows down gut motility and causes temporary water retention.\n\nHow to deflate tummy bloating:\n• Sip warm fennel (saunf) or cumin (jeera) water, or peppermint tea—they relax digestive spasm within minutes.\n• Ease up on salty processed snacks, packaged chips, and carbonated sodas which lock in water.\n• Eat smaller, warm, easily digestible meals like rice, lentil soup, or steamed veggies.`;
  }

  // 13. MOOD SWINGS / CRYING / ANGER / DEPRESSION / ANXIETY
  if (matches(['mood', 'cry', 'sad', 'angry', 'irritat', 'anxious', 'depress', 'चिड़चिड़', 'रोना', 'उदास', 'गुस्सा', 'राग', 'मूड', 'संताप', 'रडू', 'ch चिड़चिड़', 'gussa', 'rona', 'udas', 'depression'])) {
    if (lang === 'hi') {
      return `सहेली, अगर आपका मन उदास है या बिना बात के चिड़चिड़ापन, गुस्सा और रोना आ रहा है, तो याद रखें कि यह आपकी गलती नहीं है। चक्र के ${curPhaseName} में हार्मोन्स (एस्ट्रोजन व प्रोजेस्टेरोन) के तेजी से बदलने से मस्तिष्क में 'सेरोटोनिन' (खुशी का रसायन) कुछ समय के लिए कम हो जाता है।\n\nमूड को हल्का करने के नुस्खे:\n• थोड़ा सा डार्क चॉकलेट खाएं, इसमें मैग्नीशियम होता है जो दिमाग को शांत करता है।\n• अपनी किसी भरोसेमंद सहेली या माँ से बात करें, या डायरी में अपनी भावनाएं लिखें।\n• 5 मिनट के लिए धीमी, गहरी सांसें लें और अपनी पसंदीदा शांत धुन सुनें।\n\nयह भावनात्मक लहरें केवल 1-2 दिनों के लिए हैं। आप बहुत प्यारी और मजबूत हैं!`;
    }
    if (lang === 'mr') {
      return `मैत्रिणी, जर आज तुला चिडचिड किंवा अचानक रडू येत असेल, तर स्वतःवर रागावू नकोस. सध्याच्या ${curPhaseName} मध्ये हार्मोन्समध्ये बदल झाल्यामुळे मन अस्थिर होणे स्वाभाविक आहे.\n\nमन शांत करण्यासाठी:\n• थोडे डार्क चॉकलेट खा, यामुळे मेंदूतील ताण कमी होतो.\n• शांत संगीत ऐका किंवा डायरीत मन मोकळे करा.\n• स्वतःवर कोणताही दबाव आणू नका; आज विश्रांती घेणे पूर्णपणे योग्य आहे.\n\nलक्षात ठेव, हा मूड तात्पुरता आहे आणि लवकरच सर्व छान वाटेल!`;
    }
    return `Sending you the biggest warm hug right now. Experiencing emotional highs, tears, or sudden irritability is not your fault at all! Right now in your ${curPhaseName}, fluctuating progesterone and estrogen directly influence serotonin—your brain's natural feel-good chemical.\n\nGentle ways to care for your heart today:\n• Savor a square of dark chocolate—it provides magnesium which calms nerve tension.\n• Express yourself in a personal journal or chat with a close friend who makes you feel safe.\n• Wrap yourself in a cozy blanket with a warm drink and play calming music.\n\nBe patient and compassionate with yourself. These emotional waves are temporary and will pass very soon!`;
  }

  // 14. FATIGUE / WEAKNESS / LOW ENERGY
  if (matches(['tired', 'fatigue', 'energy', 'weak', 'exhaust', 'letharg', 'थकान', 'कमजोरी', 'सुस्ती', 'थकवा', 'अशक्तपणा', 'thakan', 'kamzori', 'sust', 'energy kam'])) {
    if (lang === 'hi') {
      return `थकान और कमजोरी महसूस होना आपके शरीर का एक संकेत है कि उसे विश्राम की आवश्यकता है। चक्र के दिन ${curDay} पर शरीर आंतरिक रूप से काफी काम कर रहा होता है।\n\nऊर्जा वापस पाने के उपाय:\n• दिन में 20-30 मिनट की हल्की झपकी (Power Nap) लें।\n• नींबू पानी, नारियल पानी या ताजे फलों का रस पिएं।\n• गुड़ और भुने चने खाएं—यह शरीर में तुरंत प्राकृतिक ऊर्जा और आयरन भरते हैं।\n• भारी कसरत की जगह हल्की स्ट्रेचिंग या धीमी सैर करें।\n\nआज कोई जल्दबाजी न करें, अपने शरीर की सुनें!`;
    }
    if (lang === 'mr') {
      return `थकवा जाणवणे हे शरीराने विश्रांती मागण्याचे लक्षण आहे. दिवस ${curDay} (${curPhaseName}) वर शरीराला जास्त उर्जेची गरज असते.\n\nउत्साह वाढवण्यासाठी:\n• भरपूर पाणी, लिंबू सरबत किंवा नारळ पाणी प्या.\n• दुपारच्या वेळी १५-२० मिनिटांची छोटी झोप घ्या.\n• गूळ आणि शेंगदाणे खा, यामुळे शरीराला लगेच ताकद मिळते.\n• शरीराला ताण देणारी कामे आज टाळा.`;
    }
    return `It is completely normal to feel low on energy right now on Day ${curDay} (${curPhaseName}). Your body is using significant metabolic energy, and hormonal drops naturally signal your nervous system to recharge.\n\nComforting energy boosters:\n• Take a restorative 20-minute power nap in a cozy room.\n• Rehydrate with coconut water, lemonade with a pinch of black salt, or warm herbal tea.\n• Snack on roasted chickpeas with jaggery or a handful of almonds and raisins.\n• Give yourself permission to slow down today—rest is productive!`;
  }

  // 15. SLEEP ISSUES & INSOMNIA
  if (matches(['sleep', 'insomnia', 'restless', 'wake up', 'नींद', 'अनिद्रा', 'झोप', 'झोप येत नाही', 'neend nahi', 'so nahi'])) {
    if (lang === 'hi') {
      return `माहवारी के दिनों में शरीर के तापमान में बदलाव और ऐंठन के कारण नींद न आना या रात में बार-बार आंख खुलना आम है।\n\nअच्छी और गहरी नींद के नुस्खे:\n• सोने से 30 मिनट पहले एक कप गुनगुना हल्दी वाला दूध पिएं।\n• बिस्तर पर जाने से कम से कम 30 मिनट पहले फोन और टीवी की स्क्रीन बंद कर दें।\n• पैरों के तलवों पर गुनगुने सरसों या नारियल तेल की हल्की मालिश करें।\n• करवट लेकर सोएं और दोनों घुटनों के बीच एक मुलायम तकिया रखें।`;
    }
    if (lang === 'mr') {
      return `पाळीच्या दिवसांत शरीराचे तापमान बदलल्यामुळे शांत झोप न लागणे स्वाभाविक आहे.\n\nगाढ झोपेसाठी सोपे उपाय:\n• झोपण्यापूर्वी कोमट हळदीचे दूध प्या.\n• झोपण्याच्या अर्धा तास आधी मोबाईल बाजूला ठेवा.\n• पायाच्या तळव्यांना हलके तेल लावून चोळा.\n• दोन गुडघ्यांमध्ये उशी घेऊन कुशीवर झोपा.`;
    }
    return `Trouble sleeping during cycle transitions is very common due to body temperature fluctuations and cramping.\n\nProven tips for deep sleep tonight:\n• Sip a warm mug of turmeric golden milk or chamomile tea 30 minutes before bed.\n• Keep screens off 30 minutes before lights-out; blue light suppresses natural melatonin.\n• Sleep on your side with a pillow tucked between your knees to relieve pelvic pressure.\n• Keep your bedroom cool, dark, and quiet.`;
  }

  // 15A. SPECIFIC FRUITS (Checked before general diet!)
  if (matches(['fruit', 'fruits', 'phal', 'फल', 'फळे', 'kela', 'seb', 'anar', 'papita', 'santre', 'amrud', 'banana', 'apple', 'orange', 'pomegranate', 'papaya', 'chikoo', 'mosambi', 'angur', 'grapes', 'watermelon', 'tarbuz'])) {
    if (lang === 'hi') {
      return `सहेली, माहवारी के समय फल खाना शरीर को तुरंत ऊर्जा देने, ऐंठन कम करने और हीमोग्लोबिन बढ़ाने का सबसे बेहतरीन प्राकृतिक तरीका है!\n\nपीरियड्स में सबसे असरदार फल:\n• **केला (Banana):** पोटैशियम और विटामिन B6 से भरपूर होता है, जो पेट की ऐंठन और मांसपेशियों के खिंचाव को तुरंत शांत करता है।\n• **अनार और सेब (Pomegranate & Apple):** इनमें भरपूर आयरन और प्राकृतिक ग्लूकोज होता है, जो रक्तस्राव से होने वाली कमजोरी और थकान को दूर करते हैं।\n• **पपीता और अनानास (Papaya & Pineapple):** इनमें 'पपैन' और 'ब्रोमेलैन' एंजाइम्स होते हैं, जो पेल्विक नसों की सूजन घटाते हैं और रक्तप्रवाह को सुगम बनाते हैं।\n• **संतरा और मौसंबी (Oranges & Citrus):** विटामिन C से भरपूर होते हैं, जो शरीर में आयरन के अवशोषण (Absorption) को कई गुना बढ़ा देते हैं।\n• **तरबूज व खरबूजा:** 92% पानी होने के कारण डिहाइड्रेशन और पेट फूलने (Bloating) से बचाते हैं।\n\n💡 सलाह: फल हमेशा दिन में ताजे काटकर खाएं, फ्रिज का बहुत ठंडा फल सीधे खाने से बचें।`;
    }
    if (lang === 'mr') {
      return `मासिक पाळीच्या काळात फळे खाणे हे शरीराला त्वरित ताकद देण्यासाठी आणि पोटदुखी कमी करण्यासाठी अतिशय गुणकारी आहे.\n\nसर्वात फायदेशीर फळे:\n• **केळी (Banana):** पोटॅशियम आणि व्हिटॅमिन B6 मुबलक असते, जे स्नायूंना आराम देते आणि कळा कमी करते.\n• **डाळिंब व सफरचंद (Pomegranate & Apple):** रक्तातील हिमोग्लोबिन वाढवतात आणि अशक्तपणा दूर करतात.\n• **पपई व अननस (Papaya & Pineapple):** पाळीचा प्रवाह सुलभ करतात आणि पचन सुधारतात.\n• **संत्री व मोसंबी (Citrus Fruits):** व्हिटॅमिन C मुळे शरीराची प्रतिकारशक्ती वाढते.\n• **कलिंगड:** शरीरातील पाण्याचे प्रमाण संतुलित ठेवते.\n\n💡 टीप: फळे नेहमी ताजी खावीत, फ्रीजमधील खूप थंड फळे खाणे टाळावे.`;
    }
    return `Eating fresh fruits during your period is one of the most effective ways to replenish lost electrolytes, boost iron, and calm cramps naturally!\n\nTop fruits for your cycle:\n• **Bananas:** Rich in potassium and Vitamin B6, which instantly relax contracting pelvic and calf muscles.\n• **Pomegranates & Apples:** High in easily absorbed dietary iron to rebuild red blood cells and combat period fatigue.\n• **Papaya & Pineapple:** Contain healing enzymes (papain and bromelain) that ease pelvic cramps and support steady flow.\n• **Oranges & Citrus:** Packed with Vitamin C, which increases dietary iron absorption by up to 3x.\n• **Watermelon:** High water content deflates tummy puffiness and keeps cells deeply hydrated.\n\n💡 Pro tip: Enjoy room-temperature, freshly sliced fruits rather than icy fruits straight from the fridge!`;
  }

  // 16. DIET / FOOD / MEALS / NUTRITION (General meals advice)
  if (matches(['food', 'eat', 'diet', 'meal', 'lunch', 'dinner', 'breakfast', 'खाना', 'भोजन', 'आहार', 'खाणे', 'भूख', 'kya khaye', 'khana', 'khana chahiye', 'bhojan'])) {
    if (lang === 'hi') {
      return `माहवारी के समय आपके शरीर को सुपाच्य, पौष्टिक और गर्म भोजन की आवश्यकता होती है ताकि पाचन पर दबाव न पड़े और कमजोरी न आए।\n\nआदर्श भोजन थाली:\n• **गर्म और हल्का खाना:** मूंग दाल की खिचड़ी, दलिया, या गरमा-गरम दाल-चावल घी के साथ पचने में बहुत आसान होते हैं।\n• **हरी पत्तेदार सब्जियां:** पालक, मेथी और बथुआ खून में आयरन का स्तर बढ़ाते हैं।\n• **गुड़ और भुने चने:** दोपहर के नाश्ते में गुड़-चना खाना हीमोग्लोबिन और प्राकृतिक ऊर्जा के लिए अमृत समान है।\n• **क्या न खाएं:** अत्यधिक मिर्च-मसालेदार, बाहर का तला हुआ जंक फूड और बहुत नमकीन चिप्स न खाएं, क्योंकि ये गैस और पेट फूलना बढ़ाते हैं।`;
    }
    if (lang === 'mr') {
      return `पाळीच्या दिवसांत शरीराला पचायला हलका आणि पौष्टिक आहार आवश्यक असतो.\n\nउत्तम आहार पर्याय:\n• **गरम आणि हलके जेवण:** मूग डाळ खिचडी, भात-वरण किंवा दलिया पोटासाठी खूप हलके असतात.\n• **हिरव्या पालेभाज्या:** पालक आणि मेथी खाल्ल्याने रक्तातील हिमोग्लोबिन वाढते.\n• **गूळ आणि शेंगदाणे:** शरीराला त्वरित ऊर्जा आणि लोह (Iron) देतात.\n• **काय टाळावे:** जास्त तेलकट, तिखट किंवा मसालेदार पदार्थ खाणे टाळा.`;
    }
    return `During your cycle, your digestive tract is naturally more sensitive due to progesterone, so your body loves warm, nourishing, easily digestible meals.\n\nRecommended meal choices:\n• **Warm, soothing comfort meals:** Lentil soup (dal), rice with a spoonful of pure ghee, warm oats, or steamed vegetables.\n• **Iron-rich greens:** Spinach, fenugreek, and beetroot replenish blood loss naturally.\n• **Energy snacks:** Roasted chickpeas with jaggery, walnuts, and soaked almonds.\n• **Foods to limit:** Heavy deep-fried snacks, excess sodium chips, and ultra-spicy curries which trigger gut spasms and bloating.`;
  }

  // 16B. DRINKS, HERBAL TEAS & KADHA
  if (matches(['chai', 'tea', 'kadha', 'kawa', 'drink', 'beverage', 'juice', 'चाय', 'काढ़ा', 'पेय', 'रस', 'ginger tea', 'green tea', 'herbal tea', 'garam pani', 'ajwain water', 'jeera water'])) {
    if (lang === 'hi') {
      return `माहवारी में सही गर्म पेय पदार्थ गर्भाशय की ऐंठन और पेट की गैस को 10-15 मिनट में शांत करने की ताकत रखते हैं!\n\nसबसे असरदार घरेलू पेय:\n• **अदरक-अजवाइन की गुनगुनी चाय:** एक कप पानी में थोड़ा कुटा अदरक और आधा चम्मच अजवाइन उबालकर पिएं—यह ऐंठन के लिए सबसे बेहतरीन प्राकृतिक नुस्खा है।\n• **सौंफ या जीरे का पानी:** पेट में भारीपन या गैस होने पर सौंफ का गुनगुना पानी पिएं।\n• **हल्दी वाला दूध (Golden Milk):** रात को सोते समय हल्दी वाला दूध पीने से शरीर का दर्द और अनिद्रा दूर होती है।\n• **नारियल पानी:** दिन के समय प्राकृतिक इलेक्ट्रोलाइट्स और ताजगी के लिए पिएं।\n• **सावधानी:** बहुत ज्यादा कैफीन वाली तेज कॉफी या कोल्ड ड्रिंक्स से बचें, क्योंकि ये डिहाइड्रेशन बढ़ाती हैं।`;
    }
    if (lang === 'mr') {
      return `पाळीदरम्यान कोमट आणि आयुर्वेदिक पेये घेतल्यास पोटदुखी लगेच थांबते.\n\nउत्तम घरगुती पेये:\n• **आलं आणि ओव्याचा चहा:** १ कप पाण्यात थोडे आलं आणि ओवा उकळून प्या, पोटदुखीवर हा रामबाण उपाय आहे.\n• **बडीशेपचे कोमट पाणी:** गॅस आणि अपचन कमी करण्यासाठी फायदेशीर.\n• **हळदीचे कोमट दूध:** रात्री झोपताना प्यायल्यास अंगदुखी कमी होते.\n• **नारळ पाणी:** शरीरातील ताजेतवानेपणा टिकवून ठेवते.`;
    }
    return `Warm herbal infusions directly soothe uterine muscle contractions and digestive spasms within minutes!\n\nMost soothing healing drinks:\n• **Ginger & Carom (Ajwain) Tea:** Boil crushed fresh ginger and 1/2 tsp ajwain in water—nature's most potent natural antispasmodic.\n• **Warm Fennel (Saunf) or Cumin Water:** Immediately relieves gas, belly tightness, and bloating.\n• **Turmeric Golden Milk:** Perfect before bedtime to alleviate generalized body aches and support peaceful sleep.\n• **Fresh Coconut Water:** Rebalances cellular potassium and hydration during daytime.\n• **Avoid:** Excess sugary carbonated sodas and high caffeine espresso, which dehydrate pelvic tissues.`;
  }

  // 16C. SWEET CRAVINGS & CHOCOLATE
  if (matches(['craving', 'cravings', 'chocolate', 'chocolates', 'choclate', 'sweet', 'sweets', 'meetha', 'mitha', 'sugar', 'गुड़', 'चॉकलेट', 'मीठा', 'sweet craving'])) {
    if (lang === 'hi') {
      return `माहवारी के समय मीठा या चॉकलेट खाने का तीव्र मन होना 100% स्वाभाविक है! इस समय सेरोटोनिन हार्मोन कम हो जाता है, और शरीर तुरंत खुशी और ऊर्जा चाहता है।\n\nक्रेविंग्स को संतुष्ट करने के स्मार्ट तरीके:\n• **डार्क चॉकलेट (70%+):** इसमें भरपूर मैग्नीशियम होता है, जो गर्भाशय की मांसपेशियों को शांत करता है और मन को खुश रखता है।\n• **गुड़ और तिल की चिक्की या खजूर:** प्राकृतिक मिठास देते हैं और साथ ही खून (हीमोग्लोबिन) भी बढ़ाते हैं।\n• **केला और पीनट बटर:** मीठे की तलब को मिटाता है और लंबे समय तक ऊर्जा देता है।\n• **सफेद चीनी वाली मिठाइयों और कोल्ड ड्रिंक्स** को थोड़ा सीमित रखें ताकि बाद में ब्लड शुगर अचानक गिरकर मूड खराब न करे।`;
    }
    if (lang === 'mr') {
      return `या दिवसांत गोड किंवा चॉकलेट खाण्याची तीव्र इच्छा होणे अगदी सामान्य आहे! हार्मोन्सच्या बदलांमुळे मेंदूला उर्जेची गरज असते.\n\nचांगले पर्याय:\n• **डार्क चॉकलेट:** यात मॅग्नेशियम असते जे पोटदुखी आणि ताण कमी करते.\n• **गूळ आणि शेंगदाणे किंवा खजूर:** नैसर्गिक गोडवा आणि लोह देतात.\n• **केळी:** पोटॅशियम आणि गोडव्याची उत्तम सांगड.`;
    }
    return `Craving chocolate and sweet treats during your cycle is completely real and biological! As estrogen dips, brain serotonin temporarily drops, signaling your body to seek quick comfort and magnesium.\n\nNourishing ways to satisfy sweet cravings:\n• **Dark Chocolate (70%+):** High in magnesium, which directly relaxes uterine smooth muscle and elevates mood neurotransmitters.\n• **Dates with Almond Butter:** Naturally decadent, sweet, and packed with cycle-supportive iron and healthy fats.\n• **Jaggery & Roasted Peanuts:** Classic traditional pairing providing iron, warmth, and sustained energy.\n• **Moderation note:** Enjoy your treats! Just try to choose natural jaggery, fruits, or dark chocolate over ultra-processed artificial syrups.`;
  }

  // 17. EXERCISE / YOGA / SPORTS
  if (matches(['exercise', 'workout', 'gym', 'run', 'sport', 'yoga', 'stretch', 'व्यायाम', 'कसरत', 'योगा', 'धावणे', 'खेळ', 'vyayam', 'kasrat'])) {
    if (lang === 'hi') {
      return `हाँ, बिल्कुल! माहवारी के दौरान हल्का व्यायाम करना न सिर्फ सुरक्षित है, बल्कि इससे शरीर में 'एंडोर्फिन' (प्राकृतिक दर्द निवारक हार्मोन) बनते हैं, जो ऐंठन और मूड को सुधारते हैं।\n\nसर्वोत्तम व्यायाम:\n• 15-20 मिनट की धीमी सैर (Walk).\n• 'तितली आसन' (Baddha Konasana) और कैट-काउ स्ट्रेच।\n• 'बालासन' (Child's Pose) पेल्विक हिस्से को आराम देता है।\n• यदि आज बहुत थकान या भारी रक्तस्राव हो, तो भारी वजन उठाने और कठिन दौड़भाग से बचें। अपने शरीर की सुनें!`;
    }
    if (lang === 'mr') {
      return `होय, नक्कीच! पाळीदरम्यान हलका व्यायाम करणे अत्यंत फायदेशीर असते. यामुळे शरीरातील नैसर्गिक वेदनाशामक हार्मोन्स वाढतात.\n\nचांगले पर्याय:\n• १५-२० मिनिटे हलके चालणे.\n• बटरफ्लाय आसन (Butterfly pose) आणि शरीराचे हलके स्ट्रेचिंग.\n• खूप धावणे किंवा जड वजन उचलणे या दिवसांत टाळावे. स्वतःच्या शरीराचा आदर करा!`;
    }
    return `Yes, absolutely! Moving your body gently during your cycle releases endorphins—your natural painkillers and mood boosters.\n\nBest movements:\n• Gentle 20-minute walks in fresh air.\n• Restorative yoga poses like Reclined Butterfly (Baddha Konasana) and Child's Pose which open up the pelvis.\n• If cramps are prominent or flow is heavy, skip intense HIIT or heavy lifting and choose light stretches. Listen to what feels good to your body!`;
  }

  // 18. PADS / TAMPONS / HYGIENE / LEAKS
  if (matches(['pad', 'tampon', 'cup', 'hygiene', 'leak', 'stain', 'wash', 'change', 'rash', 'कपड़ा', 'पैड', 'दाग', 'सफाई', 'डाग', 'स्वच्छता', 'pad change', 'safai'])) {
    if (lang === 'hi') {
      return `माहवारी स्वच्छता आपके स्वास्थ्य और आत्मविश्वास का सबसे महत्वपूर्ण हिस्सा है:\n\nस्वच्छता के सुनहरे नियम:\n• हर 4 से 6 घंटे में पैड जरूर बदलें, चाहे प्रवाह हल्का ही क्यों न हो।\n• केवल सादे गुनगुने पानी से बाहरी सफाई करें। कभी भी सुगंधित साबुन या डिओडोरेंट न लगाएं।\n• हमेशा साफ, सूती (कॉटन) के अंडरवियर पहनें।\n• दाग (Leak) लगना दुनिया की हर लड़की के साथ कभी न कभी होता है—इसमें कभी शर्म या झिझक महसूस न करें! अपने बैग में हमेशा एक अतिरिक्त पैड रखें।`;
    }
    if (lang === 'mr') {
      return `पाळीदरम्यान वैयक्तिक स्वच्छता अत्यंत महत्त्वाची असते:\n\nमहत्त्वाचे नियम:\n• रक्तप्रवाह कमी असला तरी दर ४ ते ६ तासांनी सॅनिटरी पॅड नक्की बदला.\n• फक्त कोमट स्वच्छ पाण्याने स्वच्छता ठेवा, कोणतेही सुगंधी साबण वापरू नका.\n• सुती (कॉटन) कपडे वापरा.\n• कपड्यांवर डाग पडणे हे अगदी सामान्य आहे, त्यामुळे लाज वाटण्याचे काहीच कारण नाही! बॅगेत नेहमी एक जास्तीचा पॅड ठेवा.`;
    }
    return `Maintaining gentle menstrual hygiene keeps you feeling fresh, confident, and protected from irritation:\n\nGolden hygiene rules:\n• Change your pad every 4 to 6 hours—bacteria thrive in moist environments even on light days.\n• Cleanse externally only with plain warm water. Avoid perfumed soaps or internal douches which disturb natural vaginal pH.\n• Wear soft, breathable cotton underwear.\n• Leaks happen to every single girl! Never feel ashamed. Keep a spare pad and an extra layer in your bag for peace of mind.`;
  }

  // 19. MEDICINES / PAINKILLERS / TABLETS
  if (matches(['medicine', 'tablet', 'pill', 'painkiller', 'meftal', 'paracetamol', 'crocin', 'दवा', 'गोली', 'पेनकिलर', 'औषध', 'उपाय', 'dawa', 'goli', 'painkiller'])) {
    if (lang === 'hi') {
      return `सहेली, ऐंठन और दर्द के लिए सबसे पहले प्राकृतिक तरीके (गर्म पानी की थैली से सेक, अदरक-अजवाइन की चाय, विश्राम) अपनाना सबसे सुरक्षित होता है।\n\nदवाइयों के बारे में जरूरी जानकारी:\n• यदि दर्द बहुत असहनीय हो और स्कूल या दैनिक काम में रुकावट डाले, तो डॉक्टर आमतौर पर 'मेफिनेमिक एसिड' (जैसे Meftal Spas) या 'पैरासिटामोल' की सलाह देते हैं।\n• कभी भी बिना अपनी माँ या डॉक्टर की सलाह के खुद से कोई भी पेनकिलर न लें।\n• कोई भी दवा हमेशा खाना खाने के बाद ही लें, कभी खाली पेट न लें।`;
    }
    if (lang === 'mr') {
      return `मैत्रिणी, पोटदुखीसाठी आधी नैसर्गिक उपाय (गरम पाण्याचा शेक, ओव्याचा चहा) करणे उत्तम असते.\n\nऔषधांविषयी महत्त्वाची माहिती:\n• जर वेदना खूप असह्य असतील, तर डॉक्टर मेफ्टाल स्पास (Meftal Spas) किंवा पॅरासिटामॉलचा सल्ला देतात.\n• डॉक्टरांच्या किंवा पालकांच्या सल्ल्याशिवाय स्वतःहून कोणतीही गोळी घेऊ नका.\n• गोळी कधीही रिकाम्या पोटी घेऊ नये.`;
    }
    return `When it comes to period pain, trying gentle natural remedies first (heating pads, ginger tea, hydration) is always best.\n\nRegarding medications:\n• If cramps are truly disabling, doctors often prescribe gentle antispasmodics (like Mefenamic acid / Meftal Spas) or Paracetamol.\n• Never take any painkiller without guidance from your parents or a doctor.\n• Always take medications after eating food, never on an empty stomach.`;
  }

  // 20. FIRST PERIOD / MENARCHE
  if (matches(['first period', 'menarche', 'पहली बार', 'पहला पीरियड', 'शुरुआत', 'पहिली पाळी', 'suruvat', 'pehli baar'])) {
    if (lang === 'hi') {
      return `बधाई हो प्यारी सहेली! पहला पीरियड आना आपके बड़े होने और एक स्वस्थ, सुंदर शरीर का प्रतीक है। इसमें डरने या घबराने की कोई बात नहीं है।\n\nशुरुआती बातें जो आपको जाननी चाहिए:\n• यह रक्त अशुद्ध नहीं है, यह केवल वही अस्तर है जो शरीर ने तैयार किया था।\n• अपनी माँ, बड़ी बहन या स्कूल टीचर को तुरंत बताएं ताकि वे आपको पैड इस्तेमाल करने में मदद कर सकें।\n• शुरुआती 1-2 सालों में पीरियड्स अनियमित हो सकते हैं, यह पूरी तरह सामान्य है। आप बहुत खास हैं!`;
    }
    if (lang === 'mr') {
      return `अभिनंदन मैत्रिणी! पहिली पाळी येणे हे तू मोठी होत असल्याचे आणि तुझे शरीर निरोगी असल्याचे सुंदर लक्षण आहे. मुळीच घाबरू नकोस!\n\n• आईशी किंवा मोठ्या बहिणीशी लगेच मनमोकळे बोल, त्या तुला पॅड कसा वापरायचा ते शिकवतील.\n• सुरुवातीच्या काही वर्षांत पाळीची तारीख मागेपुढे होणे सामान्य आहे. तू खूप छान आणि सशक्त आहेस!`;
    }
    return `Welcome to womanhood, sweet friend! Getting your very first period (menarche) is a beautiful milestone of growing up. There is absolutely nothing to fear.\n\nWhat to know right now:\n• This blood is completely natural—it is simply the soft cushion your body built.\n• Warmly tell your mom, older sister, or school nurse so they can help you with a pad.\n• Cycles are often irregular during the first 2 years. Be proud of your amazing body!`;
  }

  // 21. ACNE / PIMPLES
  if (matches(['acne', 'pimple', 'breakout', 'skin', 'मुहासे', 'पिंपल', 'फुंसी', 'त्वचा', 'pimple', 'muhase'])) {
    if (lang === 'hi') {
      return `माहवारी से पहले चेहरे पर पिंपल्स (मुंहासे) निकलना बहुत आम है। हार्मोन्स के बदलाव से त्वचा की ग्रंथियां अधिक तेल (सीबम) बनाती हैं।\n\nत्वचा की देखभाल के टिप्स:\n• दिन में 2 बार हल्के फेसवॉश से चेहरा धोएं। पिंपल्स को कभी भी हाथ से न फोड़ें।\n• दिन भर में कम से कम 8-10 गिलास पानी पिएं ताकि विषैले तत्व बाहर निकलें।\n• ज्यादा तली चीजें और अत्यधिक मीठा कम खाएं। पीरियड्स खत्म होते ही त्वचा अपने आप साफ हो जाती है।`;
    }
    if (lang === 'mr') {
      return `पाळीच्या आधी चेहऱ्यावर मुरुमे (Pimples) येणे हार्मोन्सच्या बदलांमुळे होते.\n\nकाळजी कशी घ्यावी:\n• दिवसातून दोनदा साध्या पाण्याने चेहरा स्वच्छ धुवा.\n• पिंपल्स कधीही नखाने फोडू नका, डाग पडतात.\n• भरपूर पाणी प्या आणि जास्त तेलकट पदार्थ खाणे टाळा.`;
    }
    return `Premenstrual breakouts are driven by shifting hormones that prompt your skin glands to produce more natural oil (sebum).\n\nClear skin care tips:\n• Wash gently twice daily with a mild cleanser. Never pop or squeeze pimples, as this causes dark spots.\n• Drink plenty of fresh water to flush out impurities naturally.\n• Keep hair off your face and ease up on oily foods. Your skin will clear right up as your cycle progresses!`;
  }

  // 22. WHEN TO SEE A DOCTOR / RED FLAGS
  if (matches(['doctor', 'hospital', 'checkup', 'serious', 'danger', 'डॉक्टर', 'अस्पताल', 'तपासणी', 'kab dikhaye', 'ilaj'])) {
    if (lang === 'hi') {
      return `सहेली, आपकी सेहत सबसे पहले है। अधिकांश लक्षण सामान्य होते हैं, लेकिन निम्नलिखित स्थितियों में डॉक्टर (गाइनेकोलॉजिस्ट) को दिखाना चाहिए:\n\n⚠️ डॉक्टर को कब दिखाएं:\n• यदि आपको हर 1-2 घंटे में पूरी तरह भीगा पैड बदलना पड़े।\n• यदि पेट में असहनीय दर्द हो जो हीटिंग पैड या आराम से भी कम न हो।\n• यदि 90 दिनों से अधिक समय तक माहवारी न आए।\n• यदि माहवारी 7 दिनों से अधिक समय तक लगातार चले।\n• यदि स्राव से बहुत तेज दुर्गंध, खुजली या बुखार हो। अपनी माँ के साथ जाकर परामर्श लेना सबसे अच्छा रहता है।`;
    }
    if (lang === 'mr') {
      return `मैत्रिणी, आरोग्य सर्वात महत्त्वाचे आहे. खालील लक्षणे दिसल्यास डॉक्टरांचा सल्ला नक्की घ्या:\n\n⚠️ डॉक्टरांकडे कधी जावे:\n• दर १-२ तासांनी सॅनिटरी पॅड बदलावा लागत असेल.\n• पोटात अत्यंत तीव्र आणि असह्य वेदना होत असतील.\n• सलग ३ महिने पाळी आली नसेल.\n• पाळी ७ दिवसांपेक्षा जास्त काळ चालत असेल. आईशी बोलून महिला डॉक्टरांना नक्की दाखवा.`;
    }
    return `Your wellbeing is paramount! While most symptoms are natural, here are the red flags when you should warmly consult a gynaecologist:\n\n⚠️ When to see a doctor:\n• Soaking through a full pad every 1 to 2 hours consecutively.\n• Severe, disabling pelvic pain not relieved by rest or heating pads.\n• Periods missing for more than 90 consecutive days.\n• Bleeding that lasts longer than 7 full days.\n• Foul-smelling discharge accompanied by fever, burning, or intense itching.`;
  }

  // 23. CYCLE LENGTH & HOW TO COUNT DAYS
  if (matches(['cycle length', 'calculate', 'count days', 'how long', 'कितने दिन', 'गिनती', 'गणना', 'कसे मोजायचे', 'cycle calculate'])) {
    if (lang === 'hi') {
      return `मासिक चक्र की सही गिनती करना बहुत आसान है:\n\nगणना कैसे करें:\n• 'दिन 1' (Day 1) वह दिन होता है जब आपको वास्तविक रक्तस्राव शुरू होता है।\n• एक चक्र की लंबाई: इस माहवारी के दिन 1 से लेकर अगली माहवारी के दिन 1 से ठीक पहले वाले दिन तक के कुल दिन।\n• सामान्य चक्र 21 से 35 दिनों का होता है (किशोरावस्था में यह 40 दिनों तक भी हो सकता है)। ब्लूम में अपने पीरियड्स लॉग करते रहें, ब्लूम खुद आपके औसत चक्र की गणना कर लेगा!`;
    }
    if (lang === 'mr') {
      return `मासिक पाळीचे दिवस मोजणे खूप सोपे आहे:\n\n• 'दिवस १' म्हणजे ज्या दिवशी प्रत्यक्ष रक्तस्त्राव सुरू होतो.\n• एका पाळीच्या पहिल्या दिवसापासून ते पुढच्या पाळीच्या पहिल्या दिवसाच्या आदल्या दिवसापर्यंतचा काळ म्हणजे 'चक्राचा कालावधी'.\n• सामान्यतः हा कालावधी २१ ते ३५ दिवसांचा असतो. ब्लूम ॲपमध्ये नोंदी ठेवा, ॲप आपोआप सर्व मोजून देईल!`;
    }
    return `Counting your cycle days is simple and empowering:\n\nHow to calculate:\n• Day 1 is the very first day of actual red bleeding (not light spotting).\n• Your cycle length is the total number of days from Day 1 of one period up to the day before your next period begins.\n• A typical cycle spans 21 to 35 days (often up to 40 days in teens). Just log your dates in Bloom and it tracks your averages automatically!`;
  }

  // 24. PMS (PREMENSTRUAL SYNDROME)
  if (matches(['pms', 'premenstrual', 'before period', 'आने से पहले', 'पाळीपूर्वी', 'period se pehle'])) {
    if (lang === 'hi') {
      return `पीएमएस (Premenstrual Syndrome) उन शारीरिक और मानसिक लक्षणों का समूह है जो माहवारी शुरू होने से 3 से 7 दिन पहले महसूस होते हैं।\n\nआम लक्षण:\n• स्तनों में भारीपन, पेट में हल्का फूलना, सिरदर्द, थकान और मूड में बदलाव।\n• यह प्रोजेस्टेरोन और एस्ट्रोजन हार्मोन्स के तेजी से गिरने के कारण होता है।\n• जैसे ही माहवारी शुरू होती है, ये लक्षण 1-2 दिनों में गायब हो जाते हैं। भरपूर नींद लें और तनाव मुक्त रहें!`;
    }
    if (lang === 'mr') {
      return `पीएमएस (PMS) म्हणजे पाळी सुरू होण्याच्या ३ ते ७ दिवस आधी शरीरात आणि मनात जाणवणारे नैसर्गिक बदल.\n\nलक्षणे:\n• पोट फुगणे, डोकेदुखी, चिडचिड आणि थकवा.\n• पाळी सुरू होताच हे सर्व लक्षणे आपोआप नाहीशी होतात. स्वतःची छान काळजी घ्या!`;
    }
    return `PMS (Premenstrual Syndrome) refers to the gentle physical and emotional shifts that occur 3 to 7 days before your period arrives.\n\nClassic signs:\n• Tummy bloating, breast tenderness, mild headache, food cravings, and emotional waves.\n• These symptoms are completely normal and fade within 1–2 days of your period starting. Be extra gentle with yourself!`;
  }

  // 25. BATHING, SHOWERS & SWIMMING
  if (matches(['swim', 'bath', 'shower', 'cold water', 'नहाना', 'तैरना', 'स्नान', 'आंघोळ', 'nahana', 'tairna'])) {
    if (lang === 'hi') {
      return `हाँ, बिल्कुल! माहवारी के दौरान नहाना 100% सुरक्षित और आवश्यक है।\n\nमहत्वपूर्ण बातें:\n• गुनगुने पानी से नहाना गर्भाशय और कमर की मांसपेशियों को तुरंत आराम देता है और ऐंठन कम करता है।\n• यह स्वच्छता बनाए रखने और किसी भी दुर्गंध से बचने के लिए बहुत जरूरी है।\n• स्विमिंग (तैरना) भी पूरी तरह सुरक्षित है यदि आप मेंस्ट्रुअल कप या टैम्पोन का उपयोग करती हैं।`;
    }
    if (lang === 'mr') {
      return `होय, नक्कीच! पाळीदरम्यान दररोज आंघोळ करणे १००% सुरक्षित आणि स्वच्छतेसाठी अत्यंत गरजेचे आहे.\n\n• कोमट पाण्याने आंघोळ केल्यास स्नायूंना आराम मिळतो आणि पोटदुखी कमी होते.\n• मासिक पाळीत स्वच्छता राखणे हे निरोगी आरोग्याची गुरुकिल्ली आहे.`;
    }
    return `Yes, absolutely! Bathing during your period is 100% safe, hygienic, and highly recommended.\n\nBenefits:\n• A warm shower or bath relaxes tight abdominal muscles and eases cramps naturally.\n• It keeps you feeling fresh and energized.\n• Swimming is also completely safe if you use a menstrual cup or tampon!`;
  }

  // 26. GENERAL CONTEXTUAL CYCLE-AWARE FALLBACK
  if (lang === 'hi') {
    return `सहेली, आपके इस प्रश्न के लिए धन्यवाद। चक्र के दिन ${curDay} (${curPhaseName}) पर आपका शरीर प्राकृतिक रूप से कई महत्वपूर्ण बदलावों से गुजरता है।\n\nइस समय के लिए मुख्य स्वास्थ्य सलाह:\n• पर्याप्त पानी पिएं (दिन में कम से कम 8-10 गिलास) और पौष्टिक, घर का ताजा भोजन लें।\n• अपने शरीर के संकेतों को सुनें—यदि थकान लगे तो भरपूर आराम करें, और यदि ऊर्जा अच्छी हो तो हल्की सैर या योग करें।\n• पेट पर हल्का गर्म सेक और संतुलित नींद हर चरण में मददगार रहती है।\n\nयदि आपके मन में कोई विशिष्ट प्रश्न है या कोई असुविधा महसूस हो रही है, तो मुझे खुलकर बताएं!`;
  }
  if (lang === 'mr') {
    return `मैत्रिणी, तुझ्या प्रश्नाबद्दल धन्यवाद. सध्या दिवस ${curDay} (${curPhaseName}) वर शरीरामध्ये हार्मोन्सचे नैसर्गिक कार्य सुरू आहे.\n\nआरोग्यासाठी टिप्स:\n• दिवसातून किमान ८-१० ग्लास पाणी प्या आणि पौष्टिक घरचे जेवण घ्या.\n• शरीराला आवश्यकतेनुसार विश्रांती द्या.\n• हलका व्यायाम आणि पुरेशी झोप मानसिक आणि शारीरिक स्वास्थ्य उत्तम ठेवतात.\n\nतुला पोटदुखी, रक्तप्रवाह किंवा इतर काही जाणून घ्यायचे असल्यास मला निःसंकोच विचार!`;
  }

  return `Thank you for asking, sweet friend! Currently on Day ${curDay} of your cycle (${curPhaseName}), your hormones and body rhythm are constantly working together to keep you healthy.\n\nHere are supportive guidelines for your current phase:\n• Stay deeply hydrated with at least 8 glasses of water or warm herbal infusions daily.\n• Nourish yourself with wholesome, colorful foods rich in iron, zinc, and healthy vitamins.\n• Tune into your body's energy: allow quiet rest when tired, and enjoy creative movement when stamina feels high.\n\nFeel free to ask me anything specific about cramps, delays, nutrition, pad changes, or emotions—I am always right here for you!`;
}

// Create HTTP server
const server = http.createServer((req, res) => {
  // Add CORS headers so client apps can query from anywhere
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // 1. Health check & status endpoint
  if (req.method === 'GET' && (pathname === '/api/health' || pathname === '/api/status')) {
    loadEnv();
    const geminiKey = (process.env.GEMINI_API_KEY || '').trim();
    const openAiKey = (process.env.OPENAI_API_KEY || '').trim();
    const hasGemini = Boolean(geminiKey && geminiKey !== 'your_gemini_api_key_here');
    const hasOpenAI = Boolean(openAiKey && openAiKey !== 'your_openai_api_key_here');

    let activeEngine = 'builtin';
    if (hasOpenAI || (hasGemini && geminiKey.startsWith('sk-'))) {
      activeEngine = 'openai-chatgpt';
    } else if (hasGemini) {
      activeEngine = 'gemini-flash';
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      aiConfigured: hasGemini || hasOpenAI,
      activeEngine: activeEngine,
      geminiConfigured: hasGemini,
      openaiConfigured: hasOpenAI,
      geminiModel: GEMINI_MODEL,
      openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      port: PORT
    }));
    return;
  }

  // 2. Bloom Intelligent AI endpoint (Multi-provider: OpenAI ChatGPT / Gemini Flash / Builtin)
  if (req.method === 'POST' && pathname === '/api/bloom-ai') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        loadEnv(); // Reload env dynamically on every query so changes in .env take effect immediately
        const payload = JSON.parse(body || '{}');

        const geminiKey = (process.env.GEMINI_API_KEY || '').trim();
        const openAiKey = (process.env.OPENAI_API_KEY || '').trim();
        const clientKey = (payload.apiKey || '').trim();

        const isPlaceholder = (k) => !k || k === 'your_gemini_api_key_here' || k === 'your_openai_api_key_here';

        // 1. Prioritize OpenAI ChatGPT if an OpenAI key is configured (sk-...)
        const candidateOpenAiKey = (!isPlaceholder(clientKey) && clientKey.startsWith('sk-')) ? clientKey
          : (!isPlaceholder(openAiKey) ? openAiKey
          : (!isPlaceholder(geminiKey) && geminiKey.startsWith('sk-') ? geminiKey : null));

        if (candidateOpenAiKey) {
          try {
            console.log(`[BLOOM-AI] Calling OpenAI ChatGPT (${process.env.OPENAI_MODEL || 'gpt-4o-mini'}) for: "${(payload.prompt || payload.transcript || '').slice(0, 50)}..."`);
            const reply = await callOpenAIAPI(candidateOpenAiKey, payload);
            console.log(`[BLOOM-AI] OpenAI ChatGPT responded successfully (${reply.length} chars)`);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ reply, source: 'openai' }));
            return;
          } catch (openAiErr) {
            console.warn('[BLOOM-AI] OpenAI ChatGPT error:', openAiErr.message);
          }
        }

        // 2. Call Google Gemini Flash if a Gemini key is configured
        const candidateGeminiKey = (!isPlaceholder(clientKey) && !clientKey.startsWith('sk-')) ? clientKey
          : (!isPlaceholder(geminiKey) && !geminiKey.startsWith('sk-') ? geminiKey : null);

        if (candidateGeminiKey) {
          try {
            console.log(`[BLOOM-AI] Calling Google Gemini (${GEMINI_MODEL}) for: "${(payload.prompt || payload.transcript || '').slice(0, 50)}..."`);
            const reply = await callGeminiAPI(candidateGeminiKey, payload);
            console.log(`[BLOOM-AI] Gemini Flash responded successfully (${reply.length} chars)`);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ reply, source: 'gemini' }));
            return;
          } catch (geminiErr) {
            console.warn('[BLOOM-AI] Google Gemini API error:', geminiErr.message);
          }
        }

        // 3. Builtin cycle-aware Women's Health Intelligence Engine
        console.log(`[BLOOM-AI] Responding via Builtin Intelligence (Day ${payload.cycleDay || 1}, Phase ${payload.phase || 0}, Lang ${payload.language || 'en'})`);
        const reply = getBuiltinBloomReply(payload);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ reply, source: 'builtin' }));

      } catch (err) {
        console.error('[BLOOM-AI] Error:', err.message);
        const fallbackReply = getBuiltinBloomReply({ prompt: 'general advice' });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ reply: fallbackReply, source: 'builtin' }));
      }
    });
    return;
  }

  // 3. Set API Key dynamically (supports both OpenAI 'sk-' and Google Gemini 'AIza')
  if (req.method === 'POST' && pathname === '/api/set-key') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { apiKey } = JSON.parse(body || '{}');
        const trimmed = (apiKey || '').trim();
        if (!trimmed) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'API Key cannot be empty.' }));
          return;
        }

        const envPath = path.join(__dirname, '.env');
        let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

        const isOpenAI = trimmed.startsWith('sk-');
        if (isOpenAI) {
          process.env.OPENAI_API_KEY = trimmed;
          if (envContent.includes('OPENAI_API_KEY=')) {
            envContent = envContent.replace(/OPENAI_API_KEY=.*/g, `OPENAI_API_KEY=${trimmed}`);
          } else {
            envContent += `\nOPENAI_API_KEY=${trimmed}\n`;
          }
        } else {
          process.env.GEMINI_API_KEY = trimmed;
          if (envContent.includes('GEMINI_API_KEY=')) {
            envContent = envContent.replace(/GEMINI_API_KEY=.*/g, `GEMINI_API_KEY=${trimmed}`);
          } else {
            envContent += `\nGEMINI_API_KEY=${trimmed}\n`;
          }
        }

        fs.writeFileSync(envPath, envContent, 'utf8');
        loadEnv();

        const engineName = isOpenAI ? 'OpenAI ChatGPT (gpt-4o-mini)' : `Google Gemini (${GEMINI_MODEL})`;
        console.log(`[ENV] Successfully updated and persisted key for ${engineName}`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'ok',
          message: `${engineName} API key configured successfully!`,
          provider: isOpenAI ? 'openai' : 'gemini'
        }));
      } catch (err) {
        console.error('[SET-KEY] Error:', err.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 4. Static File Serving
  let filePath = pathname === '/' ? '/preview.html' : pathname;
  // Prevent directory traversal
  const safePath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, '');
  let fullPath = path.join(__dirname, safePath);

  // If path is a directory or file not found, fall back to preview.html
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
    fullPath = path.join(fullPath, 'preview.html');
  }

  if (!fs.existsSync(fullPath)) {
    // Try in parent or dist
    const altPath = path.join(__dirname, 'preview.html');
    if (fs.existsSync(altPath)) {
      fullPath = altPath;
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
  }

  const ext = path.extname(fullPath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(fullPath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Internal Server Error: ${err.message}`);
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('====================================================');
  console.log(`  BLOOM App Server running at: http://localhost:${PORT}/preview.html`);
  console.log(`  API Endpoint: http://localhost:${PORT}/api/bloom-ai`);
  console.log(`  Gemini Model: ${GEMINI_MODEL}`);
  console.log('====================================================');
});
