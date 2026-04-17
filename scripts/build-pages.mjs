import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const outputRoot = path.join(repoRoot, 'docs');
const siteAssetsRoot = path.join(repoRoot, 'site-assets');

const excludedDirectories = new Set(['.git', '.github', '.obsidian', 'docs', 'scripts']);
const excludedFiles = new Set(['AGENTS.md']);

const markdownFiles = [];

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (excludedDirectories.has(entry.name)) {
      continue;
    }
    const absolutePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(absolutePath);
      continue;
    }
    if (!entry.name.endsWith('.md') || excludedFiles.has(entry.name)) {
      continue;
    }
    markdownFiles.push(path.relative(repoRoot, absolutePath).replace(/\\/g, '/'));
  }
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'page';
}

function pageOutputPath(relativePath) {
  const normalized = relativePath.replace(/\.md$/i, '');
  const segments = normalized.split('/');
  const fileName = segments.pop();
  const safeName = `${slugify(fileName)}.html`;
  return path.join(outputRoot, 'vault', ...segments, safeName);
}

function pageWebPath(relativePath) {
  return path.relative(outputRoot, pageOutputPath(relativePath)).replace(/\\/g, '/');
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function extractTitle(markdown, fallback) {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : fallback;
}

function stripMarkdown(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/^#+\s+/gm, '')
    .replace(/[*_>-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function ensureDir(dirPath) {
  return fs.mkdir(dirPath, { recursive: true });
}

function convertInlineMarkdown(text, currentFile, fileMap, aliasMap) {
  let html = escapeHtml(text);

  html = html.replace(/`([^`]+)`/g, (_, code) => `<code>${escapeHtml(code)}</code>`);

  html = html.replace(/\[\[([^\]]+)\]\]/g, (_, rawTarget) => {
    const target = rawTarget.split('|')[0].trim();
    const label = rawTarget.includes('|') ? rawTarget.split('|')[1].trim() : target;
    const resolved = resolveWikiTarget(target, currentFile, fileMap, aliasMap);
    if (!resolved) {
      return `<span class="broken-link">${escapeHtml(label)}</span>`;
    }
    const href = path.relative(
      path.dirname(pageOutputPath(currentFile)),
      pageOutputPath(resolved)
    ).replace(/\\/g, '/');
    return `<a href="${href}">${escapeHtml(label)}</a>`;
  });

  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
    return `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`;
  });

  return html;
}

function resolveWikiTarget(target, currentFile, fileMap, aliasMap) {
  const normalizedTarget = target.replace(/\\/g, '/').replace(/\.md$/i, '');
  const currentDir = path.posix.dirname(currentFile);

  const directCandidates = [
    `${normalizedTarget}.md`,
    path.posix.join(currentDir, `${normalizedTarget}.md`),
  ];

  for (const candidate of directCandidates) {
    if (fileMap.has(candidate)) {
      return candidate;
    }
  }

  const alias = aliasMap.get(normalizedTarget.toLowerCase());
  if (alias) {
    return alias;
  }

  const basenameAlias = aliasMap.get(path.posix.basename(normalizedTarget).toLowerCase());
  return basenameAlias || null;
}

function renderMarkdown(markdown, currentFile, fileMap, aliasMap) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const parts = [];
  let paragraph = [];
  let listItems = [];
  let orderedItems = [];
  let inCodeBlock = false;
  let codeFence = '';
  let codeLines = [];

  function flushParagraph() {
    if (paragraph.length) {
      const text = paragraph.join(' ').trim();
      if (text) {
        parts.push(`<p>${convertInlineMarkdown(text, currentFile, fileMap, aliasMap)}</p>`);
      }
      paragraph = [];
    }
  }

  function flushLists() {
    if (listItems.length) {
      parts.push(`<ul>${listItems.map((item) => `<li>${convertInlineMarkdown(item, currentFile, fileMap, aliasMap)}</li>`).join('')}</ul>`);
      listItems = [];
    }
    if (orderedItems.length) {
      parts.push(`<ol>${orderedItems.map((item) => `<li>${convertInlineMarkdown(item, currentFile, fileMap, aliasMap)}</li>`).join('')}</ol>`);
      orderedItems = [];
    }
  }

  function flushCodeBlock() {
    const code = escapeHtml(codeLines.join('\n'));
    parts.push(`<pre><code class="language-${escapeHtml(codeFence)}">${code}</code></pre>`);
    codeLines = [];
  }

  for (const line of lines) {
    const fenceMatch = line.match(/^```(\w+)?\s*$/);
    if (fenceMatch) {
      flushParagraph();
      flushLists();
      if (inCodeBlock) {
        flushCodeBlock();
        inCodeBlock = false;
        codeFence = '';
      } else {
        inCodeBlock = true;
        codeFence = fenceMatch[1] || '';
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      flushLists();
      const level = headingMatch[1].length;
      parts.push(`<h${level}>${convertInlineMarkdown(headingMatch[2].trim(), currentFile, fileMap, aliasMap)}</h${level}>`);
      continue;
    }

    const unorderedMatch = line.match(/^\s*-\s+(.+)$/);
    if (unorderedMatch) {
      flushParagraph();
      orderedItems = [];
      listItems.push(unorderedMatch[1].trim());
      continue;
    }

    const orderedMatch = line.match(/^\s*\d+\.\s+(.+)$/);
    if (orderedMatch) {
      flushParagraph();
      listItems = [];
      orderedItems.push(orderedMatch[1].trim());
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      flushLists();
      continue;
    }

    paragraph.push(line.trim());
  }

  flushParagraph();
  flushLists();

  if (inCodeBlock) {
    flushCodeBlock();
  }

  return parts.join('\n');
}

function buildTree(files) {
  const root = { files: [], children: new Map() };

  for (const file of files) {
    const parts = file.split('/');
    const fileName = parts.pop();
    let node = root;
    for (const part of parts) {
      if (!node.children.has(part)) {
        node.children.set(part, { files: [], children: new Map() });
      }
      node = node.children.get(part);
    }
    node.files.push(fileName);
  }

  return root;
}

function renderTree(node, parentSegments, currentFile, fileMap) {
  const sections = [];

  const sortedDirs = [...node.children.keys()].sort((a, b) => a.localeCompare(b));
  for (const dir of sortedDirs) {
    const child = node.children.get(dir);
    sections.push(`
      <details class="nav-folder" ${currentFile.startsWith([...parentSegments, dir].join('/')) ? 'open' : ''}>
        <summary>${escapeHtml(dir)}</summary>
        ${renderTree(child, [...parentSegments, dir], currentFile, fileMap)}
      </details>
    `);
  }

  const sortedFiles = [...node.files].sort((a, b) => a.localeCompare(b));
  if (sortedFiles.length) {
    sections.push('<ul class="nav-list">');
    for (const fileName of sortedFiles) {
      const relativePath = [...parentSegments, fileName].join('/');
      const href = path.relative(
        path.dirname(pageOutputPath(currentFile)),
        pageOutputPath(relativePath)
      ).replace(/\\/g, '/');
      const title = fileMap.get(relativePath).title;
      const active = relativePath === currentFile ? ' class="active"' : '';
      sections.push(`<li><a${active} href="${href}">${escapeHtml(title)}</a></li>`);
    }
    sections.push('</ul>');
  }

  return sections.join('\n');
}

function pageTemplate({ pageTitle, description, sidebar, content, sourcePath, rootPrefix }) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(pageTitle)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <link rel="stylesheet" href="${rootPrefix}assets/site.css">
  </head>
  <body>
    <div class="layout">
      <aside class="sidebar">
        <a class="brand" href="${rootPrefix}index.html">
          <span class="brand-mark">RC</span>
          <span>
            <strong>ResumeConverter Vault</strong>
            <small>Obsidian knowledge showcase</small>
          </span>
        </a>
        <nav class="nav">
          ${sidebar}
        </nav>
      </aside>
      <main class="content">
        <div class="content-meta">Source: <code>${escapeHtml(sourcePath)}</code></div>
        ${content}
      </main>
    </div>
  </body>
</html>`;
}

async function main() {
  await walk(repoRoot);
  markdownFiles.sort((a, b) => a.localeCompare(b));

  const fileMap = new Map();
  const aliasMap = new Map();

  for (const relativePath of markdownFiles) {
    const absolutePath = path.join(repoRoot, relativePath);
    const markdown = await fs.readFile(absolutePath, 'utf8');
    const fallbackTitle = path.basename(relativePath, '.md');
    const title = extractTitle(markdown, fallbackTitle);
    const description = stripMarkdown(markdown).slice(0, 180) || `${title} page`;

    fileMap.set(relativePath, { title, description, markdown });

    const withoutExtension = relativePath.replace(/\.md$/i, '');
    aliasMap.set(withoutExtension.toLowerCase(), relativePath);
    aliasMap.set(path.basename(withoutExtension).toLowerCase(), relativePath);
  }

  await fs.rm(outputRoot, { recursive: true, force: true });
  await ensureDir(path.join(outputRoot, 'assets'));
  await fs.copyFile(
    path.join(siteAssetsRoot, 'site.css'),
    path.join(outputRoot, 'assets', 'site.css')
  );

  const tree = buildTree(markdownFiles);

  for (const relativePath of markdownFiles) {
    const page = fileMap.get(relativePath);
    const outputPath = pageOutputPath(relativePath);
    const rootPrefix = path.relative(path.dirname(outputPath), outputRoot).replace(/\\/g, '/') || '.';
    const normalizedRootPrefix = rootPrefix.endsWith('/') ? rootPrefix : `${rootPrefix}/`;
    const sidebar = renderTree(tree, [], relativePath, fileMap);
    const content = renderMarkdown(page.markdown, relativePath, fileMap, aliasMap);
    const html = pageTemplate({
      pageTitle: `${page.title} | ResumeConverter Vault`,
      description: page.description,
      sidebar,
      content,
      sourcePath: relativePath,
      rootPrefix: normalizedRootPrefix,
    });
    await ensureDir(path.dirname(outputPath));
    await fs.writeFile(outputPath, html, 'utf8');
  }

  const indexCards = ['Bienvenue.md', 'overview.md', 'index.md', 'SECURITY.md']
    .filter((file) => fileMap.has(file))
    .map((file) => {
      const page = fileMap.get(file);
      const href = pageWebPath(file);
      return `
        <a class="card" href="${href}">
          <h2>${escapeHtml(page.title)}</h2>
          <p>${escapeHtml(page.description)}</p>
        </a>
      `;
    })
    .join('\n');

  const topicalCards = markdownFiles
    .filter((file) => file.startsWith('topics/'))
    .slice(0, 12)
    .map((file) => {
      const page = fileMap.get(file);
      const href = pageWebPath(file);
      return `<li><a href="${href}">${escapeHtml(page.title)}</a></li>`;
    })
    .join('\n');

  const homeHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>ResumeConverter Vault</title>
    <meta name="description" content="GitHub Pages showcase for the ResumeConverter Obsidian vault.">
    <link rel="stylesheet" href="assets/site.css">
  </head>
  <body>
    <main class="home">
      <section class="hero">
        <p class="eyebrow">GitHub Pages Showcase</p>
        <h1>ResumeConverter Vault</h1>
        <p>
          A static, browsable view of the Obsidian vault. The site is generated from the vault markdown and
          preserves the actual project memory structure across core pages, topics, entities, and raw sources.
        </p>
        <div class="hero-actions">
          <a class="button" href="${pageWebPath('overview.md')}">Open overview</a>
          <a class="button button-secondary" href="${pageWebPath('index.md')}">Browse index</a>
        </div>
      </section>
      <section class="grid">
        ${indexCards}
      </section>
      <section class="panel">
        <h2>Vault coverage</h2>
        <p>${markdownFiles.length} markdown pages are rendered into static HTML for GitHub Pages.</p>
        <ul class="topic-list">
          ${topicalCards}
        </ul>
      </section>
    </main>
  </body>
</html>`;

  await fs.writeFile(path.join(outputRoot, 'index.html'), homeHtml, 'utf8');
}

await main();
