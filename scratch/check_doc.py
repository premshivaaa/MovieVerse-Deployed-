import docx
import re

def check_doc(path):
    doc = docx.Document(path)
    
    reg_nums = set()
    for para in doc.paragraphs:
        match = re.search(r'1231836\d*', para.text)
        if match:
            reg_nums.add(match.group())
            
    print(f"Registration numbers found: {reg_nums}")
    print(f"Number of sections: {len(doc.sections)}")
    
    for i, sec in enumerate(doc.sections):
        print(f"Section {i}: start type {sec.start_type}")

check_doc(r"c:\Users\mopad\OneDrive\Attachments\Desktop\mern.docx")
