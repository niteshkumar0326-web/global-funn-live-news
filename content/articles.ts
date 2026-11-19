// Public Hindi articles for the reader section (/khabar).
// Every article lists its sources; facts that are not confirmed are labelled as such.

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "list"; items: string[] }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "note"; text: string }
  | { type: "product"; name: string; query: string; note?: string };

export type Article = {
  slug: string;
  title: string;
  description: string;
  category: "टेक" | "भक्ति" | "त्योहार";
  published: string; // ISO date (IST)
  updated?: string;
  youtube?: string; // related video URL
  sources: { name: string; url: string }[];
  body: Block[];
};

export const ARTICLES: Article[] = [
  {
    slug: "vivo-x500-series-india-launch-26-november",
    title: "Vivo X500 सीरीज़ भारत में 26 नवंबर को: कीमत, कैमरा, चिप और बैटरी",
    description:
      "Vivo X500, X500 Pro और X500 Pro Max की भारत लॉन्च तारीख, चीन वाले स्पेक्स और भारत की अनुमानित (लीक) कीमतें, एक जगह।",
    category: "टेक",
    published: "2026-11-19",
    sources: [
      { name: "Digit: India launch date and expected specs", url: "https://www.digit.in/news/mobile-phones/vivo-x500-pro-max-x500-pro-x500-india-launch-set-for-nov-26-check-expected-price-specs-and-more.html" },
      { name: "91mobiles: China launch, chips and prices", url: "https://www.91mobiles.com/hub/vivo-x500-series-launched-china-price-specifications/" },
    ],
    body: [
      { type: "p", text: "वीवो इंडिया ने कन्फ़र्म किया है कि X500 सीरीज़ 26 नवंबर 2026 को भारत में लॉन्च होगी। इस सीरीज़ में तीन फ़ोन हैं: X500, X500 Pro और X500 Pro Max। तीनों चीन में पहले ही लॉन्च हो चुके हैं, इसलिए ज़्यादातर स्पेक्स पता हैं। भारत की कीमतें अभी आधिकारिक नहीं हैं।" },
      { type: "h2", text: "तीनों फ़ोन एक नज़र में (चीन मॉडल)" },
      { type: "table", head: ["", "X500 Pro Max", "X500 Pro", "X500"], rows: [
        ["डिस्प्ले", "6.85\" 2K, 144Hz", "6.36\" 1.5K, 144Hz", "6.59\" 1.5K, 144Hz"],
        ["चिप", "Dimensity 9600 Pro", "Dimensity 9600 Pro", "Dimensity 9600M"],
        ["ज़ूम कैमरा", "200MP पेरिस्कोप, 3.5x", "64MP, 3.5x", "64MP, 3x"],
        ["बैटरी", "8,000 mAh", "6,510 mAh", "7,500 mAh"],
      ] },
      { type: "note", text: "Dimensity 9600M असल में पिछली पीढ़ी के Dimensity 9500 का नया नाम है। भारत में स्पेक्स लॉन्च पर बदल सकते हैं।" },
      { type: "h2", text: "भारत में कीमत: अभी सिर्फ़ लीक" },
      { type: "p", text: "टिप्स्टर संजू चौधरी के मुताबिक़ X500 की शुरुआती कीमत लगभग ₹1,19,999 हो सकती है। Pro के लिए ₹1,49,999 और Pro Max के लिए ₹1,59,999 (512GB: ₹1,79,999) बताई जा रही है। चीन में शुरुआती कीमतें CNY 5,499, 6,499 और 6,999 हैं। सेल 2 दिसंबर से शुरू होने की ख़बर है, यह भी आधिकारिक नहीं है।" },
      { type: "h2", text: "किसे इंतज़ार करना चाहिए?" },
      { type: "list", items: [
        "ज़ूम फ़ोटो और बड़ी बैटरी चाहिए: Pro Max (200MP पेरिस्कोप, 8,000 mAh)।",
        "छोटा, हाथ में आसान फ़्लैगशिप चाहिए: X500 Pro।",
        "बजट थोड़ा कम है और बैटरी ज़रूरी है: बेस X500 (7,500 mAh)।",
      ] },
      { type: "product", name: "Vivo X500 सीरीज़", query: "vivo x500", note: "लॉन्च के बाद उपलब्ध होने पर" },
      { type: "p", text: "26 नवंबर को आधिकारिक कीमत आते ही यह पेज अपडेट किया जाएगा।" },
    ],
  },
  {
    slug: "dev-uthani-ekadashi-2026-tithi-puja-vidhi",
    title: "देवउठनी एकादशी 2026: तिथि, व्रत का दिन और पूजा विधि",
    description:
      "देवउठनी (प्रबोधिनी) एकादशी 2026 कब है, स्मार्त और वैष्णव व्रत किस दिन, और घर पर पूजा कैसे करें।",
    category: "त्योहार",
    published: "2026-11-19",
    youtube: "https://www.youtube.com/@GLOBALFUNNBhakti",
    sources: [
      { name: "PanchangBodh: Dev Uthani Ekadashi", url: "https://panchangbodh.com/dev-uthani-ekadashi" },
      { name: "Jagran: Devuthani Ekadashi 2026 date", url: "https://www.thedailyjagran.com/lite/spiritual/devuthani-ekadashi-2026-november-20-or-21-know-exact-date-shubh-muhurat-and-puja-vidhi-10336151" },
      { name: "Aaj Tak: पूजा विधि और नियम", url: "https://www.aajtak.in/religion/news/story/dev-uthani-ekadashi-2024-date-significance-shubh-muhurt-pujan-vidhi-upay-tlifdu-dskc-2093788-2024-11-11" },
    ],
    body: [
      { type: "p", text: "मान्यता है कि आषाढ़ की देवशयनी एकादशी से भगवान विष्णु चार महीने की योग निद्रा में रहते हैं। इन चार महीनों को चातुर्मास कहते हैं। कार्तिक शुक्ल एकादशी को वे जागते हैं, इसलिए इसे देवउठनी या प्रबोधिनी एकादशी कहते हैं। इसके बाद विवाह जैसे शुभ काम फिर से शुरू होते हैं।" },
      { type: "h2", text: "तिथि और व्रत का दिन (नई दिल्ली)" },
      { type: "table", head: ["", "समय"], rows: [
        ["एकादशी शुरू", "20 नवंबर 2026, सुबह लगभग 7:15"],
        ["एकादशी समाप्त", "21 नवंबर 2026, सुबह लगभग 6:31"],
        ["स्मार्त (गृहस्थ) व्रत", "शुक्रवार, 20 नवंबर"],
        ["वैष्णव व्रत", "शनिवार, 21 नवंबर"],
      ] },
      { type: "note", text: "अलग-अलग पंचांगों में समय एक-दो मिनट अलग हो सकता है। अपने शहर का पंचांग ज़रूर देखें।" },
      { type: "h2", text: "पूजा विधि" },
      { type: "list", items: [
        "सुबह स्नान करके घर साफ़ करें, द्वार पर गेरू और चूने से अल्पना बनाएँ।",
        "गन्ने का मंडप बनाकर भगवान विष्णु या शालिग्राम जी को स्थापित करें।",
        "गंगाजल और पंचामृत से अभिषेक करें; तुलसी दल, पीले फूल, गन्ना, सिंघाड़ा, फल और मिठाई अर्पित करें।",
        "शाम को तुलसी के पास घी के दीपक जलाएँ, शंख-घंटी बजाकर \"उठो देव, बैठो देव\" बोलें।",
        "भगवान के सामने घी का एक दीपक रात भर जलने दें।",
      ] },
      { type: "note", text: "परंपरा के अनुसार इस दिन तुलसी के पत्ते नहीं तोड़े जाते; पत्ते एक दिन पहले तोड़कर रख लें। अपने परिवार और क्षेत्र की परंपरा का पालन करें।" },
    ],
  },
  {
    slug: "tulsi-vivah-2026-katha-vidhi",
    title: "तुलसी विवाह 2026: 21 नवंबर, कथा और घर पर विवाह की विधि",
    description:
      "तुलसी विवाह 2026 की तारीख, वृंदा और शालिग्राम की कथा, और घर पर तुलसी-शालिग्राम विवाह करने की आसान विधि।",
    category: "भक्ति",
    published: "2026-11-19",
    youtube: "https://www.youtube.com/@GLOBALFUNNBhakti",
    sources: [
      { name: "PanchangBodh: Tulsi Vivah", url: "https://panchangbodh.com/tulsi-vivah" },
      { name: "Bhakti Bharat: तुलसी विवाह पौराणिक कथा", url: "https://www.bhaktibharat.com/katha/tulsi-vivah-pauranik-katha" },
      { name: "Patrika: तुलसी विवाह की विधि", url: "https://www.patrika.com/lucknow-news/tulsi-vivah-2023-shubh-muhoort-pooja-kee-vidhi-devuthanee-ekaadashee-ka-mahatv-8602159" },
      { name: "Jagran: Tulsi Vivah 2026", url: "https://www.thedailyjagran.com/spiritual/tulsi-vivah-2026-date-exact-shubh-muhurat-puja-vidhi-and-samagri-list-10336202" },
    ],
    body: [
      { type: "p", text: "तुलसी विवाह 2026 शनिवार, 21 नवंबर को है, यानी कार्तिक शुक्ल द्वादशी, देवउठनी एकादशी के अगले दिन। कुछ परिवार इसे एकादशी के दिन ही करते हैं। विवाह शाम को प्रदोष काल में, सूर्यास्त के बाद किया जाता है; अलग-अलग स्रोत अलग शुभ समय बताते हैं, इसलिए अपने शहर का पंचांग देखें।" },
      { type: "h2", text: "वृंदा और शालिग्राम की कथा, संक्षेप में" },
      { type: "p", text: "वृंदा भगवान विष्णु की भक्त थीं और दानव राजा जालंधर की पत्नी। मान्यता है कि वृंदा के पतिव्रत की शक्ति से जालंधर अजेय था। देवताओं की प्रार्थना पर भगवान विष्णु ने जालंधर का रूप धारण किया, वृंदा का संकल्प टूटा, और युद्ध में भगवान शिव ने जालंधर का वध किया। सच्चाई जानकर वृंदा ने भगवान को पत्थर होने का श्राप दिया; यही रूप शालिग्राम कहलाया। देवताओं और माता लक्ष्मी की विनती पर वृंदा ने श्राप वापस लिया और सती हो गईं। जहाँ वे भस्म हुईं, वहाँ तुलसी का पौधा उगा, और भगवान ने वरदान दिया कि उनकी पूजा तुलसी के बिना पूरी नहीं होगी।" },
      { type: "note", text: "यह कथा पौराणिक मान्यताओं पर आधारित है; अलग-अलग ग्रंथों और क्षेत्रों में इसके रूप थोड़े अलग मिलते हैं।" },
      { type: "h2", text: "घर पर तुलसी विवाह की विधि" },
      { type: "list", items: [
        "एक छोटी चौकी पर तुलसी का पौधा रखें और गमले पर गन्ने का मंडप बनाएँ।",
        "तुलसी माता को लाल चुनरी ओढ़ाएँ और सुहाग की सामग्री अर्पित करें।",
        "शालिग्राम जी को तुलसी के पास रखें और दोनों को हल्दी लगाएँ।",
        "तुलसी के सामने घी का दीपक जलाएँ, परिक्रमा करें और मंगल गीत गाएँ।",
      ] },
      { type: "p", text: "मान्यता है कि तुलसी विवाह कराने से कन्यादान जैसा पुण्य मिलता है। पूरी कथा का वीडियो GLOBAL FUNN Bhakti चैनल पर है।" },
    ],
  },
];

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}
