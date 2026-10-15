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
  tagline: "Create well-written and efficient code quickly",
  url: "https://strict-lang.org",
  baseUrl: '/',
  projectName: "strict-lang.org",
  organizationName: "strict-lang",
  algolia: {
    apiKey: "7f6e29123c9235b4420f116e437ef737",
    indexName: "strict-lang",
    algoliaOptions: {}
  },
  headerLinks: [
    { search: true },
    { doc: "Overview", label: "Docs" },
    { doc: "Types", label: "Language" },
    { doc: "Architecture", label: "Source" },
    { blog: true, label: "Blog" },
    { href: "https://github.com/strict-lang/Strict", label: "GitHub" }
  ],
  users,
  headerIcon: 'img/StrictLogoWhite64x64.png',
  footerIcon: 'img/StrictHeadOnly.png',
  favicon: 'img/favicon.ico',
  colors: {
    primaryColor: "#52A0C6",
    secondaryColor: "#21434C"
  },
  fonts: {
    myFont: ["Verdana", "Serif"]
  },
  copyright: `Copyright © ${new Date().getFullYear()} strict-lang`,
  // Only used for the theme stylesheet from cdnjs, highlighting itself happens in highlightCode
  highlight: {
    theme: 'default',
    version: '11.11.1',
  },
  markdownOptions: {
    highlight: highlightCode,
  },
  scripts: ['https://buttons.github.io/buttons.js'],
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
