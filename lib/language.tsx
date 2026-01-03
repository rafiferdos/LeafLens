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
        eggplantNews: 'Eggplant News',
        latestUpdates: 'Latest updates from the purple world',
        latest: 'Latest',
        popular: 'Popular',
        noNewsFound: 'No news found.',
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
        eggplantNews: 'বেগুন সংবাদ',
        latestUpdates: 'বেগুন জগতের সর্বশেষ আপডেট',
        latest: 'সর্বশেষ',
        popular: 'জনপ্রিয়',
        noNewsFound: 'কোনো সংবাদ পাওয়া যায়নি।',
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
        eggplantNews: 'बैंगन समाचार',
        latestUpdates: 'बैंगन की दुनिया से ताज़ा अपडेट',
        latest: 'नवीनतम',
        popular: 'लोकप्रिय',
        noNewsFound: 'कोई समाचार नहीं मिला।',
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
        eggplantNews: 'بینگن خبریں',
        latestUpdates: 'بینگن کی دنیا سے تازہ ترین اپڈیٹس',
        latest: 'تازہ ترین',
        popular: 'مقبول',
        noNewsFound: 'کوئی خبر نہیں ملی۔',
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
