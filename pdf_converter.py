import os
import re
import json
import pdfplumber
from pathlib import Path

PDF_DIR = Path('/Volumes/docker/14554_gesp/app/pdf')
DATA_DIR = Path('/Volumes/docker/14554_gesp/app/data')

LEVELS = {
    'level1': '一级课程',
    'level2': '二级课程',
    'level3': '三级课程',
    'level4': '四级课程'
}

LESSON_TITLES = {
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
}

def extract_text_from_pdf(pdf_path):
    pages = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                pages.append(text.strip())
    return pages

def parse_slide_content(text):
    lines = text.split('\n')
    lines = [line.strip() for line in lines if line.strip()]
    
    title = None
    content = []
    code_blocks = []
    is_code = False
    code_lines = []
    
    for line in lines:
        if re.match(r'^\d+\.\s', line) or re.match(r'^[（(]\d+[)）]\s', line):
            content.append(f'<p>{line}</p>')
        elif re.match(r'^[A-D][．.)]\s', line):
            content.append(f'<p>{line}</p>')
        elif re.match(r'^[①②③④⑤⑥⑦⑧⑨⑩]\s', line):
            content.append(f'<p>{line}</p>')
        elif line.startswith('//') or line.startswith('#') or 'include' in line or 'using namespace' in line or 'int main' in line:
            is_code = True
            code_lines.append(line)
        elif is_code and (line.strip() == '' or line.strip() == '}' or line.strip().endswith(';') or line.strip().endswith('}')):
            code_lines.append(line)
            if line.strip() == '}' or (code_lines and code_lines[-2].strip() == '}'):
                code_blocks.append('\n'.join(code_lines))
                is_code = False
                code_lines = []
        elif is_code:
            code_lines.append(line)
        elif not title and len(line) < 50:
            title = line
        else:
            content.append(f'<p>{line}</p>')
    
    if code_lines:
        code_blocks.append('\n'.join(code_lines))
    
    return title, content, code_blocks

def is_question_page(text):
    patterns = [
        r'[（(]202[34]\s*年[69]\s*月[)）]',
        r'[（(]样题[)）]',
        r'真题解析',
        r'选择题',
        r'判断题',
        r'以下.*正确的是',
        r'下列.*错误的是',
        r'可以.*的是',
        r'符合.*语法的是',
        r'数组.*下标',
        r'长度为.*的数组',
        r'正确.*错误',
    ]
    for pattern in patterns:
        if re.search(pattern, text):
            return True
    return False

def parse_question(text):
    lines = text.split('\n')
    lines = [line.strip() for line in lines if line.strip()]
    
    question_text = ""
    options = []
    in_options = False
    is_true_false = False
    
    for line in lines:
        option_match = re.match(r'^([A-D])[．.)]\s*(.*)', line)
        if option_match:
            in_options = True
            options.append((option_match.group(1), option_match.group(2)))
        elif re.search(r'正确.*错误|错误.*正确', line):
            is_true_false = True
            options = [('A', '正确'), ('B', '错误')]
            parts = re.split(r'(正确|错误)', line)
            for part in parts:
                if part.strip() and part not in ['正确', '错误']:
                    question_text += part.strip() + ' '
        elif in_options:
            if len(options) > 0:
                options[-1] = (options[-1][0], options[-1][1] + ' ' + line)
            else:
                question_text += line + ' '
        else:
            question_text += line + ' '
    
    question_text = question_text.strip()
    question_text = re.sub(r'选择题\s*', '', question_text)
    question_text = re.sub(r'判断题\s*', '', question_text)
    question_text = re.sub(r'真题解析\s*', '', question_text)
    
    return {
        'question': question_text,
        'options': options,
        'analysis': generate_analysis(question_text, options)
    }

def generate_analysis(question_text, options):
    if '计算机' in question_text and '诞生' in question_text:
        return "【解析】世界上第一台电子数字计算机ENIAC诞生于1946年。中国第一台通用数字电子计算机103机诞生于1958年，确实比ENIAC晚了十多年。"
    if '微型计算机' in question_text and '集成电路' in question_text:
        return "【解析】微型计算机的问世主要得益于超大规模集成电路（VLSI）的出现，使得计算机体积大大缩小、性能大幅提升。"
    if '神威' in question_text and '太湖之光' in question_text:
        return "【解析】'神威·太湖之光'是中国自主研制的超级计算机，使用国产处理器，多次在全球超级计算机TOP500排行榜中位列第一。"
    if '数组' in question_text and '定义' in question_text:
        return "【解析】数组定义语法：数据类型 数组名[长度]。长度必须是大于0的整数常量。可以省略长度，但必须提供初始值列表。"
    if '数组' in question_text and '下标' in question_text:
        return "【解析】数组下标从0开始计数。长度为n的数组，下标范围是0到n-1。不能使用浮点数作为下标。"
    if '数组' in question_text and '初始化' in question_text:
        return "【解析】数组初始化使用花括号{}。如果初始值个数少于数组长度，剩余元素自动初始化为0。"
    if 'int' in question_text or 'double' in question_text or 'float' in question_text:
        return "【解析】int表示整型，double表示双精度浮点型，float表示单精度浮点型。数组元素类型必须一致。"
    if '循环' in question_text or 'for' in question_text:
        return "【解析】for循环是遍历数组的常用方式，循环变量从0到数组长度-1。"
    if '正确' in question_text or '错误' in question_text:
        return "【解析】请仔细阅读题目描述，结合所学知识判断正误。注意C++语言的语法规则和特性。"
    if '字符串' in question_text:
        return "【解析】字符串是以'\\0'结尾的字符数组。string类是C++标准库提供的字符串处理类，支持各种字符串操作。"
    return "【解析】本题考查相关知识点，请结合课堂内容进行分析。"

def generate_slide_html(title, content, code_blocks, is_question=False, question_data=None, slide_index=0):
    html_parts = []
    
    if is_question and question_data and len(question_data['options']) > 0:
        html_parts.append('<div class="slide">')
        html_parts.append('    <div class="quiz-container">')
        html_parts.append(f'        <div class="quiz-question">{question_data["question"]}</div>')
        html_parts.append('        <div class="quiz-options">')
        
        for i, (option_char, option_text) in enumerate(question_data['options']):
            html_parts.append(f'            <div class="quiz-option" data-quiz-index="{slide_index}" data-option="{i}" onclick="coursePlayer.selectQuizOption(this)">')
            html_parts.append(f'                <span>{option_char}</span>')
            html_parts.append(f'                <span>{option_text}</span>')
            html_parts.append('            </div>')
        
        html_parts.append('        </div>')
        html_parts.append(f'        <div class="quiz-feedback" id="feedback-{slide_index}"></div>')
        html_parts.append(f'        <button class="btn-submit" id="submit-{slide_index}" onclick="coursePlayer.submitQuiz({slide_index})" disabled>提交答案</button>')
        html_parts.append(f'        <div style="margin-top:15px;padding:15px;background:#e8f5e9;border-radius:8px;border-left:4px solid #4caf50;display:none;" id="analysis-{slide_index}">')
        html_parts.append(f'            {question_data["analysis"]}')
        html_parts.append('        </div>')
        html_parts.append('    </div>')
        html_parts.append('</div>')
    else:
        html_parts.append('<div class="slide">')
        
        if title:
            if '感谢' in title or '结束' in title or '总结' in title:
                html_parts.append(f'    <h1 class="slide-title">{title}</h1>')
            else:
                html_parts.append(f'    <h2 class="slide-subtitle-center">{title}</h2>')
        
        if content or code_blocks:
            html_parts.append('    <div class="slide-content">')
            
            for item in content:
                html_parts.append(f'        {item}')
            
            for code in code_blocks:
                html_parts.append('        <div class="code-block">')
                code_lines = code.split('\n')
                for code_line in code_lines:
                    if code_line.strip():
                        escaped = code_line.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                        html_parts.append(f'            {escaped}<br>')
                html_parts.append('        </div>')
            
            html_parts.append('    </div>')
        
        html_parts.append('</div>')
    
    return '\n'.join(html_parts)

def convert_lesson(pdf_path, level, lesson_num):
    print(f'正在转换: {pdf_path}')
    
    pages = extract_text_from_pdf(pdf_path)
    
    if not pages:
        print(f'警告：{pdf_path} 未能提取文本')
        return None
    
    slides_html = []
    quiz_index = 0
    
    for page_text in pages:
        is_q = is_question_page(page_text)
        
        if is_q:
            question_data = parse_question(page_text)
            if len(question_data['options']) > 0:
                slide_html = generate_slide_html(None, [], [], True, question_data, quiz_index)
                quiz_index += 1
            else:
                title, content, code_blocks = parse_slide_content(page_text)
                slide_html = generate_slide_html(title, content, code_blocks)
        else:
            title, content, code_blocks = parse_slide_content(page_text)
            slide_html = generate_slide_html(title, content, code_blocks)
        
        slides_html.append(slide_html)
    
    return '\n\n'.join(slides_html)

def main():
    for level, level_name in LEVELS.items():
        level_dir = PDF_DIR / level
        if not level_dir.exists():
            print(f'目录不存在: {level_dir}')
            continue
        
        output_dir = DATA_DIR / level
        output_dir.mkdir(parents=True, exist_ok=True)
        
        pdf_files = sorted(level_dir.glob('LESSON_*.pdf'))
        
        for pdf_file in pdf_files:
            match = re.match(r'LESSON_(\d+)', pdf_file.stem)
            if not match:
                continue
            
            lesson_num = int(match.group(1))
            
            html_content = convert_lesson(pdf_file, level, lesson_num)
            
            if html_content:
                output_file = output_dir / f'lesson{lesson_num}.html'
                output_file.write_text(html_content, encoding='utf-8')
                print(f'已生成: {output_file}')
    
    print('转换完成！')

if __name__ == '__main__':
    main()