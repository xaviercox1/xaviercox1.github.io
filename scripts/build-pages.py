#!/usr/bin/env python3
"""Validate and package only files reached by the public site's entry points."""
from collections import deque
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import json
import re
import shutil

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / '.pages-dist'
ENTRY_FILES = ('index.html', 'gallery.html', 'journal.html', '404.html', 'robots.txt',
               'sitemap.xml', 'CNAME', '.nojekyll', 'favicon.png', 'favicon.ico',
               '_gh-Xavier-Cox-Design-o.txt', 'Content/Fonts/RobotoFlex-OFL.txt')
SITE_BUDGET = 950_000_000
FILE_LIMIT = 100 * 1024 * 1024


class PageReferences(HTMLParser):
    def __init__(self):
        super().__init__()
        self.references = []

    def handle_starttag(self, tag, attributes):
        for name, value in attributes:
            if value and name in {'src', 'href', 'poster', 'data-src',
                                  'data-preview-src', 'data-full-src', 'data-fallback'}:
                self.references.append(value)


def resolve_reference(reference, parent):
    if not reference or reference.startswith('#'):
        return None
    url = urlsplit(reference)
    if url.scheme or url.netloc:
        return None
    path = unquote(url.path)
    if not path:
        return None
    target = (ROOT / path.lstrip('/') if path.startswith('/') else parent / path).resolve()
    if target == ROOT:
        target = ROOT / 'index.html'
    if not target.is_relative_to(ROOT):
        raise ValueError(f'Reference escapes the website: {reference}')
    return target


def collect_files():
    queue = deque(ROOT / name for name in ENTRY_FILES)
    included = set()
    while queue:
        path = queue.popleft().resolve()
        if path in included:
            continue
        if not path.is_file():
            raise ValueError(f'Missing website file: {path.relative_to(ROOT)}')
        included.add(path)
        references = []
        if path.suffix == '.html':
            parser = PageReferences()
            parser.feed(path.read_text())
            references = parser.references
            parent = path.parent
        elif path.suffix == '.css':
            references = [match[1].strip(' \t\"\'') for match in re.finditer(r'url\(([^)]+)\)', path.read_text())]
            parent = path.parent
        elif path.suffix == '.js':
            # Media URLs in these buildless scripts are relative to the document.
            references = re.findall(r'''["'`]((?:Content/|Microcosm/|assets/|landscape-promo(?:2)?\.mp4|(?:index|gallery|journal)\.html)[^"'`\n]*)["'`]''', path.read_text())
            parent = ROOT
        else:
            continue
        for reference in references:
            if '${' in reference:
                reference = reference.split('${', 1)[0]
            target = resolve_reference(reference, parent)
            if target is None:
                continue
            if target.is_dir():
                queue.extend(file for file in target.rglob('*') if file.is_file() and not file.name.startswith('.'))
            else:
                queue.append(target)
    return sorted(included)


def validate(files):
    total = sum(path.stat().st_size for path in files)
    for path in files:
        if path.stat().st_size >= FILE_LIMIT:
            raise ValueError(f'File reaches the 100 MiB Git limit: {path.relative_to(ROOT)}')
    if total >= SITE_BUDGET:
        raise ValueError(f'Website is {total / 1_000_000:.1f} MB; optimize media to stay below 950 MB.')
    for name in ('index.html', 'gallery.html', 'journal.html'):
        text = (ROOT / name).read_text()
        if 'noindex' in text or '-secret.html' in text:
            raise ValueError(f'{name} still contains workshop-only metadata or navigation.')
    return total


def main():
    files = collect_files()
    total = validate(files)
    if OUTPUT.exists():
        shutil.rmtree(OUTPUT)
    for path in files:
        target = OUTPUT / path.relative_to(ROOT)
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, target)
    print(json.dumps({'files': len(files), 'bytes': total,
                      'largestFileBytes': max(path.stat().st_size for path in files),
                      'budgetBytes': SITE_BUDGET}, indent=2))
    print(f'Validated GitHub Pages artifact: {OUTPUT} ({total / 1_000_000:.1f} MB)')


if __name__ == '__main__':
    main()
