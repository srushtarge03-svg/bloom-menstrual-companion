import React from 'react';
import { useTranslation } from 'react-i18next';
import { Droplet, Sprout, Sun, Moon, Sparkles, HeartPulse, Stethoscope, Utensils, Activity, Bed, Smile, AlertCircle } from 'lucide-react';

export interface PhaseCardProps {
  selectedPhase: number; // 0: Menstrual, 1: Follicular, 2: Ovulation, 3: Luteal
  currentPhase: number;
  currentDay: number;
  crampsLevel?: number; // 0: None, 1: Mild, 2: Moderate, 3: Severe
  flowLevel?: number;   // 0: Low, 1: Medium, 2: High
  periodDurationDays?: number;
}

export const PhaseCard: React.FC<PhaseCardProps> = ({
  selectedPhase,
  currentPhase,
  currentDay,
  crampsLevel = 0,
  flowLevel = 1,
  periodDurationDays = 5,
}) => {
  const { i18n } = useTranslation();
  const lang = (['en', 'hi', 'mr'].includes(i18n.language) ? i18n.language : 'en') as 'en' | 'hi' | 'mr';

  const phaseData = [
    {
      index: 0,
      name: { en: 'Menstrual Phase', hi: 'मेंस्ट्रुअल चरण (माहवारी के दिन)', mr: 'मासिक पाळीचा टप्पा' },
      range: { en: 'Days 1 – 5', hi: 'दिन 1 से 5', mr: 'दिवस १ ते ५' },
      color: '#D96B82',
      icon: Droplet,
      body: {
        en: 'The uterus gently releases the soft protective lining built up during the previous cycle because pregnancy did not occur. The body is in a natural self-cleansing and resting mode.',
        hi: 'गर्भाशय पिछले महीने तैयार की गई मुलायम परत को धीरे-धीरे बाहर निकालता है। शरीर इस समय प्राकृतिक सफाई और विश्राम की स्थिति में होता है।',
        mr: 'गर्भाशयात तयार झालेली मऊ गादी शरीर हळूवार बाहेर सोडते. शरीर या काळात नैसर्गिक स्वच्छता आणि विश्रांती घेते.',
      },
      symptoms: {
        en: ['Lower abdominal cramping or heaviness', 'Mild fatigue or lower energy', 'Slight lower back ache', 'Preference for quiet cozy time'],
        hi: ['पेट के निचले हिस्से में हल्की ऐंठन', 'थोड़ी थकान या सुस्ती', 'कमर में हल्का दर्द', 'शांत और आरामदायक माहौल की चाहत'],
        mr: ['पोटात हलके दुखणे किंवा जडपणा', 'किंचित थकवा जाणवणे', 'कंबरेत हलके दुखणे', 'शांत एकांत आवडणे'],
      },
      hormones: {
        en: 'Estrogen and progesterone drop to their lowest baseline levels, signaling the uterine lining to shed and giving your system a clean reset.',
        hi: 'एस्ट्रोजन और प्रोजेस्टेरोन दोनों हार्मोन अपने न्यूनतम स्तर पर आ जाते हैं, जिससे पुरानी परत हटती है और नए चक्र की शुरुआत होती है।',
        mr: 'इस्ट्रोजेन आणि प्रोजेस्टेरॉनची पातळी सर्वात कमी असते, ज्यामुळे गर्भाशयाचे अस्तर गळून पडते आणि शरीराची नवी सुरुवात होते.',
      },
      tips: {
        food: {
          en: 'Warm home-cooked meals, dal khichdi, vegetable soups, and iron-rich foods (spinach, jaggery, beetroot).',
          hi: 'गर्म दाल-खिचड़ी, पौष्टिक सूप, और आयरन से भरपूर चीजें (पालक, गुड़, चुकंदर) खाएं।',
          mr: 'गरम डाळ-खिचडी, पौष्टिक सूप आणि लोहयुक्त अन्न (पालक, गूळ, बीट) खा.',
        },
        exercise: {
          en: 'Gentle stretching, slow walking, child’s pose, or simply resting with cozy blankets.',
          hi: 'धीमी सैर, हल्की स्ट्रेचिंग करें या आराम से बैठकर अपनी मनपसंद किताब पढ़ें।',
          mr: 'हळूवार चालणे, हलके ताणण्याचे व्यायाम किंवा शांत पडून विश्रांती घेणे.',
        },
        rest: {
          en: 'Aim for 8 to 9 hours of restorative sleep; place a warm water bottle on your tummy for 15 minutes.',
          hi: '8 से 9 घंटे की पूरी नींद लें और पेट पर 15 मिनट गर्म पानी की थैली रखकर सिकाई करें।',
          mr: '८ ते ९ तासांची शांत झोप घ्या आणि पोटावर १५ मिनिटे गरम पाण्याची पिशवी ठेवा.',
        },
        mood: {
          en: 'Be extra kind and patient with yourself. It is completely okay to pause and take things slow.',
          hi: 'खुद के प्रति बहुत कोमल रहें। आज काम धीरे करना और आराम करना पूरी तरह सही है।',
          mr: 'स्वतःशी प्रेमाने वागा. आज हळूवारपणे दिवस घालवणे आणि विश्रांती घेणे अगदी योग्य आहे.',
        },
      },
    },
    {
      index: 1,
      name: { en: 'Follicular Phase', hi: 'फॉलिक्युलर चरण (नई शुरुआत)', mr: 'फॉलिक्युलर टप्पा (नवी सुरुवात)' },
      range: { en: 'Days 6 – 13', hi: 'दिन 6 से 13', mr: 'दिवस ६ ते १३' },
      color: '#5E8F8B',
      icon: Sprout,
      body: {
        en: 'Your period has completed! The pituitary gland releases Follicle-Stimulating Hormone (FSH), stimulating the ovaries to mature follicles while estrogen thickens the new uterine lining.',
        hi: 'माहवारी समाप्त हो चुकी है! पिट्यूटरी ग्रंथि फॉलिकल-स्टिम्युलेटिंग हार्मोन (FSH) छोड़ती है, जिससे अंडाशय नए रोम तैयार करते हैं और गर्भाशय में नई परत बनती है।',
        mr: 'पाळी संपली आहे! मेंदूतून एफएसएच (FSH) हार्मोन स्रवतो, ज्यामुळे अंडाशयात नवीन बीज विकसित होऊ लागते आणि गर्भाशयात नवे अस्तर तयार होते.',
      },
      symptoms: {
        en: ['Rising physical stamina and energy', 'Clearer glowing skin', 'Sharper mental focus and curiosity', 'Social and creative enthusiasm'],
        hi: ['शरीर में नई ऊर्जा और फुर्ती', 'त्वचा में प्राकृतिक निखार', 'पढ़ाई और नई चीजों में एकाग्रता', 'उत्साही और खुशमिज़ाज मन'],
        mr: ['वाढलेली शारीरिक ताकद आणि ऊर्जा', 'चेहऱ्यावर ताजेतवाने तेज', 'अभ्यासात छान एकाग्रता', 'उत्साही आणि आनंदी मनस्थिती'],
      },
      hormones: {
        en: 'Estrogen steadily rises throughout this phase, boosting serotonin (your happy neurotransmitter) and strengthening tissue repair.',
        hi: 'एस्ट्रोजन हार्मोन धीरे-धीरे बढ़ता है, जिससे मूड अच्छा रहता है और शरीर में नई शक्ति का संचार होता है।',
        mr: 'इस्ट्रोजेन हार्मोन सातत्याने वाढतो, ज्यामुळे उत्साह वाढतो आणि शरीर अधिक सक्रिय बनते.',
      },
      tips: {
        food: {
          en: 'Fresh seasonal fruits, crunchy vegetables, sprouts, curd, and protein-rich lentils.',
          hi: 'ताज़े मौसमी फल, अंकुरित अनाज, हरी सब्ज़ियां और दही का सेवन करें।',
          mr: 'ताजी फळे, मोड आलेली कडधान्ये, हिरव्या भाज्या आणि दही खा.',
        },
        exercise: {
          en: 'High-energy outdoor sports, running, dance rehearsals, swimming, and cycling.',
          hi: 'दौड़ना, डांस, साइकिल चलाना और मैदानी खेल खेलने का यह सबसे बेहतरीन समय है।',
          mr: 'धावणे, सायकल चालवणे, नृत्य आणि मैदानी खेळांसाठी हा सर्वोत्तम काळ आहे.',
        },
        rest: {
          en: 'Regular 8 hours of sleep to support brain activity and active schoolwork.',
          hi: 'नियमित 8 घंटे की अच्छी नींद लें ताकि पढ़ाई और खेलकूद में संतुलन बना रहे।',
          mr: 'नियमित ८ तास झोपा जेणेकरून शाळा आणि खेळासाठी ताजेतवाने राहाल.',
        },
        mood: {
          en: 'Channel your natural curiosity into exploring new hobbies, painting, or reading.',
          hi: 'अपनी ऊर्जा को चित्रकला, संगीत या किसी नए प्रोजेक्ट में लगाएं।',
          mr: 'वाढलेला उत्साह नवीन कला, वाचन किंवा छंद जोपासण्यात लावा.',
        },
      },
    },
    {
      index: 2,
      name: { en: 'Ovulation Phase', hi: 'ओव्यूलेशन चरण (शीर्ष ऊर्जा)', mr: 'ओव्ह्युलेशन टप्पा (सर्वोच्च ऊर्जा)' },
      range: { en: 'Days 14 – 16', hi: 'दिन 14 से 16', mr: 'दिवस १४ ते १६' },
      color: '#D2AE6D',
      icon: Sun,
      body: {
        en: 'A mature egg is gently released from the ovary into the fallopian tube, where it can be fertilized for about 12 to 24 hours. This marks the peak fertility window of the menstrual cycle.',
        hi: 'अंडाशय से एक परिपक्व अंडाणु बाहर निकलकर फैलोपियन ट्यूब में आता है, जहां वह 12 से 24 घंटे तक रह सकता है। यह चक्र का सबसे महत्वपूर्ण जैविक पड़ाव है।',
        mr: 'अंडाशयातून एक परिपक्व स्त्रीबीज फॅलोपियन नलिकेत सोडले जाते, जिथे ते १२ ते २४ तास राहू शकते. हा चक्रातील मध्य टप्पा असतो.',
      },
      symptoms: {
        en: ['Mild one-sided lower pelvic twinge (mittelschmerz)', 'Peak physical stamina and confidence', 'Clear, stretchy cervical discharge (like egg-white)', 'Heightened senses'],
        hi: ['पेट के किसी एक तरफ हल्का सा खिंचाव या चुभन', 'भरपूर शारीरिक ऊर्जा और आत्मविश्वास', 'प्राकृतिक साफ और खिंचावदार स्राव', 'सजग इंद्रियां'],
        mr: ['पोटाच्या एका बाजूला हलके दुखणे (Mittelschmerz)', 'भरपूर शारीरिक ताकद आणि आत्मविश्वास', 'नैसर्गिक स्वच्छ, पातळ पांढरा स्राव', 'सतेज मन'],
      },
      hormones: {
        en: 'Estrogen peaks at its monthly high, triggering a sharp surge in Luteinizing Hormone (LH) which prompts egg release, followed by early progesterone release.',
        hi: 'एस्ट्रोजन अपने उच्चतम स्तर पर पहुंचता है, जिससे ल्यूटिनाइजिंग हार्मोन (LH) का अचानक उछाल आता है और अंडाणु बाहर निकलता है।',
        mr: 'इस्ट्रोजेन सर्वोच्च पातळीवर पोहोचतो, ज्यामुळे एलएच (LH) हार्मोन वाढून स्त्रीबीज बाहेर पडते.',
      },
      tips: {
        food: {
          en: 'Hydrating foods, cooling cucumbers, almonds, walnuts, pumpkin seeds, and plenty of water.',
          hi: 'खीरा, तरबूज, बादाम, अखरोट और दिन भर पर्याप्त मात्रा में पानी पिएं।',
          mr: 'काकडी, बदाम, अक्रोड, बियाणे आणि भरपूर पाणी पिऊन हायड्रेटेड राहा.',
        },
        exercise: {
          en: 'You feel strong and flexible! Ideal for gymnastics, track events, and group team sports.',
          hi: 'योग, खेलकूद, जिमनास्टिक्स और दौड़ के लिए शरीर पूरी तरह तैयार रहता है।',
          mr: 'योगासने, धावणे आणि सांघिक खेळांसाठी हे दिवस अतिशय अनुकूल आहेत.',
        },
        rest: {
          en: 'Maintain a peaceful wind-down routine even when high stamina tempts you to stay up late.',
          hi: 'ऊर्जा अधिक होने पर भी रात को समय पर सोने की आदत बनाए रखें।',
          mr: 'उत्साह दांडगा असला तरी रात्री उशिरापर्यंत न जागता वेळेवर विश्रांती घ्या.',
        },
        mood: {
          en: 'Express your natural confidence in class presentations, debate, or teamwork.',
          hi: 'कक्षा में बोलने, समूह चर्चा और दोस्तों के साथ बातचीत में अपनी बात खुलकर रखें।',
          mr: 'शाळेतील चर्चा, भाषण आणि संवादात स्वतःचे विचार उत्साहाने मांडा.',
        },
      },
    },
    {
      index: 3,
      name: { en: 'Luteal Phase', hi: 'लुटियल चरण (धीमी गति व विश्राम)', mr: 'ल्युटियल टप्पा (विश्रांतीची तयारी)' },
      range: { en: 'Days 17 – 28', hi: 'दिन 17 से 28', mr: 'दिवस १७ ते २८' },
      color: '#8A6A99',
      icon: Moon,
      body: {
        en: 'The empty follicle transforms into the corpus luteum and secretes progesterone to maintain the uterine lining. If the egg is not fertilized, hormones decrease toward the end to prepare for a fresh cycle.',
        hi: 'अंडाशय प्रोजेस्टेरोन हार्मोन स्रावित करता है ताकि गर्भाशय की परत सुरक्षित रहे। यदि अंडाणु निषेचित नहीं होता, तो अंत में हार्मोन कम होकर नए चक्र की तैयारी करते हैं।',
        mr: 'अंडाशयातून प्रोजेस्टेरॉन हार्मोन स्रवतो जो गर्भाशयाचे अस्तर टिकवून ठेवतो. गर्भधारणा न झाल्यास शेवटी हार्मोन्स कमी होऊन नव्या पाळीची तयारी सुरू होते.',
      },
      symptoms: {
        en: ['Mild tummy bloating or tender breasts', 'A skin pimple or breakout', 'Desire for quiet, cozy alone time', 'Craving warm comfort foods'],
        hi: ['पेट में हल्का भारीपन या सूजन', 'चेहरे पर एकाध फुंसी होना', 'अकेले शांति से रहने की इच्छा', 'गर्म व आरामदायक नाश्ते की चाहत'],
        mr: ['पोटात हलके जड वाटणे', 'चेहऱ्यावर एखादे पुरळ येणे', 'शांत एकांत आवडणे', 'गरम पदार्थ खाण्याची इच्छा'],
      },
      hormones: {
        en: 'Progesterone rises to its monthly peak, then tapers down alongside estrogen in the final days, which can naturally influence energy and emotions.',
        hi: 'प्रोजेस्टेरोन अपने उच्चतम स्तर पर पहुंचता है और अंत में एस्ट्रोजन के साथ नीचे आता है, जिससे ऊर्जा थोड़ी कम महसूस हो सकती है।',
        mr: 'प्रोजेस्टेरॉन सर्वोच्च पातळीवर जाऊन शेवटी कमी होतो, ज्यामुळे थोडा थकवा किंवा भावनिक बदल जाणवू शकतात.',
      },
      tips: {
        food: {
          en: 'Warm soups, roasted pumpkin seeds, oats, bananas, chamomile tea, and dark chocolate in moderation.',
          hi: 'गर्म सूप, भुने हुए बीज, केला, ओट्स और थोड़ा सा डार्क चॉकलेट मूड को संतुलित रखते हैं।',
          mr: 'गरम सूप, भाजलेले बी-बियाणे, केळी, ओट्स आणि थोडे डार्क चॉकलेट खा.',
        },
        exercise: {
          en: 'Gentle restorative yoga, slow peaceful walks, and mindful deep breathing exercises.',
          hi: 'धीमी सैर, कोमल योगाभ्यास और गहरी सांस लेने के प्राणायाम करें।',
          mr: 'शांत चालणे, हलके योगासने आणि दीर्घ श्वासोच्छ्वास करा.',
        },
        rest: {
          en: 'Prioritize going to bed early; your body does its most soothing repair during sleep.',
          hi: 'जल्दी सोने को प्राथमिकता दें; नींद में शरीर खुद को सबसे अच्छी तरह संतुलित करता है।',
          mr: 'लवकर झोपण्याला प्राधान्य द्या; झोपेत शरीर स्वतःला सर्वात छान रीसेट करते.',
        },
        mood: {
          en: 'Spend time journaling, organizing your desk, and remember mood waves are temporary and normal.',
          hi: 'डायरी लिखें, कमरा व्यवस्थित करें और याद रखें कि मूड में बदलाव पूरी तरह सामान्य हैं।',
          mr: 'मनातले डायरीत लिहा, स्वतःला वेळ द्या आणि लक्षात ठेवा की हे बदल तात्पुरते आहेत.',
        },
      },
    },
  ];

  const currentPhaseObj = phaseData[selectedPhase] || phaseData[0];
  const Icon = currentPhaseObj.icon;
  const isSelectedOngoing = selectedPhase === currentPhase;

  // Analysis of logged cramps and flow
  const crampsLabels = [
    { en: 'None', hi: 'कोई नहीं', mr: 'काही नाही' },
    { en: 'Mild', hi: 'हल्की', mr: 'किंचित' },
    { en: 'Moderate', hi: 'मध्यम', mr: 'मध्यम' },
    { en: 'Severe', hi: 'तीव्र', mr: 'खूप जास्त' },
  ];
  const flowLabels = [
    { en: 'Low (1 Drop)', hi: 'हल्का (1 बूंद)', mr: 'कमी (१ थेंब)' },
    { en: 'Medium (2 Drops)', hi: 'मध्यम (2 बूंदें)', mr: 'मध्यम (२ थेंब)' },
    { en: 'High (3 Drops)', hi: 'भारी (3 बूंदें)', mr: 'जास्त (३ थेंब)' },
  ];

  const loggedCrampsText = crampsLabels[crampsLevel]?.[lang] || 'None';
  const loggedFlowText = flowLabels[flowLevel]?.[lang] || 'Medium';

  // Check for unusual logs (severe cramps, or heavy bleeding for many days)
  const isSevereCramps = crampsLevel === 3;
  const isProlongedHighFlow = flowLevel === 2 && periodDurationDays >= 7;
  const hasUnusualLogs = isSevereCramps || isProlongedHighFlow;

  return (
    <div className="clay-card p-5 sm:p-6 rounded-[22px] bg-bloom-card dark:bg-bloom-darkCard shadow-clay dark:shadow-clay-dark border border-bloom-line/70 dark:border-bloom-darkLine space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm"
            style={{ backgroundColor: currentPhaseObj.color }}
          >
            <Icon size={20} />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-bloom-ink dark:text-bloom-darkInk leading-tight">
              {currentPhaseObj.name[lang]}
            </h3>
            <span className="text-xs font-semibold text-bloom-mute dark:text-bloom-darkMute">
              {currentPhaseObj.range[lang]}
            </span>
          </div>
        </div>

        {isSelectedOngoing ? (
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-bloom-primary text-white shadow-sm">
            Current Phase (Day {currentDay})
          </span>
        ) : (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-bloom-pressed dark:bg-bloom-darkPressed text-bloom-mute border border-bloom-line/60 dark:border-bloom-darkLine">
            Exploring
          </span>
        )}
      </div>

      {/* 1. What is Happening in the Body */}
      <div className="space-y-1 bg-bloom-surface dark:bg-bloom-darkSurface p-3.5 rounded-[16px] border border-bloom-line/60 dark:border-bloom-darkLine">
        <div className="flex items-center gap-1.5 font-bold text-xs text-bloom-primary dark:text-bloom-darkPrimary">
          <HeartPulse size={15} />
          <span>What is Happening in Your Body</span>
        </div>
        <p className="text-xs sm:text-sm text-bloom-ink/90 dark:text-bloom-darkInk/90 leading-relaxed font-medium">
          {currentPhaseObj.body[lang]}
        </p>
      </div>

      {/* 2. Common Symptoms */}
      <div className="space-y-1.5">
        <span className="text-xs font-bold text-bloom-ink dark:text-bloom-darkInk block">
          Common Experiences & Symptoms
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {currentPhaseObj.symptoms[lang].map((sym, idx) => (
            <div
              key={idx}
              className="px-3 py-2 rounded-[12px] bg-bloom-pressed dark:bg-bloom-darkPressed text-xs text-bloom-ink/85 dark:text-bloom-darkInk/85 font-medium flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-bloom-primary flex-shrink-0" />
              <span>{sym}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Hormones Involved */}
      <div className="space-y-1 bg-bloom-surface dark:bg-bloom-darkSurface p-3.5 rounded-[16px] border border-bloom-line/60 dark:border-bloom-darkLine">
        <div className="flex items-center gap-1.5 font-bold text-xs text-bloom-teal">
          <Sparkles size={15} />
          <span>Hormones Involved</span>
        </div>
        <p className="text-xs sm:text-sm text-bloom-ink/90 dark:text-bloom-darkInk/90 leading-relaxed font-medium">
          {currentPhaseObj.hormones[lang]}
        </p>
      </div>

      {/* 4. Practical Tips (Food, Exercise, Rest, Mood) */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-bloom-ink dark:text-bloom-darkInk block">
          Practical Self-Care Tips
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {/* Food */}
          <div className="p-3 rounded-[14px] bg-bloom-pressed dark:bg-bloom-darkPressed border border-bloom-line/60 dark:border-bloom-darkLine space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-bloom-terracotta">
              <Utensils size={14} />
              <span>Food & Nourishment</span>
            </div>
            <p className="text-bloom-ink/85 dark:text-bloom-darkInk/85 leading-relaxed font-medium">
              {currentPhaseObj.tips.food[lang]}
            </p>
          </div>

          {/* Exercise */}
          <div className="p-3 rounded-[14px] bg-bloom-pressed dark:bg-bloom-darkPressed border border-bloom-line/60 dark:border-bloom-darkLine space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-bloom-sage">
              <Activity size={14} />
              <span>Movement & Play</span>
            </div>
            <p className="text-bloom-ink/85 dark:text-bloom-darkInk/85 leading-relaxed font-medium">
              {currentPhaseObj.tips.exercise[lang]}
            </p>
          </div>

          {/* Rest */}
          <div className="p-3 rounded-[14px] bg-bloom-pressed dark:bg-bloom-darkPressed border border-bloom-line/60 dark:border-bloom-darkLine space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-bloom-teal">
              <Bed size={14} />
              <span>Rest & Sleep</span>
            </div>
            <p className="text-bloom-ink/85 dark:text-bloom-darkInk/85 leading-relaxed font-medium">
              {currentPhaseObj.tips.rest[lang]}
            </p>
          </div>

          {/* Mood */}
          <div className="p-3 rounded-[14px] bg-bloom-pressed dark:bg-bloom-darkPressed border border-bloom-line/60 dark:border-bloom-darkLine space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-bloom-gold">
              <Smile size={14} />
              <span>Emotions & Mood</span>
            </div>
            <p className="text-bloom-ink/85 dark:text-bloom-darkInk/85 leading-relaxed font-medium">
              {currentPhaseObj.tips.mood[lang]}
            </p>
          </div>
        </div>
      </div>

      {/* 5. User's Logged Summary */}
      <div className="p-3.5 rounded-[16px] bg-bloom-surface dark:bg-bloom-darkSurface border border-bloom-line/70 dark:border-bloom-darkLine flex items-center justify-between text-xs">
        <div>
          <span className="font-bold text-bloom-ink dark:text-bloom-darkInk block">
            Your Recent Period Log
          </span>
          <span className="text-bloom-mute text-[11px]">
            Cramps: <b className="text-bloom-ink dark:text-bloom-darkInk">{loggedCrampsText}</b> • Flow: <b className="text-bloom-ink dark:text-bloom-darkInk">{loggedFlowText}</b>
          </span>
        </div>
        <div className="flex items-center gap-1 text-bloom-primary">
          <Droplet size={15} />
        </div>
      </div>

      {/* Gentle Doctor Suggestion If Logs Look Unusual */}
      {hasUnusualLogs && (
        <div className="p-3.5 rounded-[16px] bg-bloom-rose/15 border border-bloom-rose/40 text-xs space-y-1 animate-in fade-in">
          <div className="flex items-center gap-2 font-bold text-bloom-ink dark:text-bloom-darkInk">
            <Stethoscope size={16} className="text-bloom-rose flex-shrink-0" />
            <span>Gentle Health Suggestion</span>
          </div>
          <p className="text-bloom-ink/90 dark:text-bloom-darkInk/90 leading-relaxed font-medium">
            {isSevereCramps
              ? 'You logged severe cramps. While cramps are common, severe discomfort that stops your normal day is worth gently sharing with a mother, school nurse, or doctor for caring guidance.'
              : 'You logged high flow lasting 7 or more days. It is a good idea to speak with a trusted adult or doctor to ensure your iron levels and comfort are well supported.'}
          </p>
        </div>
      )}
    </div>
  );
};
