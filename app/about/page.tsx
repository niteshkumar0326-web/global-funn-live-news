import type { Metadata } from "next";
import { StaticPage } from "@/components/static-page";

export const metadata: Metadata = { title: "हमारे बारे में | GLOBAL FUNN", alternates: { canonical: "/about" } };

export default function About() {
  return (
    <StaticPage title="हमारे बारे में">
      <p>GLOBAL FUNN झारखंड से चलने वाला एक स्वतंत्र हिंदी डिजिटल मीडिया प्रोजेक्ट है, जिसे नितेश कुमार चलाते हैं। यहाँ टेक लॉन्च, त्योहार, भक्ति और ज़रूरी जानकारी सरल हिंदी में मिलती है।</p>
      <h2>हम कैसे काम करते हैं</h2>
      <ul>
        <li>हर लेख के नीचे उसके स्रोत दिए जाते हैं। जो बात अभी आधिकारिक नहीं है, उसे साफ़ तौर पर "लीक" या "अनुमानित" लिखा जाता है।</li>
        <li>लेख और वीडियो बनाने में AI टूल (जैसे आवाज़ और ग्राफ़िक्स) की मदद ली जाती है; तथ्य स्रोतों से जाँचे जाते हैं और प्रकाशन से पहले इंसान द्वारा देखे जाते हैं।</li>
        <li>हम निवेश, शेयर या ट्रेडिंग की सलाह नहीं देते, और न ही कोई टिप्स बेचते हैं।</li>
        <li>ग़लतियाँ सुधारी जाती हैं और <a href="/archive">Corrections</a> पेज पर दर्ज होती हैं।</li>
      </ul>
      <h2>हमारे चैनल</h2>
      <ul>
        <li><a href="https://www.youtube.com/@GLOBALFUNNLiveNews">GLOBAL FUNN Live News</a></li>
        <li><a href="https://www.youtube.com/@GLOBALFUNNBhakti">GLOBAL FUNN Bhakti</a></li>
        <li><a href="https://www.youtube.com/@GLOBALFUNNTechAI">GLOBAL FUNN Tech AI</a></li>
        <li><a href="https://www.youtube.com/@niteshkumar0326">GLOBAL FUNN</a></li>
      </ul>
    </StaticPage>
  );
}
