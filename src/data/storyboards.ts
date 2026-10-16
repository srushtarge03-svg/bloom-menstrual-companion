/**
 * Comprehensive Storyboard Definition for BLOOM
 * Covers all 4 Before levels and all 7 First Period topics.
 * Each scene defines:
 * - 2D Girl character pose, expression, look direction, and speaking state
 * - Explanatory visual props, step counters, diagrams, and synchronized keywords
 * - Multi-lingual narration text (EN, HI, MR) without any emoji
 */

export interface StoryboardScene {
  id: string;
  stepNumber?: number;
  totalSteps?: number;
  duration: number; // duration in seconds
  girl: {
    pose: 'calm' | 'waving' | 'pointing' | 'holding-pad' | 'explaining' | 'thinking' | 'resting' | 'washroom-prep' | 'breathing';
    expression: 'happy' | 'curious' | 'worried' | 'relieved' | 'proud';
    look: 'center' | 'left' | 'right' | 'up';
  };
  propType: string;
  keywords: {
    en: string[];
    hi: string[];
    mr: string[];
  };
  labels: {
    en: string[];
    hi: string[];
    mr: string[];
  };
  title: {
    en: string;
    hi: string;
    mr: string;
  };
  narration: {
    en: string;
    hi: string;
    mr: string;
  };
}

export interface StoryboardLesson {
  id: string;
  section: 'learn' | 'prepare';
  title: {
    en: string;
    hi: string;
    mr: string;
  };
  scenes: StoryboardScene[];
}

export const STORYBOARDS: Record<string, StoryboardLesson> = {
  // --- SECTION 1: BEFORE MY FIRST PERIOD ---
  l1: {
    id: 'l1',
    section: 'learn',
    title: {
      en: 'My Changing Body',
      hi: 'मेरा बदलता शरीर',
      mr: 'माझे बदलणारे शरीर',
    },
    scenes: [
      {
        id: 'l1-s1',
        duration: 6,
        girl: { pose: 'waving', expression: 'happy', look: 'center' },
        propType: 'growth-chart-diagram',
        keywords: {
          en: ['Growing Taller', 'Natural Timing', 'Ages 8-14'],
          hi: ['लंबाई बढ़ना', 'प्राकृतिक समय', '8 से 14 वर्ष'],
          mr: ['उंची वाढणे', 'नैसर्गिक वेळ', '८ ते १४ वर्षे'],
        },
        labels: {
          en: ['Height Growth', 'Every Body is Unique'],
          hi: ['ऊंचाई में बदलाव', 'हर शरीर अनोखा है'],
          mr: ['उंचीतील बदल', 'प्रत्येक शरीर वेगळे'],
        },
        title: {
          en: 'Your body is growing',
          hi: 'आपका शरीर बढ़ रहा है',
          mr: 'तुमचे शरीर वाढत आहे',
        },
        narration: {
          en: 'Between ages eight and fourteen, our bodies start growing in new ways. You might notice getting taller and clothes fitting differently. Everyone begins at their own natural time, and that is completely normal.',
          hi: 'आठ से चौदह साल की उम्र के बीच हमारा शरीर नए तरीके से बढ़ने लगता है। आपकी लंबाई बढ़ सकती है। हर किसी की शुरुआत अपने प्राकृतिक समय पर होती है, और यह पूरी तरह सामान्य है।',
          mr: '८ ते १४ वयोगटात आपले शरीर वेगवेगळ्या प्रकारे वाढू लागते. तुम्ही उंच होऊ शकता. प्रत्येकाची सुरुवात स्वतःच्या नैसर्गिक वेळी होते आणि ते पूर्णपणे सामान्य आहे.',
        },
      },
      {
        id: 'l1-s2',
        duration: 6,
        girl: { pose: 'explaining', expression: 'curious', look: 'right' },
        propType: 'water-hygiene-routine',
        keywords: {
          en: ['Daily Bath', 'Drink Water', 'Clean Clothes'],
          hi: ['रोज स्नान', 'पानी पिएं', 'साफ कपड़े'],
          mr: ['रोज आंघोळ', 'पाणी प्या', 'स्वच्छ कपडे'],
        },
        labels: {
          en: ['Gentle Washing', 'Fresh Skin Care'],
          hi: ['साधारण धुलाई', 'त्वचा की देखभाल'],
          mr: ['स्वच्छ धुणे', 'त्वचेची काळजी'],
        },
        title: {
          en: 'Taking gentle care',
          hi: 'अपना ध्यान रखें',
          mr: 'स्वतःची काळजी घ्या',
        },
        narration: {
          en: 'As you grow, your skin might produce more oils and sweat. Washing daily with clean water, wearing comfortable cotton clothes, and drinking plenty of water keeps you feeling fresh and energetic.',
          hi: 'बढ़ती उम्र में पसीना और त्वचा का तेल थोड़ा बढ़ सकता है। रोज़ साफ पानी से नहाना, सूती कपड़े पहनना और पर्याप्त पानी पीना आपको तरोताज़ा और स्वस्थ रखता है।',
          mr: 'वाढत्या वयात घाम आणि त्वचेवरील तेल थोडे वाढू शकते. रोज स्वच्छ पाण्याने आंघोळ करणे, सुती कपडे घालणे आणि भरपूर पाणी पिणे तुम्हाला ताजेतवाने ठेवते.',
        },
      },
      {
        id: 'l1-s3',
        duration: 6,
        girl: { pose: 'calm', expression: 'relieved', look: 'center' },
        propType: 'trusted-adult-circle',
        keywords: {
          en: ['Ask Questions', 'Mother or Teacher', 'Safe Support'],
          hi: ['सवाल पूछें', 'मां या शिक्षिका', 'सुरक्षित मदद'],
          mr: ['प्रश्न विचारा', 'आई किंवा शिक्षिका', 'सुरक्षित मदत'],
        },
        labels: {
          en: ['Trusted Family', 'Doctor or Nurse'],
          hi: ['भरोसेमंद परिवार', 'डॉक्टर या नर्स'],
          mr: ['विश्वासू कुटुंब', 'डॉक्टर किंवा परिचारिका'],
        },
        title: {
          en: 'Questions are always welcome',
          hi: 'सवाल पूछना हमेशा सही है',
          mr: 'प्रश्न विचारणे नेहमी योग्य आहे',
        },
        narration: {
          en: 'Whenever you wonder about changes in your body or feelings, you can talk to a trusted adult like your mother, aunt, teacher, or school nurse. No question is silly, and they are here to guide you.',
          hi: 'शरीर में किसी भी बदलाव पर आप मां, मौसी, शिक्षिका या डॉक्टर जैसे किसी भरोसेमंद बड़े से बात कर सकती हैं। कोई भी सवाल छोटा नहीं होता, वे प्यार से मदद करेंगे।',
          mr: 'शरीरातील बदलांबद्दल कोणतीही शंका असल्यास तुम्ही आई, मावशी, शिक्षिका किंवा डॉक्टरांशी बोलू शकता. कोणताही प्रश्न लहान नसतो, ते प्रेमाने मार्गदर्शन करतील.',
        },
      },
    ],
  },

  l2: {
    id: 'l2',
    section: 'learn',
    title: {
      en: 'Understanding Puberty',
      hi: 'किशोरावस्था को समझें',
      mr: 'वयात येणे समजून घ्या',
    },
    scenes: [
      {
        id: 'l2-s1',
        duration: 6,
        girl: { pose: 'explaining', expression: 'happy', look: 'center' },
        propType: 'puberty-bridge-visual',
        keywords: {
          en: ['Childhood to Adulthood', 'Natural Journey', 'Health'],
          hi: ['बचपन से बड़ा होना', 'प्राकृतिक सफर', 'स्वास्थ्य'],
          mr: ['बालपण ते मोठेपण', 'नैसर्गिक प्रवास', 'आरोग्य'],
        },
        labels: {
          en: ['Childhood', 'Bridge of Growth', 'Adulthood'],
          hi: ['बचपन', 'वृद्धि का सेतु', 'बड़ा होना'],
          mr: ['बालपण', 'वाढीचा पूल', 'मोठेपण'],
        },
        title: {
          en: 'The natural bridge of growth',
          hi: 'किशोरावस्था का सफर',
          mr: 'वाढीचा सुंदर टप्पा',
        },
        narration: {
          en: 'Puberty is nature’s bridge connecting childhood to adulthood. It is a completely healthy, gradual journey that gently prepares your body and mind for the years ahead.',
          hi: 'किशोरावस्था बचपन और बड़े होने के बीच प्रकृति का एक सुंदर पुल है। यह एक स्वाभाविक और स्वस्थ यात्रा है जो आपके शरीर को धीरे-धीरे भविष्य के लिए तैयार करती है।',
          mr: 'वयात येणे हा बालपण आणि मोठे होण्यामधील निसर्गाचा एक सुंदर पूल आहे. हा एक नैसर्गिक आणि निरोगी टप्पा आहे जो शरीराला पुढील काळासाठी तयार करतो.',
        },
      },
      {
        id: 'l2-s2',
        duration: 6,
        girl: { pose: 'thinking', expression: 'curious', look: 'left' },
        propType: 'emotion-waves-visual',
        keywords: {
          en: ['Changing Emotions', 'Hormone Waves', 'Normal Feelings'],
          hi: ['बदलते भाव', 'हार्मोन तरंगें', 'सामान्य अहसास'],
          mr: ['बदलत्या भावना', 'हार्मोन्सच्या लाटा', 'सामान्य भावना'],
        },
        labels: {
          en: ['Energy Waves', 'Kind Self-Talk'],
          hi: ['उत्साह और विश्राम', 'खुद के प्रति कोमलता'],
          mr: ['उत्साह आणि विश्रांती', 'स्वतःची काळजी'],
        },
        title: {
          en: 'Emotions and changing moods',
          hi: 'भावनाओं का उतार-चढ़ाव',
          mr: 'भावनांची चढ-उतार',
        },
        narration: {
          en: 'Along with physical growth, you might feel emotions more deeply or notice your moods shifting from energetic to quiet. These gentle waves happen because internal hormones are waking up.',
          hi: 'शारीरिक वृद्धि के साथ-साथ मन के भाव भी बदल सकते हैं। कभी बहुत खुशी तो कभी शांति का मन होना पूरी तरह सामान्य है क्योंकि शरीर के हार्मोन सक्रिय हो रहे हैं।',
          mr: 'शरीराच्या वाढीसोबत भावनाही तीव्र वाटू शकतात. कधी खूप उत्साह तर कधी शांत राहावेसे वाटणे सामान्य आहे, कारण शरीरातील हार्मोन्स कार्यरत होत आहेत.',
        },
      },
      {
        id: 'l2-s3',
        duration: 6,
        girl: { pose: 'breathing', expression: 'relieved', look: 'center' },
        propType: 'mindful-calm-visual',
        keywords: {
          en: ['Deep Breathing', 'Gentle Rest', 'Patience with Self'],
          hi: ['गहरी सांस', 'सुकून भरा आराम', 'धैर्य रखें'],
          mr: ['दीर्घ श्वास', 'शांत विश्रांती', 'संयम ठेवा'],
        },
        labels: {
          en: ['Take a Slow Breath', 'You are Growing Well'],
          hi: ['धीमी सांस लें', 'आप अच्छी तरह बढ़ रही हैं'],
          mr: ['हळूवार श्वास घ्या', 'तुमची वाढ छान होत आहे'],
        },
        title: {
          en: 'Being gentle with yourself',
          hi: 'खुद को समझें और धैर्य रखें',
          mr: 'स्वतःशी प्रेमाने वागा',
        },
        narration: {
          en: 'Whenever your thoughts feel busy, pause and take three slow, calming breaths. Remember that every girl around the world goes through these changes at her own pace.',
          hi: 'जब भी मन में कई विचार आएं, थोड़ा रुकें और तीन गहरी सांसें लें। याद रखें कि दुनिया भर में हर लड़की अपनी गति से इस सुंदर बदलाव से गुज़रती है।',
          mr: 'जेव्हा मनात खूप विचार येतील, तेव्हा थोडे थांबा आणि तीन शांत दीर्घ श्वास घ्या. लक्षात ठेवा की प्रत्येक मुलगी स्वतःच्या गतीने या टप्प्यातून जात असते.',
        },
      },
    ],
  },

  l3: {
    id: 'l3',
    section: 'learn',
    title: {
      en: 'Hormones: Body Messengers',
      hi: 'हार्मोन: शरीर के संदेशवाहक',
      mr: 'हार्मोन्स: शरीराचे दूत',
    },
    scenes: [
      {
        id: 'l3-s1',
        duration: 6,
        girl: { pose: 'pointing', expression: 'curious', look: 'right' },
        propType: 'hormone-pathway-diagram',
        keywords: {
          en: ['Chemical Messengers', 'Brain to Body', 'Estrogen'],
          hi: ['रासायनिक संदेशवाहक', 'मस्तिष्क से शरीर', 'एस्ट्रोजन'],
          mr: ['रासायनिक दूत', 'मेंदू ते शरीर', 'इस्ट्रोजेन'],
        },
        labels: {
          en: ['Brain Control Center', 'Gentle Signal Pathways'],
          hi: ['नियंत्रण केंद्र', 'प्राकृतिक संकेत मार्ग'],
          mr: ['नियंत्रण केंद्र', 'नैसर्गिक संदेश मार्ग'],
        },
        title: {
          en: 'Tiny natural messengers',
          hi: 'काम पर लगे नन्हे संदेशवाहक',
          mr: 'कामाला लागलेले दूत',
        },
        narration: {
          en: 'Hormones are tiny chemical messengers made inside your body. The brain sends gentle signals to help you grow taller, strengthen bones, and guide your reproductive system.',
          hi: 'हार्मोन हमारे शरीर के अंदर बनने वाले छोटे रासायनिक संदेशवाहक होते हैं। मस्तिष्क संकेतों द्वारा शरीर को बढ़ने, हड्डियों को मज़बूत करने और चक्र को शुरू करने में मदद करता है।',
          mr: 'हार्मोन्स हे शरीरात तयार होणारे नैसर्गिक रासायनिक संदेशवाहक आहेत. मेंदू शरीराला योग्य वेळी वाढण्यासाठी आणि मासिक चक्र सुरू करण्यासाठी संकेत देतो.',
        },
      },
      {
        id: 'l3-s2',
        duration: 6,
        girl: { pose: 'explaining', expression: 'happy', look: 'center' },
        propType: 'hormone-cycle-harmony',
        keywords: {
          en: ['Monthly Waves', 'Natural Harmony', 'Balanced Rhythms'],
          hi: ['मासिक तरंगें', 'प्राकृतिक लय', 'संतुलित चक्र'],
          mr: ['मासिक लाटा', 'नैसर्गिक लय', 'संतुलित चक्र'],
        },
        labels: {
          en: ['Estrogen & Progesterone', 'Rhythmic Teamwork'],
          hi: ['एस्ट्रोजन और प्रोजेस्टेरोन', 'लयबद्ध सहयोग'],
          mr: ['इस्ट्रोजेन आणि प्रोजेस्टेरॉन', 'सुसंवादी कार्य'],
        },
        title: {
          en: 'A monthly orchestra',
          hi: 'एक प्राकृतिक सुंदर धुन',
          mr: 'एक सुंदर नैसर्गिक लय',
        },
        narration: {
          en: 'Just like musical instruments playing together in harmony, different hormones rise and settle in gentle monthly waves. They guide when the uterine lining forms and when it rests.',
          hi: 'जैसे संगीत के वाद्ययंत्र एक साथ मिलकर सुंदर धुन बनाते हैं, वैसे ही हार्मोन मिलकर काम करते हैं। वे शरीर को नया अस्तर बनाने और आराम देने का समय तय करते हैं।',
          mr: 'जशी वाद्ये एकत्र येऊन सुंदर संगीत निर्माण करतात, तसेच हार्मोन्स एकत्र येऊन दरमहा शरीराची लय सांभाळतात आणि गर्भाशयाचे अस्तर नियंत्रित करतात.',
        },
      },
    ],
  },

  l4: {
    id: 'l4',
    section: 'learn',
    title: {
      en: 'Understanding Menstruation',
      hi: 'माहवारी को समझें',
      mr: 'मासिक पाळी समजून घ्या',
    },
    scenes: [
      {
        id: 'l4-s1',
        duration: 6,
        girl: { pose: 'pointing', expression: 'calm', look: 'right' },
        propType: 'uterine-cushion-diagram',
        keywords: {
          en: ['Soft Cushion', 'Uterus Lining', 'Tiny Blood Vessels'],
          hi: ['मुलायम गद्दी', 'गर्भाशय अस्तर', 'नन्हीं रक्त नलिकाएं'],
          mr: ['मऊ गादी', 'गर्भाशयाचे अस्तर', 'रक्तवाहिन्या'],
        },
        labels: {
          en: ['Uterus Cushion Layer', 'Healthy Tissue Bed'],
          hi: ['नरम सुरक्षा परत', 'स्वस्थ अस्तर'],
          mr: ['उबदार मऊ गादी', 'निरोगी अस्तर'],
        },
        title: {
          en: 'The monthly protective cushion',
          hi: 'महीने की मुलायम गद्दी',
          mr: 'दर महिन्याची मऊ गादी',
        },
        narration: {
          en: 'Each month, the uterus prepares a warm, soft cushion made of tiny blood vessels and tissue. This natural lining shows that your reproductive organs are developing smoothly and healthily.',
          hi: 'हर महीने गर्भाशय नन्हीं रक्त नलिकाओं और ऊतकों की एक मुलायम, गर्म गद्दी तैयार करता है। यह प्राकृतिक प्रक्रिया बताती है कि आपका शरीर स्वस्थ रूप से विकसित हो रहा है।',
          mr: 'दरमहा गर्भाशय रक्तवाहिन्यांची एक मऊ, उबदार गादी तयार करते. ही नैसर्गिक क्रिया दर्शवते की तुमचे शरीर निरोगीपणे विकसित होत आहे.',
        },
      },
      {
        id: 'l4-s2',
        duration: 6,
        girl: { pose: 'waving', expression: 'proud', look: 'center' },
        propType: 'natural-reset-flow',
        keywords: {
          en: ['Healthy Reset', 'Not Dirty', 'Purely Natural Blood'],
          hi: ['स्वस्थ नई शुरुआत', 'गंदा नहीं', 'प्राकृतिक रक्त'],
          mr: ['निरोगी नवी सुरुवात', 'घाणेरडे नाही', 'नैसर्गिक रक्त'],
        },
        labels: {
          en: ['Gentle Release', 'Body Reset Day 1'],
          hi: ['प्राकृतिक प्रवाह', 'शरीर का नया चक्र'],
          mr: ['नैसर्गिक स्राव', 'नवीन चक्राची सुरुवात'],
        },
        title: {
          en: 'A clean and healthy reset',
          hi: 'साफ और स्वस्थ चक्र',
          mr: 'स्वच्छ आणि निरोगी प्रक्रिया',
        },
        narration: {
          en: 'When the cushion is not needed, the body gently releases it over three to seven days. Menstrual fluid is clean, normal blood and tissue. It is never dirty or poisonous; it is a sign of good health.',
          hi: 'जब उस गद्दी की ज़रूरत नहीं होती, तो शरीर उसे तीन से सात दिनों में बाहर निकाल देता है। माहवारी का रक्त पूरी तरह साफ और प्राकृतिक होता है; यह कभी अशुद्ध नहीं होता।',
          mr: 'गादीची गरज नसताना शरीर ती ३ ते ७ दिवसांत हळूवारपणे बाहेर टाकते. मासिक पाळीचे रक्त स्वच्छ व नैसर्गिक असते; ते अशुद्ध नसते, तर चांगल्या आरोग्याचे लक्षण आहे.',
        },
      },
    ],
  },

  // --- SECTION 2: MY FIRST PERIOD ---
  p1: {
    id: 'p1',
    section: 'prepare',
    title: {
      en: 'What to do when it starts',
      hi: 'शुरू हो तो क्या करें',
      mr: 'सुरू झाल्यावर काय करावे',
    },
    scenes: [
      {
        id: 'p1-s1',
        stepNumber: 1,
        totalSteps: 3,
        duration: 6,
        girl: { pose: 'breathing', expression: 'worried', look: 'center' },
        propType: 'first-period-calm-step',
        keywords: {
          en: ['Take a Slow Breath', 'Normal Spotting', 'Stay Calm'],
          hi: ['धीमी सांस लें', 'हल्का सा दाग', 'शांत रहें'],
          mr: ['हळूवार श्वास घ्या', 'हलका डाग', 'शांत राहा'],
        },
        labels: {
          en: ['Step 1: Pause and Breathe', 'You are Completely Safe'],
          hi: ['कदम 1: रुकें और गहरी सांस लें', 'आप बिल्कुल सुरक्षित हैं'],
          mr: ['टप्पा १: थांबा आणि श्वास घ्या', 'तुम्ही पूर्णपणे सुरक्षित आहात'],
        },
        title: {
          en: 'Stay calm and breathe',
          hi: 'घबराएं नहीं, शांत रहें',
          mr: 'घाबरू नका, शांत राहा',
        },
        narration: {
          en: 'When you notice a little reddish or brown stain on your underwear for the first time, take a slow breath. Your body has reached a healthy milestone. There is nothing to worry about.',
          hi: 'जब आप पहली बार अपने अंडरवियर पर लाल या भूरा दाग देखें, तो घबराएं नहीं। एक गहरी सांस लें। यह शरीर के स्वस्थ विकास का एक सामान्य पड़ाव है।',
          mr: 'जेव्हा तुम्ही पहिल्यांदा अंडरवेअरवर लाल किंवा तपकिरी डाग पाहाल, तेव्हा घाबरू नका. दीर्घ श्वास घ्या. हे शरीर वाढल्याचे एक सामान्य आणि निरोगी लक्षण आहे.',
        },
      },
      {
        id: 'p1-s2',
        stepNumber: 2,
        totalSteps: 3,
        duration: 6,
        girl: { pose: 'washroom-prep', expression: 'curious', look: 'right' },
        propType: 'washroom-pad-step',
        keywords: {
          en: ['Take Clean Pad', 'Go to Washroom', 'Secure Underwear'],
          hi: ['साफ पैड लें', 'वॉशरुम जाएं', 'पैड लगाएं'],
          mr: ['स्वच्छ पॅड घ्या', 'स्वच्छतागृहात जा', 'पॅड लावा'],
        },
        labels: {
          en: ['Step 2: Head to Washroom', 'Use Soft Pad'],
          hi: ['कदम 2: वॉशरुम जाएं', 'साफ पैड का उपयोग करें'],
          mr: ['टप्पा २: स्वच्छतागृहात जा', 'स्वच्छ पॅड वापरा'],
        },
        title: {
          en: 'Head to the washroom with a pad',
          hi: 'साफ पैड लेकर वॉशरुम जाएं',
          mr: 'स्वच्छ पॅड घेऊन स्वच्छतागृहात जा',
        },
        narration: {
          en: 'Go to the washroom with your emergency pouch or a clean pad from your bag. If you are in school, you can visit the school clinic or ask a female teacher for one.',
          hi: 'अपने बैग से साफ पैड या इमरजेंसी किट लेकर वॉशरुम जाएं। अगर आप स्कूल में हैं, तो स्कूल नर्स या शिक्षिका से आसानी से पैड मांग सकती हैं।',
          mr: 'तुमच्या बॅगमधून स्वच्छ पॅड किंवा किट घेऊन स्वच्छतागृहात जा. शाळेत असल्यास तुम्ही परिचारिका किंवा शिक्षिकेकडून सहज पॅड मागू शकता.',
        },
      },
      {
        id: 'p1-s3',
        stepNumber: 3,
        totalSteps: 3,
        duration: 6,
        girl: { pose: 'waving', expression: 'relieved', look: 'center' },
        propType: 'trusted-adult-share',
        keywords: {
          en: ['Tell Mother or Teacher', 'Warm Support', 'You Did Great'],
          hi: ['मां या शिक्षिका को बताएं', 'सहानुभूति और मदद', 'शाबाश'],
          mr: ['आई किंवा शिक्षिकेला सांगा', 'उबदार मदत', 'खूप छान'],
        },
        labels: {
          en: ['Step 3: Tell a Trusted Adult', 'Relief & Support'],
          hi: ['कदम 3: किसी बड़े को बताएं', 'प्यार और भरोसा'],
          mr: ['टप्पा ३: मोठ्यांना सांगा', 'प्रेम आणि आधार'],
        },
        title: {
          en: 'Share with a trusted adult',
          hi: 'किसी बड़े को बताएं',
          mr: 'मोठ्यांना सांगा',
        },
        narration: {
          en: 'Tell your mum, an aunt, elder sister, or teacher. Simply say, "Mum, my period started today." She will give you a warm hug, help you with supplies, and make you feel comfortable.',
          hi: 'मां, मौसी, दीदी या टीचर को बताएं। बस मुस्कुराकर कहें, "मां, मेरी माहवारी शुरू हो गई है।" वे प्यार से आपका साथ देंगी और ज़रूरत का सामान देंगी।',
          mr: 'आई, मावशी, ताई किंवा शिक्षिकेला सांगा. फक्त म्हणा, "आई, आज माझी पाळी सुरू झाली." त्या नक्की प्रेमाने मदत करतील आणि तुम्हाला आधार देतील.',
        },
      },
    ],
  },

  p2: {
    id: 'p2',
    section: 'prepare',
    title: {
      en: 'What a sanitary pad is',
      hi: 'सैनिटरी पैड क्या है',
      mr: 'सॅनिटरी पॅड म्हणजे काय',
    },
    scenes: [
      {
        id: 'p2-s1',
        duration: 6,
        girl: { pose: 'holding-pad', expression: 'happy', look: 'center' },
        propType: 'pad-anatomy-breakdown',
        keywords: {
          en: ['Soft Cotton Sheet', 'Absorbent Core', 'Sticky Backing'],
          hi: ['मुलायम सूती सतह', 'शोषक कोर', 'चिपकने वाला भाग'],
          mr: ['मऊ सुती पृष्ठभाग', 'शोषक थर', 'चिकट भाग'],
        },
        labels: {
          en: ['Soft Top Sheet', 'Absorbent Cushion Core', 'Leak Barrier'],
          hi: ['मुलायम ऊपरी परत', 'सोखने वाली आंतरिक परत', 'सुरक्षा परत'],
          mr: ['मऊ वरचा थर', 'शोषक आतील थर', 'गळती प्रतिबंधक'],
        },
        title: {
          en: 'Anatomy of a sanitary pad',
          hi: 'सैनिटरी पैड की बनावट',
          mr: 'सॅनिटरी पॅडची रचना',
        },
        narration: {
          en: 'A sanitary pad is a soft, absorbent cushion designed to catch menstrual fluid so your clothes stay dry. It has a soft top layer, an absorbent core, and side wings to hold it in place.',
          hi: 'सैनिटरी पैड एक मुलायम, सोखने वाली गद्दी है जो माहवारी के प्रवाह को सोखकर कपड़ों को सूखा रखती है। इसमें मुलायम ऊपरी परत, सोखने वाला कोर और किनारे के पंख होते हैं।',
          mr: 'सॅनिटरी पॅड ही एक मऊ, शोषक गादी आहे जी मासिक पाळीतील स्राव शोषून कपडे स्वच्छ ठेवते. त्यात मऊ वरचा थर, शोषक गाभा आणि सुरक्षित ठेवण्यासाठी पंख असतात.',
        },
      },
      {
        id: 'p2-s2',
        duration: 6,
        girl: { pose: 'explaining', expression: 'curious', look: 'right' },
        propType: 'pad-wrapper-peel',
        keywords: {
          en: ['Peel Paper Strip', 'Side Wings', 'Keep Wrapper for Disposal'],
          hi: ['कागज़ की पट्टी हटाएं', 'किनारे के पंख', 'रैपर संभाल कर रखें'],
          mr: ['कागदी पट्टी काढा', 'बाजूचे पंख', 'रॅपर जपून ठेवा'],
        },
        labels: {
          en: ['Peel Peel Strip', 'Save Outer Wrapper'],
          hi: ['स्टिकर पट्टी हटाएं', 'बाहरी कवर संभालें'],
          mr: ['चिकट पट्टी काढा', 'बाहेरील कव्हर ठेवा'],
        },
        title: {
          en: 'The wrapper and sticky strip',
          hi: 'कवर और चिपकने वाली पट्टी',
          mr: 'कव्हर आणि चिकट पट्टी',
        },
        narration: {
          en: 'Pads come in neat hygienic wrappers. When you peel off the paper strip, you reveal a gentle adhesive underneath that sticks securely to the center of your underwear.',
          hi: 'पैड साफ सुथरे कवर में आते हैं। जब आप पीछे की कागज़ी पट्टी हटाती हैं, तो चिपकने वाला भाग दिखता है जो अंडरवियर के बीच में मजबूती से चिपक जाता है।',
          mr: 'पॅड स्वच्छ कव्हरमध्ये येतात. जेव्हा तुम्ही मागची कागदी पट्टी काढता, तेव्हा खाली चिकट भाग दिसतो जो अंडरवेअरच्या मध्यभागी व्यवस्थित चिकटतो.',
        },
      },
    ],
  },

  p3: {
    id: 'p3',
    section: 'prepare',
    title: {
      en: 'How to place a pad',
      hi: 'पैड कैसे लगाएं',
      mr: 'पॅड कसा लावावा',
    },
    scenes: [
      {
        id: 'p3-s1',
        stepNumber: 1,
        totalSteps: 3,
        duration: 6,
        girl: { pose: 'pointing', expression: 'curious', look: 'right' },
        propType: 'pad-step-peel',
        keywords: {
          en: ['Wash Hands First', 'Peel Center Strip', 'Hold by Edges'],
          hi: ['पहले हाथ धोएं', 'बीच की पट्टी हटाएं', 'किनारों से पकड़ें'],
          mr: ['आधी हात धुवा', 'मधली पट्टी काढा', 'कडेने धरा'],
        },
        labels: {
          en: ['Step 1: Peel Central Strip', 'Clean Hands'],
          hi: ['कदम 1: बीच का स्टीकर हटाएं', 'साफ हाथ'],
          mr: ['टप्पा १: मधली पट्टी काढा', 'स्वच्छ हात'],
        },
        title: {
          en: 'Step 1: Peel the adhesive paper',
          hi: 'कदम 1: चिपकने वाला कागज़ हटाएं',
          mr: 'टप्पा १: चिकट कागद काढा',
        },
        narration: {
          en: 'First, wash your hands with soap. Open the pad wrapper and gently peel the long paper strip from the center of the pad, keeping the wrapper aside for later.',
          hi: 'सबसे पहले साबुन से हाथ धोएं। पैड का पैकेट खोलें और बीच की लंबी कागज़ की पट्टी हटाएं। बाहरी कवर को बाद के लिए संभाल कर रखें।',
          mr: 'प्रथम साबणाने हात धुवा. पॅडचे कव्हर उघडा आणि मधली लांब कागदी पट्टी हळूच काढा. बाहेरील कव्हर नंतरसाठी बाजूला ठेवा.',
        },
      },
      {
        id: 'p3-s2',
        stepNumber: 2,
        totalSteps: 3,
        duration: 6,
        girl: { pose: 'explaining', expression: 'happy', look: 'right' },
        propType: 'pad-step-press',
        keywords: {
          en: ['Center in Underwear', 'Press Firmly', 'Wider End to Back'],
          hi: ['अंडरवियर के बीच में रखें', 'अच्छे से दबाएं', 'चौड़ा भाग पीछे'],
          mr: ['अंडरवेअरच्या मध्यभागी ठेवा', 'व्यवस्थित दाबा', 'रुंद भाग मागे'],
        },
        labels: {
          en: ['Step 2: Press onto Center', 'Smooth Surface'],
          hi: ['कदम 2: बीच में दबाएं', 'समतल करें'],
          mr: ['टप्पा २: मध्यभागी दाबा', 'सपाट करा'],
        },
        title: {
          en: 'Step 2: Press firmly into the center',
          hi: 'कदम 2: अंडरवियर के बीच में चिपकाएं',
          mr: 'टप्पा २: मध्यभागी चिकटवा',
        },
        narration: {
          en: 'Lower your underwear to your knees. Press the sticky center of the pad firmly onto the crotch area of your underwear, with the wider end pointing slightly toward the back.',
          hi: 'पैड के चिपकने वाले हिस्से को अपने अंडरवियर के बीच में रखें और उंगलियों से अच्छे से दबाएं, ताकि वह अपनी जगह पर ठीक से जम जाए।',
          mr: 'पॅडचा चिकट भाग अंडरवेअरच्या मध्यभागी ठेवा आणि बोटांनी व्यवस्थित दाबा, जेणेकरून तो हलणार नाही.',
        },
      },
      {
        id: 'p3-s3',
        stepNumber: 3,
        totalSteps: 3,
        duration: 6,
        girl: { pose: 'holding-pad', expression: 'proud', look: 'center' },
        propType: 'pad-step-wings',
        keywords: {
          en: ['Fold Wings Underneath', 'Secure Fit', 'Ready & Comfortable'],
          hi: ['पंखों को नीचे मोड़ें', 'मजबूत पकड़', 'आरामदायक'],
          mr: ['पंख खाली दुमडा', 'सुरक्षित पकड', 'आरामदायी'],
        },
        labels: {
          en: ['Step 3: Wrap Wings Underneath', 'All Secure!'],
          hi: ['कदम 3: पंखों को नीचे मोड़ें', 'तैयार!'],
          mr: ['टप्पा ३: पंख खाली दुमडा', 'तयार!'],
        },
        title: {
          en: 'Step 3: Wrap wings underneath',
          hi: 'कदम 3: पंखों को नीचे मोड़कर चिपकाएं',
          mr: 'टप्पा ३: पंख खाली दुमडून चिकटवा',
        },
        narration: {
          en: 'Peel the little strips from the side wings, fold them under the sides of your underwear, and press. Pull up your underwear and make sure it feels comfortable. You are all set!',
          hi: 'अब दोनों पंखों के स्टिकर हटाएं, उन्हें अंडरवियर के नीचे की तरफ मोड़कर चिपका दें। अंडरवियर पहनें और सुनिश्चित करें कि यह आरामदायक है। आप तैयार हैं!',
          mr: 'आता दोन्ही पंखांवरील पट्ट्या काढून ते अंडरवेअरच्या खालच्या बाजूला दुमडून चिकटवा. अंडरवेअर व्यवस्थित घाला आणि खात्री करा. झाले काम!',
        },
      },
    ],
  },

  p4: {
    id: 'p4',
    section: 'prepare',
    title: {
      en: 'When and how to change it',
      hi: 'कब और कैसे बदलें',
      mr: 'कधी आणि कसे बदलावे',
    },
    scenes: [
      {
        id: 'p4-s1',
        duration: 6,
        girl: { pose: 'pointing', expression: 'curious', look: 'right' },
        propType: 'timer-change-interval',
        keywords: {
          en: ['Every 4-6 Hours', 'Stay Fresh', 'Prevent Odour'],
          hi: ['हर 4-6 घंटे में', 'ताज़गी बनी रहे', 'दुर्गंध से बचाव'],
          mr: ['दर ४-६ तासांनी', 'स्वच्छता राखा', 'दुर्गंधीपासून बचाव'],
        },
        labels: {
          en: ['4 to 6 Hours Guideline', 'Healthy Hygiene Clock'],
          hi: ['4 से 6 घंटे का नियम', 'स्वस्थ समय चक्र'],
          mr: ['४ ते ६ तासांचा नियम', 'आरोग्यदायी वेळ'],
        },
        title: {
          en: 'Change every four to six hours',
          hi: 'हर चार से छह घंटे में बदलें',
          mr: 'दर ४ ते ६ तासांनी बदला',
        },
        narration: {
          en: 'Change your pad every four to six hours, even on days with lighter flow. Regularly changing prevents irritation, keeps your skin dry, and ensures you feel fresh all day.',
          hi: 'माहवारी का प्रवाह हल्का होने पर भी हर चार से छह घंटे में पैड बदलें। नियमित रूप से बदलने से त्वचा सूखी रहती है और किसी तरह का संक्रमण नहीं होता।',
          mr: 'स्राव कमी असला तरी दर ४ ते ६ तासांनी पॅड बदला. नियमित बदलल्याने त्वचा कोरडी राहते आणि कोणतीही खाज किंवा त्रास होत नाही.',
        },
      },
      {
        id: 'p4-s2',
        duration: 6,
        girl: { pose: 'explaining', expression: 'calm', look: 'center' },
        propType: 'peel-roll-technique',
        keywords: {
          en: ['Peel Gently Front to Back', 'Roll Up Tight', 'Wrap in Paper'],
          hi: ['आगे से पीछे खींचें', 'गोल रोल करें', 'कागज़ में लपेटें'],
          mr: ['हळूच काढा', 'घट्ट गुंडाळा', 'कागदात गुंडाळा'],
        },
        labels: {
          en: ['Peel Wings First', 'Roll Compactly'],
          hi: ['पहले पंख हटाएं', 'छोटा रोल बनाएं'],
          mr: ['प्रथम पंख काढा', 'लहान रोल करा'],
        },
        title: {
          en: 'Peeling and rolling the old pad',
          hi: 'पुराना पैड निकालना और लपेटना',
          mr: 'जुना पॅड काढणे आणि गुंडाळणे',
        },
        narration: {
          en: 'Unstick the side wings first, then gently peel the pad from front to back. Roll it up tightly like a small sleeping bag so the soiled surface is tucked safely on the inside.',
          hi: 'पहले दोनों पंख खोलें, फिर पैड को आगे से पीछे की ओर धीरे से खींचें। इसे छोटे रोल की तरह लपेटें ताकि इस्तेमाल किया हुआ हिस्सा अंदर सुरक्षित बंद हो जाए।',
          mr: 'आधी दोन्ही पंख मोकळे करा, मग पॅड पुढे ते मागे हळूच ओढा. तो छान गुंडाळा जेणेकरून वापरलेला भाग आत सुरक्षित बंद होईल.',
        },
      },
    ],
  },

  p5: {
    id: 'p5',
    section: 'prepare',
    title: {
      en: 'Disposal and hygiene',
      hi: 'पैड का सुरक्षित निपटान',
      mr: 'पॅडची विल्हेवाट आणि स्वच्छता',
    },
    scenes: [
      {
        id: 'p5-s1',
        duration: 6,
        girl: { pose: 'pointing', expression: 'calm', look: 'right' },
        propType: 'dustbin-paper-wrap',
        keywords: {
          en: ['Wrap in Waste Paper', 'Use Dustbin Only', 'Never Flush in Toilet'],
          hi: ['अखबार में लपेटें', 'सिर्फ कूड़ेदान में डालें', 'टॉयलेट में कभी न बहाएं'],
          mr: ['कागदात गुंडाळा', 'फक्त कचराकुंडीत टाका', 'टॉयलेटमध्ये कधीही फ्लश करू नका'],
        },
        labels: {
          en: ['Always Dustbin', 'Do Not Flush'],
          hi: ['हमेशा डस्टबिन में', 'फ्लश न करें'],
          mr: ['नेहमी कचराकुंडीत', 'फ्लश करू नका'],
        },
        title: {
          en: 'Wrap neatly and use the dustbin',
          hi: 'कागज़ में लपेटकर कूड़ेदान में डालें',
          mr: 'कागदात गुंडाळून कचराकुंडीत टाका',
        },
        narration: {
          en: 'Wrap the rolled pad inside the new pad wrapper or waste newspaper. Always throw it directly into the covered dustbin. Never flush pads in the toilet, as they block pipes.',
          hi: 'रोल किए गए पैड को नए पैड के कवर या रद्दी कागज़ में लपेटें। इसे हमेशा ढक्कन वाले कूड़ेदान में ही डालें। पैड को कभी टॉयलेट में फ्लश न करें, इससे पाइप रुक जाते हैं।',
          mr: 'गुंडाळलेला पॅड नव्या पॅडच्या कव्हरमध्ये किंवा वर्तमानपत्रात गुंडाळा. तो नेहमी झाकण असलेल्या कचराकुंडीत टाका. टॉयलेटमध्ये कधीही फ्लश करू नका, कारण पाईप अडकतात.',
        },
      },
      {
        id: 'p5-s2',
        duration: 6,
        girl: { pose: 'waving', expression: 'happy', look: 'center' },
        propType: 'soap-handwash-step',
        keywords: {
          en: ['Wash Hands with Soap', '20 Seconds', 'Clean & Fresh'],
          hi: ['साबुन से हाथ धोएं', '20 सेकंड', 'साफ और स्वच्छ'],
          mr: ['साबणाने हात धुवा', '२० सेकंद', 'स्वच्छ आणि ताजे'],
        },
        labels: {
          en: ['Soap and Running Water', 'Complete Protection'],
          hi: ['साबुन और पानी', 'पूर्ण स्वच्छता'],
          mr: ['साबण आणि पाणी', 'पूर्ण स्वच्छता'],
        },
        title: {
          en: 'Wash hands thoroughly',
          hi: 'साबुन से हाथ धोएं',
          mr: 'साबणाने हात स्वच्छ धुवा',
        },
        narration: {
          en: 'Finish by washing your hands thoroughly with soap and running water for twenty seconds. Dry them with a clean towel. You are fresh, healthy, and ready to go back to your day!',
          hi: 'अंत में बीस सेकंड तक साबुन और साफ पानी से हाथ धोएं। साफ तौलिये से सुखाएं। अब आप पूरी तरह स्वच्छ और स्वस्थ महसूस करेंगी!',
          mr: 'शेवटी २० सेकंद साबण आणि वाहत्या पाण्याने हात स्वच्छ धुवा. स्वच्छ टॉवेलने पुसा. आता तुम्ही पूर्णपणे स्वच्छ व ताजेतवाने आहात!',
        },
      },
    ],
  },

  p6: {
    id: 'p6',
    section: 'prepare',
    title: {
      en: 'Body hygiene during periods',
      hi: 'माहवारी में शारीरिक स्वच्छता',
      mr: 'पाळीदरम्यान शरीराची स्वच्छता',
    },
    scenes: [
      {
        id: 'p6-s1',
        duration: 6,
        girl: { pose: 'calm', expression: 'happy', look: 'center' },
        propType: 'warm-water-bath-visual',
        keywords: {
          en: ['Daily Warm Bath', 'Soothes Muscles', 'Safe & Clean'],
          hi: ['गुनगुने पानी से नहाना', 'मांसपेशियों को आराम', 'सुरक्षित और साफ'],
          mr: ['कोमट पाण्याने आंघोळ', 'स्नायूंना आराम', 'सुरक्षित आणि स्वच्छ'],
        },
        labels: {
          en: ['Warm Bathing is Safe', 'Relaxes Body'],
          hi: ['नहाना पूरी तरह सुरक्षित है', 'शरीर को आराम'],
          mr: ['आंघोळ करणे सुरक्षित आहे', 'शरीराला आराम'],
        },
        title: {
          en: 'Daily warm baths are soothing',
          hi: 'गुनगुने पानी से नहाना सुखदायक है',
          mr: 'कोमट पाण्याने आंघोळ आरामदायी असते',
        },
        narration: {
          en: 'Bathing during your period is completely safe, healthy, and refreshing. Warm water relaxes tired tummy muscles, eases tension, and keeps your entire body feeling comfortable.',
          hi: 'माहवारी के दिनों में नहाना पूरी तरह सुरक्षित और ज़रूरी है। गुनगुना पानी पेट की मांसपेशियों को सुकून देता है, थकान मिटाता है और आपको तरोताज़ा रखता है।',
          mr: 'पाळीच्या दिवसांत आंघोळ करणे पूर्णपणे सुरक्षित आणि आवश्यक आहे. कोमट पाण्यामुळे पोटाच्या स्नायूंना आराम मिळतो आणि ताजेतवाने वाटते.',
        },
      },
      {
        id: 'p6-s2',
        duration: 6,
        girl: { pose: 'explaining', expression: 'curious', look: 'right' },
        propType: 'front-to-back-hygiene',
        keywords: {
          en: ['Wash Front to Back', 'Plain Warm Water', 'Cotton Underwear'],
          hi: ['आगे से पीछे धोएं', 'सादा पानी', 'सूती अंडरवियर'],
          mr: ['पुढे ते मागे धुवा', 'साधे पाणी', 'सुती अंडरवेअर'],
        },
        labels: {
          en: ['Front to Back Motion', 'No Harsh Perfumes'],
          hi: ['आगे से पीछे की दिशा', 'खुशबूदार साबुन से बचें'],
          mr: ['पुढे ते मागे दिशा', 'सुगंधी साबण टाळा'],
        },
        title: {
          en: 'Gentle front-to-back washing',
          hi: 'आगे से पीछे की तरफ धोएं',
          mr: 'पुढे ते मागे या दिशेने धुवा',
        },
        narration: {
          en: 'When washing the intimate area, use plain warm water and always wipe from front to back. Avoid harsh perfumed soaps, and wear breathable cotton underwear to keep skin happy.',
          hi: 'निजी अंगों को साफ करते समय हमेशा आगे से पीछे की तरफ धोएं और सादे पानी का उपयोग करें। तेज़ खुशबूदार साबुन से बचें और साफ सूती कपड़े पहनें।',
          mr: 'स्वच्छता करताना नेहमी पुढे ते मागे या दिशेने साध्या पाण्याने धुवा. सुगंधी साबण वापरणे टाळा आणि हवा खेळती राहणारे सुती कपडे वापरा.',
        },
      },
    ],
  },

  p7: {
    id: 'p7',
    section: 'prepare',
    title: {
      en: 'Common symptoms during periods',
      hi: 'माहवारी के आम लक्षण और आराम',
      mr: 'सामान्य लक्षणे आणि आराम',
    },
    scenes: [
      {
        id: 'p7-s1',
        duration: 6,
        girl: { pose: 'resting', expression: 'calm', look: 'center' },
        propType: 'cramps-comfort-bottle',
        keywords: {
          en: ['Warm Water Bottle', 'Sip Warm Fluids', 'Gentle Rest'],
          hi: ['गर्म पानी की थैली', 'गुनगुना पानी पिएं', 'आराम करें'],
          mr: ['गरम पाण्याची पिशवी', 'कोमट पाणी प्या', 'शांत विश्रांती'],
        },
        labels: {
          en: ['Gentle Warmth on Tummy', 'Comfort Position'],
          hi: ['पेट पर हल्की सिकाई', 'आरामदायक स्थिति'],
          mr: ['पोटावर हलका शेक', 'आरामदायी स्थिती'],
        },
        title: {
          en: 'Soothe mild cramps with warmth',
          hi: 'हल्की ऐंठन में गर्माहट से आराम',
          mr: 'हलक्या पोटदुखीत उबदार शेक',
        },
        narration: {
          en: 'Mild cramps in your lower tummy are very common as uterine muscles work. Resting with a warm water bottle, sipping warm water, or resting curled on your side brings quick relief.',
          hi: 'माहवारी के पहले एक-दो दिन पेट के निचले हिस्से में हल्की ऐंठन होना आम बात है। पेट पर गर्म पानी की थैली रखकर लेटना और गुनगुना पानी पीना मांसपेशियों को तुरंत आराम देता है।',
          mr: 'पाळीच्या पहिल्या १-२ दिवसांत हलकी पोटदुखी होणे सामान्य आहे. पोटावर गरम पाण्याची पिशवी ठेवणे आणि कोमट पाणी पिणे यामुळे स्नायूंना लगेच आराम मिळतो.',
        },
      },
      {
        id: 'p7-s2',
        duration: 6,
        girl: { pose: 'explaining', expression: 'proud', look: 'right' },
        propType: 'nutrition-water-care',
        keywords: {
          en: ['Healthy Meals', 'Plenty of Sleep', 'Talk to Adult If Severe'],
          hi: ['पौष्टिक भोजन', 'पूरी नींद', 'दर्द ज़्यादा हो तो डॉक्टर से मिलें'],
          mr: ['पौष्टिक आहार', 'शांत झोप', 'त्रास जास्त असल्यास डॉक्टरकडे जा'],
        },
        labels: {
          en: ['Warm Nourishing Foods', 'Consult Trusted Doctor for Red Flags'],
          hi: ['पौष्टिक आहार', 'ज़्यादा दर्द हो तो डॉक्टर से पूछें'],
          mr: ['पौष्टिक जेवण', 'खूप त्रास असल्यास डॉक्टरांना भेटा'],
        },
        title: {
          en: 'Rest, nourish, and know when to ask',
          hi: 'आहार, नींद और डॉक्टर से कब पूछें',
          mr: 'आहार, झोप आणि डॉक्टरांचा सल्ला',
        },
        narration: {
          en: 'Eating warm, home-cooked food and getting good sleep help your energy stay balanced. If cramps ever feel severe or stop you from daily activities, talk to a trusted adult or doctor.',
          hi: 'घर का बना गर्म खाना खाना और पूरी नींद लेना आपकी ऊर्जा बनाए रखता है। अगर दर्द बहुत तेज़ हो या रोज़मर्रा के काम में रुकावट डाले, तो किसी बड़े या डॉक्टर को ज़रूर बताएं।',
          mr: 'घरचे पौष्टिक जेवण आणि पुरेशी झोप यामुळे उत्साह टिकून राहतो. वेदना खूप जास्त असल्यास किंवा रोजची कामे करणे अवघड झाल्यास मोठ्यांना किंवा डॉक्टरांना नक्की सांगा.',
        },
      },
    ],
  },
};
