import docx

def find_sections(path):
    doc = docx.Document(path)
    
    for i, para in enumerate(doc.paragraphs):
        if "Declaration by Student" in para.text:
            print(f"Declaration found at paragraph {i}")
        if "Table of Contents" in para.text:
            print(f"ToC found at paragraph {i}")

    # A better way to see sections is by looking at paragraph runs or just iterating through them,
    # but python-docx assigns sections to document.sections.
    # We can add a page number to the footer of the section that contains the Declaration.
    
    # We will just print the text of the first paragraph of each section to understand where they begin.
    # Wait, sections are at the document level. Paragraphs don't easily map to sections in python-docx unless we check section properties.
    pass

find_sections(r"c:\Users\mopad\OneDrive\Attachments\Desktop\mern.docx")
