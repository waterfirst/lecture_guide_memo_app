// API Key Manager
// Handles Gemini API key validation and storage

class APIKeyManager {
    constructor() {
        this.apiKey = null;
        this.isValid = false;
        this.backendUrl = window.location.origin.includes('localhost')
            ? 'http://localhost:8000'
            : window.location.origin;
        this.init();
    }

    init() {
        // Load API key from localStorage
        const storedKey = localStorage.getItem('gemini_api_key');
        if (storedKey) {
            this.apiKey = storedKey;
            document.getElementById('api-key-input').value = storedKey;
            // Validate stored key on load
            this.validateKey(storedKey, true);
        }

        // Set up event listeners
        document.getElementById('validate-api-key-btn').addEventListener('click', () => {
            const input = document.getElementById('api-key-input');
            const key = input.value.trim();
            if (key) {
                this.validateKey(key);
            } else {
                this.showError('API 키를 입력해주세요.');
            }
        });

        // Allow Enter key to validate
        document.getElementById('api-key-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const key = e.target.value.trim();
                if (key) {
                    this.validateKey(key);
                }
            }
        });
    }

    async validateKey(key, silent = false) {
        const indicator = document.getElementById('api-key-indicator');
        const btn = document.getElementById('validate-api-key-btn');

        // Show validating state
        indicator.className = 'api-key-indicator validating';
        indicator.title = '검증 중...';
        btn.disabled = true;
        btn.textContent = '검증 중...';

        try {
            const response = await fetch(`${this.backendUrl}/validate-api-key`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ api_key: key })
            });

            const data = await response.json();

            if (data.valid) {
                // Valid key
                this.apiKey = key;
                this.isValid = true;
                localStorage.setItem('gemini_api_key', key);

                indicator.className = 'api-key-indicator valid';
                indicator.title = 'API 키가 유효합니다';

                if (!silent) {
                    this.showSuccess('API 키가 성공적으로 검증되었습니다!');
                }
            } else {
                // Invalid key
                this.apiKey = null;
                this.isValid = false;
                localStorage.removeItem('gemini_api_key');

                indicator.className = 'api-key-indicator invalid';
                indicator.title = 'API 키가 유효하지 않습니다';

                if (!silent) {
                    this.showError('유효하지 않은 API 키입니다: ' + data.message);
                }
            }
        } catch (error) {
            console.error('API key validation error:', error);
            this.apiKey = null;
            this.isValid = false;

            indicator.className = 'api-key-indicator invalid';
            indicator.title = '검증 실패';

            if (!silent) {
                this.showError('API 키 검증 중 오류가 발생했습니다: ' + error.message);
            }
        } finally {
            btn.disabled = false;
            btn.textContent = '검증';
        }
    }

    getApiKey() {
        return this.apiKey;
    }

    isApiKeyValid() {
        return this.isValid && this.apiKey !== null;
    }

    showSuccess(message) {
        // You can replace this with a more sophisticated notification system
        alert(message);
    }

    showError(message) {
        // You can replace this with a more sophisticated notification system
        alert(message);
    }
}

// Create global instance
const apiKeyManager = new APIKeyManager();
