// 스마트 수학 손글씨 연습장 (직접 풀이 쓰기 캔버스 컴포넌트)
const { useState, useRef, useEffect } = React;

window.DrawingCanvas = function DrawingCanvas({ onSubmitCanvasImage, isLoading }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState("pen"); // "pen" | "highlighter" | "eraser"
  const [color, setColor] = useState("#0f172a");
  const [lineWidth, setLineWidth] = useState(3);
  const [history, setHistory] = useState([]);
  const [hasStrokes, setHasStrokes] = useState(false);
  const [noteComment, setNoteComment] = useState("");

  // 캔버스 초기화 및 흰색+모눈 배경 세팅
  const initCanvasBackground = (ctx, width, height) => {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    // 은은한 모눈종이 가이드라인 그리기 (AI 이미지 인식에도 방해되지 않으면서 필기하기 편함)
    ctx.strokeStyle = "#f1f5f9";
    ctx.lineWidth = 1;
    const step = 28;
    for (let x = 0; x < width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    initCanvasBackground(ctx, canvas.width, canvas.height);
    saveSnapshot();
  }, []);

  const saveSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setHistory(prev => [...prev.slice(-19), canvas.toDataURL("image/png")]);
  };

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if (e.touches && e.touches.length > 0) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { x, y } = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (tool === "eraser") {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 22;
    } else if (tool === "highlighter") {
      ctx.globalCompositeOperation = "multiply";
      ctx.strokeStyle = "rgba(253, 224, 71, 0.45)";
      ctx.lineWidth = 16;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
    }

    setIsDrawing(true);
    setHasStrokes(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.closePath();
    ctx.globalCompositeOperation = "source-over";
    setIsDrawing(false);
    saveSnapshot();
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const newHistory = history.slice(0, -1);
    const prevDataUrl = newHistory[newHistory.length - 1];
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = prevDataUrl;
    setHistory(newHistory);
    if (newHistory.length === 1) setHasStrokes(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    initCanvasBackground(ctx, canvas.width, canvas.height);
    saveSnapshot();
    setHasStrokes(false);
  };

  // 빠른 예시 손글씨 수식 자동 그리기 (마우스로 쓰기 번거로울 때 원클릭 테스트용)
  const drawSampleHandwriting = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    initCanvasBackground(ctx, canvas.width, canvas.height);

    ctx.font = "italic 22px 'Pretendard', serif";
    ctx.fillStyle = "#1e293b";
    ctx.fillText("(1) 조건 (가)에서  f(x) = x² + ax + b", 36, 56);
    ctx.fillText("(2) 조건 (나)  lim (x² + ax + b) / x = 2", 36, 108);
    ctx.font = "16px 'Pretendard', sans-serif";
    ctx.fillText("x → 0", 136, 128);

    ctx.font = "italic 22px 'Pretendard', serif";
    ctx.fillStyle = "#2563eb";
    ctx.fillText("분모가 0으로 가므로 f(0) = b = 0", 36, 175);

    ctx.fillStyle = "#dc2626";
    ctx.fillText("그 다음 lim (x² + ax) / x = 2 에서 막혔어요!", 36, 228);

    setHasStrokes(true);
    saveSnapshot();
  };

  const handleSendCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    onSubmitCanvasImage(dataUrl, noteComment);
    setNoteComment("");
  };

  const colors = [
    { code: "#0f172a", name: "검정" },
    { code: "#2563eb", name: "파랑" },
    { code: "#dc2626", name: "빨강 (막힌 곳 표시)" },
    { code: "#059669", name: "초록" }
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* 캔버스 툴바 */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-100 p-2.5 rounded-xl border border-slate-200">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setTool("pen")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              tool === "pen" ? "bg-indigo-600 text-white shadow-sm" : "bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            ✏️ 펜
          </button>
          <button
            type="button"
            onClick={() => setTool("highlighter")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              tool === "highlighter" ? "bg-amber-400 text-slate-900 shadow-sm" : "bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            🖍️ 형광펜
          </button>
          <button
            type="button"
            onClick={() => setTool("eraser")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              tool === "eraser" ? "bg-slate-800 text-white shadow-sm" : "bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            🧹 지우개
          </button>

          <div className="h-4 w-px bg-slate-300 mx-1" />

          {/* 색상 선택 */}
          <div className="flex items-center gap-1.5">
            {colors.map((c) => (
              <button
                key={c.code}
                type="button"
                title={c.name}
                onClick={() => {
                  setTool("pen");
                  setColor(c.code);
                }}
                className={`w-6 h-6 rounded-full border-2 transition transform ${
                  color === c.code && tool === "pen" ? "scale-110 border-indigo-600 ring-2 ring-indigo-200" : "border-white"
                }`}
                style={{ backgroundColor: c.code }}
              />
            ))}
          </div>
        </div>

        {/* 우측 액션 버튼 */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={drawSampleHandwriting}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition"
          >
            ✨ 예시 손글씨 자동 채우기
          </button>
          <button
            type="button"
            onClick={handleUndo}
            disabled={history.length <= 1}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 disabled:opacity-40"
          >
            ↩ 실행 취소
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white text-rose-600 hover:bg-rose-50 border border-slate-200"
          >
            🗑️ 전체 지우기
          </button>
        </div>
      </div>

      {/* 필기 캔버스 영역 */}
      <div className="relative rounded-xl overflow-hidden border-2 border-indigo-200 shadow-inner bg-white">
        <canvas
          ref={canvasRef}
          width={680}
          height={290}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-[260px] cursor-crosshair touch-none block"
        />
        {!hasStrokes && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-1">
            <span className="text-sm font-medium">마우스나 태블릿 펜으로 여기에 직접 풀이 과정을 써보세요!</span>
            <span className="text-xs">풀다가 막힌 부분에 빨간 펜으로 물음표(?)를 그리거나 상단의 [예시 손글씨 자동 채우기]를 눌러보세요</span>
          </div>
        )}
      </div>

      {/* 코멘트 추가 및 전송 바 */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={noteComment}
          onChange={(e) => setNoteComment(e.target.value)}
          placeholder="(선택) 예: 2번째 줄에서 x를 어떻게 약분하는지 모르겠어요"
          className="flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="button"
          onClick={handleSendCanvas}
          disabled={isLoading || (!hasStrokes && !noteComment.trim())}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold text-sm shadow-sm transition flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <span>📤 내 필기 보여주고 코칭받기</span>
        </button>
      </div>
    </div>
  );
};
