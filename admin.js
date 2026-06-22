// 成語管理應用 - 管理頁面邏輯

// 將此處替換為你部署的 GAS web app URL
var GAS_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbzAEXxhtMhWbmEIhpHiBxxCXfU0vwEjQUch31maj7vinHYbYQNVVh9y3EqbL3s9T9AOww/exec';

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
        var saved = localStorage.getItem('idioms');
        this.idioms = saved ? JSON.parse(saved) : [];
    }

    saveIdioms() {
        localStorage.setItem('idioms', JSON.stringify(this.idioms));
    }

    // 將新增的成語推送到後端（Google Apps Script）
    sendToGAS(idiom, meaning) {
        if (!GAS_WEBAPP_URL || GAS_WEBAPP_URL.indexOf('REPLACE_WITH') === 0) return;
        try {
            fetch(GAS_WEBAPP_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ idiom: idiom, meaning: meaning })
            }).then(function(resp) {
                // 可選：檢查回應
                return resp.json();
            }).then(function(data) {
                console.log('GAS 回應：', data);
            }).catch(function(err) {
                console.warn('發送到 GAS 失敗：', err);
            });
        } catch (e) {
            console.warn('sendToGAS 錯誤：', e);
        }
    }

    setupEventListeners() {
        var self = this;
        var addForm = document.getElementById('addForm');
        var autoFillBtn = document.getElementById('autoFillBtn');
        var cancelBtn = document.getElementById('cancelBtn');

        if (addForm) {
            addForm.addEventListener('submit', function(e) {
                e.preventDefault();
                self.addIdiom();
            });
        }

        if (autoFillBtn) {
            autoFillBtn.addEventListener('click', function() {
                self.autoFillMeaning();
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', function() {
                self.cancelEdit();
            });
        }
    }

    addIdiom() {
        var idiomInput = document.getElementById('idiomInput');
        var meaningInput = document.getElementById('meaningInput');
        var form = document.getElementById('addForm');
        var isEditMode = form.dataset.editMode;

        var idiom = idiomInput.value.trim();
        var meaning = meaningInput.value.trim();

        if (!idiom) {
            this.showNotification('請輸入成語', 'error');
            return;
        }

        if (!meaning) {
            this.showNotification('請輸入成語解釋', 'error');
            return;
        }

        if (isEditMode) {
            var itemIndex = this.idioms.findIndex(function(item) { return item.idiom === isEditMode; });
            if (itemIndex !== -1) {
                this.idioms[itemIndex].meaning = meaning;
                this.saveIdioms();
                this.renderList();
                this.showNotification('成語已更新', 'success');
                form.removeAttribute('data-edit-mode');
            }
        } else {
            if (this.idioms.some(function(item) { return item.idiom === idiom; })) {
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
            // 非同步推送到後端（如果有設定 GAS_WEBAPP_URL）
            try { this.sendToGAS(idiom, meaning); } catch (e) { console.warn(e); }
        }

        idiomInput.value = '';
        meaningInput.value = '';
        idiomInput.focus();
        
        var submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = '➕ 新增成語';
        }
    }

    deleteIdiom(idiom) {
        var self = this;
        if (confirm('確定要刪除 "' + idiom + '" 嗎？')) {
            this.idioms = this.idioms.filter(function(item) { return item.idiom !== idiom; });
            this.saveIdioms();
            this.renderList();
            this.showNotification('成語已刪除', 'success');
        }
    }

    editIdiom(idiom) {
        var item = this.idioms.find(function(i) { return i.idiom === idiom; });
        if (item) {
            document.getElementById('idiomInput').value = item.idiom;
            document.getElementById('meaningInput').value = item.meaning;
            document.getElementById('idiomInput').focus();
            
            var form = document.getElementById('addForm');
            form.dataset.editMode = idiom;
            
            var submitBtn = form.querySelector('button[type="submit"]');
            var cancelBtn = document.getElementById('cancelBtn');
            if (submitBtn) {
                submitBtn.textContent = '✏️ 更新成語';
            }
            if (cancelBtn) {
                cancelBtn.style.display = 'block';
            }
            
            document.getElementById('idiomInput').disabled = true;
            document.getElementById('idiomInput').title = '編輯模式下無法修改成語名稱，請刪除後重新新增';
        }
    }

    cancelEdit() {
        var form = document.getElementById('addForm');
        form.removeAttribute('data-edit-mode');
        
        document.getElementById('idiomInput').value = '';
        document.getElementById('meaningInput').value = '';
        
        document.getElementById('idiomInput').disabled = false;
        document.getElementById('idiomInput').title = '';
        
        var submitBtn = form.querySelector('button[type="submit"]');
        var cancelBtn = document.getElementById('cancelBtn');
        if (submitBtn) {
            submitBtn.textContent = '➕ 新增成語';
        }
        if (cancelBtn) {
            cancelBtn.style.display = 'none';
        }
        
        document.getElementById('idiomInput').focus();
    }

    renderList() {
        var listContainer = document.getElementById('idiomList');
        var self = this;
        
        if (this.idioms.length === 0) {
            listContainer.innerHTML = '<p class="empty-message">還沒有任何成語</p>';
            return;
        }

        var html = '';
        for (var i = 0; i < this.idioms.length; i++) {
            var item = this.idioms[i];
            var escapedIdiom = this.escapeHtml(item.idiom);
            var escapedIdiomAttr = this.escapeHtml(item.idiom, true);
            var escapedMeaning = this.escapeHtml(item.meaning);
            
            html += '<div class="idiom-item">' +
                '<div class="idiom-item-content">' +
                '<div class="idiom-item-title">' + escapedIdiom + '</div>' +
                '<div class="idiom-item-meaning">' + escapedMeaning + '</div>' +
                '<div class="source-text">來源: ' + item.source + '</div>' +
                '</div>' +
                '<div class="idiom-item-actions">' +
                '<button class="btn btn-secondary" onclick="manager.editIdiom(\'' + escapedIdiomAttr + '\')">✏️ 編</button>' +
                '<button class="btn btn-danger" onclick="manager.deleteIdiom(\'' + escapedIdiomAttr + '\')">🗑️ 刪</button>' +
                '</div>' +
                '</div>';
        }
        
        listContainer.innerHTML = html;
    }

    async autoFillMeaning() {
        var idiomInput = document.getElementById('idiomInput');
        var idiom = idiomInput.value.trim();

        if (!idiom) {
            this.showNotification('請先輸入成語', 'error');
            return;
        }

        this.showNotification('正在查詢成語解釋...', 'loading');

        try {
            var meaning = await this.fetchIdiomMeaning(idiom);
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
        // 方案 1：使用 Moedict 詞條資料庫
        try {
            var url = 'https://www.moedict.tw/uni/' + encodeURIComponent(idiom) + '.json';
            var response = await fetch(url);
            if (response.ok) {
                var data = await response.json();
                if (data && data.heteronyms && data.heteronyms.length > 0) {
                    var defs = data.heteronyms[0].definitions;
                    if (defs && defs.length > 0) {
                        return defs[0].def;
                    }
                }
            }
        } catch (e) {
            console.log('Moedict 方案失敗', e);
        }

        // 方案 2：使用中文維基百科摘要，詞彙量更大
        try {
            var wikiUrl =
                'https://zh.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro=1&explaintext=1&titles=' +
                encodeURIComponent(idiom) +
                '&origin=*';
            var wikiResp = await fetch(wikiUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            if (wikiResp.ok) {
                var wikiData = await wikiResp.json();
                if (wikiData && wikiData.query && wikiData.query.pages) {
                    var pages = wikiData.query.pages;
                    for (var pageId in pages) {
                        if (pages.hasOwnProperty(pageId)) {
                            var page = pages[pageId];
                            if (page && page.extract && page.extract.length > 0) {
                                return page.extract;
                            }
                        }
                    }
                }
            }
        } catch (e) {
            console.log('Wikipedia 方案失敗', e);
        }

        // 方案 3：本地詞庫備援
        var localDatabase = await this.getLocalIdiomDatabase();
        if (localDatabase[idiom]) {
            return localDatabase[idiom];
        }

        return null;
    }

    async getLocalIdiomDatabase() {
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
            '前景光明': '未來很有希望。'
        };
    }

    showNotification(message, type) {
        type = type || 'success';
        var notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = 'notification ' + type + ' show';

        setTimeout(function() {
            notification.classList.remove('show');
        }, 3000);
    }

    escapeHtml(text, forAttribute) {
        if (forAttribute) {
            return text.replace(/\\/g, '\\\\')
                       .replace(/'/g, "\\'")
                       .replace(/"/g, '\\"')
                       .replace(/\n/g, '\\n');
        }
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

var manager;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        manager = new IdiomManager();
    });
} else {
    manager = new IdiomManager();
}
