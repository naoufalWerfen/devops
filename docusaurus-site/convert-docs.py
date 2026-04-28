#!/usr/bin/env python3
"""Convert MkDocs admonition syntax to Docusaurus."""
import re
import glob
import os

docs_dir = '/var/www/devops/docusaurus-site/docs'

# Map MkDocs admonition types to Docusaurus
TYPE_MAP = {
    'info': 'info',
    'tip': 'tip',
    'note': 'note',
    'warning': 'warning',
    'danger': 'danger',
    'success': 'tip',
    'caution': 'caution',
}

def convert_admonitions(content):
    lines = content.split('\n')
    result = []
    i = 0
    while i < len(lines):
        line = lines[i]
        # Match !!! type "title" or !!! type
        m = re.match(r'^!!! (\w+)\s*"([^"]*)"', line)
        m2 = re.match(r'^!!! (\w+)\s*$', line)
        
        if m or m2:
            if m:
                adm_type = m.group(1)
                title = m.group(2)
            else:
                adm_type = m2.group(1)
                title = None
            
            ds_type = TYPE_MAP.get(adm_type, 'note')
            
            if title:
                result.append(f':::{ds_type}[{title}]')
            else:
                result.append(f':::{ds_type}')
            
            # Collect indented content
            i += 1
            while i < len(lines) and (lines[i].startswith('    ') or lines[i].strip() == ''):
                if lines[i].strip() == '':
                    result.append('')
                else:
                    result.append(lines[i][4:])  # Remove 4-space indent
                i += 1
            
            # Remove trailing empty lines inside admonition
            while result and result[-1] == '':
                result.pop()
            
            result.append(':::')
            result.append('')
            continue
        
        # Remove MkDocs material icons like :material-xxx:
        line = re.sub(r':material-[a-z-]+:', '', line)
        # Remove :xxx: emoji syntax that MkDocs uses but keep content  
        
        result.append(line)
        i += 1
    
    return '\n'.join(result)

def fix_internal_links(content):
    # Fix relative links that pointed to README.md → index.md
    content = content.replace('](README.md)', '](index.md)')
    return content

count = 0
for md_file in glob.glob(os.path.join(docs_dir, '**/*.md'), recursive=True):
    with open(md_file, 'r', encoding='utf-8') as f:
        original = f.read()
    
    converted = convert_admonitions(original)
    converted = fix_internal_links(converted)
    
    if converted != original:
        with open(md_file, 'w', encoding='utf-8') as f:
            f.write(converted)
        count += 1
        print(f'  Converted: {os.path.relpath(md_file, docs_dir)}')

print(f'\nTotal files converted: {count}')
