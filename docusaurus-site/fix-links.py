#!/usr/bin/env python3
import glob, os
os.chdir('/var/www/devops/docusaurus-site/docs')
for f in glob.glob('**/*.md', recursive=True):
    with open(f, 'r') as fh:
        c = fh.read()
    n = c.replace('README.md', 'index.md')
    if n != c:
        with open(f, 'w') as fh:
            fh.write(n)
        print('Fixed:', f)
print('Done')
