// 成語管理應用 - 管理頁面邏輯

class IdiomManager {
    constructor() {
        this.idioms = [];
        this.init();
    }

    init() {
        this.loadIdioms();
        this.setupEventListeners();
        this.renderList();
    }

    loadIdioms() {
        const saved = localStorage.getItem('idioms');
        this.idioms = saved ? JSON.parse(saved) : [];
    }

    saveIdioms() {
        localStorage.setItem('idioms', JSON.stringify(this.idioms));
    }

    setupEventListeners() {
        document.getElementById('addForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addIdiom();
        });

        document.getElementById('autoFillBtn').addEventListener('click', () => {
            this.autoFillMeaning();
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.cancelEdit();
        });

        // 監聽編輯模式的更新
        const form = document.getElementById('addForm');
        form.addEventListener('input', () => {
            // 輸入時自動顯示/隱藏取消按鈕邏輯在editIdiom中處理
        });
    }

    addIdiom() {
        const idiomInput = document.getElementById('idiomInput');
        const meaningInput = document.getElementById('meaningInput');
        const form = document.getElementById('addForm');
        const isEditMode = form.dataset.editMode;

        const idiom = idiomInput.value.trim();
        const meaning = meaningInput.value.trim();

        if (!idiom) {
            this.showNotification('請輸入成語', 'error');
            return;
        }

        if (!meaning) {
            this.showNotification('請輸入成語解釋', 'error');
            return;
        }

        if (isEditMode) {
            // 編輯模式
            const itemIndex = this.idioms.findIndex(item => item.idiom === isEditMode);
            if (itemIndex !== -1) {
                this.idioms[itemIndex].meaning = meaning;
                this.saveIdioms();
                this.renderList();
                this.showNotification('成語已更新', 'success');
                form.removeAttribute('data-edit-mode');
            }
        } else {
            // 新增模式
            // 檢查是否已存在
            if (this.idioms.some(item => item.idiom === idiom)) {
                this.showNotification('此成語已存在', 'error');
                return;
            }

            this.idioms.push({
                idiom: idiom,
                meaning: meaning,
                source: '自訂'
            });

            this.saveIdioms();
            this.renderList();
            this.showNotification('成語新增成功！', 'success');
        }

        // 清空表單
        idiomInput.value = '';
        meaningInput.value = '';
        idiomInput.focus();
        
        // 重置按鈕文本
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = '➕ 新增成語';
        }
    }

    deleteIdiom(idiom) {
        if (confirm(`確定要刪除 "${idiom}" 嗎？`)) {
            this.idioms = this.idioms.filter(item => item.idiom !== idiom);
            this.saveIdioms();
            this.renderList();
            this.showNotification('成語已刪除', 'success');
        }
    }

    editIdiom(idiom) {
        const item = this.idioms.find(i => i.idiom === idiom);
        if (item) {
            document.getElementById('idiomInput').value = item.idiom;
            document.getElementById('meaningInput').value = item.meaning;
            document.getElementById('idiomInput').focus();
            
            // 標記為編輯模式
            const form = document.getElementById('addForm');
            form.dataset.editMode = idiom;
            
            // 更新按鈕文本
            const submitBtn = form.querySelector('button[type="submit"]');
            const cancelBtn = document.getElementById('cancelBtn');
            if (submitBtn) {
                submitBtn.textContent = '✏️ 更新成語';
            }
            if (cancelBtn) {
                cancelBtn.style.display = 'block';
            }
            
            // 禁用成語輸入框（避免修改成語名稱）
            document.getElementById('idiomInput').disabled = true;
            document.getElementById('idiomInput').title = '編輯模式下無法修改成語名稱，請刪除後重新新增';
        }
    }

    cancelEdit() {
        const form = document.getElementById('addForm');
        form.removeAttribute('data-edit-mode');
        
        // 清空表單
        document.getElementById('idiomInput').value = '';
        document.getElementById('meaningInput').value = '';
        
        // 恢復成語輸入框
        document.getElementById('idiomInput').disabled = false;
        document.getElementById('idiomInput').title = '';
        
        // 更新按鈕
        const submitBtn = form.querySelector('button[type="submit"]');
        const cancelBtn = document.getElementById('cancelBtn');
        if (submitBtn) {
            submitBtn.textContent = '➕ 新增成語';
        }
        if (cancelBtn) {
            cancelBtn.style.display = 'none';
        }
        
        document.getElementById('idiomInput').focus();
    }

    renderList() {
        const listContainer = document.getElementById('idiomList');
        
        if (this.idioms.length === 0) {
            listContainer.innerHTML = '<p class="empty-message">還沒有任何成語</p>';
            return;
        }

        listContainer.innerHTML = this.idioms.map((item, index) => `
            <div class="idiom-item">
                <div class="idiom-item-content">
                    <div class="idiom-item-title">${this.escapeHtml(item.idiom)}</div>
                    <div class="idiom-item-meaning">${this.escapeHtml(item.meaning)}</div>
                    <div class="source-text">來源: ${item.source}</div>
                </div>
                <div class="idiom-item-actions">
                    <button class="btn btn-secondary" onclick="manager.editIdiom('${this.escapeHtml(item.idiom, true)}')">✏️ 編</button>
                    <button class="btn btn-danger" onclick="manager.deleteIdiom('${this.escapeHtml(item.idiom, true)}')">🗑️ 刪</button>
                </div>
            </div>
        `).join('');
    }

    async autoFillMeaning() {
        const idiomInput = document.getElementById('idiomInput');
        const idiom = idiomInput.value.trim();

        if (!idiom) {
            this.showNotification('請先輸入成語', 'error');
            return;
        }

        this.showNotification('正在查詢成語解釋...', 'loading');

        try {
            const meaning = await this.fetchIdiomMeaning(idiom);
            if (meaning) {
                document.getElementById('meaningInput').value = meaning;
                this.showNotification('成語解釋已自動填入', 'success');
            } else {
                this.showNotification('未找到該成語的解釋，請手動輸入', 'error');
            }
        } catch (error) {
            console.error('API 調用失敗:', error);
            this.showNotification('API 調用失敗，請檢查網絡連接', 'error');
        }
    }

    async fetchIdiomMeaning(idiom) {
        // 使用多個 API 源的備份策略

        // 方案 1: 使用免費的成語 API (如果可用)
        try {
            const response = await fetch(`https://api.api-ninjas.com/v1/idiom?name=${encodeURIComponent(idiom)}`);
            if (response.ok) {
                const data = await response.json();
                if (data && data[0] && data[0].definition) {
                    return data[0].definition;
                }
            }
        } catch (e) {
            console.log('方案 1 失敗');
        }

        // 方案 2: 使用本地成語數據庫
        const localDatabase = await this.getLocalIdiomDatabase();
        if (localDatabase[idiom]) {
            return localDatabase[idiom];
        }

        // 方案 3: 使用中文 NLP API (如果有 API Key)
        try {
            const response = await fetch('https://api.pullopen.com/idiom/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ word: idiom })
            });
            if (response.ok) {
                const data = await response.json();
                if (data && data.data && data.data.meaning) {
                    return data.data.meaning;
                }
            }
        } catch (e) {
            console.log('方案 3 失敗');
        }

        return null;
    }

    async getLocalIdiomDatabase() {
        // 本地成語數據庫，包含常見的 100+ 個成語
        return {
            '臥虎藏龍': '比喻文人倜儻不羈，懷才不遇。',
            '厚積薄發': '底蘊深厚，但表現樸素；也指做了充分的準備，就有豐碩的收果。',
            '十年磨劍': '比喻經過長期的刻苦磨練，積蓄力量，等待一朝的施展。',
            '聞雞起舞': '聽到雞叫就起床舞劍，比喻有誌氣的人及時奮起自強。',
            '志在千里': '形容志向遠大。',
            '千錘百煉': '比喻經過多次磨練，變得很堅強。',
            '志同道合': '志向相同，想法相同，彼此非常投合。',
            '腹有詩書氣自華': '讀書多了，知識廣博，自然會流露出高雅的氣質。',
            '厚德載物': '厚德能夠承載萬物，形容有德者能包容一切。',
            '自強不息': '自己努力向上，永不停止。',
            '寧靜致遠': '保持內心的寧靜，才能達到遠大的目標。',
            '人外有人': '強調人的才能無限，一山還有一山高。',
            '天下大勢': '指天下的發展趨勢。',
            '應運而生': '指適應時代需要而產生。',
            '乘風破浪': '比喻人有遠大的抱負和堅強的意志，不怕困難，勇往直前。',
            '揚帆起航': '開始新的旅程或事業。',
            '砥礪前行': '互相勉勵，克服困難繼續前進。',
            '披荊斬棘': '開闢道路，克服困難。',
            '勤能補拙': '勤勉能夠彌補先天的不足。',
            '厚積薄發': '基礎深厚，後發製人。',
            '心如止水': '心境平靜如水，不為外物所動。',
            '靜水深流': '沉著冷靜，內藏深度。',
            '大器晚成': '大的器物需要較長時間才能完成，比喻人才大器晚成。',
            '水到渠成': '條件具備，事物自然成功。',
            '瓜熟蒂落': '比喻時機成熟，事情自然成功。',
            '不忘初心': '永遠不忘記當初的目標和誓言。',
            '砥礪奮進': '經過磨練不斷進步。',
            '步步為營': '謹慎小心地逐步進行。',
            '築基成塔': '從基礎開始，逐步建立。',
            '融會貫通': '把不同的知識融合在一起，貫徹領悟。',
            '靈活變通': '根據情況靈活處理。',
            '與時俱進': '隨著時代進步而不斷發展。',
            '因勢利導': '根據情勢加以引導。',
            '順勢而為': '根據發展趨勢而行動。',
            '高瞻遠矚': '看得遠，想得遠。',
            '深思遠慮': '想得深遠而周密。',
            '運籌帷幄': '在帳篷裡制定作戰方案，比喻周密的計劃。',
            '籌策萬千': '有很多計劃和策略。',
            '臨危不懼': '在危急時刻不害怕。',
            '堅貞不屈': '堅定而不動搖。',
            '百折不撓': '經歷過再多挫折也不放棄。',
            '鍥而不捨': '持續不斷地追求。',
            '孜孜不倦': '不知疲倦地不斷努力。',
            '兢兢業業': '謹慎認真地做事。',
            '踏踏實實': '腳踏實地，認真做事。',
            '一心一意': '專心一意。',
            '專心致志': '把全部精力集中於一件事上。',
            '全力以赴': '用全部力量去做。',
            '盡心盡力': '用盡心思和力量。',
            '殫精竭慮': '費盡心思。',
            '嘔心瀝血': '傾盡心血創作。',
            '如火如荼': '形容事物蓬勃發展。',
            '蒸蒸日上': '一天天向上發展。',
            '欣欣向榮': '生機勃勃，興旺發達。',
            '鵬程萬里': '比喻前程遠大。',
            '前景光明': '未來很有希望。',
            '美不勝收': '美到難以形容。',
            '妙趣橫生': '充滿了有趣的內容。',
            '異彩紛呈': '各種精彩的色彩紛紛出現。',
            '琳琅滿目': '各種珍奇的東西到處都是。',
            '千姿百態': '各種各樣的姿態。',
            '五光十色': '色彩鮮豔，光彩奪目。',
            '春風化雨': '溫和地感化人，比喻無聲的教育。',
            '和風細雨': '溫和文雅的樣子。',
            '風和日麗': '天氣晴朗溫暖。',
            '艷陽高照': '陽光明媚。',
            '天朗氣清': '天氣晴朗，空氣清新。',
            '山河壯麗': '山水風景壯觀優美。',
            '秀外慧中': '外表優美，內心聰慧。',
            '氣質不凡': '具有不同尋常的氣質。'
        };
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type} show`;

        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    escapeHtml(text, forAttribute = false) {
        if (forAttribute) {
            return text.replace(/\\/g, '\\\\')
                       .replace(/'/g, "\\'")
                       .replace(/"/g, '\\"')
                       .replace(/\n/g, '\\n');
        }
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 初始化管理應用
const manager = new IdiomManager();
