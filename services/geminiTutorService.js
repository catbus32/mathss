// 소크라테스식 수학 코칭 AI 에이전트 서비스 (Google Gemini API 초고속 연동 + 실시간 그래프 그림판 렌더링 엔진)

const SOCRATIC_SYSTEM_PROMPT = `당신은 학생이 스스로 수학 문제를 풀 수 있도록 돕는 '소크라테스식 수학 코칭 에이전트'입니다.
절대로 처음부터 끝까지 이어지는 정석 해설이나 최종 정답을 바로 알려주지 마세요!

[⚡ 초고속 즉각 코칭 원칙]
- 장황한 서론이나 불필요한 미사여구를 모두 생략하고, 첨부된 기준 해설지와 학생 질문을 보고 어떤 식으로 안내할지 바로 판단하여 2~3초 내에 핵심만 신속하게 코칭하세요!
- 학생이 현재 풀이의 몇 번째 단계에 와 있는지 대조하여, '다음 딱 한 걸음만 스스로 딛을 수 있는 핵심 힌트 1개'와 '직접 답해볼 수 있는 짧은 유도 질문 1개'만 명쾌하게 제시하세요.

[📊 다중 그래프 단일 좌표평면 동시 렌더링 절대 원칙 (필수)]
- 사용자가 그래프를 활용한 해설을 원하거나("그래프로 그려줘", "그림판으로 보여줘", "그래프로 보고 싶어" 등), 시각적 설명이 필요한 경우, 지체 없이 사용자가 원하는 설명에 대응하는 그래프를 즉시 도출하여 "graphData" 객체로 바로 그려주세요!
- 🚨 여러 그래프를 비교하거나 연관지어 설명해야 할 경우(예: 삼각함수 각변환·대칭이동, 원함수와 변환함수, 곡선과 접선, 두 함수의 교점, 평행이동 등), 절대로 1개의 그래프만 그리지 마세요!
- 🚨 반드시 하나의 좌표평면("functions" 배열) 안에 관련된 모든 그래프들(원함수, 변환함수, 접선, 보조선 등 2개 이상)을 한 번에 모두 함께 겹쳐서 그려주세요!
- 🚨 [평행이동·각변환으로 두 그래프가 포개어지는(일치하는) 경우]:
  평행이동이나 각변환으로 두 함수가 완전히 겹치거나 포개어지는 경우(예: y = cos(x)를 -π/2만큼 평행이동하면 y = cos(x + π/2) ≡ -sin(x) 로 완전히 포개어짐), 사용자가 시각적으로 두 그래프가 포개어졌다는 사실을 확연히 눈으로 볼 수 있도록 functions 배열에 기준 함수와 평행이동된 함수를 각각 명확한 label과 color로 모두 포함시켜주세요! 프론트엔드가 자동으로 두 곡선의 포개어짐을 감지하여 눈에 띄는 '교차 투톤 줄무늬(두 색상 교대)'와 '완전히 포개어짐 뱃지'로 시각화합니다.
- graphData 형식:
  - functions: 그릴 모든 함수 식 리스트 (각각 고유한 color와 dashed 스타일 지정! 순수 x 수식)
    예 (각변환 및 평행이동 일치):
    [
      { "expr": "Math.cos(x)", "label": "y = cos(x)", "color": "#4f46e5" },
      { "expr": "-Math.sin(x)", "label": "y = -sin(x) (각변환)", "color": "#dc2626", "dashed": true },
      { "expr": "Math.cos(x + Math.PI/2)", "label": "y = cos(x + π/2) (평행이동)", "color": "#059669", "dashed": true }
    ]
    예 (곡선과 접선):
    [
      { "expr": "x*x - x + 1", "label": "곡선 y = f(x)", "color": "#4f46e5" },
      { "expr": "4*x - 5", "label": "접선 y = 4x - 5", "color": "#dc2626", "dashed": true }
    ]
  - points: 강조할 중요 좌표점 리스트 (접점, 교점, 절편 등)
  - xRange: [최소x, 최대x] (모든 함수 곡선이 잘리지 않고 다 보이도록 충분한 범위 지정)
  - yRange: [최소y, 최대y]
  - description: 그래프들이 하나의 좌표평면에서 어떻게 포개어지고 비교되는지 핵심 설명

[🚨 수학적 연산 및 부호 검증 절대 무오류 원칙 (Zero Math Error - 절대 준수)]
- 당신은 정밀한 수학 코칭 AI입니다. 기초 사칙연산, 부호 처리, 분수 계산에서 절대로 어이없는 계산 실수나 오판을 저지르지 마세요!
- ⚠️ 부호 법칙(Sign Rules) 엄격 준수:
  1) 마이너스의 마이너스는 무조건 플러스입니다! -(-A) = +A
     (예: -(-3/5) = +3/5 = 0.6 입니다! 학생이 "-(-3/5) = 3/5" 또는 "-(-a) = a" 라고 바르게 전개했을 때, 절대로 "틀렸다"거나 "부호가 잘못되었다"고 오판하지 마세요!)
  2) -(A - B) = -A + B = B - A
  3) (-A) * (-B) = A * B,  (-A) / (-B) = A / B
  4) (-A) * B = -(A * B),  A / (-B) = -(A / B)
  5) 분수의 통분, 덧셈/뺄셈, 약분을 철저하게 수치로 검산하세요.
- ⚠️ 2중 자가 검산(Self-Verification Chain) 필수:
  - 학생의 풀이를 "맞다/틀리다" 판단하기 전에, 반드시 학생이 작성한 등식의 좌변과 우변의 실제 값을 직접 계산하여 일치하는지 확인하세요.
  - 제공된 [기준 정석 해설지]의 공식, 부호, 단계별 수치를 절대적 진실(Ground Truth)로 삼아 일치 여부를 대조하세요!

[🚨 PC/모바일 화면에서 누구나 즉시 알아볼 수 있는 직관적 수식 표기 지침 (절대 준수)]
- \\cos(\\frac{\\pi}{2}+\\theta) = -\\sin\\ 같은 백슬래시(\\)나 중괄호({})가 노출되는 난해한 raw LaTeX 코드를 절대로 작성하지 마세요!
- 사용자가 볼 때 깨지거나 읽기 어려운 기호 대신, PC와 스마트폰 화면에서 누구나 바로 알아볼 수 있는 직관적인 수학 기호(유니코드)를 사용하세요:
  - ⭕ 올바른 모바일/PC 친화적 표기:
    - cos(π/2 + θ) = -sin(θ)
    - f(x) = x² + 2x,  f(2) = 8
    - lim(x → 0) (x² + 2x)/x = 2
    - x = ±2,  √(3),  b = 0
  - ❌ 금지된 난해한 표기:
    - \\cos(\\frac{\\pi}{2}+\\theta) = -\\sin\\ (절대 금지: 백슬래시와 중괄호가 그대로 노출되어 가독성이 떨어짐)
- 분수는 (a)/(b) 형태로 괄호를 사용하여 명확히 나타내고, 삼각함수(sin, cos, tan), 그리스 문자(π, θ, α, β), 제곱(², ³), 화살표(→), 기호(√, ±, ·)를 직접 사용하여 친절하고 깔끔하게 설명하세요!

반드시 아래 JSON 스키마 형식으로만 응답하세요:
{
  "mathVerification": "학생 식의 부호 전개(-(-3/5)=+3/5 등)와 사칙연산이 맞는지 실제 값으로 먼저 계산해 본 내부 검증 한 줄 기록",
  "statusBadge": "상태 배지 텍스트 (예: '✅ 방향은 맞아요! (약분 단계 힌트)', '📊 그래프 시각화 코칭', '🔍 문제 조건 분석')",
  "diagnosisType": "STUCK_ON_RIGHT_TRACK | WRONG_DIRECTION | CONDITION_ANALYSIS | SOLVED | CONCEPT_EXPLANATION",
  "diagnosis": "학생의 현재 풀이 상태 진단 또는 문제 조건 분석 (1~2문장)",
  "guidance": "다음 단계로 나아가기 위한 핵심 코칭 가이드 (정답 스포일러 금지, 2~3문장)",
  "whyThisHint": "왜 이런 힌트/방향이 나왔는지 원리 설명",
  "relatedConcept": {
    "title": "관련 핵심 수학 개념 제목",
    "explanation": "직관적인 개념 설명"
  },
  "followUpPrompt": "학생이 바로 이어서 대답해 볼 수 있는 구체적인 한 줄 질문",
  "graphData": null 또는 {
    "title": "그래프 제목",
    "functions": [
      { "expr": "x*x + 2*x", "label": "f(x) = x² + 2x", "color": "#4f46e5" }
    ],
    "points": [
      { "x": 0, "y": 0, "label": "(0, 0)" }
    ],
    "xRange": [-4, 4],
    "yRange": [-6, 10],
    "description": "x가 0으로 갈 때 f(x)가 0으로 수렴함을 그래프로 확인할 수 있습니다."
  }
}`;

window.GeminiTutorService = {
  modelsCache: null,

  parseDataUrl(dataUrl) {
    if (!dataUrl || !dataUrl.startsWith("data:")) return null;
    const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) return null;
    return {
      mimeType: matches[1],
      data: matches[2]
    };
  },

  // [속도 최적화] 이미지 고속 리사이징 & 압축 (수 MB의 초고용량 사진을 100~150KB로 압축하여 Vision API 전송 속도 10배 단축)
  async compressImage(dataUrl, maxDimension = 1024, quality = 0.82) {
    if (!dataUrl || !dataUrl.startsWith("data:image/")) return dataUrl;
    
    // 이미 작은 이미지(150KB 이하)는 압축 생략
    if (dataUrl.length < 200000) return dataUrl;

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL("image/jpeg", quality);
        resolve(compressed);
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  },

  // [수학 연산 무오류 시스템] 학생이 작성한 등식/사칙연산/부호 전개를 시스템 레벨에서 사전 수치 검증
  verifyStudentMathNumerically(text) {
    if (!text) return null;
    const lines = text.split(/[\n,;]/);
    const verifiedEquations = [];

    for (const line of lines) {
      if (!line.includes("=")) continue;
      const parts = line.split("=");
      if (parts.length === 2) {
        const leftRaw = parts[0].trim();
        const rightRaw = parts[1].trim();

        try {
          const evalSide = (expr) => {
            let clean = expr
              .replace(/\^/g, "**")
              .replace(/π/g, "Math.PI")
              .replace(/√\(([^)]+)\)/g, "Math.sqrt($1)")
              .replace(/√(\d+)/g, "Math.sqrt($1)")
              .replace(/(\d)\s*([a-zA-Z\(])/g, "$1*$2");
            const fn = new Function(`"use strict"; return (${clean});`);
            const val = fn();
            return (typeof val === "number" && isFinite(val)) ? val : null;
          };

          const valL = evalSide(leftRaw);
          const valR = evalSide(rightRaw);
          if (valL !== null && valR !== null) {
            const isMatch = Math.abs(valL - valR) < 1e-9;
            verifiedEquations.push({
              equation: `${leftRaw} = ${rightRaw}`,
              isMatch,
              valL,
              valR
            });
          }
        } catch (e) {
          // x나 함수명이 포함된 대수식은 예외 무시
        }
      }
    }

    if (verifiedEquations.length > 0) {
      return verifiedEquations.map(eq => {
        if (eq.isMatch) {
          return `✓ [사전 수치 검증 완료] "${eq.equation}" 은 좌변(${eq.valL})과 우변(${eq.valR})이 수학적으로 100% 일치하는 참인 계산입니다. 부호나 사칙연산이 틀렸다고 오판하지 마세요!`;
        } else {
          return `! [사전 수치 검증 참고] "${eq.equation}" 은 좌변(${eq.valL})과 우변(${eq.valR})의 수치가 일치하지 않습니다. 계산 오차 여부를 확인하세요.`;
        }
      }).join("\n");
    }
    return null;
  },

  // 계정별 모델 목록 캐싱 및 조회 (Google AI Studio ListModels)
  async fetchAvailableModels(apiKey, forceRefresh = false) {
    if (!forceRefresh && this.modelsCache && this.modelsCache.length > 0) {
      return this.modelsCache;
    }

    const cleanKey = apiKey.trim();
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(cleanKey)}`;

    const response = await fetch(url);
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `모델 목록 조회 실패 (${response.status})`);
    }

    const data = await response.json();
    const allModels = data.models || [];

    const contentModels = allModels.filter(m => 
      m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")
    );

    // 고속 flash 모델 최우선 정렬 (2.5 -> 2.0 -> 1.5 -> pro)
    const sorted = contentModels.sort((a, b) => {
      const score = (name) => {
        const n = name.toLowerCase();
        if (n.includes("2.5-flash")) return 120;
        if (n.includes("2.0-flash")) return 110;
        if (n.includes("2.0-flash-exp")) return 105;
        if (n.includes("1.5-flash-latest")) return 100;
        if (n.includes("1.5-flash-002")) return 95;
        if (n.includes("1.5-flash-001")) return 90;
        if (n.includes("1.5-flash")) return 85;
        if (n.includes("1.5-flash-8b")) return 80;
        if (n.includes("1.5-pro-latest")) return 75;
        if (n.includes("1.5-pro")) return 70;
        if (n.includes("flash")) return 60;
        if (n.includes("pro")) return 50;
        return 10;
      };
      return score(b.name) - score(a.name);
    });

    this.modelsCache = sorted;
    return sorted;
  },

  async testApiKey(apiKey) {
    if (!apiKey || !apiKey.trim()) {
      return { success: false, error: "API 키를 입력해 주세요." };
    }
    const cleanKey = apiKey.trim();

    try {
      const availableModels = await this.fetchAvailableModels(cleanKey, true);
      let selectedModelName = null;
      let lastTestError = null;

      for (const m of availableModels.slice(0, 5)) {
        const modelEndpoint = m.name.startsWith("models/") ? m.name : `models/${m.name}`;
        const url = `https://generativelanguage.googleapis.com/v1beta/${modelEndpoint}:generateContent?key=${encodeURIComponent(cleanKey)}`;
        
        try {
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: "hi" }] }]
            })
          });

          if (res.ok) {
            selectedModelName = modelEndpoint;
            break;
          } else {
            const err = await res.json().catch(() => ({}));
            lastTestError = err?.error?.message;
          }
        } catch (e) {
          lastTestError = e.message;
        }
      }

      if (!selectedModelName) {
        return {
          success: false,
          error: lastTestError || "계정에서 사용 가능한 generateContent 모델 테스트에 실패했습니다."
        };
      }

      window.ACTIVE_GEMINI_MODEL = selectedModelName;
      localStorage.setItem("ACTIVE_GEMINI_MODEL", selectedModelName);

      const displayName = selectedModelName.replace("models/", "");
      return {
        success: true,
        activeModel: displayName,
        allModels: availableModels.map(m => m.name.replace("models/", ""))
      };
    } catch (err) {
      return {
        success: false,
        error: err.message
      };
    }
  },

  // 시도할 최적 모델 목록 반환
  async getModelsToTry(apiKey) {
    const list = [];
    const verified = window.ACTIVE_GEMINI_MODEL || localStorage.getItem("ACTIVE_GEMINI_MODEL");
    if (verified) list.push(verified.startsWith("models/") ? verified : `models/${verified}`);

    if (this.modelsCache && this.modelsCache.length > 0) {
      this.modelsCache.forEach(m => {
        const ep = m.name.startsWith("models/") ? m.name : `models/${m.name}`;
        if (!list.includes(ep)) list.push(ep);
      });
      return list;
    }

    const defaults = [
      "models/gemini-2.5-flash",
      "models/gemini-2.0-flash",
      "models/gemini-2.0-flash-exp",
      "models/gemini-1.5-flash-latest",
      "models/gemini-1.5-flash",
      "models/gemini-1.5-flash-002",
      "models/gemini-1.5-flash-001",
      "models/gemini-1.5-flash-8b",
      "models/gemini-1.5-pro-latest",
      "models/gemini-1.5-pro",
      "models/gemini-pro"
    ];
    defaults.forEach(d => {
      if (!list.includes(d)) list.push(d);
    });

    return list;
  },

  async callGeminiAPI({
    apiKey,
    problemText,
    problemImage,
    problemPdfText,
    solutionGuideText,
    solutionGuideImage,
    solutionGuidePdfText,
    studentText,
    studentImage,
    studentPdfText,
    chatHistory,
    mode,
    wantsGraph = false
  }) {
    const parts = [];

    let promptHeader = `[수학 문제]\n${problemText || "(첨부된 사진/자료 확인)"}\n`;
    if (problemPdfText) promptHeader += `[문제 PDF 추출]\n${problemPdfText}\n`;

    if (solutionGuideText && solutionGuideText.trim()) {
      promptHeader += `\n[🔒 기준 정석 해설지 (비밀 검증용 - 학생 노출 금지)]\n${solutionGuideText.trim()}\n`;
    }
    if (solutionGuidePdfText) promptHeader += `\n[해설지 PDF 추출]\n${solutionGuidePdfText}\n`;

    if (solutionGuideImage) {
      promptHeader += `\n[🚨 최우선 기준: 첨부된 해설지 사진]\n사용자가 첨부한 [기준 해설지 사진]의 문제 및 풀이 단계를 직접 판독하여 코칭 기준으로 삼으세요.\n`;
    }

    if (wantsGraph || /그래프|그려|그림판|좌표/.test(studentText || "")) {
      promptHeader += `\n[⚡ 초고속 다중 그래프 즉각 도출 모드]\n사용자가 그래프 시각화 설명을 요청했습니다!\n1. 생각하는 데 1초도 지체하지 말고, 사용자가 원하는 설명에 대응하는 핵심 그래프를 즉시 떠올려 단 2~3초 내로 바로 응답하세요!\n2. 🚨 다중 그래프 필수 원칙: 여러 그래프를 비교하거나 연관지어 설명해야 하는 경우(각변환, 평행이동, 대칭이동, 곡선과 접선, 두 함수의 교점 등), 절대로 1개만 그리지 말고 하나의 좌표평면(functions 배열)에 관련된 모든 그래프들(2개 이상)을 반드시 전부 함께 겹쳐서 그려주세요!\n3. 🚨 평행이동/각변환 포개어짐 처리: 평행이동해서 두 함수가 겹치는 경우, 두 함수를 모두 functions에 넣어주면 프론트엔드가 교차 투톤 대시 스트라이프와 포개어짐 뱃지로 두 그래프가 완전히 포개어졌음을 한눈에 보이도록 자동 렌더링합니다!\n4. 장황한 글 대신 핵심 코칭 2문장과 직관적인 다중 그래프 데이터로 신속히 답변하세요!\n`;
    }

    if (mode === "ANALYZE_PROBLEM_ONLY") {
      promptHeader += `\n[모드: 문제 조건 분석]\n학생이 풀이를 시작하기 전입니다. 기준 해설지를 보고 어떤 풀이 방향으로 첫 단추를 꿰어야 할지 3문장 이내로 핵심만 빠르게 짚어주세요.\n`;
    } else if (mode === "EXPLAIN_HINT_DEEPER") {
      promptHeader += `\n[모드: 힌트 쉬운 설명]\n직전 힌트를 더 쉬운 비유와 기초 개념으로 친절하게 설명해 주세요: "${studentText}"\n`;
    } else {
      promptHeader += `\n[모드: 풀이 진단 & 코칭]\n학생 풀이: "${studentText || "(첨부 이미지/필기 확인)"}"\n`;
      if (studentPdfText) promptHeader += `[학생 PDF]\n${studentPdfText}\n`;
      promptHeader += `기준 해설지와 대조하여 맞은 점과 막힌 지점을 짚고 다음 1단계만 질문하세요.\n`;
    }

    if (studentText) {
      const mathVerificationNote = this.verifyStudentMathNumerically(studentText);
      if (mathVerificationNote) {
        promptHeader += `\n[🔍 시스템 사전 수치 검증 정보]\n${mathVerificationNote}\n`;
      }
    }

    if (chatHistory && chatHistory.length > 0) {
      const recentHistory = chatHistory.slice(-4).map(m => {
        if (m.role === "student") return `학생: ${m.text || "(풀이 제출)"}`;
        return `튜터: ${m.tutorData ? (m.tutorData.diagnosis + " " + m.tutorData.guidance) : m.text}`;
      }).join("\n");
      promptHeader += `\n[최근 대화]\n${recentHistory}\n`;
    }

    parts.push({ text: promptHeader });

    // [속도 최적화] 이미지 고속 압축 후 전송 (업로드 시간 단축)
    if (problemImage) {
      const compressed = await this.compressImage(problemImage);
      const parsedProb = this.parseDataUrl(compressed);
      if (parsedProb) {
        parts.push({ text: "[문제 사진]" });
        parts.push({ inlineData: parsedProb });
      }
    }

    if (solutionGuideImage) {
      const compressedGuide = await this.compressImage(solutionGuideImage);
      const parsedGuide = this.parseDataUrl(compressedGuide);
      if (parsedGuide) {
        parts.push({ text: "[🔒 기준 해설지 사진 (비밀 참조)]" });
        parts.push({ inlineData: parsedGuide });
      }
    }

    if (studentImage) {
      const compressedSol = await this.compressImage(studentImage);
      const parsedSol = this.parseDataUrl(compressedSol);
      if (parsedSol) {
        parts.push({ text: "[학생 풀이 사진/필기]" });
        parts.push({ inlineData: parsedSol });
      }
    }

    // 1차 시도: 캐시 또는 기본 후보군으로 고속 호출
    let modelsToTry = await this.getModelsToTry(apiKey);
    let lastError = null;

    const requestPayload = {
      systemInstruction: {
        parts: [{ text: SOCRATIC_SYSTEM_PROMPT }]
      },
      contents: [{ role: "user", parts }],
      generationConfig: {
        temperature: 0.0, // 연산 환각 방지 및 결정론적 무오류 계산 (Zero Math Error)
        maxOutputTokens: wantsGraph ? 600 : 750, // 불필요한 장황한 생성 방지 및 빠른 속도
        responseMimeType: "application/json"
      }
    };

    const tryCallModel = async (modelEndpoint) => {
      const url = `https://generativelanguage.googleapis.com/v1beta/${modelEndpoint}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload)
      });

      if (response.ok) {
        window.ACTIVE_GEMINI_MODEL = modelEndpoint;
        localStorage.setItem("ACTIVE_GEMINI_MODEL", modelEndpoint);
        const result = await response.json();
        const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          return JSON.parse(rawText);
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `상태 코드 ${response.status}`);
      }
    };

    for (const modelEndpoint of modelsToTry) {
      try {
        const parsed = await tryCallModel(modelEndpoint);
        if (parsed) return parsed;
      } catch (err) {
        lastError = err.message;
      }
    }

    // [핵심] 기본 후보군이 모두 실패(not found 등)한 경우: 실제 계정의 ListModels를 조회하여 실시간 자동 연결
    if (lastError && /not found|not supported|ListModels/i.test(lastError)) {
      try {
        const liveModels = await this.fetchAvailableModels(apiKey, true);
        for (const m of liveModels) {
          const ep = m.name.startsWith("models/") ? m.name : `models/${m.name}`;
          if (modelsToTry.includes(ep)) continue;
          try {
            const parsed = await tryCallModel(ep);
            if (parsed) return parsed;
          } catch (e) {
            lastError = e.message;
          }
        }
      } catch (listErr) {
        lastError = listErr.message;
      }
    }

    throw new Error(lastError || "Gemini 모델 응답에 실패했습니다.");
  },

  async generateSimilarProblemWithGemini({ apiKey, problemText, problemImage, solutionGuideText, difficultyLevel }) {
    let prompt = `다음 수학 문제를 학생이 진짜 스스로 이해했는지 확인하기 위한 '이해도 점검용 쌍둥이 유사 문제'를 1문제 신속하게 출제해 주세요.
핵심 개념 구조와 풀이 원리는 원본 문제와 동일하되, 숫자, 계수, 다항식 형태를 자연스럽게 변형하세요.
PC와 모바일 화면에서 누구나 즉시 알아볼 수 있는 직관적인 기호(cos, sin, π, θ, x², √, ± 등)를 사용하세요. (난해한 raw LaTeX 백슬래시 사용 금지)
난이도: ${difficultyLevel || "기본 쌍둥이 변형"}

[원본 문제]
${problemText || "(첨부된 사진/자료 참조)"}\n`;

    if (solutionGuideText) prompt += `[기준 해설지]\n${solutionGuideText}\n`;

    prompt += `\nJSON 형식으로만 신속히 응답하세요:
{
  "level": "이해도 점검 쌍둥이 문제 (예: '계수 변형 쌍둥이 확인 문제')",
  "problemText": "변형된 수학 문제 본문",
  "keyPoint": "방금 푼 문제에서 어떤 원리를 그대로 적용해야 하는지 1문장 요약",
  "hintStep1": "스스로 첫 단추를 풀기 위한 1단계 힌트",
  "solutionGuide": "[정답 및 핵심 풀이 단계 요약] (예: '[정답: 12] 1. f(0)=0 도출 2. x 약분 후 a=3 대입...')"
}`;

    const parts = [{ text: prompt }];

    if (problemImage) {
      const compressed = await this.compressImage(problemImage);
      const parsedProb = this.parseDataUrl(compressed);
      if (parsedProb) parts.push({ inlineData: parsedProb });
    }

    const modelsToTry = await this.getModelsToTry(apiKey);
    let lastError = null;

    for (const modelEndpoint of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/${modelEndpoint}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts }],
            generationConfig: {
              temperature: 0.5,
              maxOutputTokens: 600,
              responseMimeType: "application/json"
            }
          })
        });

        if (response.ok) {
          window.ACTIVE_GEMINI_MODEL = modelEndpoint;
          localStorage.setItem("ACTIVE_GEMINI_MODEL", modelEndpoint);
          const result = await response.json();
          const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
          return JSON.parse(rawText);
        } else {
          const errData = await response.json().catch(() => ({}));
          lastError = errData?.error?.message;
        }
      } catch (err) {
        lastError = err.message;
      }
    }

    throw new Error(lastError || "유사 문제 생성 실패");
  },

  simulateSocraticCoaching({ currentProblem, problemText, solutionGuideText, solutionGuideImage, studentText, studentImage, inputSource, mode, wantsGraph = false }) {
    const cleanInput = (studentText || "").trim();
    const isGraphRequested = wantsGraph || /그래프|그려|그림판|좌표/.test(cleanInput);

    // [그래프 시각화 요청 시] 데모 모드에서도 즉시 멋진 그래프 데이터 제공
    if (isGraphRequested) {
      // 1. 삼각함수 및 각변환 관련 질문 시: 단 하나의 좌표평면에 3개 곡선 동시 렌더링
      if (/cos|sin|tan|삼각|각변환/.test(cleanInput) || /cos|sin|tan|삼각|각변환/.test(problemText || "")) {
        return {
          statusBadge: "📊 삼각함수 다중 그래프 단일 좌표평면 동시 비교",
          diagnosisType: "CONCEPT_EXPLANATION",
          diagnosis: "삼각함수의 각변환 원리를 한눈에 비교하실 수 있도록 **하나의 좌표평면에 y = cos(x)와 y = -sin(x) [= cos(x + π/2)] 그래프를 동시에 그렸습니다!**",
          guidance: "파란색 곡선 cos(x)를 x축 방향으로 -π/2만큼 평행이동하면 빨간색 점선 -sin(x)와 정확하게 일치하여 포개어집니다!\n\n따라서 cos(π/2 + x) = -sin(x)가 성립함을 하나의 좌표평면 위에서 두 곡선이 겹치는 모습을 통해 즉시 확인하실 수 있습니다.",
          whyThisHint: "그래프를 따로 그리면 위상차(π/2)와 부호 반전(-sin)을 비교하기 어렵지만, 하나의 좌표평면에 겹쳐 그리면 평행이동과 대칭 관계가 한눈에 직관적으로 증명되기 때문입니다.",
          relatedConcept: {
            title: "삼각함수의 각변환과 평행이동의 기하학적 관계",
            explanation: "cos(π/2 + θ)는 cos 그래프를 왼쪽으로 π/2만큼 평행이동한 것으로, sin 그래프의 상하를 반전시킨 -sin(θ)와 완벽히 포개어집니다."
          },
          followUpPrompt: "하나의 좌표평면에서 파란색과 빨간색 곡선이 어떻게 평행이동되어 일치하는지 보이시나요? 아래 [필기 노트로 가져오기]를 눌러 직접 보조선을 그어보세요!",
          graphData: {
            title: "단일 좌표평면에서 비교하는 y = cos(x) 와 y = -sin(x)",
            functions: [
              { expr: "Math.cos(x)", label: "y = cos(x)", color: "#4f46e5" },
              { expr: "-Math.sin(x)", label: "y = -sin(x) [변환결과]", color: "#dc2626", dashed: true },
              { expr: "Math.cos(x + Math.PI/2)", label: "y = cos(x + π/2)", color: "#059669", dashed: true }
            ],
            points: [
              { x: 0, y: 1, label: "(0, 1) cos(0)" },
              { x: 0, y: 0, label: "(0, 0) -sin(0)" },
              { x: 1.57, y: -1, label: "(π/2, -1)" },
              { x: 3.14, y: -1, label: "(π, -1) cos(π)" }
            ],
            xRange: [-4, 5],
            yRange: [-2, 2],
            description: "파란색 y = cos(x) 그래프를 왼쪽으로 π/2만큼 평행이동하면 빨간색/초록색 점선 y = -sin(x)와 정확하게 일치함을 하나의 평면에서 확인할 수 있습니다."
          }
        };
      }

      if (currentProblem && currentProblem.id === "deriv-02") {
        return {
          statusBadge: "📊 그림판 그래프 시각화 코칭",
          diagnosisType: "CONCEPT_EXPLANATION",
          diagnosis: "점 $(2, 3)$에서의 접선의 기울기를 기하학적으로 이해할 수 있도록 **그림판에 그래프를 직접 그렸습니다!**",
          guidance: "곡선 $y=f(x)$ 위의 점 $(2, 3)$에서 그은 접선(빨간 점선)의 방정식이 $y = 4x - 5$임을 확인해 보세요!\n\n평균변화율 $\\frac{f(x)-3}{x-2}$에서 $x$가 $2$로 한없이 가까워질 때, 할선이 바로 이 접선으로 수렴하는 기하학적 의미를 볼 수 있습니다.",
          whyThisHint: "미분계수 f'(2)=4는 곡선 위의 점 (2,3)에서 그은 접선의 기울기와 정확히 일치하기 때문입니다.",
          relatedConcept: {
            title: "미분계수의 기하학적 의미 (접선의 기울기)",
            explanation: "lim_{x->a} [f(x)-f(a)]/(x-a)는 곡선 위의 두 점을 이은 할선의 기울기의 극한이며, 기하학적으로 점 (a, f(a))에서의 접선의 기울기입니다."
          },
          followUpPrompt: "그래프에서 접선의 기울기가 4로 가파르게 올라가는 모습이 보이시나요? 접선의 y절편은 얼마인가요?",
          graphData: {
            title: "곡선과 x=2에서의 접선 y = 4x - 5",
            functions: [
              { expr: "x*x - x + 1", label: "곡선 y = f(x)", color: "#4f46e5" },
              { expr: "4*x - 5", label: "접선 y = 4x - 5", color: "#dc2626", dashed: true }
            ],
            points: [
              { x: 2, y: 3, label: "접점 (2, 3)" },
              { x: 1.25, y: 0, label: "x절편 (1.25, 0)" }
            ],
            xRange: [-1, 4],
            yRange: [-3, 9],
            description: "파란색 곡선 위의 점 (2, 3)에서 빨간색 점선 접선이 정확히 접하는 모습을 확인하세요!"
          }
        };
      }

      // 기본 limit-01 문제 또는 일반 문제의 그래프
      return {
        statusBadge: "📊 그림판 그래프 시각화 코칭",
        diagnosisType: "CONCEPT_EXPLANATION",
        diagnosis: "조건 (나)에서 $x \\to 0$일 때 $f(x)$가 어디로 향하는지 이해를 돕기 위해 **그림판에 $f(x) = x^2 + 2x$ 그래프를 직접 그렸습니다!**",
        guidance: "그래프를 보시면 곡선이 원점 $(0, 0)$을 정확히 지나고 있죠? 그렇기 때문에 $f(0) = 0$이 되고 상수항 $b=0$이 됩니다.\n\n또한 원점 근처($x \\to 0$)에서 곡선의 접선 기울기(일차항 계수)가 $2$가 되어 $\\lim_{x \\to 0} \\frac{f(x)}{x} = 2$가 성립하는 모습을 직관적으로 볼 수 있습니다!",
        whyThisHint: "식으로만 보면 추상적인 극한을 좌표평면의 그래프로 시각화하면 '왜 분모가 0으로 갈 때 분자도 0으로 가야 하는지(원점을 지나야 하는지)' 바로 납득되기 때문입니다.",
        relatedConcept: {
          title: "다항함수 그래프와 극한의 시각적 수렴",
          explanation: "연속함수 f(x)에서 x가 0으로 갈 때의 극한값은 그래프 상에서 곡선을 따라 x=0 지점으로 이동했을 때의 y값(함숫값 f(0))과 같습니다."
        },
        followUpPrompt: "그래프에서 곡선이 원점 (0,0)을 지나는 모습이 확인되시나요? 아래 '필기 노트로 가져오기'를 눌러 직접 필기해 보세요!",
        graphData: {
          title: "이차함수 f(x) = x² + 2x 의 그래프 개형",
          functions: [
            { expr: "x*x + 2*x", label: "f(x) = x² + 2x", color: "#4f46e5" },
            { expr: "2*x", label: "원점에서의 접선 y = 2x", color: "#059669", dashed: true }
          ],
          points: [
            { x: 0, y: 0, label: "원점 f(0)=0" },
            { x: -2, y: 0, label: "(-2, 0)" },
            { x: -1, y: -1, label: "꼭짓점 (-1, -1)" },
            { x: 2, y: 8, label: "f(2) = 8" }
          ],
          xRange: [-4, 3],
          yRange: [-2, 9],
          description: "x가 0으로 다가갈 때 곡선이 (0,0)으로 수렴하며, x=2일 때 f(2)=8이 됨을 시각적으로 확인할 수 있습니다."
        }
      };
    }

    // 커스텀 문제 또는 해설지 사진 등록 상태
    if (solutionGuideImage || !currentProblem) {
      if (solutionGuideImage) {
        return {
          statusBadge: "📷 해설지 사진 등록 완료 (Gemini API 필요)",
          diagnosisType: "CONDITION_ANALYSIS",
          diagnosis: `첨부해주신 **기준 해설지 사진**이 등록되었습니다! 직접 올리신 해설지 사진의 글씨와 수식을 실시간으로 읽고 정확하게 학생을 코칭하려면 **Gemini 멀티모달 비전 AI 모델 연동**이 필요합니다.`,
          guidance: `현재는 무료 API 키가 연결되지 않은 **'예시 문제 시뮬레이션 데모 모드'** 상태입니다.\n\n우측 상단의 **[🔑 API 키 등록하기]** 버튼을 눌러 Google AI Studio의 무료 API 키를 등록해 보세요!\n\nAPI 키를 등록하시면 Gemini가 첨부하신 해설지 사진의 풀이 단계를 완벽히 판독하여, 1~2초 내에 실시간 1:1 맞춤 코칭을 제공합니다.`,
          whyThisHint: "해설지 사진 속 복잡한 수학 수식과 풀이 단계는 실제 멀티모달 Vision AI가 직접 인식해야 정확한 코칭이 가능하기 때문입니다.",
          relatedConcept: {
            title: "초고속 멀티모달 시각 인식 코칭",
            explanation: "Gemini 2.5 Flash는 사용자가 올린 해설지 사진 속 손글씨와 그래프를 정밀하게 읽어내어 학생에게 최적의 힌트를 도출합니다."
          },
          followUpPrompt: "우측 상단 [🔑 API 키 등록하기]를 눌러 무료 키를 등록해 보세요!"
        };
      }

      if (mode === "ANALYZE_PROBLEM_ONLY") {
        return {
          statusBadge: "🔍 직접 등록한 문제 조건 분석",
          diagnosisType: "CONDITION_ANALYSIS",
          diagnosis: `직접 등록하신 수학 문제의 첫 풀이 방향을 안내합니다.`,
          guidance: `1. **문제의 목표 파악**: 최종적으로 구해야 하는 값이나 식을 확인하세요.\n2. **주어진 조건 나열**: 조건에서 필요한 기본 성질을 하나씩 정리해 볼까요?\n3. **첫 단추 세우기**: 조건을 대수식으로 옮겨 적고 첫 번째 식을 세워보세요!`,
          whyThisHint: "조건을 낱낱이 쪼개어 각각이 의미하는 성질을 파악하는 것이 출발점입니다.",
          relatedConcept: {
            title: "Polya의 문제 해결 4단계",
            explanation: "1) 이해 → 2) 계획 → 3) 실행 → 4) 검토"
          },
          followUpPrompt: "문제의 조건에서 가장 먼저 세울 수 있는 첫 번째 식이나 아이디어를 적어보세요!"
        };
      }

      return {
        statusBadge: "💬 맞춤 코칭 (Gemini API 키 연결 권장)",
        diagnosisType: "STUCK_ON_RIGHT_TRACK",
        diagnosis: cleanInput ? `작성해주신 풀이("${cleanInput}")를 확인했습니다.` : "제출하신 풀이 자료를 확인했습니다.",
        guidance: `직접 등록하신 문제에 대해 정확하고 심층적인 1:1 맞춤 첨삭을 받으시려면 **Google Gemini API 키**를 등록해 주세요.\n\n현재 데모 모드에서는 기본 문제 해결 가이드를 제공합니다:\n- 문제에 제시된 모든 등식이나 조건이 식에 온전히 반영되었는지 점검해 보세요.`,
        whyThisHint: "자유 형식의 커스텀 문제와 손글씨 풀이를 실시간으로 정밀 채점하기 위해서는 실제 LLM 추론 엔진이 필요하기 때문입니다.",
        relatedConcept: {
          title: "풀이 단계별 점검",
          explanation: "문제가 막힐 때는 누락된 조건이 없는지 확인하는 것이 효과적입니다."
        },
        followUpPrompt: "어느 단계에서 가장 막히셨는지 적어주시거나, 우측 상단에서 무료 API 키를 등록해 보세요!"
      };
    }

    if (mode === "ANALYZE_PROBLEM_ONLY") {
      if (currentProblem && currentProblem.conditionAnalysis) {
        const ca = currentProblem.conditionAnalysis;
        const cluesText = ca.clues.map((c, idx) => `**[${idx + 1}] ${c.condition}**\n- ${c.insight}`).join("\n\n");
        const firstClue = ca.clues[1] || ca.clues[0];
        return {
          statusBadge: "🔍 문제 조건 분석 & 첫 단추 도출",
          diagnosisType: "CONDITION_ANALYSIS",
          diagnosis: ca.summary,
          guidance: `${cluesText}\n\n---\n💡 **첫 번째 생각할 질문:**\n${ca.firstStepQuestion}`,
          whyThisHint: firstClue.whyItMatters,
          relatedConcept: {
            title: firstClue.conceptTitle,
            explanation: firstClue.conceptBody
          },
          followUpPrompt: ca.firstStepQuestion
        };
      }
    }

    if (currentProblem && currentProblem.sampleStudentAttempts) {
      const matchedSample = currentProblem.sampleStudentAttempts.find(s => s.text === cleanInput);
      if (matchedSample) {
        return {
          ...matchedSample.tutorResponse,
          diagnosisType: matchedSample.diagnosisType
        };
      }
    }

    if (studentImage && !cleanInput) {
      let sourceLabel = "업로드하신 풀이 자료";
      if (inputSource === "canvas") sourceLabel = "직접 작성하신 손글씨 필기 캔버스";
      else if (inputSource === "pdf") sourceLabel = "업로드하신 풀이 PDF 문서";
      else if (inputSource === "image") sourceLabel = "업로드하신 풀이 사진";

      return {
        statusBadge: `✏️ ${sourceLabel} 분석 완료 (기준 해설지 대조)`,
        diagnosisType: "STUCK_ON_RIGHT_TRACK",
        diagnosis: `기준 해설지와 대조해 보았습니다. 문제의 조건을 수식으로 옮겨 적어 내려간 초반 접근은 좋습니다.`,
        guidance: `식 정리 중간 단계에서 멈추셨네요.\n현재 문제에서는:\n- 분모가 $0$이 되는 인수를 분자에서도 찾아 **약분**했는지 확인해 보세요!\n- 약분 후 극한값을 대입하면 미정계수가 바로 나옵니다.`,
        whyThisHint: "0/0 꼴을 약분하여 부정형을 해소한 뒤 극한값을 대입하는 정석 단계입니다.",
        relatedConcept: {
          title: "다항함수 극한 풀이 3단계",
          explanation: "1) 최고차항 차수 결정 → 2) 0인자 확인 → 3) 약분 후 대입"
        },
        followUpPrompt: "제출하신 풀이 중 몇 번째 줄에서 가장 막히셨나요? 말씀해 주시거나 한 줄 더 이어서 써보세요!"
      };
    }

    const lower = cleanInput.toLowerCase();

    if (/모르겠|이해가 안|왜|어려워|무슨 말|개념/.test(lower)) {
      return {
        statusBadge: "📘 눈높이 개념 브릿징 & 힌트 원리 설명",
        diagnosisType: "CONCEPT_EXPLANATION",
        diagnosis: "충분히 헷갈릴 수 있는 부분이에요! 왜 방금 같은 힌트가 나왔는지 쉬운 숫자로 설명해 드릴게요.",
        guidance: `분수 $\\frac{\\text{분자}}{\\text{분모}}$에서 분모가 $0$에 가까워질 때, 분자가 가만히 있으면 값이 무한히 커집니다(발산).\n\n그런데 극한값이 숫자로 수렴했으므로, 분모가 $0$으로 갈 때 **분자도 똑같이 $0$으로 가야** 약분되어 수렴할 수 있습니다!`,
        whyThisHint: "원리를 이해하면 어떤 변형 문제도 풀 수 있기 때문입니다.",
        relatedConcept: {
          title: "0/0 부정형 극한의 수렴 원리",
          explanation: "분모 → 0일 때 수렴하려면 반드시 분자 → 0 이어야 합니다."
        },
        followUpPrompt: "이제 왜 분자가 0으로 가야 하는지 이해가 되셨나요? 식에 대입하면 미지수가 어떻게 되나요?"
      };
    }

    if (/f\(0\)\s*=\s*0|b\s*=\s*0|0으로|0이|2차식/.test(lower) && !/8|4x\s*-\s*5/.test(lower)) {
      return {
        statusBadge: "👏 기준 해설지와 일치합니다! (다음 단계로 이동)",
        diagnosisType: "STUCK_ON_RIGHT_TRACK",
        diagnosis: `맞습니다! 분모가 $0$으로 가므로 분자도 $0$이 되어 $f(0)=0 \\Rightarrow b=0$이 됩니다.`,
        guidance: `따라서 $f(x) = x^2 + ax = x(x + a)$가 됩니다.\n\n이제 이 식을 조건 (나)에 넣고 분모·분자의 $x$를 약분하면 **$a$의 값**은 얼마인가요?`,
        whyThisHint: "b=0을 구했으므로 공통인수 x를 약분하는 다음 단계입니다.",
        relatedConcept: {
          title: "상수항이 없는 식의 인수분해",
          explanation: "f(0)=0인 다항식은 항상 x로 묶어 인수분해됩니다."
        },
        followUpPrompt: "약분 후 x=0을 대입하면 a는 얼마가 나오나요?"
      };
    }

    if (/\b8\b|f\(2\)\s*=\s*8|4x\s*-\s*5/.test(lower)) {
      return {
        statusBadge: "🎉 기준 정답 일치! 스스로 정답에 도달했습니다!",
        diagnosisType: "SOLVED",
        diagnosis: `정답입니다! 👏 기준 정석 해설지의 최종 정답과 완벽하게 일치합니다! 해설지를 보지 않고 스스로 조건을 하나씩 풀어서 정답을 이끌어내셨어요!`,
        guidance: `**오늘 스스로 풀어낸 핵심 논리:**\n1. 최고차항 차수와 계수 결정\n2. 분모 → 0 이면 분자 → 0 성질로 인수 확인\n3. 공통인수 약분 후 대입하여 식 완성\n\n상단의 **[🔄 유사 문제 생성]** 버튼을 눌러 쌍둥이 문제도 풀어볼까요?`,
        whyThisHint: "정답 도출 후 핵심 호흡을 정리하면 개념이 완전히 정착됩니다.",
        relatedConcept: {
          title: "소크라테스 학습 성공",
          explanation: "스스로 힌트를 소화하여 도달한 풀이는 오래 기억에 남습니다."
        },
        followUpPrompt: "하단의 '유사 문제 생성' 버튼을 눌러 쌍둥이 문제에 도전해 보세요!"
      };
    }

    return {
      statusBadge: "💬 기준 해설지 대조 코칭",
      diagnosisType: "STUCK_ON_RIGHT_TRACK",
      diagnosis: `작성해주신 풀이("${cleanInput}")를 기준 해설지와 비교해 보았습니다. 좋은 시도입니다!`,
      guidance: `한 걸음 더 나아가기 위해 분모가 $0$이 될 때 분자도 $0$이 되어야 한다는 성질을 적용했는지 확인해 보세요. 그 성질을 이용해 식을 인수분해해 보시겠어요?`,
      whyThisHint: "기준 해설지의 가장 핵심적인 분기점이기 때문입니다.",
      relatedConcept: {
        title: "극한 풀이 체크포인트",
        explanation: "1) 분모 → 0 이면 분자 → 0\n2) 0인자 약분하기"
      },
      followUpPrompt: "식을 인수분해하면 어떻게 되는지 적어보시겠어요?"
    };
  }
};
