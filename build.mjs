// Builds dist/: the landing page from site/, and one HTML page per Markdown file in content/docs.
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { Marked } from "marked";

const NAV = [
  ["Overview", [["introduction", "Introduction"], ["concepts", "Core concepts"]]],
  ["Protocol", [["lifecycle", "Market lifecycle"], ["oracle", "The oracle"], ["evidence", "Evidence and sealing"], ["cutoff", "Eligibility cutoff"], ["disputes", "Disputes and arbitration"], ["audit-agent", "Audit agent"], ["council", "The council"]]],
  ["Markets", [["pools-and-duels", "Pools and duels"], ["fees-and-limits", "Fees and limits"]]],
  ["Security", [["roles", "Roles and permissions"], ["emergency", "Emergency controls"], ["security-status", "Testing and audits"]]],
  ["Developers", [["contracts", "Contracts and addresses"], ["read-api", "Read API"], ["agent-api", "Agent API"], ["cli", "Mimir CLI"]]],
];
const PAGES = NAV.flatMap(([group, items]) => items.map(([slug, title]) => ({ slug, title, group })));

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const slugify = (s) => s.toLowerCase().replace(/<[^>]+>/g, "").replace(/&[a-z]+;/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function render(md) {
  const toc = [];
  const used = new Set();
  const marked = new Marked({
    renderer: {
      heading({ tokens, depth }) {
        const html = this.parser.parseInline(tokens);
        if (depth === 1) return `<h1>${html}</h1>\n`;
        let id = slugify(html) || "section";
        while (used.has(id)) id += "-";
        used.add(id);
        if (depth <= 3) toc.push({ depth, id, text: html.replace(/<[^>]+>/g, "") });
        return `<h${depth} id="${id}"><a class="anchor" href="#${id}" aria-hidden="true">#</a>${html}</h${depth}>\n`;
      },
      table(token) {
        const cell = (c, tag) => `<${tag}${c.align ? ` style="text-align:${c.align}"` : ""}>${this.parser.parseInline(c.tokens)}</${tag}>`;
        const head = `<tr>${token.header.map((c) => cell(c, "th")).join("")}</tr>`;
        const body = token.rows.map((r) => `<tr>${r.map((c) => cell(c, "td")).join("")}</tr>`).join("");
        return `<div class="table"><table><thead>${head}</thead><tbody>${body}</tbody></table></div>\n`;
      },
      link({ href, tokens }) {
        const text = this.parser.parseInline(tokens);
        const external = /^https?:/.test(href);
        return `<a href="${esc(href)}"${external ? ' target="_blank" rel="noopener"' : ""}>${text}</a>`;
      },
    },
  });
  return { html: marked.parse(md), toc };
}

const header = (active) => `<header class="top">
  <a class="brand" href="/"><img src="/favicon.png" alt=""><b>Mimir</b><span>Protocol</span></a>
  <nav class="links" aria-label="Main">
    <a href="/#protocol">Protocol</a>
    <a href="/docs"${active === "docs" ? ' aria-current="page"' : ""}>Docs</a>
    <a href="/docs/contracts">Developers</a>
    <a href="https://github.com/enliven17/mimir-markets" target="_blank" rel="noopener">GitHub</a>
  </nav>
  <a class="btn primary" href="https://mimirmarkets.xyz">Open app</a>
</header>`;

function page({ slug, title, group }, i) {
  const { html, toc } = render(readFileSync(`content/docs/${slug}.md`, "utf8"));
  const prev = PAGES[i - 1], next = PAGES[i + 1];
  const side = NAV.map(([g, items]) => `<div class="nav-group"><p>${g}</p>${items.map(([s, t]) =>
    `<a href="/docs/${s}"${s === slug ? ' aria-current="page"' : ""}>${t}</a>`).join("")}</div>`).join("");
  const onPage = toc.filter((t) => t.depth === 2).length
    ? `<p>On this page</p>${toc.map((t) => `<a class="d${t.depth}" href="#${t.id}">${t.text}</a>`).join("")}` : "";
  const desc = esc(readFileSync(`content/docs/${slug}.md`, "utf8").split("\n").find((l) => l && !l.startsWith("#"))?.replace(/[*`[\]]|\(\/?[^)]*\)/g, "").slice(0, 160) ?? "");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} · Mimir Docs</title>
<meta name="description" content="${desc}">
<meta name="theme-color" content="#110f0e">
<link rel="icon" href="/favicon.png">
<link rel="preload" href="/fonts/Geist-Variable.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/base.css">
<link rel="stylesheet" href="/docs.css">
</head>
<body class="docs">
${header("docs")}
<div class="docs-shell">
  <aside class="sidebar" id="sidebar">
    <div class="search"><input type="search" placeholder="Search docs" aria-label="Search docs" id="q"><kbd>/</kbd><div class="results" id="results" hidden></div></div>
    <nav aria-label="Documentation">${side}</nav>
  </aside>
  <main class="doc">
    <button class="menu" type="button" aria-controls="sidebar" aria-expanded="false">Menu</button>
    <p class="crumb">${group}</p>
    <article>${html}</article>
    <nav class="pager" aria-label="Pages">
      ${prev ? `<a class="prev" href="/docs/${prev.slug}"><span>Previous</span>${prev.title}</a>` : "<span></span>"}
      ${next ? `<a class="next" href="/docs/${next.slug}"><span>Next</span>${next.title}</a>` : "<span></span>"}
    </nav>
    <p class="edit"><a href="https://github.com/enliven17/mimir-protocol/blob/main/content/docs/${slug}.md" target="_blank" rel="noopener">Edit this page on GitHub</a></p>
  </main>
  <aside class="toc">${onPage}</aside>
</div>
<script src="/docs.js" defer></script>
</body>
</html>`;
}

rmSync("dist", { recursive: true, force: true });
mkdirSync("dist/docs", { recursive: true });
cpSync("site", "dist", { recursive: true });
const search = [];
PAGES.forEach((p, i) => {
  const out = page(p, i);
  writeFileSync(`dist/docs/${p.slug}.html`, out);
  if (i === 0) writeFileSync("dist/docs/index.html", out);
  const md = readFileSync(`content/docs/${p.slug}.md`, "utf8");
  search.push({ slug: p.slug, title: p.title, group: p.group, text: md.replace(/[#*`|>\-[\]()]/g, " ").replace(/\s+/g, " ").slice(0, 4000) });
});
writeFileSync("dist/search.json", JSON.stringify(search));
console.log(`built ${PAGES.length} docs pages`);
