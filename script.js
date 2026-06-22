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
        var saved = localStorage.getItem('idioms');
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
        var self = this;
        var card = document.getElementById('card');
        var nextBtn = document.getElementById('nextBtn');
        var prevBtn = document.getElementById('prevBtn');
        var shuffleBtn = document.getElementById('shuffleBtn');
        var resetBtn = document.getElementById('resetBtn');

        if (card) {
            card.addEventListener('click', function() {
                self.flipCard();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                self.nextCard();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                self.prevCard();
            });
        }

        if (shuffleBtn) {
            shuffleBtn.addEventListener('click', function() {
                self.shuffle();
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                self.reset();
            });
        }

        document.addEventListener('keydown', function(e) {
            if (e.key === ' ') {
                e.preventDefault();
                self.flipCard();
            } else if (e.key === 'ArrowRight') {
                self.nextCard();
            } else if (e.key === 'ArrowLeft') {
                self.prevCard();
            }
        });
    }

    displayCard() {
        var cardContainer = document.querySelector('.card-container');
        var controls = document.querySelector('.controls');
        var cardInfo = document.querySelector('.card-info');
        var emptyState = document.getElementById('emptyState');

        if (this.idioms.length === 0) {
            if (cardContainer) {
                cardContainer.style.display = 'none';
            }
            if (controls) {
                controls.style.display = 'none';
            }
            if (cardInfo) {
                cardInfo.style.display = 'none';
            }
            if (emptyState) {
                emptyState.style.display = 'block';
            }
            return;
        }

        if (cardContainer) {
            cardContainer.style.display = 'block';
        }
        if (controls) {
            controls.style.display = 'flex';
        }
        if (cardInfo) {
            cardInfo.style.display = 'block';
        }
        if (emptyState) {
            emptyState.style.display = 'none';
        }

        var current = this.idioms[this.currentIndex];
        var idiomEl = document.getElementById('idiom');
        var meaningEl = document.getElementById('meaning');
        var cardCounterEl = document.getElementById('cardCounter');
        var cardSourceEl = document.getElementById('cardSource');

        if (idiomEl) {
            idiomEl.textContent = current.idiom;
        }
        if (meaningEl) {
            meaningEl.textContent = current.meaning;
        }
        if (cardCounterEl) {
            cardCounterEl.textContent = (this.currentIndex + 1) + ' / ' + this.idioms.length;
        }

        if (current.source && cardSourceEl) {
            cardSourceEl.textContent = '來源: ' + current.source;
        }

        this.isFlipped = false;
        var card = document.getElementById('card');
        if (card) {
            card.classList.remove('flipped');
        }
    }

    flipCard() {
        var card = document.getElementById('card');
        if (card) {
            card.classList.toggle('flipped');
            this.isFlipped = !this.isFlipped;
        }
    }

    nextCard() {
        if (this.idioms.length === 0) {
            return;
        }
        this.currentIndex = (this.currentIndex + 1) % this.idioms.length;
        this.displayCard();
    }

    prevCard() {
        if (this.idioms.length === 0) {
            return;
        }
        this.currentIndex = (this.currentIndex - 1 + this.idioms.length) % this.idioms.length;
        this.displayCard();
    }

    shuffle() {
        if (this.idioms.length === 0) {
            return;
        }
        // Fisher-Yates 洗牌算法
        for (var i = this.idioms.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = this.idioms[i];
            this.idioms[i] = this.idioms[j];
            this.idioms[j] = temp;
        }
        this.currentIndex = 0;
        this.displayCard();
    }

    reset() {
        this.currentIndex = 0;
        this.displayCard();
    }

    static setupStorageListener(app) {
        window.addEventListener('storage', function() {
            app.loadIdioms();
            app.displayCard();
        });
    }
}

// 初始化應用
function initApp() {
    var app = new IdiomCardApp();
    IdiomCardApp.setupStorageListener(app);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
