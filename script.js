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
        if (card) {
            card.addEventListener('click', () => this.flipCard());
        }

        document.getElementById('nextBtn')?.addEventListener('click', () => this.nextCard());
        document.getElementById('prevBtn')?.addEventListener('click', () => this.prevCard());
        document.getElementById('shuffleBtn')?.addEventListener('click', () => this.shuffle());
        document.getElementById('resetBtn')?.addEventListener('click', () => this.reset());

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
        if (this.idioms.length === 0) {
            document.querySelector('.card-container')?.style.display = 'none';
            document.querySelector('.controls')?.style.display = 'none';
            document.querySelector('.card-info')?.style.display = 'none';
            document.getElementById('emptyState')?.style.display = 'block';
            return;
        }

        document.querySelector('.card-container')?.style.display = 'block';
        document.querySelector('.controls')?.style.display = 'flex';
        document.querySelector('.card-info')?.style.display = 'block';
        document.getElementById('emptyState')?.style.display = 'none';

        const current = this.idioms[this.currentIndex];
        document.getElementById('idiom').textContent = current.idiom;
        document.getElementById('meaning').textContent = current.meaning;
        document.getElementById('cardCounter').textContent = `${this.currentIndex + 1} / ${this.idioms.length}`;

        if (current.source) {
            document.getElementById('cardSource').textContent = `來源: ${current.source}`;
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

// 初始化應用
const app = new IdiomCardApp();
IdiomCardApp.setupStorageListener(app);
