from pathlib import Path
import re
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_TAB_ALIGNMENT, WD_TAB_LEADER
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'output' / 'KaPamana_Chapters_1_to_3.md'
OUTPUT = ROOT / 'output' / 'KaPamana_Chapters_1_to_3.docx'

doc = Document()
sec = doc.sections[0]
sec.page_width, sec.page_height = Inches(8.5), Inches(13)
sec.top_margin = Inches(1.0)
sec.bottom_margin = Inches(0.95)
sec.left_margin = Inches(1.18)
sec.right_margin = Inches(0.92)
sec.header_distance = Inches(0.4)
sec.footer_distance = Inches(0.42)
sec.different_first_page_header_footer = True

styles = doc.styles
normal = styles['Normal']
normal.font.name = 'Times New Roman'
normal.font.size = Pt(11.5)
normal.font.color.rgb = RGBColor(0, 0, 0)
normal.paragraph_format.line_spacing = 1.38
normal.paragraph_format.space_after = Pt(7)
normal.paragraph_format.widow_control = True

for style_name, size, before, after in [
    ('Title', 17, 0, 16),
    ('Heading 1', 15, 0, 17),
    ('Heading 2', 12.5, 17, 7),
    ('Heading 3', 11.5, 13, 5),
]:
    style = styles[style_name]
    style.font.name = 'Times New Roman'
    style.font.size = Pt(size)
    style.font.bold = True
    style.font.color.rgb = RGBColor(0, 0, 0)
    style.paragraph_format.space_before = Pt(before)
    style.paragraph_format.space_after = Pt(after)
    style.paragraph_format.keep_with_next = True

header = sec.header.paragraphs[0]
header.alignment = WD_ALIGN_PARAGRAPH.RIGHT
run = header.add_run('KA-PAMANA  |  CHAPTERS 1–3')
run.font.name = 'Times New Roman'
run.font.size = Pt(9)
run.font.color.rgb = RGBColor(0, 0, 0)

footer = sec.footer.paragraphs[0]
footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = footer.add_run('KA-PAMANA  •  BSIT 4-5  •  ')
run.font.name = 'Times New Roman'
run.font.size = Pt(9)
field = OxmlElement('w:fldSimple')
field.set(qn('w:instr'), 'PAGE')
footer._p.append(field)

def add_runs(paragraph, text):
    parts = re.split(r'(\*\*.*?\*\*)', text)
    for part in parts:
        if part.startswith('**') and part.endswith('**'):
            paragraph.add_run(part[2:-2]).bold = True
        elif part:
            paragraph.add_run(part)

def paragraph(text, reference=False):
    p = doc.add_paragraph()
    if in_ch3 and not reference:
        p.paragraph_format.line_spacing = 1.32
        p.paragraph_format.space_after = Pt(6)
    if reference:
        p.paragraph_format.left_indent = Inches(0.33)
        p.paragraph_format.first_line_indent = Inches(-0.33)
        p.paragraph_format.space_after = Pt(8)
        p.paragraph_format.line_spacing = 1.15
    add_runs(p, text)
    return p

def list_item(text):
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Inches(0.42)
    p.paragraph_format.first_line_indent = Inches(-0.28)
    p.paragraph_format.space_after = Pt(5)
    add_runs(p, text)
    return p

def set_cell_margins(cell, top=50, start=75, bottom=50, end=75):
    tc = cell._tc
    tc_pr = tc.get_or_add_tcPr()
    margins = tc_pr.first_child_found_in('w:tcMar')
    if margins is None:
        margins = OxmlElement('w:tcMar')
        tc_pr.append(margins)
    for m, value in [('top', top), ('start', start), ('bottom', bottom), ('end', end)]:
        el = margins.find(qn('w:' + m))
        if el is None:
            el = OxmlElement('w:' + m)
            margins.append(el)
        el.set(qn('w:w'), str(value))
        el.set(qn('w:type'), 'dxa')

def set_rule(parent, side, size):
    rule = OxmlElement('w:' + side)
    rule.set(qn('w:val'), 'single')
    rule.set(qn('w:sz'), str(size))
    rule.set(qn('w:color'), '000000')
    parent.append(rule)

def set_apa_table_borders(table):
    tbl_pr = table._tbl.tblPr
    borders = OxmlElement('w:tblBorders')
    for side in ('left', 'right', 'insideH', 'insideV'):
        rule = OxmlElement('w:' + side)
        rule.set(qn('w:val'), 'nil')
        borders.append(rule)
    set_rule(borders, 'top', 8)
    set_rule(borders, 'bottom', 8)
    tbl_pr.append(borders)
    for cell in table.rows[0].cells:
        tc_pr = cell._tc.get_or_add_tcPr()
        cell_borders = OxmlElement('w:tcBorders')
        set_rule(cell_borders, 'bottom', 6)
        tc_pr.append(cell_borders)

table_titles = [
    'Conceptual Framework',
    'Synthesis of Reviewed Sources',
    'Functional Requirements',
    'System Architecture',
    'Verification Results',
]
table_notes = {
    2: 'Implications are design guidance, not measured KaPamana outcomes.',
}
table_count = 0

def add_table(rows):
    global table_count
    headers, body = rows[0], rows[1:]
    table_count += 1
    cap = doc.add_paragraph()
    cap.paragraph_format.space_before = Pt(7)
    cap.paragraph_format.space_after = Pt(0)
    cap.paragraph_format.keep_with_next = True
    rr = cap.add_run(f'Table {table_count}')
    rr.bold = True
    title = doc.add_paragraph()
    title.paragraph_format.space_after = Pt(4)
    title.paragraph_format.keep_with_next = True
    rr = title.add_run(table_titles[table_count-1])
    rr.italic = True

    table = doc.add_table(rows=1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    if headers[0] == 'ID':
        widths = [0.55, 2.45, 3.4]
    elif headers[0] == 'Layer':
        widths = [1.15, 2.1, 3.15]
    elif headers[0] == 'Check':
        widths = [1.5, 2.3, 2.6]
    elif headers[0] == 'Source':
        widths = [1.6, 2.35, 2.45]
    else:
        widths = [1.2, 2.7, 2.5]
    for i, width in enumerate(widths):
        table.columns[i].width = Inches(width)
    for i, value in enumerate(headers):
        cell = table.rows[0].cells[i]
        cell.width = Inches(widths[i])
        cell.text = value
        cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
        for p in cell.paragraphs:
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.1
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            for run in p.runs:
                run.font.name = 'Times New Roman'
                run.font.size = Pt(10)
    repeat = OxmlElement('w:tblHeader')
    repeat.set(qn('w:val'), 'true')
    table.rows[0]._tr.get_or_add_trPr().append(repeat)
    for row in body:
        cells = table.add_row().cells
        for i, value in enumerate(row):
            cells[i].width = Inches(widths[i])
            cells[i].text = value
            cells[i].vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            for p in cells[i].paragraphs:
                p.paragraph_format.space_after = Pt(0)
                p.paragraph_format.line_spacing = 1.12
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT if i == 0 else WD_ALIGN_PARAGRAPH.CENTER
                for run in p.runs:
                    run.font.name = 'Times New Roman'
                    run.font.size = Pt(9.4)
    set_apa_table_borders(table)
    for row in table.rows:
        row_properties = row._tr.get_or_add_trPr()
        row_properties.append(OxmlElement('w:cantSplit'))
        for cell in row.cells:
            set_cell_margins(cell)
    if table_count in table_notes:
        note = doc.add_paragraph()
        note.paragraph_format.space_before = Pt(4)
        note.paragraph_format.space_after = Pt(6)
        note.add_run('Note.').italic = True
        note.add_run(' ' + table_notes[table_count])

# Cover
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_before = Pt(115)
r = p.add_run('KA-PAMANA')
r.bold = True
r.font.name = 'Times New Roman'
r.font.size = Pt(23)
p = doc.add_paragraph(style='Title')
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.add_run("A MOBILE APPLICATION FOR INTERACTIVE LEARNING AND PRESERVATION OF ORIENTAL MINDORO'S CULTURE AND HERITAGE")
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_before = Pt(34)
p.add_run('CHAPTERS 1, 2, AND 3').bold = True
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.add_run('System development manuscript')
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_before = Pt(80)
p.add_run('ABAO, MATHEW ANDREI F.\nARAÑO, JOHN CHRISTOPHER C.\nPALPALLATOC, MICA V.').bold = True
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_before = Pt(25)
p.add_run('BSIT 4-5\nNovember 2026')
doc.add_page_break()

# Contents. Page numbers are inserted after the first visual render.
doc.add_heading('Contents', level=1)
toc = [
    ('Chapter 1 Introduction', 'ch1'),
    ('Chapter 2 Review of Related Literature and Studies', 'ch2'),
    ('Chapter 3 Methodology', 'ch3'),
    ('References', 'refs'),
]
PAGE_NUMBERS = {'ch1': 3, 'ch2': 7, 'ch3': 10, 'refs': 15}
for label, key in toc:
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(13)
    p.paragraph_format.tab_stops.add_tab_stop(Inches(6.35), WD_TAB_ALIGNMENT.RIGHT, WD_TAB_LEADER.DOTS)
    p.add_run(label)
    if key in PAGE_NUMBERS:
        p.add_run('\t' + str(PAGE_NUMBERS[key]))
p = doc.add_paragraph()
p.paragraph_format.space_before = Pt(25)
p.add_run('Document basis. ').bold = True
p.add_run('This manuscript describes the implementation and verification available on 9 November 2026. It identifies additional usability, learning, and cultural review that has not yet been performed.')
doc.add_page_break()

lines = SOURCE.read_text(encoding='utf-8').splitlines()
i = 0
in_references = False
in_ch3 = False
while i < len(lines):
    line = lines[i].strip()
    if not line:
        i += 1
        continue
    if (re.fullmatch(r'\*\*Table \d+\*\*', line)
            or (line.startswith('*') and line.endswith('*') and line[1:-1] in table_titles)
            or line.startswith('*Note.*')):
        # The source contains the APA label, title, and note for plain-text reading;
        # add_table builds their Word equivalents with the appropriate styling.
        i += 1
        continue
    if line.startswith('|'):
        rows = []
        while i < len(lines) and lines[i].strip().startswith('|'):
            row = [c.strip() for c in lines[i].strip().strip('|').split('|')]
            if not all(re.fullmatch(r':?-{3,}:?', c or '') for c in row):
                rows.append(row)
            i += 1
        add_table(rows)
        continue
    if line.startswith('# '):
        title = line[2:]
        in_ch3 = title == 'Chapter 3 Methodology'
        if title == 'References':
            in_references = True
        chapter = doc.add_heading(title, level=1)
        if line != '# Chapter 1 Introduction':
            chapter.paragraph_format.page_break_before = True
        i += 1
        continue
    if line.startswith('## '):
        doc.add_heading(line[3:], level=2)
        i += 1
        continue
    if line.startswith('### '):
        doc.add_heading(line[4:], level=3)
        i += 1
        continue
    if re.match(r'^\d+\. ', line):
        list_item(line)
        i += 1
        continue
    text = line
    i += 1
    while i < len(lines) and lines[i].strip() and not lines[i].lstrip().startswith(('#', '|')) and not re.match(r'^\d+\. ', lines[i].strip()):
        text += ' ' + lines[i].strip()
        i += 1
    paragraph(text, reference=in_references)

doc.save(OUTPUT)
print(OUTPUT)
