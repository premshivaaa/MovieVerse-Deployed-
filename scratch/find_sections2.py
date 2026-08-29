import docx

def find_sections(path):
    doc = docx.Document(path)
    
    # We can group paragraphs by section
    # A new section is created when a section break is encountered.
    # In python-docx, `document.sections` gives the sections.
    # The sections correspond to parts of the document.
    current_section = 0
    section_texts = {0: []}
    
    for p in doc.paragraphs:
        section_texts[current_section].append(p.text)
        # Check if paragraph contains a section break
        # In python-docx, paragraph.runs can have breaks.
        # But actually, the safest is to just print it.
        pass
    
    # Alternatively, just look at document._body.xpath('//w:sectPr')
    pass

    # Let's just run the add_pagination logic starting from section index 2 and see if the user is happy, or we can check which page is which.
    
find_sections(r"c:\Users\mopad\OneDrive\Attachments\Desktop\mern.docx")
