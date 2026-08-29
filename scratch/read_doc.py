import docx
import sys

try:
    doc = docx.Document(r"c:\Users\mopad\OneDrive\Attachments\Desktop\mern.docx")
    print(f"Total Paragraphs: {len(doc.paragraphs)}")
    
    for i, para in enumerate(doc.paragraphs[:50]): # First 50 paragraphs to get an idea
        if para.text.strip():
            print(f"[{i}] {para.style.name}: {para.text[:100]}")
except Exception as e:
    print(f"Error reading docx: {e}")
