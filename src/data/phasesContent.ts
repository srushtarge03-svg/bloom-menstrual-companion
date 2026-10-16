/**
 * Comprehensive Menstrual Cycle Phases Content
 * Covers all 4 phases in English, Hindi, and Marathi.
 * Designed for girls aged 10-15 in warm, reassuring, non-diagnostic language.
 * Marked: Needs Medical Review.
 */

export interface PhaseInfo {
  id: string;
  name: { en: string; hi: string; mr: string };
  daysLabel: { en: string; hi: string; mr: string };
  color: string;
  darkColor: string;
  whatHappens: { en: string; hi: string; mr: string };
  symptoms: {
    physical: { en: string[]; hi: string[]; mr: string[] };
    emotional: { en: string[]; hi: string[]; mr: string[] };
  };
  tips: {
    food: { en: string; hi: string; mr: string };
    sleep: { en: string; hi: string; mr: string };
    movement: { en: string; hi: string; mr: string };
    hygiene: { en: string; hi: string; mr: string };
    mood: { en: string; hi: string; mr: string };
  };
  todaySuggestions: { en: string[]; hi: string[]; mr: string[] };
  whenToTalk: { en: string; hi: string; mr: string };
  needsMedicalReview: boolean;
}

export const PHASES_CONTENT: Record<string, PhaseInfo> = {
  p0: {
    id: 'p0',
    name: {
      en: 'Period Days (Menstrual Phase)',
      hi: 'माहवारी के दिन (मेंस्ट्रुअल चरण)',
      mr: 'पाळीचे दिवस (मासिक पाळीचा टप्पा)',
    },
    daysLabel: {
      en: 'Days 1 to 5',
      hi: 'दिन 1 से 5',
      mr: 'दिवस १ ते ५',
    },
    color: '#C98A6B', // Terracotta
    darkColor: '#D39A7F',
    whatHappens: {
      en: 'Your body is gently releasing the soft uterine cushion it built last month. Hormones are at their baseline, and your body is in a natural cleansing and reset mode.',
      hi: 'आपका शरीर पिछले महीने बनी मुलायम गर्भाशय गद्दी को धीरे-धीरे बाहर निकालता है। हार्मोन का स्तर शांत होता है और शरीर प्राकृतिक सफाई व नई शुरुआत की स्थिति में होता है।',
      mr: 'शरीर मागील महिन्यात तयार झालेली मऊ गर्भाशयाची गादी हळूवार बाहेर सोडते. हार्मोन्स शांत असतात आणि शरीर नैसर्गिक स्वच्छतेच्या व विश्रांतीच्या टप्प्यात असते.',
    },
    symptoms: {
      physical: {
        en: ['Mild lower tummy cramps', 'Feeling a bit tired', 'Lower back heaviness'],
        hi: ['पेट के निचले हिस्से में हल्की ऐंठन', 'थोड़ी थकान महसूस होना', 'कमर में भारीपन'],
        mr: ['पोटात हलके दुखणे', 'किंचित थकवा जाणवणे', 'कंबरेत जडपणा'],
      },
      emotional: {
        en: ['Wanting quiet time', 'Gentle mood', 'Needing extra rest'],
        hi: ['शांत रहने का मन', 'सुकून की चाहत', 'आराम की ज़रूरत'],
        mr: ['शांत राहावेसे वाटणे', 'मऊ मनस्थिती', 'विश्रांतीची गरज'],
      },
    },
    tips: {
      food: {
        en: 'Enjoy warm, home-cooked meals like dal khichdi, warm soups, and iron-rich foods like spinach and jaggery.',
        hi: 'दाल-खिचड़ी, गर्म सूप जैसे हल्के गर्म भोजन और पालक, गुड़ जैसी आयरन से भरपूर चीज़ें खाएं।',
        mr: 'डाळ-खिचडी, गरम सूप यांसारखे घरचे जेवण आणि पालक, गूळ यांसारखे लोहयुक्त पौष्टिक अन्न खा.',
      },
      sleep: {
        en: 'Aim for 8 to 9 hours of sleep with a cozy warm blanket.',
        hi: '8 से 9 घंटे की पूरी नींद लें और शरीर को गर्म व आरामदायक रखें।',
        mr: '८ ते ९ तासांची शांत झोप घ्या आणि शरीर उबदार ठेवा.',
      },
      movement: {
        en: 'Gentle stretching, slow walks, or curling up with a book.',
        hi: 'धीमी सैर, हल्की स्ट्रेचिंग करें या आराम से बैठकर अपनी मनपसंद किताब पढ़ें।',
        mr: 'हळूवार चालणे, हलके व्यायाम किंवा विश्रांती घेत पुस्तक वाचणे.',
      },
      hygiene: {
        en: 'Change your pad every 4-6 hours, take a warm bath daily, and wear clean cotton underwear.',
        hi: 'हर 4-6 घंटे में पैड बदलें, रोज़ गुनगुने पानी से नहाएं और साफ सूती कपड़े पहनें।',
        mr: 'दर ४-६ तासांनी पॅड बदला, कोमट पाण्याने आंघोळ करा आणि स्वच्छ सुती कपडे वापरा.',
      },
      mood: {
        en: 'Be extra kind to yourself. It is okay to take things slow today.',
        hi: 'खुद के प्रति बहुत कोमल रहें। आज काम धीरे करना पूरी तरह ठीक है।',
        mr: 'स्वतःशी प्रेमाने वागा. आज हळूवारपणे दिवस घालवणे पूर्णपणे योग्य आहे.',
      },
    },
    todaySuggestions: {
      en: [
        'Rest with a warm water bottle on your lower tummy for 15 minutes.',
        'Sip warm water or warm milk to stay cozy and hydrated.',
        'Pack two clean pads in your school bag pouch just in case.',
      ],
      hi: [
        'पेट पर 15 मिनट के लिए गर्म पानी की थैली रखकर आराम करें।',
        'गुनगुना पानी या गर्म दूध पीकर खुद को हाइड्रेटेड रखें।',
        'अपने बैग में दो साफ पैड सुरक्षित रखें।',
      ],
      mr: [
        'पोटावर १५ मिनिटे गरम पाण्याची पिशवी ठेवून शांत पडून राहा.',
        'कोमट पाणी किंवा गरम दूध पिऊन हायड्रेटेड राहा.',
        'बॅगेत दोन स्वच्छ पॅड सुरक्षित सोबत ठेवा.',
      ],
    },
    whenToTalk: {
      en: 'Talk to a trusted adult or doctor if your cramps are severe enough to keep you in bed, bleeding lasts longer than 7 days, or you soak through a pad in less than 2 hours.',
      hi: 'यदि ऐंठन बहुत तेज़ हो, खून का बहाव 7 दिनों से अधिक रहे, या 2 घंटे से कम में पैड पूरी तरह भीग जाए, तो डॉक्टर या मां से ज़रूर बात करें।',
      mr: 'खूप जास्त पोटदुखी असल्यास, पाळी ७ दिवसांपेक्षा जास्त चालल्यास, किंवा २ तासांपेक्षा कमी वेळेत पॅड भरत असल्यास मोठ्यांशी किंवा डॉक्टरांशी नक्की बोला.',
    },
    needsMedicalReview: true,
  },

  p1: {
    id: 'p1',
    name: {
      en: 'Fresh Start (Follicular Phase)',
      hi: 'नई शुरुआत (फॉलिक्युलर चरण)',
      mr: 'नवी सुरुवात (फॉलिक्युलर टप्पा)',
    },
    daysLabel: {
      en: 'Days 6 to 12',
      hi: 'दिन 6 से 12',
      mr: 'दिवस ६ ते १२',
    },
    color: '#8FAE9B', // Sage
    darkColor: '#9EB8A7',
    whatHappens: {
      en: 'Your period has ended! Estrogen levels begin to rise gently, telling the body to prepare a fresh new cushion in the uterus. Your natural vitality and curiosity bounce back.',
      hi: 'माहवारी समाप्त हो चुकी है! एस्ट्रोजन हार्मोन धीरे-धीरे बढ़ने लगता है, जिससे शरीर नई मुलायम परत तैयार करता है। आपकी ऊर्जा और उत्साह वापस लौटते हैं।',
      mr: 'पाळी संपली आहे! इस्ट्रोजेन हार्मोन हळूवार वाढू लागतो, ज्यामुळे गर्भाशयात नवे अस्तर तयार होते. तुमचा उत्साह आणि ऊर्जा पुन्हा वाढते.',
    },
    symptoms: {
      physical: {
        en: ['Clear glowing skin', 'Feeling energetic and light', 'Healthy appetite'],
        hi: ['त्वचा में निखार', 'हल्कापन और फुर्ती', 'अच्छी भूख लगना'],
        mr: ['चेहऱ्यावर ताजेतवाने तेज', 'हलकेपण आणि उत्साह', 'छान भूक लागणे'],
      },
      emotional: {
        en: ['Curious and creative', 'Ready to learn new things', 'Happy and social'],
        hi: ['सीखने की नई उमंग', 'सहेलियों से बात करने का मन', 'सकारात्मक सोच'],
        mr: ['नवे शिकण्याची उत्सुकता', 'मैत्रिणींशी बोलण्याचा आनंद', 'आनंदी मनस्थिती'],
      },
    },
    tips: {
      food: {
        en: 'Eat fresh colorful fruits, crunchy vegetables, sprouts, and curd.',
        hi: 'ताज़े मौसमी फल, हरी सब्ज़ियां, अंकुरित अनाज और दही का सेवन करें।',
        mr: 'ताजी फळे, हिरव्या भाज्या, मोड आलेली कडधान्ये आणि दही खा.',
      },
      sleep: {
        en: 'Consistent 8 hours to power your active brain and schoolwork.',
        hi: 'नियमित 8 घंटे की अच्छी नींद लें ताकि पढ़ाई में मन लगे।',
        mr: 'नियमित ८ तास झोपा जेणेकरून अभ्यासात एकाग्रता राहील.',
      },
      movement: {
        en: 'A wonderful time for sports, dancing, running, and playing outside.',
        hi: 'खेलकूद, दौड़ना, साइकिल चलाना और डांस करने का यह सबसे अच्छा समय है।',
        mr: 'खेळ, सायकल चालवणे, नृत्य आणि मैदानी खेळ यासाठी हा उत्तम काळ आहे.',
      },
      hygiene: {
        en: 'Wash daily with clean water and wear comfortable, breathable cotton.',
        hi: 'रोज़ साफ पानी से नहाएं और आरामदायक सूती कपड़े पहनें।',
        mr: 'दररोज स्वच्छ पाण्याने आंघोळ करा आणि आरामदायक सुती कपडे वापरा.',
      },
      mood: {
        en: 'Channel your rising energy into art, reading, or creative hobbies.',
        hi: 'अपनी ऊर्जा को चित्रकला, संगीत या अपनी पसंदीदा हॉबी में लगाएं।',
        mr: 'वाढलेली ऊर्जा वाचन, कला किंवा आवडीच्या छंदात लावा.',
      },
    },
    todaySuggestions: {
      en: [
        'Try learning a new skill or reading a chapter of an exciting book.',
        'Enjoy outdoor sports or a playful walk in fresh air.',
        'Drink a refreshing glass of water and eat a fruit snack.',
      ],
      hi: [
        'कुछ नया सीखने या मनपसंद किताब का अध्याय पढ़ने का प्रयास करें।',
        'खुली हवा में खेलें या सहेलियों के साथ टहलें।',
        'एक गिलास ताज़ा पानी पिएं और कोई मौसमी फल खाएं।',
      ],
      mr: [
        'काहीतरी नवे शिका किंवा आवडीच्या पुस्तकाचे पान वाचा.',
        'बाहेर मोकळ्या हवेत खेळा किंवा फिरायला जा.',
        'एक ग्लास ताजे पाणी प्या आणि छान फळ खा.',
      ],
    },
    whenToTalk: {
      en: 'Cycles in the first 1-2 years can vary. If you have not had a period for over 3 months, gently let your mother or doctor know.',
      hi: 'शुरुआती 1-2 सालों में चक्र में बदलाव सामान्य है। यदि 3 महीने से माहवारी न आई हो, तो मां या डॉक्टर को बताएं।',
      mr: 'पहिल्या १-२ वर्षांत चक्राची वेळ बदलू शकते. सलग ३ महिने पाळी न आल्यास आईला किंवा डॉक्टरांना नक्की सांगा.',
    },
    needsMedicalReview: true,
  },

  p2: {
    id: 'p2',
    name: {
      en: 'Peak Energy (Ovulation Phase)',
      hi: 'शीर्ष ऊर्जा (ओव्यूलेशन चरण)',
      mr: 'सर्वोच्च ऊर्जा (ओव्ह्युलेशन टप्पा)',
    },
    daysLabel: {
      en: 'Days 13 to 16',
      hi: 'दिन 13 से 16',
      mr: 'दिवस १३ ते १६',
    },
    color: '#D2AE6D', // Gold
    darkColor: '#DEC088',
    whatHappens: {
      en: 'One of the ovaries gently releases a tiny microscopic egg cell. Your estrogen hits its monthly high point, making you feel confident, sociable, and expressive.',
      hi: 'अंडाशय से एक नन्हा अंडाणु बाहर आता है। एस्ट्रोजन अपने महीने के सबसे ऊंचे स्तर पर होता है, जिससे आप आत्मविश्वासी और खुशमिज़ाज महसूस करती हैं।',
      mr: 'अंडाशयातून एक लहान स्त्रीबीज तयार होते. इस्ट्रोजेनची पातळी उच्च असल्याने आत्मविश्वास आणि उत्साह दांडगा असतो.',
    },
    symptoms: {
      physical: {
        en: ['Clear stretchy natural discharge', 'Peak physical stamina', 'Sharp senses'],
        hi: ['हल्का सा प्राकृतिक साफ स्राव', 'भरपूर शारीरिक ऊर्जा', 'सजग इंद्रियां'],
        mr: ['नैसर्गिक स्वच्छ पांढरा स्राव', 'भरपूर शारीरिक ताकद', 'सतेज उत्साह'],
      },
      emotional: {
        en: ['Confident and cheerful', 'Enjoys talking with friends', 'Empathetic'],
        hi: ['आत्मविश्वासी और प्रसन्न', 'सहेलियों से बात करने में आनंद', 'सहानुभूतिपूर्ण'],
        mr: ['आत्मविश्वासी आणि आनंदी', 'मैत्रिणींशी गप्पा मारण्यात रस', 'उत्साही मन'],
      },
    },
    tips: {
      food: {
        en: 'Nourishing nuts like almonds and walnuts, fiber-rich fruits, and cooling water.',
        hi: 'बादाम, अखरोट जैसे मेवे, फाइबर युक्त फल और पर्याप्त पानी पिएं।',
        mr: 'बदाम, अक्रोड, फायबरयुक्त फळे आणि भरपूर पाणी प्या.',
      },
      sleep: {
        en: 'Keep a calm bedtime routine even when you feel like staying up late.',
        hi: 'उत्साह में देर रात तक जागने के बजाय समय पर सोने का नियम रखें।',
        mr: 'उत्साह असला तरी रात्री उशिरापर्यंत न जागता वेळेवर झोपा.',
      },
      movement: {
        en: 'Your body feels strong and flexible! Perfect for yoga, gymnastics, and team sports.',
        hi: 'योग, खेलकूद और व्यायाम करने के लिए यह सबसे बेहतरीन दिन हैं।',
        mr: 'योगासने, धावणे आणि मैदानी खेळांसाठी हे दिवस अतिशय उत्तम आहेत.',
      },
      hygiene: {
        en: 'Clear discharge is completely normal and cleanses the body. Wear clean cotton underwear.',
        hi: 'साफ स्राव पूरी तरह सामान्य है और शरीर को साफ रखता है। साफ कपड़े पहनें।',
        mr: 'स्वच्छ स्राव अगदी सामान्य असून शरीर स्वच्छ ठेवतो. सुती कपडे वापरा.',
      },
      mood: {
        en: 'Express yourself through writing, public speaking, or group activities.',
        hi: 'समूह गतिविधियों, बातचीत और भाषण में अपनी प्रतिभा दिखाएं।',
        mr: 'गट चर्चा, भाषण किंवा संवादात स्वतःचे विचार उत्साहाने मांडा.',
      },
    },
    todaySuggestions: {
      en: [
        'Notice your natural confidence and share your ideas in class or with family.',
        'Hydrate well throughout the day to support your natural vitality.',
        'Celebrate your growing body and how intelligently nature designs it.',
      ],
      hi: [
        'अपने आत्मविश्वास को पहचानें और परिवार या कक्षा में अपने विचार साझा करें।',
        'दिन भर पर्याप्त पानी पीकर शरीर को ऊर्जावान रखें।',
        'प्रकृति के इस बुद्धिमान और सुंदर शरीर तंत्र का सम्मान करें।',
      ],
      mr: [
        'तुमचा आत्मविश्वास ओळखा आणि शाळेत किंवा घरात मनमोकळे बोला.',
        'दिवसभरात भरपूर पाणी पिऊन ताजेतवाने राहा.',
        'निसर्गाने शरीराची किती सुंदर रचना केली आहे हे समजून घ्या.',
      ],
    },
    whenToTalk: {
      en: 'A slight pinch on one side of the lower tummy for a few hours is normal. If pain is severe or sharp, let an adult know.',
      hi: 'ओव्यूलेशन के समय पेट के एक तरफ हल्का सा खिंचाव सामान्य है। दर्द तेज़ हो तो मां को बताएं।',
      mr: 'ओव्ह्युलेशनवेळी पोटाच्या एका बाजूला हलके दुखणे सामान्य आहे. तीव्र वेदना झाल्यास मोठ्यांना सांगा.',
    },
    needsMedicalReview: true,
  },

  p3: {
    id: 'p3',
    name: {
      en: 'Slow Down (Luteal Phase)',
      hi: 'धीमी गति (लुटियल चरण)',
      mr: 'विश्रांतीचा टप्पा (ल्युटियल टप्पा)',
    },
    daysLabel: {
      en: 'Days 17 to 28',
      hi: 'दिन 17 से 28',
      mr: 'दिवस १७ ते २८',
    },
    color: '#5C3D6B', // Deep Plum
    darkColor: '#C7A4D6',
    whatHappens: {
      en: 'Progesterone hormone rises to support the cushion lining. Toward the end of this phase, hormones gently decrease, prompting your body to rest and prepare for the next clean reset.',
      hi: 'प्रोजेस्टेरोन हार्मोन गर्भाशय की परत को संभालता है। चरण के अंत में हार्मोन धीरे-धीरे कम होते हैं, जिससे शरीर थोड़ा विश्राम मांगता है और नए चक्र की तैयारी करता है।',
      mr: 'प्रोजेस्टेरॉन हार्मोन गर्भाशयाचे अस्तर टिकवून ठेवतो. टप्प्याच्या शेवटी हार्मोन्स कमी होतात, त्यामुळे शरीराला थोड्या विश्रांतीची गरज भासते.',
    },
    symptoms: {
      physical: {
        en: ['Mild bloating or tender breasts', 'A pimple or two', 'Craving warm snacks'],
        hi: ['पेट में हल्का भारीपन', 'चेहरे पर एकाध फुंसी', 'गर्म नाश्ता खाने की इच्छा'],
        mr: ['पोटात हलके जड वाटणे', 'चेहऱ्यावर एखादे पुरळ', 'गरम पदार्थ खाण्याची इच्छा'],
      },
      emotional: {
        en: ['Preferring cozy alone time', 'Mood might feel a bit sensitive', 'Organizing thoughts'],
        hi: ['अकेले शांति से रहने का मन', 'भावुकता या संवेदनशीलता', 'चीज़ें व्यवस्थित करने की इच्छा'],
        mr: ['शांत एकांत आवडणे', 'मन थोडे संवेदनशील असणे', 'गोष्टी नीटनेटके ठेवण्याची इच्छा'],
      },
    },
    tips: {
      food: {
        en: 'Warm soups, chamomile tea, roasted seeds, and dark chocolate in moderation.',
        hi: 'गर्म सूप, भुने हुए बीज, मेवे और थोड़ा सा डार्क चॉकलेट मूड को अच्छा रखता है।',
        mr: 'गरम सूप, भाजलेले बी-बियाणे आणि थोडे डार्क चॉकलेट मन प्रसन्न ठेवते.',
      },
      sleep: {
        en: 'Prioritize going to bed early. Your body does its deepest healing in sleep.',
        hi: 'जल्दी सोने की आदत बनाएं। नींद में शरीर खुद को सबसे अच्छी तरह रीसेट करता है।',
        mr: 'लवकर झोपण्याला प्राधान्य द्या. झोपेत शरीर स्वतःला सर्वात छान रीसेट करते.',
      },
      movement: {
        en: 'Gentle walking, slow yoga stretches, and cozy breathing.',
        hi: 'धीमी सैर, कोमल योगाभ्यास और गहरी सांस लेने के व्यायाम करें।',
        mr: 'शांत चालणे, हलके योगासने आणि दीर्घ श्वास घेणे.',
      },
      hygiene: {
        en: 'Wash your face twice daily with mild soap to care for any breakouts.',
        hi: 'चेहरे को दिन में दो बार सादे पानी और हल्के साबुन से धोएं।',
        mr: 'चेहरा दिवसातून दोनदा साध्या पाण्याने आणि सौम्य साबणाने धुवा.',
      },
      mood: {
        en: 'Remember that mood shifts are just temporary chemical waves, not who you are.',
        hi: 'याद रखें कि मूड में बदलाव सिर्फ अस्थायी हार्मोन हैं, कोई चिंता की बात नहीं।',
        mr: 'लक्षात ठेवा की मूडमधील बदल फक्त तात्पुरते हार्मोनल बदल आहेत, काळजी करू नका.',
      },
    },
    todaySuggestions: {
      en: [
        'Prepare your emergency period kit with a pad, paper wrap, and clean pouch.',
        'Take a warm shower in the evening to relax your mind and muscles.',
        'Spend 10 quiet minutes journaling or drawing before sleep.',
      ],
      hi: [
        'अपने बैग में एक साफ पैड और रैपर वाला इमरजेंसी किट तैयार रखें।',
        'शाम को गुनगुने पानी से नहाकर मांसपेशियों को आराम दें।',
        'सोने से पहले 10 मिनट शांति से डायरी लिखें या चित्र बनाएं।',
      ],
      mr: [
        'बॅगेत एक पॅड आणि कागदासह स्वच्छ किट तयार ठेवा.',
        'संध्याकाळी कोमट पाण्याने आंघोळ करून स्नायूंना आराम द्या.',
        'झोपण्यापूर्वी १० मिनिटे शांत बसून चित्र काढा किंवा मनातले लिहा.',
      ],
    },
    whenToTalk: {
      en: 'If you feel intense mood sadness or extreme anxiety that lasts many days before your period, talk to your mother or doctor for gentle guidance.',
      hi: 'यदि माहवारी से पहले बहुत ज़्यादा उदासी या चिंता कई दिनों तक रहे, तो मां या डॉक्टर से बात करें।',
      mr: 'पाळीपूर्वी खूप जास्त नैराश्य किंवा चिंता सतत जाणवत असल्यास आईशी किंवा डॉक्टरांशी नक्की बोला.',
    },
    needsMedicalReview: true,
  },
};
