// Local search for docs and blog, uses /search-index.json made by scripts/build-search-index.js
(function () {
  var index = null;
  var loading = null;

  function load() {
    if (!loading)
      loading = fetch('/search-index.json').then(function (r) { return r.json(); }).then(function (data) {
        index = data;
      });
    return loading;
  }

  function escapeHtml(text) {
    return text.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }

  var groups = { Home: 0, Docs: 1, Blog: 2 };

  function score(entry, words) {
    var title = entry.title.toLowerCase();
    var headings = entry.headings.join(' ').toLowerCase();
    var text = entry.text.toLowerCase();
    var total = 0;
    for (var i = 0; i < words.length; i++) {
      var word = words[i];
      var found = 0;
      if (title.indexOf(word) >= 0) found += 10;
      if (headings.indexOf(word) >= 0) found += 4;
      if (text.indexOf(word) >= 0) found += 1;
      if (!found) return 0;
      total += found;
    }
    return total;
  }

  function snippet(entry, words) {
    var lower = entry.text.toLowerCase();
    var at = -1;
    for (var i = 0; i < words.length && at < 0; i++)
      at = lower.indexOf(words[i]);
    var start = Math.max(0, at - 20);
    if (start > 0) {
      var space = entry.text.indexOf(' ', start);
      if (space >= 0 && space < at) start = space + 1;
    }
    var text = entry.text.slice(start, start + 70);
    return (start > 0 ? '…' : '') + escapeHtml(text) + (start + 70 < entry.text.length ? '…' : '');
  }

  function search(query) {
    var words = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length || !index) return [];
    return index.map(function (entry) { return { entry: entry, score: score(entry, words) }; })
      .filter(function (r) { return r.score > 0; })
      .sort(function (a, b) { return groups[a.entry.type] - groups[b.entry.type] || b.score - a.score; })
      .slice(0, 7)
      .map(function (r) { return { entry: r.entry, title: escapeHtml(r.entry.title), snippet: snippet(r.entry, words) }; });
  }
  function init() {
    var nav = document.querySelector('.nav-site');
    if (!nav || document.getElementById('strictSearch')) return;
    var item = document.createElement('li');
    item.id = 'strictSearch';
    item.className = 'strictSearch';
    item.innerHTML = '<input type="search" placeholder="Search" aria-label="Search" autocomplete="off"/><div class="strictSearchResults" hidden></div>';
    nav.insertBefore(item, nav.firstChild);
    var input = item.querySelector('input');
    var box = item.querySelector('.strictSearchResults');
    var selected = -1;

    function render() {
      var results = search(input.value);
      selected = results.length ? 0 : -1;
      if (!input.value.trim()) { box.hidden = true; return; }
      box.hidden = false;
      box.innerHTML = results.length ? results.map(function (r, i) {
        return '<a href="' + r.entry.url + '"' + (i === 0 ? ' class="selected"' : '') + '><span class="strictSearchTitle">' + r.title +
          '</span><span class="strictSearchText">' + r.snippet + '</span></a>';
      }).join('') : '<div class="strictSearchNone">No results</div>';
      box.style.left = '0';
      box.style.right = 'auto';
      if (box.getBoundingClientRect().right > window.innerWidth - 8) {
        box.style.left = 'auto';
        box.style.right = '0';
      }
    }

    function move(delta) {
      var links = box.querySelectorAll('a');
      if (!links.length) return;
      selected = (selected + delta + links.length) % links.length;
      for (var i = 0; i < links.length; i++) links[i].className = i === selected ? 'selected' : '';
    }

    input.addEventListener('focus', function () { load().then(render); });
    input.addEventListener('input', function () { load().then(render); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
      else if (e.key === 'Escape') { box.hidden = true; input.blur(); }
      else if (e.key === 'Enter') {
        var link = box.querySelector('a.selected');
        if (link) window.location.href = link.getAttribute('href');
      }
    });
    document.addEventListener('click', function (e) { if (!item.contains(e.target)) box.hidden = true; });
    document.addEventListener('keydown', function (e) {
      if (e.key === '/' && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); input.focus(); }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

