import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supported languages
export type Language = 'en' | 'bn' | 'hi' | 'ur';

export interface LanguageOption {
    code: Language;
    name: string;
    nativeName: string;
    newsApiCode: string; // NewsData.io language code
}

export const LANGUAGES: LanguageOption[] = [
    { code: 'en', name: 'English', nativeName: 'English', newsApiCode: 'en' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', newsApiCode: 'bn' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', newsApiCode: 'hi' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو', newsApiCode: 'ur' },
];

// Translations
export const translations: Record<Language, Record<string, string>> = {
    en: {
        // Navigation
        home: 'Home',
        news: 'News',
        history: 'History',
        about: 'About',

        // Home Screen
        welcomeTitle: 'LeafLens',
        welcomeSubtitle: 'Your Plant Health Companion',
        scanPlant: 'Scan Plant',
        myGarden: 'My Garden',
        recentScans: 'Recent Scans',
        noRecentScans: 'No recent scans yet',

        // News Screen
        eggplantNews: 'Latest Articles',
        latestUpdates: 'Gardening, food & healthy living',
        latest: 'Latest',
        popular: 'Popular',
        noNewsFound: 'No articles found.',
        loadingMore: 'Loading more...',
        tapToRead: 'Tap to read the full article...',
        noImageAvailable: 'No image available',

        // Garden Screen
        myGardenTitle: 'My Garden',
        yourGardenEmpty: 'Your Garden is Empty',
        gardenEmptyDesc: 'Add your plant babies here to track their health journey, save diagnosis history, and get care reminders.',
        addFirstPlant: 'Add Your First Plant',
        addPlant: 'Add Plant',
        editPlantDetails: 'Edit Plant Details',
        newPlantBaby: 'New Plant Baby',
        addNewPlant: 'Add a new plant to your collection.',
        updatePlantDetails: 'Update your plant details below.',
        removePlant: 'Remove Plant',
        removeConfirm: 'Are you sure you want to remove this plant from your garden? This action cannot be undone.',
        cancel: 'Cancel',
        remove: 'Remove',
        updatePlant: 'Update Plant',

        // Plant Form
        name: 'Name',
        type: 'Type',
        selectType: 'Select Type',
        plantTypes: 'Plant Types',
        wateringFrequency: 'Watering Frequency',
        sunlightNeeds: 'Sunlight Needs',
        difficulty: 'Difficulty',
        petSafe: 'Pet Safe',
        details: 'Details',
        location: 'Location',
        soil: 'Soil',
        notes: 'Notes',
        addPhoto: 'Add Photo',

        // Settings
        settings: 'Settings',
        language: 'Language',
        selectLanguage: 'Select Language',

        // Common
        loading: 'Loading...',
        error: 'Error',
        retry: 'Retry',
        added: 'Added',

        // Home Screen Extra
        welcomeBack: 'Welcome back',
        plantParent: 'Plant Parent',
        aiPowered: 'AI Powered',
        diagnoseInstantly: "Diagnose your plant's health instantly",
        snapPhoto: 'Snap Photo',
        upload: 'Upload',
        recentScan: 'Recent Scan',
        viewAll: 'View All',
        plantCareEssentials: 'Plant Care Essentials',
        sunlight: 'Sunlight',
        watering: 'Watering',
        temp: 'Temp',
        sunlightTip: 'Most indoor plants prefer bright, indirect light.',
        wateringTip: 'Check soil moisture before watering to avoid root rot.',
        tempTip: 'Keep plants away from cold drafts and heaters.',
        analysis: 'Analysis',
        analyzePlant: 'Analyze Plant',
        healthy: 'Healthy',
        attentionNeeded: 'Attention Needed',
        confidence: 'Confidence',
        healthyDesc: 'Your plant looks healthy and vibrant! Keep up the good work.',
        scanAnother: 'Scan Another',

        // About Screen
        appearance: 'Appearance',
        light: 'Light',
        dark: 'Dark',
        system: 'System',
        ourMission: 'Our Mission',
        missionDesc: 'We believe that every plant deserves to thrive. LeafLens empowers you to understand your green companions better, bringing expert botanical knowledge to your fingertips instantly.',
        builtWith: 'Built with',
        by: 'by',
        creatorEngineer: 'Creator & Engineer',
        researcherPartner: 'Researcher & Partner',
        visitWebsite: 'Visit Website',
        makingBeautiful: 'Making things beautiful',
        version: 'Version',
        nurturingNature: 'Nurturing nature with the power of vision.',
    },
    bn: {
        // Navigation
        home: 'হোম',
        news: 'সংবাদ',
        history: 'ইতিহাস',
        about: 'সম্পর্কে',

        // Home Screen
        welcomeTitle: 'লিফলেন্স',
        welcomeSubtitle: 'আপনার উদ্ভিদ স্বাস্থ্য সঙ্গী',
        scanPlant: 'গাছ স্ক্যান করুন',
        myGarden: 'আমার বাগান',
        recentScans: 'সাম্প্রতিক স্ক্যান',
        noRecentScans: 'এখনো কোনো স্ক্যান নেই',

        // News Screen
        eggplantNews: 'সাম্প্রতিক নিবন্ধ',
        latestUpdates: 'বাগান, খাদ্য ও সুস্থ জীবনযাপন',
        latest: 'সর্বশেষ',
        popular: 'জনপ্রিয়',
        noNewsFound: 'কোনো নিবন্ধ পাওয়া যায়নি।',
        loadingMore: 'আরো লোড হচ্ছে...',
        tapToRead: 'পুরো নিবন্ধ পড়তে ট্যাপ করুন...',
        noImageAvailable: 'ছবি নেই',

        // Garden Screen
        myGardenTitle: 'আমার বাগান',
        yourGardenEmpty: 'আপনার বাগান খালি',
        gardenEmptyDesc: 'আপনার গাছের স্বাস্থ্য ট্র্যাক করতে, রোগ নির্ণয়ের ইতিহাস সংরক্ষণ করতে এবং যত্নের অনুস্মারক পেতে এখানে আপনার গাছ যোগ করুন।',
        addFirstPlant: 'প্রথম গাছ যোগ করুন',
        addPlant: 'গাছ যোগ করুন',
        editPlantDetails: 'গাছের বিবরণ সম্পাদনা করুন',
        newPlantBaby: 'নতুন গাছ',
        addNewPlant: 'আপনার সংগ্রহে একটি নতুন গাছ যোগ করুন।',
        updatePlantDetails: 'নীচে আপনার গাছের বিবরণ আপডেট করুন।',
        removePlant: 'গাছ সরান',
        removeConfirm: 'আপনি কি নিশ্চিত যে আপনি এই গাছটি আপনার বাগান থেকে সরাতে চান? এই ক্রিয়াটি পূর্বাবস্থায় ফেরানো যাবে না।',
        cancel: 'বাতিল',
        remove: 'সরান',
        updatePlant: 'গাছ আপডেট করুন',

        // Plant Form
        name: 'নাম',
        type: 'ধরন',
        selectType: 'ধরন নির্বাচন করুন',
        plantTypes: 'গাছের ধরন',
        wateringFrequency: 'পানি দেওয়ার ফ্রিকোয়েন্সি',
        sunlightNeeds: 'সূর্যালোকের প্রয়োজন',
        difficulty: 'কঠিনতা',
        petSafe: 'পোষা প্রাণীর জন্য নিরাপদ',
        details: 'বিবরণ',
        location: 'অবস্থান',
        soil: 'মাটি',
        notes: 'নোট',
        addPhoto: 'ছবি যোগ করুন',

        // Settings
        settings: 'সেটিংস',
        language: 'ভাষা',
        selectLanguage: 'ভাষা নির্বাচন করুন',

        // Common
        loading: 'লোড হচ্ছে...',
        error: 'ত্রুটি',
        retry: 'পুনরায় চেষ্টা করুন',
        added: 'যোগ করা হয়েছে',

        // Home Screen Extra
        welcomeBack: 'স্বাগতম',
        plantParent: 'উদ্ভিদ প্রেমী',
        aiPowered: 'এআই চালিত',
        diagnoseInstantly: 'আপনার গাছের স্বাস্থ্য তাৎক্ষণিকভাবে নির্ণয় করুন',
        snapPhoto: 'ছবি তুলুন',
        upload: 'আপলোড',
        recentScan: 'সাম্প্রতিক স্ক্যান',
        viewAll: 'সব দেখুন',
        plantCareEssentials: 'উদ্ভিদ যত্নের প্রয়োজনীয়তা',
        sunlight: 'সূর্যালোক',
        watering: 'পানি দেওয়া',
        temp: 'তাপমাত্রা',
        sunlightTip: 'বেশিরভাগ ইনডোর গাছ উজ্জ্বল, পরোক্ষ আলো পছন্দ করে।',
        wateringTip: 'মাটির আর্দ্রতা পরীক্ষা করুন পানি দেওয়ার আগে।',
        tempTip: 'গাছ ঠান্ডা বাতাস এবং হিটার থেকে দূরে রাখুন।',
        analysis: 'বিশ্লেষণ',
        analyzePlant: 'গাছ বিশ্লেষণ করুন',
        healthy: 'সুস্থ',
        attentionNeeded: 'মনোযোগ প্রয়োজন',
        confidence: 'আত্মবিশ্বাস',
        healthyDesc: 'আপনার গাছ সুস্থ দেখাচ্ছে! ভালো কাজ চালিয়ে যান।',
        scanAnother: 'আরেকটি স্ক্যান করুন',

        // About Screen
        appearance: 'চেহারা',
        light: 'হালকা',
        dark: 'গাঢ়',
        system: 'সিস্টেম',
        ourMission: 'আমাদের লক্ষ্য',
        missionDesc: 'আমরা বিশ্বাস করি প্রতিটি গাছ সুস্থ থাকার যোগ্য। লিফলেন্স আপনাকে আপনার সবুজ বন্ধুদের ভালোভাবে বুঝতে সাহায্য করে।',
        builtWith: 'তৈরি করা হয়েছে',
        by: 'দ্বারা',
        creatorEngineer: 'স্রষ্টা ও প্রকৌশলী',
        researcherPartner: 'গবেষক ও অংশীদার',
        visitWebsite: 'ওয়েবসাইট দেখুন',
        makingBeautiful: 'সুন্দর করে তৈরি করা',
        version: 'সংস্করণ',
        nurturingNature: 'দৃষ্টির শক্তিতে প্রকৃতির যত্ন।',
    },
    hi: {
        // Navigation
        home: 'होम',
        news: 'समाचार',
        history: 'इतिहास',
        about: 'के बारे में',

        // Home Screen
        welcomeTitle: 'लीफलेंस',
        welcomeSubtitle: 'आपका पौधा स्वास्थ्य साथी',
        scanPlant: 'पौधा स्कैन करें',
        myGarden: 'मेरा बगीचा',
        recentScans: 'हाल के स्कैन',
        noRecentScans: 'अभी तक कोई स्कैन नहीं',

        // News Screen
        eggplantNews: 'ताज़ा लेख',
        latestUpdates: 'बागवानी, खाना और स्वस्थ जीवन',
        latest: 'नवीनतम',
        popular: 'लोकप्रिय',
        noNewsFound: 'कोई लेख नहीं मिला।',
        loadingMore: 'और लोड हो रहा है...',
        tapToRead: 'पूरा लेख पढ़ने के लिए टैप करें...',
        noImageAvailable: 'कोई छवि उपलब्ध नहीं',

        // Garden Screen
        myGardenTitle: 'मेरा बगीचा',
        yourGardenEmpty: 'आपका बगीचा खाली है',
        gardenEmptyDesc: 'अपने पौधों के स्वास्थ्य को ट्रैक करने, निदान इतिहास सहेजने और देखभाल अनुस्मारक प्राप्त करने के लिए यहां अपने पौधे जोड़ें।',
        addFirstPlant: 'पहला पौधा जोड़ें',
        addPlant: 'पौधा जोड़ें',
        editPlantDetails: 'पौधे का विवरण संपादित करें',
        newPlantBaby: 'नया पौधा',
        addNewPlant: 'अपने संग्रह में एक नया पौधा जोड़ें।',
        updatePlantDetails: 'नीचे अपने पौधे का विवरण अपडेट करें।',
        removePlant: 'पौधा हटाएं',
        removeConfirm: 'क्या आप वाकई इस पौधे को अपने बगीचे से हटाना चाहते हैं? इस क्रिया को पूर्ववत नहीं किया जा सकता।',
        cancel: 'रद्द करें',
        remove: 'हटाएं',
        updatePlant: 'पौधा अपडेट करें',

        // Plant Form
        name: 'नाम',
        type: 'प्रकार',
        selectType: 'प्रकार चुनें',
        plantTypes: 'पौधों के प्रकार',
        wateringFrequency: 'पानी देने की आवृत्ति',
        sunlightNeeds: 'सूर्यप्रकाश की आवश्यकता',
        difficulty: 'कठिनाई',
        petSafe: 'पालतू जानवरों के लिए सुरक्षित',
        details: 'विवरण',
        location: 'स्थान',
        soil: 'मिट्टी',
        notes: 'नोट्स',
        addPhoto: 'फोटो जोड़ें',

        // Settings
        settings: 'सेटिंग्स',
        language: 'भाषा',
        selectLanguage: 'भाषा चुनें',

        // Common
        loading: 'लोड हो रहा है...',
        error: 'त्रुटि',
        retry: 'पुनः प्रयास करें',
        added: 'जोड़ा गया',

        // Home Screen Extra
        welcomeBack: 'वापसी पर स्वागत है',
        plantParent: 'पौधा माता-पिता',
        aiPowered: 'एआई संचालित',
        diagnoseInstantly: 'अपने पौधे के स्वास्थ्य का तुरंत निदान करें',
        snapPhoto: 'फोटो लें',
        upload: 'अपलोड',
        recentScan: 'हाल का स्कैन',
        viewAll: 'सब देखें',
        plantCareEssentials: 'पौधे की देखभाल की आवश्यकताएं',
        sunlight: 'सूर्य का प्रकाश',
        watering: 'पानी देना',
        temp: 'तापमान',
        sunlightTip: 'अधिकांश इनडोर पौधे उज्ज्वल, अप्रत्यक्ष प्रकाश पसंद करते हैं।',
        wateringTip: 'पानी देने से पहले मिट्टी की नमी जांचें।',
        tempTip: 'पौधों को ठंडी हवा और हीटर से दूर रखें।',
        analysis: 'विश्लेषण',
        analyzePlant: 'पौधे का विश्लेषण करें',
        healthy: 'स्वस्थ',
        attentionNeeded: 'ध्यान देने की जरूरत',
        confidence: 'आत्मविश्वास',
        healthyDesc: 'आपका पौधा स्वस्थ दिख रहा है! अच्छा काम जारी रखें।',
        scanAnother: 'एक और स्कैन करें',

        // About Screen
        appearance: 'दिखावट',
        light: 'हल्का',
        dark: 'गहरा',
        system: 'सिस्टम',
        ourMission: 'हमारा मिशन',
        missionDesc: 'हम मानते हैं कि हर पौधा फलने-फूलने का हकदार है। लीफलेंस आपको अपने हरे साथियों को बेहतर समझने में मदद करता है।',
        builtWith: 'बनाया गया',
        by: 'द्वारा',
        creatorEngineer: 'निर्माता और इंजीनियर',
        researcherPartner: 'शोधकर्ता और साथी',
        visitWebsite: 'वेबसाइट देखें',
        makingBeautiful: 'सुंदर बनाना',
        version: 'संस्करण',
        nurturingNature: 'दृष्टि की शक्ति से प्रकृति का पोषण।',
    },
    ur: {
        // Navigation
        home: 'ہوم',
        news: 'خبریں',
        history: 'تاریخ',
        about: 'کے بارے میں',

        // Home Screen
        welcomeTitle: 'لیف لینس',
        welcomeSubtitle: 'آپ کا پودوں کی صحت کا ساتھی',
        scanPlant: 'پودا اسکین کریں',
        myGarden: 'میرا باغ',
        recentScans: 'حالیہ اسکینز',
        noRecentScans: 'ابھی تک کوئی اسکین نہیں',

        // News Screen
        eggplantNews: 'تازہ مضامین',
        latestUpdates: 'باغبانی، کھانا اور صحت مند زندگی',
        latest: 'تازہ ترین',
        popular: 'مقبول',
        noNewsFound: 'کوئی مضمون نہیں ملا۔',
        loadingMore: 'مزید لوڈ ہو رہا ہے...',
        tapToRead: 'پورا مضمون پڑھنے کے لیے ٹیپ کریں...',
        noImageAvailable: 'کوئی تصویر دستیاب نہیں',

        // Garden Screen
        myGardenTitle: 'میرا باغ',
        yourGardenEmpty: 'آپ کا باغ خالی ہے',
        gardenEmptyDesc: 'اپنے پودوں کی صحت کو ٹریک کرنے، تشخیص کی تاریخ محفوظ کرنے اور دیکھ بھال کی یاد دہانیاں حاصل کرنے کے لیے یہاں اپنے پودے شامل کریں۔',
        addFirstPlant: 'پہلا پودا شامل کریں',
        addPlant: 'پودا شامل کریں',
        editPlantDetails: 'پودے کی تفصیلات میں ترمیم کریں',
        newPlantBaby: 'نیا پودا',
        addNewPlant: 'اپنے مجموعے میں ایک نیا پودا شامل کریں۔',
        updatePlantDetails: 'نیچے اپنے پودے کی تفصیلات اپڈیٹ کریں۔',
        removePlant: 'پودا ہٹائیں',
        removeConfirm: 'کیا آپ واقعی اس پودے کو اپنے باغ سے ہٹانا چاہتے ہیں؟ یہ عمل واپس نہیں کیا جا سکتا۔',
        cancel: 'منسوخ',
        remove: 'ہٹائیں',
        updatePlant: 'پودا اپڈیٹ کریں',

        // Plant Form
        name: 'نام',
        type: 'قسم',
        selectType: 'قسم منتخب کریں',
        plantTypes: 'پودوں کی اقسام',
        wateringFrequency: 'پانی دینے کی تعدد',
        sunlightNeeds: 'سورج کی روشنی کی ضرورت',
        difficulty: 'مشکل',
        petSafe: 'پالتو جانوروں کے لیے محفوظ',
        details: 'تفصیلات',
        location: 'مقام',
        soil: 'مٹی',
        notes: 'نوٹس',
        addPhoto: 'تصویر شامل کریں',

        // Settings
        settings: 'ترتیبات',
        language: 'زبان',
        selectLanguage: 'زبان منتخب کریں',

        // Common
        loading: 'لوڈ ہو رہا ہے...',
        error: 'خرابی',
        retry: 'دوبارہ کوشش کریں',
        added: 'شامل کیا گیا',

        // Home Screen Extra
        welcomeBack: 'واپسی پر خوش آمدید',
        plantParent: 'پودوں کے والدین',
        aiPowered: 'اے آئی سے چلنے والا',
        diagnoseInstantly: 'اپنے پودے کی صحت کی فوری تشخیص کریں',
        snapPhoto: 'فوٹو لیں',
        upload: 'اپ لوڈ',
        recentScan: 'حالیہ اسکین',
        viewAll: 'سب دیکھیں',
        plantCareEssentials: 'پودوں کی دیکھ بھال کی ضروریات',
        sunlight: 'سورج کی روشنی',
        watering: 'پانی دینا',
        temp: 'درجہ حرارت',
        sunlightTip: 'زیادہ تر انڈور پودے روشن، بالواسطہ روشنی پسند کرتے ہیں۔',
        wateringTip: 'پانی دینے سے پہلے مٹی کی نمی چیک کریں۔',
        tempTip: 'پودوں کو ٹھنڈی ہوا اور ہیٹر سے دور رکھیں۔',
        analysis: 'تجزیہ',
        analyzePlant: 'پودے کا تجزیہ کریں',
        healthy: 'صحت مند',
        attentionNeeded: 'توجہ کی ضرورت',
        confidence: 'اعتماد',
        healthyDesc: 'آپ کا پودا صحت مند لگ رہا ہے! اچھا کام جاری رکھیں۔',
        scanAnother: 'ایک اور اسکین کریں',

        // About Screen
        appearance: 'ظاہری شکل',
        light: 'ہلکا',
        dark: 'گہرا',
        system: 'سسٹم',
        ourMission: 'ہمارا مشن',
        missionDesc: 'ہمارا ماننا ہے کہ ہر پودا پھلنے پھولنے کا مستحق ہے۔ لیف لینس آپ کو اپنے سبز ساتھیوں کو بہتر سمجھنے میں مدد کرتا ہے۔',
        builtWith: 'بنایا گیا',
        by: 'کی طرف سے',
        creatorEngineer: 'تخلیق کار اور انجینئر',
        researcherPartner: 'محقق اور ساتھی',
        visitWebsite: 'ویب سائٹ دیکھیں',
        makingBeautiful: 'خوبصورت بنانا',
        version: 'ورژن',
        nurturingNature: 'نظر کی طاقت سے فطرت کی پرورش۔',
    },
};

// Context
interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
    languageOptions: LanguageOption[];
    currentLanguageOption: LanguageOption;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Provider
export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en');

    useEffect(() => {
        // Load saved language
        AsyncStorage.getItem('appLanguage').then((saved) => {
            if (saved && ['en', 'bn', 'hi', 'ur'].includes(saved)) {
                setLanguageState(saved as Language);
            }
        });
    }, []);

    const setLanguage = async (lang: Language) => {
        setLanguageState(lang);
        await AsyncStorage.setItem('appLanguage', lang);
    };

    const t = (key: string): string => {
        return translations[language][key] || translations['en'][key] || key;
    };

    const currentLanguageOption = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

    return (
        <LanguageContext.Provider value={{
            language,
            setLanguage,
            t,
            languageOptions: LANGUAGES,
            currentLanguageOption
        }}>
            {children}
        </LanguageContext.Provider>
    );
}

// Hook
export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
