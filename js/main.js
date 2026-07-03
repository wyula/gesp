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
            const response = await fetch(`data/${this.currentLevel}/lesson${this.currentLesson}.json`);
            if (!response.ok) {
                throw new Error(`加载课程数据失败: ${response.status}`);
            }
            this.slides = await response.json();
        } catch (error) {
            console.error('加载课程数据失败:', error);
            this.slides = [];
        }
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
            slideElement.innerHTML = this.generateSlideHTML(slide, index);
            container.appendChild(slideElement);
        });
        
        this.updateProgress();
    }
    
    generateSlideHTML(slide, index) {
        let content = '';
        
        switch (slide.type) {
            case 'title':
                content = `
                    <h1 class="slide-title">${slide.title}</h1>
                    ${slide.subtitle ? `<p style="text-align:center; color:#666; font-size:18px;">${slide.subtitle}</p>` : ''}
                    ${slide.author ? `<p style="text-align:center; color:#999; margin-top:20px;">${slide.author}</p>` : ''}
                `;
                break;
                
            case 'subtitle':
                content = `
                    <h2 class="slide-subtitle">${slide.title}</h2>
                    ${slide.content ? `<div class="slide-content">${this.processContent(slide.content)}</div>` : ''}
                `;
                break;
                
            case 'content':
                content = `
                    ${slide.title ? `<h2 class="slide-subtitle">${slide.title}</h2>` : ''}
                    <div class="slide-content">${this.processContent(slide.content)}</div>
                `;
                break;
                
            case 'code':
                content = `
                    ${slide.title ? `<h2 class="slide-subtitle">${slide.title}</h2>` : ''}
                    <div class="code-block">${this.highlightCode(slide.code)}</div>
                    ${slide.explanation ? `<div class="slide-content"><p><strong>说明：</strong>${slide.explanation}</p></div>` : ''}
                `;
                break;
                
            case 'quiz':
                content = `
                    <div class="quiz-container">
                        <div class="quiz-question">${slide.question}</div>
                        <div class="quiz-options">
                            ${slide.options.map((opt, i) => `
                                <div class="quiz-option" data-quiz-index="${index}" data-option="${i}" onclick="coursePlayer.selectQuizOption(this)">
                                    <span>${String.fromCharCode(65 + i)}</span>
                                    <span>${opt}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="quiz-feedback" id="feedback-${index}"></div>
                        <button class="btn-submit" id="submit-${index}" onclick="coursePlayer.submitQuiz(${index})" disabled>提交答案</button>
                    </div>
                `;
                break;
                
            case 'example':
                content = `
                    ${slide.title ? `<h2 class="slide-subtitle">${slide.title}</h2>` : ''}
                    <div class="example-box">
                        ${slide.description ? `<p>${slide.description}</p>` : ''}
                        ${slide.code ? `<div class="code-block">${this.highlightCode(slide.code)}</div>` : ''}
                    </div>
                `;
                break;
                
            case 'highlight':
                content = `
                    ${slide.title ? `<h2 class="slide-subtitle">${slide.title}</h2>` : ''}
                    <div class="highlight-box">${this.processContent(slide.content)}</div>
                `;
                break;
                
            case 'array':
                content = `
                    ${slide.title ? `<h2 class="slide-subtitle">${slide.title}</h2>` : ''}
                    <div class="slide-content">${this.processContent(slide.description)}</div>
                    <div class="array-visual">
                        <div class="array-box">
                            ${slide.values.map((val, i) => `
                                <div class="array-item">
                                    <div class="array-value">${val}</div>
                                    <div class="array-index">${i}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
                break;
                
            case 'two-column':
                content = `
                    ${slide.title ? `<h2 class="slide-subtitle">${slide.title}</h2>` : ''}
                    <div class="two-column">
                        ${slide.columns.map(col => `
                            <div class="info-card">
                                ${col.title ? `<h4>${col.title}</h4>` : ''}
                                ${col.content ? `<div class="slide-content">${this.processContent(col.content)}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                `;
                break;
                
            default:
                content = `
                    ${slide.title ? `<h2 class="slide-subtitle">${slide.title}</h2>` : ''}
                    <div class="slide-content">${this.processContent(slide.content || '')}</div>
                `;
        }
        
        return content;
    }
    
    processContent(content) {
        if (!content) return '';
        
        let result = content;
        
        result = result.replace(/\n\|(.*)\|\n\|[-|]+\|\n((?:\|.*\|\n?)+)/g, (match, header, body) => {
            const headerCells = header.split('|').map(cell => cell.trim()).filter(cell => cell);
            const bodyRows = body.trim().split('\n').map(row => {
                const cells = row.split('|').map(cell => cell.trim()).filter(cell => cell);
                return `<tr>${cells.map(cell => `<td>${cell}</td>`).join('')}</tr>`;
            }).join('');
            
            return `<table class="content-table"><thead><tr>${headerCells.map(cell => `<th>${cell}</th>`).join('')}</tr></thead><tbody>${bodyRows}</tbody></table>`;
        });
        
        result = result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        result = result.replace(/`([^`]+)`/g, '<code style="background:#f0f0f0;padding:2px 6px;border-radius:3px;">$1</code>');
        result = result.replace(/\n/g, '<br>');
        
        return result;
    }
    
    highlightCode(code) {
        const keywords = ['int', 'float', 'double', 'char', 'bool', 'void', 'string', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'return', 'include', 'using', 'namespace', 'std', 'cin', 'cout', 'endl', 'true', 'false', 'const', 'static', 'struct', 'class', 'public', 'private', 'protected'];
        
        return code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\/\/.*$/gm, '<span class="code-comment">$&</span>')
            .replace(/("[^"]*"|'[^']*')/g, '<span class="code-string">$1</span>')
            .replace(/\b(\d+)\b/g, '<span class="code-number">$1</span>')
            .replace(new RegExp(`\\b(${keywords.join('|')})\\b`, 'g'), '<span class="code-keyword">$1</span>');
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
        const slide = this.slides[quizIndex];
        const selectedOption = document.querySelector(`[data-quiz-index="${quizIndex}"].selected span:first-child`);
        
        if (!selectedOption) return;
        
        const selectedIndex = selectedOption.textContent.charCodeAt(0) - 65;
        const isCorrect = selectedIndex === slide.answer;
        
        const options = document.querySelectorAll(`[data-quiz-index="${quizIndex}"]`);
        options.forEach((opt, i) => {
            opt.classList.remove('selected');
            if (i === slide.answer) {
                opt.classList.add('correct');
            } else if (i === selectedIndex && !isCorrect) {
                opt.classList.add('incorrect');
            }
            opt.style.pointerEvents = 'none';
        });
        
        const feedback = document.getElementById(`feedback-${quizIndex}`);
        feedback.className = `quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        const correctAnswerText = slide.options[slide.answer];
        feedback.textContent = isCorrect ? '✅ 回答正确！' : `❌ 回答错误，正确答案是：${correctAnswerText}`;
        
        document.getElementById(`submit-${quizIndex}`).disabled = true;
        
        this.quizState[quizIndex] = isCorrect;
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