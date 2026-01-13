// Gemini API Client for Browser
// Uses Google Generative AI SDK directly from the browser

import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiClient {
    constructor() {
        this.genAI = null;
        this.model = null;
    }

    async validateApiKey(apiKey) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            // 모델 이름을 backend와 일치하게 수정: gemini-3-flash-preview
            const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

            // Try to generate a simple test to validate the key
            const result = await model.generateContent("Test");
            const response = await result.response;

            if (response && response.text) {
                return { valid: true, message: "API key is valid" };
            } else {
                return { valid: false, message: "No response from API" };
            }
        } catch (error) {
            console.error('Gemini API validation error:', error);
            return {
                valid: false,
                message: error.message || "Invalid API key"
            };
        }
    }

    async generateScript(apiKey, text, imageData) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            // 모델 이름을 backend와 일치하게 수정: gemini-3-flash-preview
            const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

            let prompt = "다음 슬라이드 이미지를 핵심 요약 위주로 매우 간결하게 한글로 설명해줘. 불필요한 서술은 제외하고 가독성 좋게 불렛 포인트 마크다운 형식으로 작성해줘.";

            if (text) {
                prompt += `\n\n참고 텍스트: ${text}`;
            }

            let result;

            if (imageData) {
                // If we have image data, use multimodal generation
                let base64Data = imageData;
                if (imageData.includes(',')) {
                    base64Data = imageData.split(',')[1];
                }

                const imagePart = {
                    inlineData: {
                        data: base64Data,
                        mimeType: "image/png"
                    }
                };

                result = await model.generateContent([prompt, imagePart]);
            } else if (text) {
                // Text-only generation
                prompt = `다음 영어 강의 텍스트를 핵심 요약 위주로 매우 간결하게 한글로 설명해줘. 불필요한 내용은 빼고 가독성 좋은 마크다운 불렛 포인트로 작성해줘:\n\n${text}`;
                result = await model.generateContent(prompt);
            } else {
                throw new Error('No text or image provided');
            }

            const response = await result.response;
            const scriptText = response.text();

            return { script: scriptText };
        } catch (error) {
            console.error('Gemini API generation error:', error);
            throw new Error(`스크립트 생성 실패: ${error.message}`);
        }
    }
}

// Export singleton instance
window.geminiClient = new GeminiClient();
