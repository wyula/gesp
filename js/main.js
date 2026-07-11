class CoursePlayer {
    constructor() {
        this.currentLevel = 'level3';
        this.currentLesson = 1;
        this.currentPage = 0;
        this.slides = [];
        this.isPresentationMode = false;
        this.isContextMenuVisible = false;
        this.quizState = {};
        this.lessonData = null;
        this.progressData = this.loadProgress();
        this.restoreLastProgress();
        
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
        
        if (this.currentPage >= this.slides.length) {
            this.currentPage = Math.max(0, this.slides.length - 1);
        }
        this.goToPage(this.currentPage);
        
        this.updateSidebarProgress();
    }
    
    async loadCourseData() {
        try {
            const [htmlResponse, jsResponse] = await Promise.all([
                fetch(`lesson/${this.currentLevel}/lesson${this.currentLesson}/index.html`),
                fetch(`lesson/${this.currentLevel}/lesson${this.currentLesson}/lesson.js`)
            ]);
            
            if (!htmlResponse.ok) {
                throw new Error(`加载课程数据失败: ${htmlResponse.status}`);
            }
            
            const htmlContent = await htmlResponse.text();
            this.slides = this.parseHTMLSlides(htmlContent);
            
            if (jsResponse.ok) {
                const jsContent = await jsResponse.text();
                const script = document.createElement('script');
                script.textContent = jsContent;
                document.head.appendChild(script);
                document.head.removeChild(script);
                this.lessonData = window.lessonData || null;
            } else {
                this.lessonData = null;
            }
        } catch (error) {
            console.error('加载课程数据失败:', error);
            this.slides = [];
            this.lessonData = null;
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
        
        if (typeof hljs !== 'undefined') {
            hljs.highlightAll();
            this.addCopyButtons();
        }
        
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
            a.dataset.level = this.currentLevel;
            a.classList.add('lesson-item');
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
        document.getElementById('btn-presentation').addEventListener('click', () => this.enterPresentation());
        
        document.addEventListener('keydown', (e) => {
            if (this.isPresentationMode && e.key === 'Escape') {
                e.preventDefault();
                this.exitPresentation();
            } else if (!e.target.closest('input, textarea')) {
                if (e.key === 'ArrowLeft') this.prevPage();
                else if (e.key === 'ArrowRight') this.nextPage();
                else if (e.key === 'Home') this.goToPage(0);
                else if (e.key === 'End') this.goToPage(this.slides.length - 1);
            }
        });
        
        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement && this.isPresentationMode) {
                this.exitPresentation();
            }
        });
        
        document.addEventListener('webkitfullscreenchange', () => {
            if (!document.webkitFullscreenElement && this.isPresentationMode) {
                this.exitPresentation();
            }
        });
        
        document.addEventListener('click', (e) => {
            const isInMenu = e.target.closest('.normal-context-menu');
            const isInDialog = e.target.closest('.go-to-page-dialog');
            const menuWasVisible = this.isContextMenuVisible;
            
            if (!isInMenu && !isInDialog) {
                this.hideNormalContextMenu();
            }
            if (this.isPresentationMode && !menuWasVisible && !isInMenu && !isInDialog && !e.target.closest('.quiz-option') && !e.target.closest('.btn-submit')) {
                this.nextPage();
            }
        });
        
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showNormalContextMenu(e.clientX, e.clientY);
        });
        
        document.addEventListener('wheel', (e) => {
            if (this.isPresentationMode) {
                e.preventDefault();
                if (e.deltaY > 0) {
                    this.nextPage();
                } else {
                    this.prevPage();
                }
            }
        }, { passive: false });
    }
    
    showNormalContextMenu(x, y) {
        let menu = document.getElementById('normal-context-menu');
        if (!menu) {
            menu = document.createElement('div');
            menu.id = 'normal-context-menu';
            menu.className = 'normal-context-menu';
            document.body.appendChild(menu);
        }
        
        let pagesHtml = '<div class="context-submenu" id="context-submenu">';
        const cols = 5;
        const rows = Math.ceil(this.slides.length / cols);
        for (let r = 0; r < rows; r++) {
            pagesHtml += '<div class="context-submenu-row">';
            for (let c = 0; c < cols; c++) {
                const idx = r * cols + c;
                if (idx < this.slides.length) {
                    const activeClass = idx === this.currentPage ? 'context-submenu-item-active' : '';
                    pagesHtml += `<div class="context-submenu-item ${activeClass}" onclick="coursePlayer.goToPage(${idx}); coursePlayer.hideNormalContextMenu()">${idx + 1}</div>`;
                }
            }
            pagesHtml += '</div>';
        }
        pagesHtml += '</div>';
        
        const exitItem = this.isPresentationMode 
            ? `<div class="context-menu-divider"></div><div class="context-menu-item context-menu-item-danger" onclick="coursePlayer.hideNormalContextMenu(); coursePlayer.exitPresentation()">🚪 退出全屏</div>`
            : `<div class="context-menu-divider"></div><div class="context-menu-item context-menu-item-primary" onclick="coursePlayer.hideNormalContextMenu(); coursePlayer.enterPresentation()">🎤 演示模式</div>`;
        
        menu.innerHTML = `
            <div class="context-menu-item" onclick="coursePlayer.prevPage(); coursePlayer.hideNormalContextMenu()">◀ 上一页</div>
            <div class="context-menu-item" onclick="coursePlayer.nextPage(); coursePlayer.hideNormalContextMenu()">▶ 下一页</div>
            <div class="context-menu-divider"></div>
            <div class="context-menu-item context-menu-item-has-sub" id="context-menu-has-sub">📄 跳转到页面 <span class="context-menu-arrow">›</span>${pagesHtml}</div>
            ${exitItem}
        `;
        
        const rect = menu.getBoundingClientRect();
        const maxX = window.innerWidth - rect.width;
        const maxY = window.innerHeight - rect.height;
        menu.style.left = Math.min(x, maxX) + 'px';
        menu.style.top = Math.min(y, maxY) + 'px';
        menu.style.display = 'block';
        this.isContextMenuVisible = true;
        
        this.setupSubmenuEvents();
    }
    
    setupSubmenuEvents() {
        const parentItem = document.getElementById('context-menu-has-sub');
        const submenu = document.getElementById('context-submenu');
        if (!parentItem || !submenu) return;
        
        const showSubmenu = () => {
            if (this.submenuHideTimer) {
                clearTimeout(this.submenuHideTimer);
                this.submenuHideTimer = null;
            }
            submenu.classList.add('visible');
        };
        
        const hideSubmenu = () => {
            this.submenuHideTimer = setTimeout(() => {
                submenu.classList.remove('visible');
                this.submenuHideTimer = null;
            }, 200);
        };
        
        parentItem.addEventListener('mouseenter', showSubmenu);
        parentItem.addEventListener('mouseleave', hideSubmenu);
        submenu.addEventListener('mouseenter', showSubmenu);
        submenu.addEventListener('mouseleave', hideSubmenu);
    }
    
    hideNormalContextMenu() {
        const menu = document.getElementById('normal-context-menu');
        if (menu) {
            menu.style.display = 'none';
        }
        const submenu = document.getElementById('context-submenu');
        if (submenu) {
            submenu.classList.remove('visible');
        }
        if (this.submenuHideTimer) {
            clearTimeout(this.submenuHideTimer);
            this.submenuHideTimer = null;
        }
        this.isContextMenuVisible = false;
    }
    
    showGoToPageDialog() {
        let dialog = document.getElementById('go-to-page-dialog');
        if (!dialog) {
            dialog = document.createElement('div');
            dialog.id = 'go-to-page-dialog';
            dialog.className = 'go-to-page-dialog';
            document.body.appendChild(dialog);
        }
        
        dialog.innerHTML = `
            <div class="dialog-overlay" onclick="coursePlayer.hideGoToPageDialog()"></div>
            <div class="dialog-content">
                <h3>跳转到页面</h3>
                <p>当前第 ${this.currentPage + 1} / ${this.slides.length} 页</p>
                <input type="number" id="page-input" min="1" max="${this.slides.length}" value="${this.currentPage + 1}">
                <div class="dialog-buttons">
                    <button class="btn-cancel" onclick="coursePlayer.hideGoToPageDialog()">取消</button>
                    <button class="btn-confirm" onclick="coursePlayer.goToPageInput()">确定</button>
                </div>
            </div>
        `;
        
        dialog.style.display = 'flex';
        setTimeout(() => {
            document.getElementById('page-input').focus();
        }, 100);
    }
    
    hideGoToPageDialog() {
        const dialog = document.getElementById('go-to-page-dialog');
        if (dialog) {
            dialog.style.display = 'none';
        }
    }
    
    goToPageInput() {
        const input = document.getElementById('page-input');
        if (input) {
            const pageNum = parseInt(input.value) - 1;
            if (!isNaN(pageNum) && pageNum >= 0 && pageNum < this.slides.length) {
                this.goToPage(pageNum);
            }
        }
        this.hideGoToPageDialog();
    }
    
    goToPage(pageNum) {
        if (pageNum < 0 || pageNum >= this.slides.length) return;
        
        document.querySelectorAll('.slide').forEach((slide, index) => {
            slide.classList.toggle('active', index === pageNum);
        });
        
        this.currentPage = pageNum;
        this.updateNavigation();
        this.updateProgress();
        this.updateProgressRecord();
        
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
    
    addCopyButtons() {
        document.querySelectorAll('.slide pre').forEach(pre => {
            if (pre.querySelector('.copy-btn')) return;
            
            const btn = document.createElement('button');
            btn.className = 'copy-btn';
            btn.innerHTML = '📋 复制';
            btn.onclick = async () => {
                const code = pre.querySelector('code').textContent;
                const cleanCode = code.split('\n').map(line => {
                    return line.replace(/^\d+\s*/, '');
                }).join('\n');
                try {
                    await navigator.clipboard.writeText(cleanCode);
                    btn.textContent = '✓ 已复制';
                    btn.classList.add('copied');
                    setTimeout(() => {
                        btn.textContent = '📋 复制';
                        btn.classList.remove('copied');
                    }, 2000);
                } catch (err) {
                    console.error('复制失败:', err);
                }
            };
            pre.appendChild(btn);
            
            this.addLineNumbers(pre);
        });
    }
    
    addLineNumbers(pre) {
        const code = pre.querySelector('code');
        if (!code) return;
        
        const lines = code.innerHTML.split('\n');
        const numberedLines = lines.map((line, index) => {
            const lineNum = index + 1;
            return `<span class="line-number">${lineNum}</span>${line || ' '}`;
        });
        code.innerHTML = numberedLines.join('\n');
    }
    
    enterPresentation() {
        this.isPresentationMode = true;
        const sidebar = document.querySelector('.sidebar');
        
        sidebar.style.display = 'none';
        this.hideNormalContextMenu();
        
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen();
        }
    }
    
    exitPresentation() {
        this.isPresentationMode = false;
        const sidebar = document.querySelector('.sidebar');
        
        sidebar.style.display = 'block';
        this.hideNormalContextMenu();
        
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
    
    loadProgress() {
        try {
            const data = localStorage.getItem('gesp_progress');
            return data ? JSON.parse(data) : {
                lastLevel: 'level3',
                lastLesson: 1,
                lastPage: 0,
                visited: {},
                quizResults: {}
            };
        } catch (e) {
            return {
                lastLevel: 'level3',
                lastLesson: 1,
                lastPage: 0,
                visited: {},
                quizResults: {}
            };
        }
    }
    
    saveProgress() {
        try {
            localStorage.setItem('gesp_progress', JSON.stringify(this.progressData));
        } catch (e) {
            console.error('Failed to save progress:', e);
        }
    }
    
    updateProgressRecord() {
        const key = `${this.currentLevel}_lesson${this.currentLesson}`;
        if (!this.progressData.visited[key]) {
            this.progressData.visited[key] = [];
        }
        if (!this.progressData.visited[key].includes(this.currentPage)) {
            this.progressData.visited[key].push(this.currentPage);
            this.progressData.visited[key].sort((a, b) => a - b);
        }
        
        if (!this.progressData.pageCounts) {
            this.progressData.pageCounts = {};
        }
        this.progressData.pageCounts[key] = this.slides.length;
        
        this.progressData.lastLevel = this.currentLevel;
        this.progressData.lastLesson = this.currentLesson;
        this.progressData.lastPage = this.currentPage;
        
        this.saveProgress();
        this.updateSidebarProgress();
    }
    
    restoreLastProgress() {
        if (this.progressData && this.progressData.lastLevel) {
            this.currentLevel = this.progressData.lastLevel;
            this.currentLesson = this.progressData.lastLesson;
            this.currentPage = this.progressData.lastPage || 0;
        }
    }
    
    saveQuizResult(quizIndex, answer, isCorrect) {
        const key = `${this.currentLevel}_lesson${this.currentLesson}_q${quizIndex}`;
        this.progressData.quizResults[key] = {
            answer: answer,
            correct: isCorrect,
            timestamp: Date.now()
        };
        this.saveProgress();
    }
    
    getQuizResult(quizIndex) {
        const key = `${this.currentLevel}_lesson${this.currentLesson}_q${quizIndex}`;
        return this.progressData.quizResults[key] || null;
    }
    
    updateSidebarProgress() {
        document.querySelectorAll('.lesson-item').forEach(item => {
            const level = item.dataset.level;
            const lesson = parseInt(item.dataset.lesson);
            const key = `${level}_lesson${lesson}`;
            const visited = this.progressData.visited[key] || [];
            const totalPages = this.progressData.pageCounts ? this.progressData.pageCounts[key] || 0 : 0;
            
            const progress = totalPages > 0 ? Math.round((visited.length / totalPages) * 100) : 0;
            
            let progressEl = item.querySelector('.lesson-progress');
            if (!progressEl) {
                progressEl = document.createElement('span');
                progressEl.className = 'lesson-progress';
                item.appendChild(progressEl);
            }
            progressEl.textContent = progress > 0 ? `${progress}%` : '';
        });
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
        
        const answerText = selectedOption.textContent;
        this.saveQuizResult(quizIndex, answerText, isCorrect);
    }
    
    isQuizCorrect(quizIndex, selectedIndex) {
        if (!this.lessonData || !this.lessonData.answers) return false;
        return this.lessonData.answers[quizIndex] !== undefined && this.lessonData.answers[quizIndex] === selectedIndex;
    }
    
    getCorrectAnswer(quizIndex) {
        if (!this.lessonData || !this.lessonData.answers) return 0;
        return this.lessonData.answers[quizIndex] !== undefined ? this.lessonData.answers[quizIndex] : 0;
    }
    
    getCorrectAnswerText(quizIndex) {
        const options = document.querySelectorAll(`[data-quiz-index="${quizIndex}"] span:last-child`);
        const correctIndex = this.getCorrectAnswer(quizIndex);
        return options[correctIndex] ? options[correctIndex].textContent : '';
    }
    
    async loadLesson(lessonNum) {
        this.updateProgressRecord();
        
        this.currentLesson = lessonNum;
        
        const key = `${this.currentLevel}_lesson${lessonNum}`;
        const savedPage = this.progressData.visited[key] ? Math.min(this.progressData.lastPage, this.slides.length - 1) : 0;
        this.currentPage = savedPage;
        
        document.querySelectorAll('.nav-list a').forEach(a => a.classList.remove('active'));
        const activeLink = document.querySelector(`[data-lesson="${lessonNum}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
        
        await this.loadCourseData();
        this.renderSlides();
        
        if (this.currentPage >= this.slides.length) {
            this.currentPage = Math.max(0, this.slides.length - 1);
        }
        
        this.goToPage(this.currentPage);
        
        const titles = this.lessonTitles[this.currentLevel];
        const levelName = this.levelNames[this.currentLevel];
        document.getElementById('lesson-title').textContent = `CCF-GESP C++${levelName} - ${titles[lessonNum] || '第' + lessonNum + '课'}`;
        
        this.updateSidebarProgress();
    }
    
    async loadLevel(level) {
        this.updateProgressRecord();
        
        this.currentLevel = level;
        this.currentLesson = 1;
        
        const key = `${level}_lesson1`;
        const savedPage = this.progressData.visited[key] ? Math.min(this.progressData.lastPage, this.slides.length - 1) : 0;
        this.currentPage = savedPage;
        
        document.querySelectorAll('.course-tab').forEach(tab => tab.classList.remove('active'));
        const activeTab = document.querySelector(`.course-tab[onclick="coursePlayer.loadLevel('${level}')"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
        
        await this.loadCourseData();
        this.renderSlides();
        this.renderNav();
        
        if (this.currentPage >= this.slides.length) {
            this.currentPage = Math.max(0, this.slides.length - 1);
        }
        
        this.goToPage(this.currentPage);
        
        const titles = this.lessonTitles[this.currentLevel];
        const levelName = this.levelNames[this.currentLevel];
        document.getElementById('lesson-title').textContent = `CCF-GESP C++${levelName} - ${titles[1] || '第1课'}`;
        
        this.updateSidebarProgress();
    }
}

const coursePlayer = new CoursePlayer();