# GESP 编程能力等级认证教学资源

基于 HTML5 的交互式课程学习平台，用于 CCF-GESP C++ 等级考试备考学习。

## 功能特性

- 📚 **交互式课程学习**：支持幻灯片式浏览，左右翻页切换内容
- 📝 **测验功能**：每课包含多个选择题，即时反馈答题结果
- 🎤 **演示模式**：支持全屏演示，自动隐藏光标
- 📱 **响应式设计**：适配不同屏幕尺寸
- 💾 **本地运行**：无需服务器，直接打开即可使用

## 技术栈

- **前端框架**：原生 HTML5 + CSS3 + JavaScript
- **样式设计**：响应式布局，现代化 UI 设计
- **数据格式**：HTML5 格式存储课程内容，所见即所得

## 快速开始

### 方式一：本地直接打开

直接用浏览器打开 `index.html` 文件即可运行。

> **注意**：部分浏览器在 `file://` 协议下可能会限制本地文件加载。建议使用方式二。

### 方式二：本地服务器运行

```bash
# 使用 Python 启动本地服务器
python3 -m http.server 8000

# 或使用 Node.js
npx serve

# 然后在浏览器访问 http://localhost:8000
```

## 项目结构

```
gesp/
├── index.html          # 主页面入口
├── css/
│   └── main.css        # 全局样式
├── js/
│   └── main.js         # 核心逻辑
├── data/               # 课程数据
│   └── level3/         # C++ 三级课程
│       ├── lesson1.html   # 第1课：数组
│       ├── lesson2.html   # 第2课：数组进阶
│       ├── lesson3.html   # 第3课：字符串1
│       ├── lesson4.html   # 第4课：字符串2
│       ├── lesson5.html   # 第5课：枚举算法
│       ├── lesson6.html   # 第6课：模拟算法
│       ├── lesson7.html   # 第7课：函数进阶
│       ├── lesson8.html   # 第8课：位运算
│       ├── lesson9.html   # 第9课：数制转换
│       └── lesson10.html  # 第10课：综合复习
├── assets/
│   └── image/          # 图片资源
├── pdf/                # PDF 课件
└── .gitignore          # Git 忽略配置
```

## 课程内容

| 课程 | 主题 | 主要知识点 |
|------|------|------------|
| 第1课 | 数组 | 数组定义、初始化、下标访问 |
| 第2课 | 数组进阶 | 数组操作、排序算法 |
| 第3课 | 字符串1 | 字符数组、字符串函数 |
| 第4课 | 字符串2 | string 类、字符串操作 |
| 第5课 | 枚举算法 | 枚举思想、经典例题 |
| 第6课 | 模拟算法 | 模拟思想、实战演练 |
| 第7课 | 函数进阶 | 参数传递、函数重载、递归 |
| 第8课 | 位运算 | 按位与/或/异或、移位运算 |
| 第9课 | 数制转换 | 十进制、二进制、八进制、十六进制 |
| 第10课 | 综合复习 | 真题演练、考试技巧 |

## 使用说明

### 快捷键

- **← / →**：上一页 / 下一页
- **Home**：跳转到第一页
- **End**：跳转到最后一页
- **Esc**：退出演示模式

### 演示模式

点击右上角「演示模式」按钮进入全屏演示，适合课堂教学使用。

## 开发说明

### 添加新课程

1. 在 `data/level3/` 目录下创建新的 HTML 文件
2. 使用 `.slide` 类定义幻灯片内容
3. 在 `js/main.js` 的 `loadLesson` 方法中添加课程标题

### 课程内容格式

```html
<div class="slide">
    <h2 class="slide-subtitle">标题</h2>
    <div class="slide-content">
        <p>内容文本</p>
        <div class="code-block">
            // 代码块
        </div>
    </div>
</div>
```

### 添加测验

```html
<div class="slide">
    <div class="quiz-container">
        <div class="quiz-question">问题描述</div>
        <div class="quiz-options">
            <div class="quiz-option" data-quiz-index="0" data-option="0" onclick="coursePlayer.selectQuizOption(this)">
                <span>A</span>
                <span>选项内容</span>
            </div>
        </div>
        <div class="quiz-feedback" id="feedback-0"></div>
        <button class="btn-submit" id="submit-0" onclick="coursePlayer.submitQuiz(0)" disabled>提交答案</button>
    </div>
</div>
```

## 许可证

MIT License