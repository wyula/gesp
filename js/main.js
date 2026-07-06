class CoursePlayer {
    constructor() {
        this.currentLevel = 'level3';
        this.currentLesson = 1;
        this.currentPage = 0;
        this.slides = [];
        this.isPresentationMode = false;
        this.quizState = {};
        
        this.lessonTitles = {
            'level1': {
                0: '考级标准',
                1: '第1课 C++语言入门',
                2: '第2课 变量和数据类型',
                3: '第3课 运算符和表达式',
                4: '第4课 输入输出',
                5: '第5课 选择结构',
                6: '第6课 循环结构',
                7: '第7课 函数基础',
                8: '第8课 函数进阶',
                9: '第9课 综合练习',
                10: '第10课 模拟考试'
            },
            'level2': {
                0: '考级标准',
                1: '第1课 分支结构进阶',
                2: '第2课 循环结构进阶',
                3: '第3课 函数递归',
                4: '第4课 数组基础',
                5: '第5课 数组进阶',
                6: '第6课 字符串处理',
                7: '第7课 结构体',
                8: '第8课 文件操作',
                9: '第9课 综合练习',
                10: '第10课 模拟考试'
            },
            'level3': {
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
            },
            'level4': {
                0: '考级标准',
                1: '第1课 指针基础',
                2: '第2课 指针进阶',
                3: '第3课 动态数组',
                4: '第4课 链表基础',
                5: '第5课 链表进阶',
                6: '第6课 栈和队列',
                7: '第7课 二叉树基础',
                8: '第8课 二叉树遍历',
                9: '第9课 图论基础',
                10: '第10课 排序算法',
                11: '第11课 查找算法',
                12: '第12课 贪心算法',
                13: '第13课 动态规划入门',
                14: '第14课 综合练习',
                15: '第15课 模拟考试',
                16: '第16课 真题讲解',
                17: '第17课 考前冲刺',
                18: '第18课 复习总结'
            }
        };
        
        this.levelNames = {
            'level1': '一级',
            'level2': '二级',
            'level3': '三级',
            'level4': '四级'
        };
        
        this.init();
    }
    
    async init() {
        await this.loadCourseData();
        this.renderSlides();
        this.renderNav();
        this.setupEventListeners();
        this.updateNavigation();
    }
    
    async loadCourseData() {
        try {
            const response = await fetch(`data/${this.currentLevel}/lesson${this.currentLesson}/index.html`);
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
    
    renderNav() {
        const navList = document.getElementById('nav-list');
        navList.innerHTML = '';
        
        const titles = this.lessonTitles[this.currentLevel];
        if (!titles) return;
        
        Object.keys(titles).forEach(lessonNum => {
            const num = parseInt(lessonNum);
            const title = titles[num];
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#';
            a.dataset.lesson = num;
            a.textContent = title;
            a.onclick = (e) => {
                e.preventDefault();
                this.loadLesson(num);
            };
            if (num === this.currentLesson) {
                a.classList.add('active');
            }
            li.appendChild(a);
            navList.appendChild(li);
        });
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
        
        const analysis = document.getElementById(`analysis-${quizIndex}`);
        if (analysis) {
            analysis.style.display = 'block';
        }
        
        this.quizState[quizIndex] = isCorrect;
    }
    
    isQuizCorrect(quizIndex, selectedIndex) {
        const quizAnswers = {
            'level1': {
                1: { 0: 2, 1: 0, 2: 0, 3: 0 },
                2: { 0: 0 },
                3: { 0: 0 },
                4: { 0: 0 },
                5: { 0: 0 },
                6: { 0: 0 },
                7: { 0: 0 },
                8: { 0: 0 },
                9: { 0: 0 },
                10: { 0: 0 }
            },
            'level2': {
                1: { 0: 0 },
                2: { 0: 0 },
                3: { 0: 0 },
                4: { 0: 0 },
                5: { 0: 0 },
                6: { 0: 0 },
                7: { 0: 0 },
                8: { 0: 0 },
                9: { 0: 0 },
                10: { 0: 0 }
            },
            'level3': {
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
            },
            'level4': {
                1: { 0: 0 },
                2: { 0: 0 },
                3: { 0: 0 },
                4: { 0: 0 },
                5: { 0: 0 },
                6: { 0: 0 },
                7: { 0: 0 },
                8: { 0: 0 },
                9: { 0: 0 },
                10: { 0: 0 },
                11: { 0: 0 },
                12: { 0: 0 },
                13: { 0: 0 },
                14: { 0: 0 },
                15: { 0: 0 },
                16: { 0: 0 },
                17: { 0: 0 },
                18: { 0: 0 }
            }
        };
        
        const levelAnswers = quizAnswers[this.currentLevel];
        if (!levelAnswers) return false;
        
        const lessonAnswers = levelAnswers[this.currentLesson];
        if (!lessonAnswers) return false;
        
        return lessonAnswers[quizIndex] !== undefined && lessonAnswers[quizIndex] === selectedIndex;
    }
    
    getCorrectAnswer(quizIndex) {
        const quizAnswers = {
            'level1': {
                1: { 0: 2, 1: 0, 2: 0, 3: 0 },
                2: { 0: 0 },
                3: { 0: 0 },
                4: { 0: 0 },
                5: { 0: 0 },
                6: { 0: 0 },
                7: { 0: 0 },
                8: { 0: 0 },
                9: { 0: 0 },
                10: { 0: 0 }
            },
            'level2': {
                1: { 0: 0 },
                2: { 0: 0 },
                3: { 0: 0 },
                4: { 0: 0 },
                5: { 0: 0 },
                6: { 0: 0 },
                7: { 0: 0 },
                8: { 0: 0 },
                9: { 0: 0 },
                10: { 0: 0 }
            },
            'level3': {
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
            },
            'level4': {
                1: { 0: 0 },
                2: { 0: 0 },
                3: { 0: 0 },
                4: { 0: 0 },
                5: { 0: 0 },
                6: { 0: 0 },
                7: { 0: 0 },
                8: { 0: 0 },
                9: { 0: 0 },
                10: { 0: 0 },
                11: { 0: 0 },
                12: { 0: 0 },
                13: { 0: 0 },
                14: { 0: 0 },
                15: { 0: 0 },
                16: { 0: 0 },
                17: { 0: 0 },
                18: { 0: 0 }
            }
        };
        
        const levelAnswers = quizAnswers[this.currentLevel];
        if (!levelAnswers) return 0;
        
        const lessonAnswers = levelAnswers[this.currentLesson];
        if (!lessonAnswers) return 0;
        
        return lessonAnswers[quizIndex] !== undefined ? lessonAnswers[quizIndex] : 0;
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
        const activeLink = document.querySelector(`[data-lesson="${lessonNum}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
        
        await this.loadCourseData();
        this.renderSlides();
        this.updateNavigation();
        
        const titles = this.lessonTitles[this.currentLevel];
        const levelName = this.levelNames[this.currentLevel];
        document.getElementById('lesson-title').textContent = `CCF-GESP C++${levelName} - ${titles[lessonNum] || '第' + lessonNum + '课'}`;
    }
    
    async loadLevel(level) {
        this.currentLevel = level;
        this.currentLesson = 1;
        this.currentPage = 0;
        
        document.querySelectorAll('.course-tab').forEach(tab => tab.classList.remove('active'));
        const activeTab = document.querySelector(`.course-tab[onclick="coursePlayer.loadLevel('${level}')"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
        
        await this.loadCourseData();
        this.renderSlides();
        this.renderNav();
        this.updateNavigation();
        
        const titles = this.lessonTitles[this.currentLevel];
        const levelName = this.levelNames[this.currentLevel];
        document.getElementById('lesson-title').textContent = `CCF-GESP C++${levelName} - ${titles[1] || '第1课'}`;
    }
}

const coursePlayer = new CoursePlayer();