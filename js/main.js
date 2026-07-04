class CoursePlayer {
    constructor() {
        this.currentLevel = 'level3';
        this.currentLesson = 1;
        this.currentPage = 0;
        this.slides = [];
        this.isPresentationMode = false;
        this.quizState = {};
        
        this.init();
    }
    
    async init() {
        await this.loadCourseData();
        this.renderSlides();
        this.setupEventListeners();
        this.updateNavigation();
    }
    
    async loadCourseData() {
        try {
            const response = await fetch(`data/${this.currentLevel}/lesson${this.currentLesson}.html`);
            if (!response.ok) {
                throw new Error(`加载课程数据失败: ${response.status}`);
            }
            const htmlContent = await response.text();
            this.slides = this.parseHTMLSlides(htmlContent);
        } catch (error) {
            console.error('加载课程数据失败:', error);
            this.slides = [];
        }
    }
    
    parseHTMLSlides(htmlContent) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        const slideElements = tempDiv.querySelectorAll('.slide');
        return Array.from(slideElements).map(slide => ({
            content: slide.innerHTML
        }));
    }
    
    renderSlides() {
        const container = document.getElementById('slide-container');
        container.innerHTML = '';
        
        if (this.slides.length === 0) {
            container.innerHTML = '<div class="slide active"><h2 class="slide-title">暂无课程内容</h2><p class="slide-content">请选择其他课程</p></div>';
            return;
        }
        
        this.slides.forEach((slide, index) => {
            const slideElement = document.createElement('div');
            slideElement.className = `slide ${index === 0 ? 'active' : ''}`;
            slideElement.innerHTML = slide.content;
            container.appendChild(slideElement);
        });
        
        this.updateProgress();
    }
    
    setupEventListeners() {
        document.getElementById('btn-prev').addEventListener('click', () => this.prevPage());
        document.getElementById('btn-next').addEventListener('click', () => this.nextPage());
        document.getElementById('btn-presentation').addEventListener('click', () => this.togglePresentation());
        
        document.addEventListener('keydown', (e) => {
            if (this.isPresentationMode && e.key === 'Escape') {
                this.togglePresentation();
            } else if (!e.target.closest('input, textarea')) {
                if (e.key === 'ArrowLeft') this.prevPage();
                else if (e.key === 'ArrowRight') this.nextPage();
                else if (e.key === 'Home') this.goToPage(0);
                else if (e.key === 'End') this.goToPage(this.slides.length - 1);
            }
        });
    }
    
    goToPage(pageNum) {
        if (pageNum < 0 || pageNum >= this.slides.length) return;
        
        document.querySelectorAll('.slide').forEach((slide, index) => {
            slide.classList.toggle('active', index === pageNum);
        });
        
        this.currentPage = pageNum;
        this.updateNavigation();
        this.updateProgress();
        
        document.querySelector('.slide-container').scrollTop = 0;
    }
    
    prevPage() {
        this.goToPage(this.currentPage - 1);
    }
    
    nextPage() {
        this.goToPage(this.currentPage + 1);
    }
    
    updateNavigation() {
        document.getElementById('btn-prev').disabled = this.currentPage === 0;
        document.getElementById('btn-next').disabled = this.currentPage === this.slides.length - 1;
        document.getElementById('page-indicator').textContent = `第 ${this.currentPage + 1} / ${this.slides.length} 页`;
    }
    
    updateProgress() {
        const progress = ((this.currentPage + 1) / this.slides.length) * 100;
        document.getElementById('progress-fill').style.width = `${progress}%`;
    }
    
    togglePresentation() {
        this.isPresentationMode = !this.isPresentationMode;
        const sidebar = document.querySelector('.sidebar');
        const btn = document.getElementById('btn-presentation');
        
        if (this.isPresentationMode) {
            sidebar.style.display = 'none';
            btn.textContent = '退出演示';
            document.body.style.cursor = 'none';
            
            setTimeout(() => {
                document.addEventListener('mousemove', this.hideCursor);
            }, 1000);
        } else {
            sidebar.style.display = 'block';
            btn.textContent = '🎤 演示模式';
            document.body.style.cursor = 'default';
            document.removeEventListener('mousemove', this.hideCursor);
        }
    }
    
    hideCursor = () => {
        document.body.style.cursor = 'none';
    }
    
    selectQuizOption(optionElement) {
        const quizIndex = parseInt(optionElement.dataset.quizIndex);
        const options = optionElement.parentElement.querySelectorAll('.quiz-option');
        
        options.forEach(opt => opt.classList.remove('selected'));
        optionElement.classList.add('selected');
        
        document.getElementById(`submit-${quizIndex}`).disabled = false;
    }
    
    submitQuiz(quizIndex) {
        const selectedOption = document.querySelector(`[data-quiz-index="${quizIndex}"].selected span:first-child`);
        
        if (!selectedOption) return;
        
        const selectedIndex = selectedOption.textContent.charCodeAt(0) - 65;
        const isCorrect = this.isQuizCorrect(quizIndex, selectedIndex);
        
        const options = document.querySelectorAll(`[data-quiz-index="${quizIndex}"]`);
        options.forEach((opt, i) => {
            opt.classList.remove('selected');
            if (i === this.getCorrectAnswer(quizIndex)) {
                opt.classList.add('correct');
            } else if (i === selectedIndex && !isCorrect) {
                opt.classList.add('incorrect');
            }
            opt.style.pointerEvents = 'none';
        });
        
        const feedback = document.getElementById(`feedback-${quizIndex}`);
        feedback.className = `quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        feedback.textContent = isCorrect ? '✅ 回答正确！' : `❌ 回答错误，正确答案是：${this.getCorrectAnswerText(quizIndex)}`;
        
        document.getElementById(`submit-${quizIndex}`).disabled = true;
        
        this.quizState[quizIndex] = isCorrect;
    }
    
    isQuizCorrect(quizIndex, selectedIndex) {
        const quizAnswers = {
            1: { 0: 0, 1: 0, 2: 1, 3: 1, 4: 2, 5: 1, 6: 1, 7: 1, 8: 1, 9: 0, 10: 0 },
            2: { 0: 1, 1: 0, 2: 1 },
            3: { 0: 1, 1: 0, 2: 1 },
            4: { 0: 2, 1: 1 },
            5: { 0: 1, 1: 2 },
            6: { 0: 1, 1: 0 },
            7: { 0: 1, 1: 2 },
            8: { 0: 1, 1: 0 },
            9: { 0: 1, 1: 0 },
            10: { 0: 2, 1: 2 }
        };
        
        return quizAnswers[this.currentLesson] && quizAnswers[this.currentLesson][quizIndex] === selectedIndex;
    }
    
    getCorrectAnswer(quizIndex) {
        const quizAnswers = {
            1: { 0: 0, 1: 0, 2: 1, 3: 1, 4: 2, 5: 1, 6: 1, 7: 1, 8: 1, 9: 0, 10: 0 },
            2: { 0: 1, 1: 0, 2: 1 },
            3: { 0: 1, 1: 0, 2: 1 },
            4: { 0: 2, 1: 1 },
            5: { 0: 1, 1: 2 },
            6: { 0: 1, 1: 0 },
            7: { 0: 1, 1: 2 },
            8: { 0: 1, 1: 0 },
            9: { 0: 1, 1: 0 },
            10: { 0: 2, 1: 2 }
        };
        
        return quizAnswers[this.currentLesson] && quizAnswers[this.currentLesson][quizIndex] !== undefined 
            ? quizAnswers[this.currentLesson][quizIndex] 
            : 0;
    }
    
    getCorrectAnswerText(quizIndex) {
        const options = document.querySelectorAll(`[data-quiz-index="${quizIndex}"] span:last-child`);
        const correctIndex = this.getCorrectAnswer(quizIndex);
        return options[correctIndex] ? options[correctIndex].textContent : '';
    }
    
    async loadLesson(lessonNum) {
        this.currentLesson = lessonNum;
        this.currentPage = 0;
        
        document.querySelectorAll('.nav-list a').forEach(a => a.classList.remove('active'));
        document.querySelector(`[data-lesson="${lessonNum}"]`).classList.add('active');
        
        await this.loadCourseData();
        this.renderSlides();
        this.updateNavigation();
        
        const lessonTitles = {
            0: '考级标准',
            1: '第1课 数组',
            2: '第2课 数组进阶',
            3: '第3课 字符串1',
            4: '第4课 字符串2',
            5: '第5课 数制和编码1',
            6: '第6课 数制和编码2',
            7: '第7课 位运算1',
            8: '第8课 位运算2',
            9: '第9课 模拟算法',
            10: '第10课 枚举算法'
        };
        document.getElementById('lesson-title').textContent = `CCF-GESP C++三级 - ${lessonTitles[lessonNum] || '第' + lessonNum + '课'}`;
    }
    
    async loadLevel(level) {
        this.currentLevel = level;
        this.currentLesson = 1;
        this.currentPage = 0;
        
        await this.loadCourseData();
        this.renderSlides();
        this.updateNavigation();
    }
}

const coursePlayer = new CoursePlayer();