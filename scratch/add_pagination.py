import docx
from docx.oxml import OxmlElement, ns

def create_element(name):
    return OxmlElement(name)

def create_attribute(element, name, value):
    element.set(ns.qn(name), value)

def add_page_number(run):
    fldChar1 = create_element('w:fldChar')
    create_attribute(fldChar1, 'w:fldCharType', 'begin')

    instrText = create_element('w:instrText')
    create_attribute(instrText, 'xml:space', 'preserve')
    instrText.text = " PAGE "

    fldChar2 = create_element('w:fldChar')
    create_attribute(fldChar2, 'w:fldCharType', 'separate')

    t = create_element('w:t')
    t.text = "3"

    fldChar3 = create_element('w:fldChar')
    create_attribute(fldChar3, 'w:fldCharType', 'end')

    run._r.append(fldChar1)
    run._r.append(instrText)
    run._r.append(fldChar2)
    run._r.append(t)
    run._r.append(fldChar3)

def add_pagination(doc_path, output_path):
    doc = docx.Document(doc_path)
    
    # In Word, page numbers are part of headers/footers.
    # We want to start from the section containing "Declaration" or just page 3.
    # Since there are 4 sections, let's find which section contains the Declaration
    # For simplicity, let's look at all sections.
    
    # First, let's ensure the declaration section has page numbering and isn't linked to previous
    for i, section in enumerate(doc.sections):
        # We unlink the footer from the previous section
        section.footer.is_linked_to_previous = False
        
        # Clear the footer to remove any existing content
        for paragraph in section.footer.paragraphs:
            p = paragraph._element
            p.getparent().remove(p)
            p._p = p._element = None
        
        # Determine if we should add pagination to this section.
        # "paging starting from page 3 i.e: declaration."
        # We will add pagination from the section containing the Declaration onwards.
        # We know from before there are 4 sections, and Declaration is near paragraph 35.
        # Let's just add it to the section that corresponds to the 3rd section (index 2) or wherever we want.
        # Wait, if we set page numbering starting at section index 2 (assuming it's page 3).
        # Let's actually add the page number field to all sections starting from index 2, assuming 0 and 1 are title and ToC.
        
        # We can also just set the starting page number to 3 if they want the literal number 3.
        # But `PAGE` field automatically handles it. We just need to restart numbering at 3 if they want that.
        
        if i >= 2: # assuming section 2 is page 3
            footer = section.footer
            paragraph = footer.add_paragraph()
            paragraph.alignment = docx.enum.text.WD_ALIGN_PARAGRAPH.CENTER
            run = paragraph.add_run()
            add_page_number(run)

    doc.save(output_path)
    print(f"Saved pagination to {output_path}")

add_pagination(r"c:\Users\mopad\OneDrive\Attachments\Desktop\mern.docx", r"c:\Users\mopad\OneDrive\Attachments\Desktop\mern_paginated.docx")
