// EmotionDiary.jsx
import { useState } from "react";
import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getGenerativeModel } from "firebase/ai";

const firebaseConfig = {
  apiKey: "AIzaSyAiF6AukDhkj1hbaoKK6Iw9imrmWJFnNFQ",
  authDomain: "fir-78f97.firebaseapp.com",
  projectId: "fir-78f97",
  storageBucket: "fir-78f97.firebasestorage.app",
  messagingSenderId: "315472783806",
  appId: "1:315472783806:web:1b6d0ba68bac5bc38431ef",
};

const app = initializeApp(firebaseConfig);

// App Check (무료 reCAPTCHA v3)
initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider("무료 발급받은 사이트키"),
  isTokenAutoRefreshEnabled: true,
});

export default function EmotionDiary() {
  const [diary, setDiary] = useState("");
  const [emotionResult, setEmotionResult] = useState("");

  const analyzeEmotion = async () => {
    if (!diary.trim()) return;

    try {
      const model = getGenerativeModel(app, {
        model: "gemini-1.5-flash",
        systemInstruction:
          "당신은 감정 분석 도우미입니다. 아래 일기 내용을 분석하여 현재 감정을 요약하고, 긍정/부정, 주요 감정 종류를 간결하게 리포트해 주세요.",
      });

      const response = await model.generate({
        prompt: diary,
      });

      setEmotionResult(response.text);
    } catch (error) {
      console.error("감정 분석 실패:", error);
      setEmotionResult("감정 분석 중 오류가 발생했습니다.");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>감정 일기</h2>
      <textarea
        rows={10}
        cols={50}
        placeholder="오늘의 감정을 일기로 적어보세요..."
        value={diary}
        onChange={(e) => setDiary(e.target.value)}
      />
      <br />
      <button onClick={analyzeEmotion} style={{ marginTop: 10 }}>
        감정 분석
      </button>
      <h3>분석 결과:</h3>
      <pre>{emotionResult}</pre>
    </div>
  );
}
