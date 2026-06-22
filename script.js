// 成語卡片應用 - 主頁面邏輯

class IdiomCardApp {
    constructor() {
        this.idioms = [];
        this.currentIndex = 0;
        this.isFlipped = false;
        this.init();
    }

    init() {
        this.loadIdioms();
        this.setupEventListeners();
        this.displayCard();
    }

    loadIdioms() {
        const saved = localStorage.getItem('idioms');
        this.idioms = saved ? JSON.parse(saved) : this.getDefaultIdioms();
    }

    getDefaultIdioms() {
        return [
            { idiom: '臥虎藏龍', meaning: '比喻文人倜儻不羈，懷才不遇。', source: '自訂' },
            { idiom: '厚積薄發', meaning: '底蘊深厚，但表現樸素；也指做了充分的準備，就有豐碩的收果。', source: '自訂' },
            { idiom: '十年磨劍', meaning: '比喻經過長期的刻苦磨練，積蓄力量，等待一朝的施展。', source: '自訂' },
            { idiom: '聞雞起舞', meaning: '聽到雞叫就起床舞劍，比喻有誌氣的人及時奮起自強。', source: '自訂' },
            { idiom: '志在千里', meaning: '形容志向遠大。', source: '自訂' }
        ];
    }

    setupEventListeners() {
        const card = document.getElementById('card');
        const nextBtn = document.getElementById('nextBtn');
        const prevBtn = document.getElementById('prevBtn');
        const shuffleBtn = document.getElementById('shuffleBtn');
        const resetBtn = document.getElementById('resetBtn');

        // 卡片翻轉
        if (card) {
            card.addEventListener('click', () => this.flipCard());
        }

        // 翻頁按鈕
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextCard());
        }
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prevCard());
        }

        // 控制按鈕
        if (shuffleBtn) {
            shuffleBtn.addEventListener('click', () => this.shuffle());
        }
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.reset());
        }

        // 鍵盤快捷鍵
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ') {
                e.preventDefault();
                this.flipCard();
            } else if (e.key === 'ArrowRight') {
                this.nextCard();
            } else if (e.key === 'ArrowLeft') {
                this.prevCard();
            }
        });
    }

    displayCard() {
        const cardContainer = document.querySelector('.card-container');
        const controls = document.querySelector('.controls');
        const cardInfo = document.querySelector('.card-info');
        const emptyState = document.getElementById('emptyState');

        if (this.idioms.length === 0) {
            if (cardContainer) cardContainer.style.display = 'none';
            if (controls) controls.style.display = 'none';
            if (cardInfo) cardInfo.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (cardContainer) cardContainer.style.display = 'block';
        if (controls) controls.style.display = 'flex';
        if (cardInfo) cardInfo.style.display = 'block';
        if (emptyState) emptyState.style.display = 'none';

        const current = this.idioms[this.currentIndex];
        const idiomEl = document.getElementById('idiom');
        const meaningEl = document.getElementById('meaning');
        const cardCounterEl = document.getElementById('cardCounter');
        const cardSourceEl = document.getElementById('cardSource');

        if (idiomEl) idiomEl.textContent = current.idiom;
        if (meaningEl) meaningEl.textContent = current.meaning;
        if (cardCounterEl) cardCounterEl.textContent = `${this.currentIndex + 1} / ${this.idioms.length}`;

        if (current.source && cardSourceEl) {
            cardSourceEl.textContent = `來源: ${current.source}`;
        }

        this.isFlipped = false;
        const card = document.getElementById('card');
        if (card) {
            card.classList.remove('flipped');
        }
    }

    flipCard() {
        const card = document.getElementById('card');
        if (card) {
            card.classList.toggle('flipped');
            this.isFlipped = !this.isFlipped;
        }
    }

    nextCard() {
        if (this.idioms.length === 0) return;
        this.currentIndex = (this.currentIndex + 1) % this.idioms.length;
        this.displayCard();
    }

    prevCard() {
        if (this.idioms.length === 0) return;
        this.currentIndex = (this.currentIndex - 1 + this.idioms.length) % this.idioms.length;
        this.displayCard();
    }

    shuffle() {
        if (this.idioms.length === 0) return;
        // Fisher-Yates 洗牌算法
        for (let i = this.idioms.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.idioms[i], this.idioms[j]] = [this.idioms[j], this.idioms[i]];
        }
        this.currentIndex = 0;
        this.displayCard();
    }

    reset() {
        this.currentIndex = 0;
        this.displayCard();
    }

    // 監聽 storage 事件，當其他頁面修改數據時更新
    static setupStorageListener(app) {
        window.addEventListener('storage', () => {
            app.loadIdioms();
            app.displayCard();
        });
    }
}

// 等待 DOM 完全加載後初始化應用
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const app = new IdiomCardApp();
        IdiomCardApp.setupStorageListener(app);
    });
} else {
    const app = new IdiomCardApp();
    IdiomCardApp.setupStorageListener(app);
}
