/**
 * Strict Interactive Playground UI
 * Manages the live editor, preset selection, line number gutter,
 * real-time SCrunch execution values, and test pass/fail indicators.
 */
(function () {
  'use strict';

  const PRESETS = {
    area: {
      name: 'Area Calculator',
      typeName: 'AreaCalculator',
      code: `has width Number
has height Number
has logger
Area Number
\tAreaCalculator(3, 4).Area is 12
\tAreaCalculator(10, 5).Area is 50
\twidth * height`
    },
    temperature: {
      name: 'Temperature',
      typeName: 'TemperatureConverter',
      code: `has celsius Number
has logger
ToFahrenheit Number
\tTemperatureConverter(100).ToFahrenheit is 212
\tTemperatureConverter(0).ToFahrenheit is 32
\tcelsius * 9 / 5 + 32`
    },
    fibonacci: {
      name: 'Fibonacci',
      typeName: 'Fibonacci',
      code: `Fibonacci(index Number) Number
\tFibonacci(0) is 0
\tFibonacci(1) is 1
\tFibonacci(6) is 8
\tindex <= 1 then index else Fibonacci(index - 1) + Fibonacci(index - 2)`
    },
    isEven: {
      name: 'Even Numbers',
      typeName: 'IsEven',
      code: `IsEven(n Number) Boolean
\tIsEven(4) is true
\tIsEven(7) is false
\tn % 2 is 0`
    },
    custom: {
      name: 'Custom',
      typeName: 'MyType',
      code: `has value Number
Square Number
\tMyType(5).Square is 25
\tMyType(12).Square is 144
\tvalue * value`
    }
  };

  let currentPresetKey = 'area';
  let debounceTimer = null;

  function initPlayground() {
    const container = document.getElementById('strictPlaygroundApp');
    if (!container) return;

    // Render Playground layout
    container.innerHTML = `
      <div class="sp-toolbar">
        <div class="sp-presets" role="tablist" aria-label="Strict Example Presets">
          ${Object.keys(PRESETS).map(key => `
            <button type="button" class="sp-preset-btn ${key === currentPresetKey ? 'active' : ''}" data-key="${key}" role="tab" aria-selected="${key === currentPresetKey}">
              ${PRESETS[key].name}
            </button>
          `).join('')}
        </div>
      </div>
      <div class="sp-workspace">
        <div class="sp-editor-pane">
          <div class="sp-line-numbers" id="spLineNumbers"></div>
          <div class="sp-editor-wrapper">
            <pre class="sp-code-highlight" id="spCodeHighlight" aria-hidden="true"><code class="hljs language-strict" id="spCodeHighlightInner"></code></pre>
            <textarea id="spCodeTextarea" spellcheck="false" autocomplete="off" autocapitalize="off" aria-label="Strict Code Editor"></textarea>
          </div>
          <div class="sp-gutter-values" id="spGutterValues" aria-label="SCrunch live line values"></div>
        </div>
      </div>
      <div class="sp-footer">
        <div class="sp-test-summary" id="spTestSummary">
          <span class="sp-summary-icon">✓</span>
          <span class="sp-summary-text">Evaluating...</span>
        </div>
        <div class="sp-actions">
          <button type="button" class="sp-reset-btn" id="spResetBtn" title="Reset to original preset code">Reset</button>
          <a class="sp-vscode-link" href="/docs/VSCode">See the full VS Code experience →</a>
          <div class="sp-status" id="spStatusBadge">
            <span class="sp-status-dot"></span>
            <span class="sp-status-text">Ready</span>
          </div>
        </div>
      </div>
    `;

    const textarea = document.getElementById('spCodeTextarea');
    const resetBtn = document.getElementById('spResetBtn');
    const presetButtons = container.querySelectorAll('.sp-preset-btn');

    // Preset buttons click
    presetButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-key');
        if (key && PRESETS[key]) {
          currentPresetKey = key;
          presetButtons.forEach(b => {
            const isActive = b === btn;
            b.classList.toggle('active', isActive);
            b.setAttribute('aria-selected', isActive ? 'true' : 'false');
          });
          loadPreset(currentPresetKey);
        }
      });
    });

    // Reset button
    resetBtn.addEventListener('click', () => {
      loadPreset(currentPresetKey);
    });

    // Textarea input
    textarea.addEventListener('input', () => {
      updateHighlight();
      updateLineNumbers();
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        runEvaluation();
      }, 120);
    });

    // Synchronize scrolling between textarea and highlight/values/line numbers
    textarea.addEventListener('scroll', () => {
      const highlight = document.getElementById('spCodeHighlight');
      if (highlight) {
        highlight.scrollTop = textarea.scrollTop;
        highlight.scrollLeft = textarea.scrollLeft;
      }
      const lineNums = document.getElementById('spLineNumbers');
      const gutterVals = document.getElementById('spGutterValues');
      if (lineNums) lineNums.scrollTop = textarea.scrollTop;
      if (gutterVals) gutterVals.scrollTop = textarea.scrollTop;
    });

    // Support Tab key in textarea
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        textarea.value = textarea.value.substring(0, start) + '\t' + textarea.value.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + 1;
        updateHighlight();
        updateLineNumbers();
        runEvaluation();
      }
    });

    loadPreset(currentPresetKey);
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function ensureHljsStrictRegistered() {
    if (typeof window !== 'undefined' && window.hljs && !window.hljs.getLanguage('strict')) {
      window.hljs.registerLanguage('strict', hljs => ({
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
      }));
    }
  }

  function highlightStrict(code) {
    ensureHljsStrictRegistered();
    if (typeof window !== 'undefined' && window.hljs && window.hljs.getLanguage && window.hljs.getLanguage('strict')) {
      try {
        return window.hljs.highlight(code, { language: 'strict' }).value;
      } catch (e) {
        // Fallback to built-in tokenizer below
      }
    }
    const lines = code.split(/\r?\n/);
    return lines.map(line => {
      const commentMatch = line.match(/^(\s*)(#|\/\/)(.*)$/);
      if (commentMatch) {
        return escapeHtml(commentMatch[1]) + '<span class="hljs-comment">' + escapeHtml(commentMatch[2] + commentMatch[3]) + '</span>';
      }

      const isIndented = /^\s+/.test(line);
      let output = '';

      let firstIdentIsTitle = false;
      if (!isIndented) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('has ') && !trimmed.startsWith('constant ') && !trimmed.startsWith('let ') && !trimmed.startsWith('mutable ')) {
          firstIdentIsTitle = true;
        }
      }

      const tokenRegex = /("(?:[^"\\]|\\.)*")|(\b-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)|(\b(?:has|constant|let|mutable|if|else|then|for|in|is|not|and|or|xor|return|to|from|with|as|long)\b)|(\b(?:true|false|None)\b)|(\b(?:value|index|outer)\b)|(\b[A-Z][A-Za-z0-9_]*\b)|(\b[a-z_][A-Za-z0-9_]*\b)|(#.*|\/\/.*)|([^\s\w]+|\s+)/g;
      let match;
      let hasSeenFirstWord = false;

      while ((match = tokenRegex.exec(line)) !== null) {
        const [full, str, num, kw, lit, builtin, type, ident, comment, other] = match;
        if (str !== undefined) {
          output += '<span class="hljs-string">' + escapeHtml(str) + '</span>';
        } else if (num !== undefined) {
          output += '<span class="hljs-number">' + escapeHtml(num) + '</span>';
        } else if (kw !== undefined) {
          output += '<span class="hljs-keyword">' + escapeHtml(kw) + '</span>';
        } else if (lit !== undefined) {
          output += '<span class="hljs-literal">' + escapeHtml(lit) + '</span>';
        } else if (builtin !== undefined) {
          output += '<span class="hljs-built_in">' + escapeHtml(builtin) + '</span>';
        } else if (type !== undefined) {
          if (firstIdentIsTitle && !hasSeenFirstWord) {
            output += '<span class="hljs-title">' + escapeHtml(type) + '</span>';
          } else {
            output += '<span class="hljs-type">' + escapeHtml(type) + '</span>';
          }
        } else if (ident !== undefined) {
          if (firstIdentIsTitle && !hasSeenFirstWord) {
            output += '<span class="hljs-title">' + escapeHtml(ident) + '</span>';
          } else {
            output += escapeHtml(ident);
          }
        } else if (comment !== undefined) {
          output += '<span class="hljs-comment">' + escapeHtml(comment) + '</span>';
        } else {
          output += escapeHtml(other);
        }
        if (kw || lit || builtin || type || ident) {
          hasSeenFirstWord = true;
        }
      }
      return output;
    }).join('\n');
  }

  function updateHighlight() {
    const textarea = document.getElementById('spCodeTextarea');
    const highlightInner = document.getElementById('spCodeHighlightInner');
    if (!textarea || !highlightInner) return;
    const code = textarea.value;
    highlightInner.innerHTML = highlightStrict(code) + (code.endsWith('\n') ? ' ' : '');
    const highlight = document.getElementById('spCodeHighlight');
    if (highlight) {
      highlight.scrollTop = textarea.scrollTop;
      highlight.scrollLeft = textarea.scrollLeft;
    }
  }

  function loadPreset(key) {
    const textarea = document.getElementById('spCodeTextarea');
    if (!textarea || !PRESETS[key]) return;
    textarea.value = PRESETS[key].code;
    updateHighlight();
    updateLineNumbers();
    runEvaluation();
  }

  function updateLineNumbers() {
    const textarea = document.getElementById('spCodeTextarea');
    const lineNumbers = document.getElementById('spLineNumbers');
    if (!textarea || !lineNumbers) return;

    const lineCount = (textarea.value.match(/\n/g) || []).length + 1;
    let html = '';
    for (let i = 1; i <= lineCount; i++) {
      html += `<div class="sp-line-no">${i}</div>`;
    }
    lineNumbers.innerHTML = html;
  }

  function runEvaluation() {
    const textarea = document.getElementById('spCodeTextarea');
    const statusBadge = document.getElementById('spStatusBadge');
    const statusText = statusBadge ? statusBadge.querySelector('.sp-status-text') : null;
    const testSummary = document.getElementById('spTestSummary');
    const gutterValues = document.getElementById('spGutterValues');
    if (!textarea || !gutterValues || !window.StrictMiniEval) return;

    const source = textarea.value;
    const preset = PRESETS[currentPresetKey] || PRESETS.custom;
    const typeName = preset.typeName || 'Snippet';

    const t0 = performance.now();
    const result = window.StrictMiniEval.evaluateSnippet(source, typeName);
    const duration = Math.max(0.05, performance.now() - t0).toFixed(2);

    // Update status badge
    if (statusBadge && statusText) {
      statusBadge.className = 'sp-status ' + (result.success ? 'passed' : 'failed');
      statusText.textContent = result.success ? `Passing (${duration} ms)` : `Failed (${duration} ms)`;
    }

    // Render SCrunch values and test badges beside lines
    const lines = source.split(/\r?\n/);
    const lineTraceMap = {};
    result.lines.forEach(l => {
      lineTraceMap[l.lineIndex] = l;
    });

    const testMap = {};
    result.tests.forEach(t => {
      testMap[t.lineIndex] = t;
    });

    let gutterHtml = '';
    for (let i = 0; i < lines.length; i++) {
      const trace = lineTraceMap[i];
      const test = testMap[i];
      let lineContent = '';

      if (test) {
        if (test.passed) {
          lineContent = `<span class="sp-badge-pass" title="Test passed in ${(test.durationMs || 0.1).toFixed(2)} ms">✓ passed</span>`;
        } else {
          const detail = test.error ? test.error : `got ${formatVal(test.got)}, expected ${formatVal(test.expected)}`;
          lineContent = `<span class="sp-badge-fail" title="${detail}">✗ ${detail}</span>`;
        }
      } else if (trace && trace.values && trace.values.length > 0) {
        lineContent = `<span class="sp-val-tag" title="Executed ${trace.hits} time(s)">→ ${trace.values.join(', ')}</span>`;
      }

      gutterHtml += `<div class="sp-gutter-line">${lineContent}</div>`;
    }
    gutterValues.innerHTML = gutterHtml;

    // Update summary bar
    if (testSummary) {
      const totalTests = result.tests.length;
      const passedTests = result.tests.filter(t => t.passed).length;

      if (totalTests > 0) {
        if (result.success) {
          testSummary.className = 'sp-test-summary success';
          testSummary.innerHTML = `
            <span class="sp-summary-icon">✓</span>
            <span class="sp-summary-text">All ${totalTests} inline tests passing in <strong>${duration} ms</strong>. Native speed & immediate feedback.</span>
          `;
        } else {
          const failedCount = totalTests - passedTests;
          testSummary.className = 'sp-test-summary error';
          testSummary.innerHTML = `
            <span class="sp-summary-icon">✗</span>
            <span class="sp-summary-text">${failedCount} of ${totalTests} test(s) failing. Adjust your expression above to see tests pass.</span>
          `;
        }
      } else {
        testSummary.className = 'sp-test-summary info';
        testSummary.innerHTML = `
          <span class="sp-summary-icon">ℹ</span>
          <span class="sp-summary-text">Evaluated in ${duration} ms. Add an inline test with <code>Method(args) is result</code> to see immediate feedback.</span>
        `;
      }
    }
  }

  function formatVal(v) {
    if (v === null || v === undefined) return 'None';
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
  }

  // Initialize once DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlayground);
  } else {
    initPlayground();
  }
})();
