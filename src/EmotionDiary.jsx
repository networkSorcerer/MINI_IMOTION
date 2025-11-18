// src/EmotionDiary.jsx
import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";

// 1. Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyAiF6AukDhkj1hbaoKK6Iw9imrmWJFnNFQ", // 기존 웹 앱 API Key
  authDomain: "fir-78f97.firebaseapp.com",
  projectId: "fir-78f97",
  storageBucket: "fir-78f97.firebasestorage.app",
  messagingSenderId: "315472783806",
  appId: "1:315472783806:web:1b6d0ba68bac5bc38431ef",
};

// 2. Firebase 초기화
const app = initializeApp(firebaseConfig);

// 4. AI Logic 초기화 (v12 SDK 기준)
const ai = getAI(app, { backend: new GoogleAIBackend() });

export default function EmotionDiary() {
  const [diary, setDiary] = useState("");
  const [emotionResult, setEmotionResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);

  const MAX_DAILY = 3; // 하루 최대 호출 횟수

  // 5. 로컬Storage로 하루 횟수 유지
  useEffect(() => {
    const saved = localStorage.getItem("dailyCount");
    const today = localStorage.getItem("dailyCountDate");
    const now = new Date().toDateString();

    if (saved && today === now) {
      setCount(Number(saved));
    } else {
      localStorage.setItem("dailyCount", 0);
      localStorage.setItem("dailyCountDate", now);
      setCount(0);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("dailyCount", count);
  }, [count]);

  // 6. 감정 분석 함수
  const analyzeEmotion = async () => {
    if (!diary.trim()) return;
    if (loading) return;
    if (count >= MAX_DAILY) {
      alert("오늘 최대 분석 횟수에 도달했습니다.");
      return;
    }

    setLoading(true);
    setCount((prev) => prev + 1);

    try {
      const model = getGenerativeModel(ai, {
        model: "gemini-2.5-flash", // 최신 모델로 변경
        systemInstruction:
          "당신은 감정 분석 도우미입니다. 일기 내용을 분석하여 현재 감정을 요약하고, 긍정/부정, 주요 감정 종류를 간결하게 리포트해 주세요.",
      });

      const result = await model.generateContent(diary);
      const responseText = result.response.text();
      setEmotionResult(responseText);
    } catch (err) {
      console.error("감정 분석 실패:", err);
      setEmotionResult("감정 분석 중 오류가 발생했습니다.");
    } finally {
      setTimeout(() => setLoading(false), 5000);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
      <h2>감정 일기</h2>
      <textarea
        rows={10}
        cols={50}
        placeholder="오늘의 감정을 일기로 적어보세요..."
        value={diary}
        onChange={(e) => setDiary(e.target.value)}
        style={{ width: "100%", padding: 10 }}
      />
      <br />
      <button
        onClick={analyzeEmotion}
        disabled={loading || count >= MAX_DAILY}
        style={{ marginTop: 10, padding: "8px 16px" }}
      >
        {loading ? "분석 중..." : "감정 분석"}
      </button>

      <p>
        오늘 사용한 횟수: {count}/{MAX_DAILY}
      </p>
      {/* <button
        onClick={() => {
          localStorage.removeItem("dailyCount");
          localStorage.removeItem("dailyCountDate");
          setCount(0);
          alert("하루 카운트 초기화 완료");
        }}
      >
        하루 카운트 초기화
      </button> */}

      <h3>분석 결과:</h3>
      <pre
        style={{
          background: "#f0f0f0",
          padding: 10,
          minHeight: 50,
          whiteSpace: "pre-wrap",
        }}
      >
        {emotionResult}
      </pre>
    </div>
  );
}
