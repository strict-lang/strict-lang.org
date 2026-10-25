// Builds static/search-index.json from docs and blog posts for the local search (static/js/strict-search.js)
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', '..');
const entries = [];

const parse = text => {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(text);
  const meta = {};
  if (!match)
    return { meta, body: text };
  for (const line of match[1].split(/\r?\n/)) {
    const pair = /^(\w+):\s*(.*)$/.exec(line);
    if (pair)
      meta[pair[1]] = pair[2].trim();
  }
  return { meta, body: match[2] };
};

const plain = body => body
  .replace(/```[\s\S]*?```/g, match => match.replace(/```\w*/g, ' '))
  .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
  .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
  .replace(/<[^>]+>/g, ' ')
  .replace(/[#*`|>_]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const headings = body => (body.match(/^#{1,3} .+$/gm) || []).map(line => line.replace(/^#+ /, '').trim());

for (const file of fs.readdirSync(path.join(root, 'docs')).filter(name => name.endsWith('.md'))) {
  const { meta, body } = parse(fs.readFileSync(path.join(root, 'docs', file), 'utf8'));
  const id = meta.id || file.replace(/\.md$/, '');
  entries.push({ type: 'Docs', title: meta.title || id, url: '/docs/' + id, headings: headings(body), text: plain(body) });
}

const blogFolder = path.join(__dirname, '..', 'blog');
for (const file of fs.readdirSync(blogFolder).filter(name => name.endsWith('.md'))) {
  const { meta, body } = parse(fs.readFileSync(path.join(blogFolder, file), 'utf8'));
  const match = /^(\d{4})-(\d{2})-(\d{2})-(.+)\.md$/.exec(file);
  if (!match)
    continue;
  entries.push({
    type: 'Blog',
    title: meta.title || match[4],
    url: `/blog/${match[1]}/${match[2]}/${match[3]}/${encodeURI(match[4])}`,
    headings: headings(body),
    text: plain(body)
  });
}
// The main page: split at its sections and keep the visible text of each
const decode = text => text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ');
const pageSource = fs.readFileSync(path.join(__dirname, '..', 'pages', 'en', 'index.js'), 'utf8');
const sections = [
  { marker: '<section', title: 'Strict Programming Language', url: '/' },
  { marker: 'id="playground"', title: 'Try Strict in the Browser', url: '/#playground' },
  { marker: 'id="games"', title: 'Games', url: '/#games' },
  { marker: 'id="scrunch"', title: 'SCrunch in VS Code', url: '/#scrunch' },
  { marker: 'id="performance"', title: 'Performance and Benchmarks', url: '/#performance' },
  { marker: 'id="latest"', title: 'Latest Development News', url: '/#latest' }
];
const starts = sections.map(section => pageSource.indexOf(section.marker));
sections.forEach((section, i) => {
  const to = i + 1 < sections.length ? starts[i + 1] : pageSource.length;
  const parts = [];
  pageSource.slice(starts[i], to).replace(/>([^<>{}]{3,})</g, (match, text) => { parts.push(decode(text)); return match; });
  entries.push({ type: 'Home', title: section.title, url: section.url, headings: [], text: parts.join(' ').replace(/\s+/g, ' ').trim() });
});
const target = path.join(__dirname, '..', 'static', 'search-index.json');
fs.writeFileSync(target, JSON.stringify(entries));
console.log(`Search index: ${entries.length} pages, ${Math.round(fs.statSync(target).size / 1024)} KB`);




