import pdfplumber
import os
import re

BASE_DIR = '/Volumes/webdav.wyula.i234.me/docker/14554_gesp/app/pdf/gesp真题'

def extract_pdf_text(pdf_path):
    try:
        pdf = pdfplumber.open(pdf_path)
        pages = []
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                pages.append(text)
        return '\n'.join(pages)
    except Exception as e:
        print(f"Error reading {pdf_path}: {e}")
        return ""

def clean_text(text):
    text = re.sub(r'\n(\d+)\n', '\n', text)
    text = re.sub(r'\n(\d+)(?=\n)', '\n', text)
    return text

def parse_single_choice(text):
    questions = []
    lines = text.split('\n')
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        match = re.match(r'^第\s*(\d+)\s*题', line)
        if match:
            q_number = match.group(1)
            q_content = re.sub(r'^第\s*\d+\s*题\s*', '', line)
            i += 1
            options = []
            while i < len(lines):
                next_line = lines[i].strip()
                if next_line.startswith('A'):
                    options.append(next_line)
                    i += 1
                elif next_line.startswith('B'):
                    options.append(next_line)
                    i += 1
                elif next_line.startswith('C'):
                    options.append(next_line)
                    i += 1
                elif next_line.startswith('D'):
                    options.append(next_line)
                    i += 1
                elif re.match(r'^第\s*\d+\s*题', next_line):
                    break
                elif next_line:
                    q_content += next_line
                    i += 1
                else:
                    i += 1
            questions.append({
                'number': q_number,
                'content': q_content.strip(),
                'options': options
            })
        elif re.match(r'^\d+\.\s', line):
            q_number = re.match(r'^(\d+)\.\s', line).group(1)
            q_content = re.sub(r'^\d+\.\s*', '', line)
            i += 1
            options = []
            while i < len(lines):
                next_line = lines[i].strip()
                if next_line.startswith('A'):
                    options.append(next_line)
                    i += 1
                elif next_line.startswith('B'):
                    options.append(next_line)
                    i += 1
                elif next_line.startswith('C'):
                    options.append(next_line)
                    i += 1
                elif next_line.startswith('D'):
                    options.append(next_line)
                    i += 1
                elif re.match(r'^\d+\.\s', next_line):
                    break
                elif next_line:
                    q_content += next_line
                    i += 1
                else:
                    i += 1
            questions.append({
                'number': q_number,
                'content': q_content.strip(),
                'options': options
            })
        else:
            i += 1
    return questions

def parse_true_false(text):
    questions = []
    lines = text.split('\n')
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        match = re.match(r'^第\s*(\d+)\s*题', line)
        if match:
            q_number = match.group(1)
            q_content = re.sub(r'^第\s*\d+\s*题\s*', '', line)
            i += 1
            while i < len(lines):
                next_line = lines[i].strip()
                if re.match(r'^第\s*\d+\s*题', next_line):
                    break
                elif next_line:
                    q_content += next_line
                    i += 1
                else:
                    i += 1
            questions.append({
                'number': q_number,
                'content': q_content.strip()
            })
        elif re.match(r'^\d+\.\s', line):
            q_number = re.match(r'^(\d+)\.\s', line).group(1)
            q_content = re.sub(r'^\d+\.\s*', '', line)
            i += 1
            while i < len(lines):
                next_line = lines[i].strip()
                if re.match(r'^\d+\.\s', next_line):
                    break
                elif next_line:
                    q_content += next_line
                    i += 1
                else:
                    i += 1
            questions.append({
                'number': q_number,
                'content': q_content.strip()
            })
        else:
            i += 1
    return questions

def extract_answer_key(text):
    single_choice_answers = ""
    true_false_answers = ""
    
    answer_lines = re.findall(r'答案\s+([ABCD\s]+)', text)
    if answer_lines:
        single_choice_answers = ''.join(answer_lines[0].split())
    
    tf_answer_lines = re.findall(r'答案\s+([√×\s]+)', text)
    if tf_answer_lines:
        true_false_answers = ''.join(tf_answer_lines[0].split())
    
    return single_choice_answers, true_false_answers

def generate_objective_file(pdf_path, pdf_text):
    dir_name = os.path.dirname(pdf_path)
    base_name = os.path.basename(pdf_path).replace('.pdf', '')
    obj_file = os.path.join(dir_name, f"{base_name}_客观题.txt")
    
    pdf_text = clean_text(pdf_text)
    
    single_start = pdf_text.find('一、单选题')
    tf_start = pdf_text.find('二、判断题')
    program_start = pdf_text.find('三、编程题')
    
    if single_start == -1:
        single_start = pdf_text.find('单选题')
    if single_start == -1:
        single_start = pdf_text.find('1 单选题')
    if tf_start == -1:
        tf_start = pdf_text.find('判断题')
    if tf_start == -1:
        tf_start = pdf_text.find('2 判断题')
    if program_start == -1:
        program_start = pdf_text.find('编程题')
    if program_start == -1:
        program_start = pdf_text.find('3 编程题')
    if program_start == -1:
        program_start = len(pdf_text)
    
    single_text = pdf_text[single_start:tf_start] if tf_start > single_start else pdf_text[single_start:program_start]
    tf_text = pdf_text[tf_start:program_start] if tf_start > 0 else ""
    
    single_questions = parse_single_choice(single_text)
    tf_questions = parse_true_false(tf_text)
    
    content = ""
    for idx, q in enumerate(single_questions, 1):
        q_text = q['content'].replace('（）', '')
        content += f"第 {idx} 题 {q_text}\n"
        content += f" {{{{ select({idx}) }}}}\n"
        for opt in q['options']:
            opt_text = opt.strip()
            opt_text = re.sub(r'^[A-D][．.\\s]+', '', opt_text)
            opt_text = opt_text.strip()
            content += f" - {opt_text}\n"
        content += "\n"
    
    for idx, q in enumerate(tf_questions, 1):
        q_text = q['content'].replace('（）', '')
        q_text = q_text.replace('（', '')
        q_text = q_text.replace('）', '')
        if q_text.endswith('（）'):
            q_text = q_text[:-3]
        content += f"第 {idx + len(single_questions)} 题 {q_text}（）\n"
        content += f" {{{{ select({idx + len(single_questions)}) }}}}\n"
        content += " - 对\n"
        content += " - 错\n"
        content += "\n"
    
    with open(obj_file, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"生成客观题文件: {obj_file}")
    return obj_file

def generate_eval_file(pdf_path, pdf_text):
    dir_name = os.path.dirname(pdf_path)
    base_name = os.path.basename(pdf_path).replace('.pdf', '')
    eval_file = os.path.join(dir_name, f"{base_name}_客观题_评测设置.txt")
    
    single_answers, tf_answers = extract_answer_key(pdf_text)
    
    content = "type: objective\n"
    content += "answers:\n"
    
    all_answers = []
    
    if single_answers:
        for i, ans in enumerate(single_answers, 1):
            all_answers.append((i, ans))
    
    if tf_answers:
        offset = len(single_answers) if single_answers else 0
        for i, ans in enumerate(tf_answers, 1):
            tf_result = 'A' if ans == '√' else 'B'
            all_answers.append((i + offset, tf_result))
    
    for num, ans in all_answers:
        content += f"  '{num}':\n"
        content += f"  - {ans}\n"
        content += f"  - 2\n"
    
    content += "score: 50\n"
    
    with open(eval_file, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"生成评测设置文件: {eval_file}")
    return eval_file

def process_pdf(pdf_path):
    print(f"\n处理: {pdf_path}")
    pdf_text = extract_pdf_text(pdf_path)
    if not pdf_text:
        print("无法提取文本")
        return
    
    dir_name = os.path.dirname(pdf_path)
    base_name = os.path.basename(pdf_path).replace('.pdf', '')
    obj_file = os.path.join(dir_name, f"{base_name}_客观题.txt")
    eval_file = os.path.join(dir_name, f"{base_name}_客观题_评测设置.txt")
    
    if os.path.exists(obj_file):
        print(f"跳过已存在的客观题文件: {obj_file}")
    else:
        generate_objective_file(pdf_path, pdf_text)
    
    if os.path.exists(eval_file):
        print(f"跳过已存在的评测设置文件: {eval_file}")
    else:
        generate_eval_file(pdf_path, pdf_text)

def main():
    pdf_files = []
    for root, dirs, files in os.walk(BASE_DIR):
        for f in files:
            if f.endswith('.pdf'):
                pdf_files.append(os.path.join(root, f))
    
    print(f"找到 {len(pdf_files)} 个PDF文件")
    
    for pdf_path in pdf_files:
        process_pdf(pdf_path)
    
    print("\n处理完成!")

if __name__ == '__main__':
    main()
