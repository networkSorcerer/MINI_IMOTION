// src/EmotionDiary.jsx
import { useState, useEffect } from "react";
import Sentiment from "sentiment";

const sentiment = new Sentiment();

export default function Emotion() {
  const [diary, setDiary] = useState("");
  const [emotionResult, setEmotionResult] = useState("");
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const MAX_DAILY = 3;

  // 하루 사용 횟수 로컬스토리지 유지
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

  const analyzeEmotion = () => {
    if (!diary.trim()) return;
    if (count >= MAX_DAILY) {
      alert("오늘 최대 분석 횟수에 도달했습니다.");
      return;
    }

    setLoading(true);
    setCount((prev) => prev + 1);

    const result = sentiment.analyze(diary);
    const summary = `
점수: ${result.score}
긍정 단어: ${result.positive.join(", ") || "없음"}
부정 단어: ${result.negative.join(", ") || "없음"}
총 단어 수: ${result.words.length}
`;
    setEmotionResult(summary);
    setTimeout(() => setLoading(false), 500); // 간단한 로딩
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

      <button
        onClick={() => {
          localStorage.removeItem("dailyCount");
          localStorage.removeItem("dailyCountDate");
          setCount(0);
          alert("하루 카운트 초기화 완료");
        }}
      >
        하루 카운트 초기화
      </button>

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
