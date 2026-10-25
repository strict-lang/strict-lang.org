const users = [
  {
    caption: 'Benjamin',
    image: '/img/StrictLogoBlue128x128.png',
    infoLink: 'https://BenjaminNitschke.com',
    pinned: true,
  },
];

// Docusaurus 1 bundles highlight.js 9, which is end of life, so code blocks use highlight.js 11 instead
const hljs = require('highlight.js');

// Strict syntax highlighting, used for every code block without a language
const strictLanguage = hljs => ({
  aliases: ['str'],
  keywords: {
    keyword: 'has constant let mutable if else then for in is not and or xor return to from with as long',
    literal: 'true false None',
    built_in: 'value index outer',
  },
  contains: [
    hljs.QUOTE_STRING_MODE,
    { className: 'comment', begin: /(#|\/\/).*$/ },
    { className: 'number', begin: /\b-?\d+(\.\d+)?([eE][+-]?\d+)?\b/, relevance: 0 },
    {
      className: 'title',
      begin: /^(?!(has|constant|mutable|let|if|else|for|return)\b)([A-Za-z]+|[+\-*\/%^<>=]+)(?=[( ]|$)/,
    },
    { className: 'type', begin: /\b[A-Z][A-Za-z]*\b/, relevance: 0 },
  ],
});
hljs.registerLanguage('strict', strictLanguage);

// Returning '' lets remarkable escape the code itself, used for ```text blocks
const highlightCode = (code, language = 'strict') => {
  if (language === 'text')
    return '';
  if (hljs.getLanguage(language))
    return hljs.highlight(code, { language }).value;
  return hljs.highlightAuto(code).value;
};

const siteConfig = {
  title: "Strict Programming Language",
  tagline: "Clean & Fast Anywhere",
  url: "https://strict-lang.org",
  baseUrl: '/',
  projectName: "strict-lang.org",
  organizationName: "strict-lang",
  headerLinks: [
    { href: "/#games", label: "Games" },
    { href: "/#performance", label: "Performance" },
    { doc: "VSCode", label: "VS Code" },
    { doc: "Overview", label: "Docs" },
    { blog: true, label: "Blog" },
    { href: "https://github.com/strict-lang/Strict", label: "GitHub" }
  ],
  users,
  headerIcon: 'img/StrictLogoWhite64x64.png',
  favicon: 'img/favicon.ico',
  colors: {
    primaryColor: "#073b4c",
    secondaryColor: "#0b1720"
  },
  fonts: {
    myFont: ["Verdana", "Serif"]
  },
  copyright: 'Copyright © 2000-2026 Benjamin Nitschke',
  authorUrl: 'https://benjaminnitschke.com',
  // Only used for the theme stylesheet from cdnjs, highlighting itself happens in highlightCode
  highlight: {
    theme: 'github-dark',
    version: '11.11.1',
  },
  markdownOptions: {
    highlight: highlightCode,
  },
  scripts: [
    'https://buttons.github.io/buttons.js',
    'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/highlight.min.js',
    '/js/strict-mini-eval.js',
    '/js/strict-playground.js',
    '/js/strict-theater.js',
    '/js/strict-search.js',
    '/js/strict-nav.js'
  ],
  onPageNav: 'separate',
  cleanUrl: true,
  enableUpdateBy: true,
  enableUpdateTime: true,
  blogSidebarCount: 'ALL',
  repoUrl: "https://github.com/strict-lang/Strict",
  websiteRepoUrl: "https://github.com/strict-lang/strict-lang.org",
  ogImage: 'img/StrictBanner.png',
  twitterImage: 'img/StrictBanner.png',
};

module.exports = siteConfig;

