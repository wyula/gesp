# GESP 编程能力等级认证教学资源

基于 HTML5 的交互式课程学习平台，用于 CCF-GESP C++ 等级考试备考学习。

## 功能特性

- 📚 **交互式课程学习**：支持幻灯片式浏览，左右翻页切换内容
- 📝 **测验功能**：每课包含多个选择题，即时反馈答题结果和详细解析
- 🎤 **演示模式**：支持全屏演示，鼠标左键翻页，右键快速定位
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
├── lesson/             # 课程数据
│   ├── level1/         # C++ 一级课程
│   ├── level2/         # C++ 二级课程
│   ├── level3/         # C++ 三级课程
│   │   ├── lesson1/    # 第1课：数组
│   │   │   ├── index.html
│   │   │   ├── lesson.js
│   │   │   └── *.png   # 课程图片
│   │   ├── lesson2/    # 第2课：数组进阶
│   │   ├── lesson3/    # 第3课：字符串1
│   │   ├── lesson4/    # 第4课：字符串2
│   │   ├── lesson5/    # 第5课：数制与编码
│   │   ├── lesson6/    # 第6课：进制转换
│   │   ├── lesson7/    # 第7课：位运算1
│   │   ├── lesson8/    # 第8课：位运算2
│   │   ├── lesson9/    # 第9课：模拟算法
│   │   └── lesson10/   # 第10课：枚举算法
│   └── level4/         # C++ 四级课程
├── image/              # 全局图片资源
│   ├── bg.png          # 背景图片
│   ├── c++.png         # C++ 图标（网站图标）
│   └── gesp.png        # GESP Logo
├── pdf/                # PDF 课件（原始课件）
└── .gitignore          # Git 忽略配置
```

## 课程内容

### C++ 三级课程

| 课程 | 主题 | 主要知识点 |
|------|------|------------|
| 第1课 | 数组 | 数组定义、初始化、下标访问、遍历 |
| 第2课 | 数组进阶 | 数组存储、下标越界、数组操作 |
| 第3课 | 字符串1 | 字符数组、字符串函数、字符串操作 |
| 第4课 | 字符串2 | string 类、字符串常用操作函数 |
| 第5课 | 数制与编码 | 二进制、原码、反码、补码 |
| 第6课 | 进制转换 | 八进制、十六进制、进制转换 |
| 第7课 | 位运算1 | 按位与/或/异或/取反、位运算用途 |
| 第8课 | 位运算2 | 左移/右移、运算符优先级、复合赋值 |
| 第9课 | 模拟算法 | 算法概念、流程图、模拟思想 |
| 第10课 | 枚举算法 | 枚举思想、经典例题、实战演练 |

## 使用说明

### 快捷键

| 按键 | 功能 |
|------|------|
| **← / →** | 上一页 / 下一页 |
| **Home** | 跳转到第一页 |
| **End** | 跳转到最后一页 |
| **Esc** | 退出演示模式 |

### 演示模式

点击右上角「🎤 演示模式」按钮进入全屏演示，适合课堂教学使用。

#### 演示模式操作

| 操作 | 功能 |
|------|------|
| **鼠标左键点击** | 翻到下一页（点击题目选项和按钮时不翻页） |
| **鼠标右键点击** | 弹出页面导航器，快速跳转到指定页面 |
| **鼠标滚轮** | 向前滚动翻到上一页，向后滚动翻到下一页 |
| **Esc 键** | 退出全屏演示模式 |

### 题目交互

1. 点击选项选择答案
2. 点击「提交答案」按钮提交
3. 查看答题反馈和详细解析

## 开发说明

### 添加新课程

1. 在 `lesson/{level}/` 目录下创建新的课程文件夹（如 `lesson11/`）
2. 在文件夹中创建 `index.html` 和 `lesson.js` 文件
3. 在 `js/main.js` 的 `lessonTitles` 配置中添加课程标题

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

### 图片幻灯片格式

```html
<div class="slide">
    <div class="slide-image-container">
        <img src="1-图片名称.png" alt="图片描述" class="slide-image">
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
        <div class="quiz-analysis" id="analysis-0">详细解析内容</div>
    </div>
</div>
```

## 许可证

MIT License