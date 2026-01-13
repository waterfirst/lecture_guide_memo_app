// Gemini API Client for Browser - 최적화 버전
import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiClient {
    constructor() {
        this.genAI = null;
        this.activeModelName = null; // 동적으로 결정될 모델명
    }

    // 사용 가능한 최적의 모델을 찾아 설정합니다.
    async _determineBestModel(genAI) {
        if (this.activeModelName) return this.activeModelName;

        try {
            // 프로젝트 내 모델 목록(models.txt) 기반 우선순위
            const priorityModels = [
                "gemini-3-flash-preview", 
                "gemini-2.0-flash", 
                "gemini-1.5-flash-latest",
                "gemini-1.5-flash"
            ];

            // 실제 API에서 허용하는 모델 목록 가져오기 (필요 시)
            // 브라우저 SDK의 제약이 있을 수 있으므로 우선순위 목록에서 하나씩 테스트합니다.
            for (const modelName of priorityModels) {
                try {
                    const model = genAI.getGenerativeModel({ model: modelName });
                    await model.generateContent({ contents: [{ role: 'user', parts: [{ text: 't' }] }], generationConfig: { maxOutputTokens: 1 } });
                    console.log(`Using model: ${modelName}`);
                    this.activeModelName = modelName;
                    return modelName;
                } catch (e) {
                    continue; // 다음 모델 시도
                }
            }
            throw new Error("사용 가능한 Gemini Flash 모델을 찾을 수 없습니다.");
        } catch (error) {
            console.error("Model discovery failed:", error);
            return "gemini-1.5-flash"; // 최후의 보루
        }
    }

    async validateApiKey(apiKey) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const modelName = await this._determineBestModel(genAI);
            const model = genAI.getGenerativeModel({ model: modelName });

            const result = await model.generateContent("API Key Test");
            const response = await result.response;

            if (response && response.text()) {
                return { valid: true, message: `성공 (${modelName} 사용 중)` };
            }
            return { valid: false, message: "응답 값이 올바르지 않습니다." };
        } catch (error) {
            return { valid: false, message: error.message };
        }
    }

    async generateScript(apiKey, text, imageData) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const modelName = await this._determineBestModel(genAI);
            const model = genAI.getGenerativeModel({ model: modelName });

            let prompt = "다음 슬라이드 이미지를 핵심 요약 위주로 매우 간결하게 한글로 설명해줘. 불필요한 서술은 제외하고 가독성 좋게 불렛 포인트 마크다운 형식으로 작성해줘.";
            if (text) prompt += `\n\n참고 텍스트: ${text}`;

            let result;
            if (imageData) {
                let base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData;
                result = await model.generateContent([
                    prompt,
                    { inlineData: { data: base64Data, mimeType: "image/png" } }
                ]);
            } else {
                result = await model.generateContent(prompt);
            }

            const response = await result.response;
            return { script: response.text() };
        } catch (error) {
            throw new Error(`스크립트 생성 실패: ${error.message}`);
        }
    }
}

window.geminiClient = new GeminiClient();
