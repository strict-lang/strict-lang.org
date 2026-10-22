/**
 * StrictMiniEval - Lightweight client-side evaluator for Strict code snippets.
 * Evaluates core base package types (Number, Text, Boolean), methods, conditionals,
 * inline test assertions ('is', 'is not'), and tracks line execution values (SCrunch style).
 */
(function (global) {
  'use strict';

  function evaluateSnippet(sourceCode, typeName = 'Snippet') {
    const rawLines = sourceCode.split(/\r?\n/);
    const members = []; // { name, type, defaultVal }
    const methods = []; // { name, params: [{name, type}], returnType, tests: [], bodyLines: [] }
    let currentMethod = null;

    const lineTrace = rawLines.map((text, idx) => ({
      lineIndex: idx,
      text: text,
      hits: 0,
      values: []
    }));

    function recordValue(lineIdx, val) {
      if (lineIdx >= 0 && lineIdx < lineTrace.length) {
        lineTrace[lineIdx].hits++;
        const strVal = formatValue(val);
        if (!lineTrace[lineIdx].values.includes(strVal)) {
          lineTrace[lineIdx].values.push(strVal);
        }
      }
    }

    function formatValue(v) {
      if (v === null || v === undefined) return 'None';
      if (typeof v === 'boolean') return v ? 'true' : 'false';
      if (typeof v === 'number') {
        if (Number.isInteger(v)) return v.toString();
        return parseFloat(v.toFixed(4)).toString();
      }
      if (typeof v === 'string') return `"${v}"`;
      if (Array.isArray(v)) return '(' + v.map(formatValue).join(', ') + ')';
      return String(v);
    }

    // Step 1: Parse structure (has members, method headers, indented tests & bodies)
    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i];
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#')) {
        continue;
      }

      const isIndented = line.startsWith('\t') || line.startsWith('  ');

      if (!isIndented) {
        if (trimmed.startsWith('has ')) {
          // Member definition: has <name> [Type] [= default]
          const parts = trimmed.substring(4).trim().split(/\s+/);
          const name = parts[0];
          const type = parts[1] || 'Any';
          members.push({ name, type });
          currentMethod = null;
        } else {
          // Method signature: e.g. "ToFahrenheit Number" or "Area Number" or "Fibonacci(index Number) Number"
          const match = trimmed.match(/^([A-Za-z0-9_]+)(?:\((.*?)\))?(?:\s+([A-Za-z0-9_]+))?$/);
          if (match) {
            const mName = match[1];
            const rawParams = match[2] || '';
            const retType = match[3] || 'Any';
            const params = [];
            if (rawParams.trim()) {
              rawParams.split(',').forEach(p => {
                const pParts = p.trim().split(/\s+/);
                params.push({ name: pParts[0], type: pParts[1] || 'Number' });
              });
            }
            currentMethod = {
              name: mName,
              params: params,
              returnType: retType,
              headerLine: i,
              tests: [],
              bodyLines: []
            };
            methods.push(currentMethod);
          }
        }
      } else {
        if (currentMethod) {
          // Check if it's an inline test assertion: e.g. "Method(args) is expected" or "Type(args).Method is expected"
          // Exclude lines that are return statements like "n % 2 is 0"
          const isTestAssertion = checkIsTest(trimmed, currentMethod.name, typeName);
          if (isTestAssertion) {
            currentMethod.tests.push({
              lineIndex: i,
              raw: trimmed,
              expr: isTestAssertion.callExpr,
              expected: isTestAssertion.expectedExpr,
              not: isTestAssertion.isNot
            });
          } else {
            currentMethod.bodyLines.push({
              lineIndex: i,
              text: trimmed
            });
          }
        }
      }
    }

    function checkIsTest(line, methodName, typeName) {
      // Inline test patterns:
      // Type(args).Method is Expected
      // Method(args) is Expected
      // Method is Expected
      const mEsc = methodName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const tEsc = typeName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const testRegex = new RegExp(`^(?:(?:${tEsc}\\s*\\([^)]*\\)\\s*\\.)?${mEsc}(?:\\s*\\([^)]*\\))?)\\s+(is\\s+not|is)\\s+(.+)$`);
      const match = line.match(testRegex);
      if (match) {
        const op = match[1];
        const expected = match[2];
        const callPart = line.substring(0, line.indexOf(op)).trim();
        return {
          callExpr: callPart,
          expectedExpr: expected.trim(),
          isNot: op.includes('not')
        };
      }
      return null;
    }

    // Step 2: Expression Evaluator
    function evaluateExpression(expr, context) {
      expr = expr.trim();
      if (!expr) return null;

      // Handle conditional: <cond> then <thenExpr> else <elseExpr>
      // Be careful about nested conditionals
      const thenIdx = findKeyword(expr, 'then');
      const elseIdx = findKeyword(expr, 'else');
      if (thenIdx > 0 && elseIdx > thenIdx) {
        const condPart = expr.substring(0, thenIdx).trim();
        const thenPart = expr.substring(thenIdx + 4, elseIdx).trim();
        const elsePart = expr.substring(elseIdx + 4).trim();
        const condVal = evaluateExpression(condPart, context);
        if (isTruthy(condVal)) {
          return evaluateExpression(thenPart, context);
        } else {
          return evaluateExpression(elsePart, context);
        }
      }

      // Handle binary operators in order of precedence:
      // 1. or, xor
      // 2. and
      // 3. comparisons: is not, is, <=, >=, <, >, !=, ==
      // 4. addition/subtraction: +, -
      // 5. multiplication/division/modulo: *, /, %
      // 6. unary: not, -
      // 7. method/member calls, grouping

      const ops = [
        [' or ', ' xor '],
        [' and '],
        [' is not ', ' is ', '<=', '>=', '<', '>', '!=', '=='],
        ['+', '-'],
        ['*', '/', '%']
      ];

      for (const opGroup of ops) {
        const split = findTopLevelOp(expr, opGroup);
        if (split) {
          const left = evaluateExpression(split.left, context);
          const right = evaluateExpression(split.right, context);
          const op = split.op.trim();
          switch (op) {
            case 'or': return isTruthy(left) || isTruthy(right);
            case 'xor': return Boolean(isTruthy(left) ^ isTruthy(right));
            case 'and': return isTruthy(left) && isTruthy(right);
            case 'is not':
            case '!=':
              return !areEqual(left, right);
            case 'is':
            case '==':
              return areEqual(left, right);
            case '<': return left < right;
            case '>': return left > right;
            case '<=': return left <= right;
            case '>=': return left >= right;
            case '+':
              if (typeof left === 'string' || typeof right === 'string') return String(left) + String(right);
              return Number(left) + Number(right);
            case '-': return Number(left) - Number(right);
            case '*': return Number(left) * Number(right);
            case '/': return Number(right) !== 0 ? Number(left) / Number(right) : 0;
            case '%': return Number(left) % Number(right);
          }
        }
      }

      // Unary not
      if (expr.startsWith('not ')) {
        return !isTruthy(evaluateExpression(expr.substring(4), context));
      }

      // Member or call chaining: Obj.Method(args) or Type(args).Method or obj.member
      const dotSplit = findTopLevelDot(expr);
      if (dotSplit) {
        const targetVal = evaluateExpression(dotSplit.target, context);
        const memberCall = dotSplit.call;
        return dispatchMember(targetVal, memberCall, context);
      }

      // Function / Method invocation: Name(arg1, arg2)
      const callMatch = expr.match(/^([A-Za-z0-9_]+)\s*\((.*)\)$/);
      if (callMatch) {
        const callee = callMatch[1];
        const rawArgs = splitArguments(callMatch[2]);
        const evalArgs = rawArgs.map(a => evaluateExpression(a, context));

        // If callee matches a method, call it (unless members exist and it matches the type instantiation)
        const foundMethod = methods.find(m => m.name === callee);
        if (foundMethod && (members.length === 0 || callee !== typeName)) {
          return executeMethod(foundMethod, context.self || {}, evalArgs);
        }

        // Is it instantiating the current type? e.g. TemperatureConverter(100) or AreaCalculator(3, 4)
        if (members.length > 0 && (callee === typeName || callee === 'Self')) {
          const instance = { __type: typeName };
          members.forEach((m, idx) => {
            instance[m.name] = idx < evalArgs.length ? evalArgs[idx] : null;
          });
          return instance;
        }

        if (foundMethod) {
          return executeMethod(foundMethod, context.self || {}, evalArgs);
        }

        // Builtin functions
        if (callee === 'List' || callee === 'Number' || callee === 'Text') {
          return evalArgs.length === 1 ? evalArgs[0] : evalArgs;
        }
      }

      // Parentheses: (expr)
      if (expr.startsWith('(') && expr.endsWith(')')) {
        const inner = expr.substring(1, expr.length - 1);
        if (isBalanced(inner)) {
          return evaluateExpression(inner, context);
        }
      }

      // Literals
      if (expr === 'true') return true;
      if (expr === 'false') return false;
      if (expr === 'None') return null;
      if (/^-?\d+(\.\d+)?$/.test(expr)) return parseFloat(expr);
      if ((expr.startsWith('"') && expr.endsWith('"')) || (expr.startsWith("'") && expr.endsWith("'"))) {
        return expr.substring(1, expr.length - 1);
      }

      // Identifiers from context (locals / parameters / members / self)
      if (context.locals && expr in context.locals) {
        return context.locals[expr];
      }
      if (context.self && expr in context.self) {
        return context.self[expr];
      }

      // Check if expr is a memberless method call on self: e.g. ToFahrenheit
      const mOnSelf = methods.find(m => m.name === expr);
      if (mOnSelf && context.self) {
        return executeMethod(mOnSelf, context.self, []);
      }

      return expr;
    }

    function dispatchMember(target, memberExpr, context) {
      if (target === null || target === undefined) return null;

      const callMatch = memberExpr.match(/^([A-Za-z0-9_]+)(?:\((.*)\))?$/);
      if (!callMatch) return null;
      const memberName = callMatch[1];
      const hasArgs = callMatch[2] !== undefined;
      const rawArgs = hasArgs ? splitArguments(callMatch[2]) : [];
      const evalArgs = rawArgs.map(a => evaluateExpression(a, context));

      // Check if target is a snippet instance
      if (typeof target === 'object') {
        if (memberName in target) {
          return target[memberName];
        }
        const m = methods.find(m => m.name === memberName);
        if (m) {
          return executeMethod(m, target, evalArgs);
        }
      }

      // Array / List methods
      if (Array.isArray(target)) {
        if (memberName === 'Length' || memberName === 'Count') return target.length;
        if (memberName === 'First') return target[0];
        if (memberName === 'Last') return target[target.length - 1];
        if (memberName === 'Contains') return target.includes(evalArgs[0]);
      }

      // String / Text methods
      if (typeof target === 'string') {
        if (memberName === 'Length') return target.length;
        if (memberName === 'ToUpper') return target.toUpperCase();
        if (memberName === 'ToLower') return target.toLowerCase();
        if (memberName === 'Contains') return target.includes(evalArgs[0]);
      }

      return null;
    }

    function executeMethod(method, selfObj, argValues) {
      const locals = { ...selfObj };
      method.params.forEach((p, idx) => {
        locals[p.name] = idx < argValues.length ? argValues[idx] : null;
      });

      const methodContext = { self: selfObj, locals: locals };
      let lastVal = null;

      for (const lineObj of method.bodyLines) {
        let text = lineObj.text.trim();
        if (text.startsWith('let ')) {
          const eqIdx = text.indexOf('=');
          if (eqIdx > 4) {
            const varName = text.substring(4, eqIdx).trim();
            const valExpr = text.substring(eqIdx + 1).trim();
            const val = evaluateExpression(valExpr, methodContext);
            locals[varName] = val;
            recordValue(lineObj.lineIndex, val);
            lastVal = val;
            continue;
          }
        }
        const evaluated = evaluateExpression(text, methodContext);
        recordValue(lineObj.lineIndex, evaluated);
        lastVal = evaluated;
      }

      return lastVal;
    }

    // Helpers
    function isTruthy(val) {
      if (typeof val === 'boolean') return val;
      if (val === null || val === undefined) return false;
      if (typeof val === 'number') return val !== 0;
      if (typeof val === 'string') return val.length > 0;
      if (Array.isArray(val)) return val.length > 0;
      return true;
    }

    function areEqual(a, b) {
      if (a === b) return true;
      if (typeof a === 'number' && typeof b === 'number') {
        return Math.abs(a - b) < 0.0001;
      }
      return String(a) === String(b);
    }

    function isBalanced(str) {
      let depth = 0;
      for (let i = 0; i < str.length; i++) {
        if (str[i] === '(') depth++;
        else if (str[i] === ')') depth--;
        if (depth < 0) return false;
      }
      return depth === 0;
    }

    function splitArguments(argString) {
      if (!argString || !argString.trim()) return [];
      const args = [];
      let current = '';
      let depth = 0;
      let inQuote = false;
      for (let i = 0; i < argString.length; i++) {
        const ch = argString[i];
        if (ch === '"' || ch === "'") inQuote = !inQuote;
        if (!inQuote) {
          if (ch === '(') depth++;
          else if (ch === ')') depth--;
          else if (ch === ',' && depth === 0) {
            args.push(current.trim());
            current = '';
            continue;
          }
        }
        current += ch;
      }
      if (current.trim()) args.push(current.trim());
      return args;
    }

    function findKeyword(expr, kw) {
      let depth = 0;
      let inQuote = false;
      const target = ' ' + kw + ' ';
      for (let i = 0; i <= expr.length - target.length; i++) {
        const ch = expr[i];
        if (ch === '"' || ch === "'") inQuote = !inQuote;
        if (!inQuote) {
          if (ch === '(') depth++;
          else if (ch === ')') depth--;
          else if (depth === 0 && expr.startsWith(target, i)) {
            return i + 1; // index where keyword starts
          }
        }
      }
      return -1;
    }

    function findTopLevelOp(expr, opList) {
      let depth = 0;
      let inQuote = false;
      // Search from right to left for left-associative operators
      for (let i = expr.length - 1; i >= 0; i--) {
        const ch = expr[i];
        if (ch === '"' || ch === "'") inQuote = !inQuote;
        if (!inQuote) {
          if (ch === ')') depth++;
          else if (ch === '(') depth--;
          else if (depth === 0) {
            for (const op of opList) {
              const opLen = op.length;
              if (i >= opLen - 1 && expr.substring(i - opLen + 1, i + 1) === op) {
                // Ensure subtraction vs negative number distinction
                if (op === '-' && (i - opLen < 0 || /[\+\-\*\/%(<>=]/.test(expr[i - opLen].trim()))) {
                  continue;
                }
                const left = expr.substring(0, i - opLen + 1).trim();
                const right = expr.substring(i + 1).trim();
                if (left && right) {
                  return { left, right, op };
                }
              }
            }
          }
        }
      }
      return null;
    }

    function findTopLevelDot(expr) {
      let depth = 0;
      let inQuote = false;
      for (let i = expr.length - 1; i >= 0; i--) {
        const ch = expr[i];
        if (ch === '"' || ch === "'") inQuote = !inQuote;
        if (!inQuote) {
          if (ch === ')') depth++;
          else if (ch === '(') depth--;
          else if (depth === 0 && ch === '.') {
            // Check it's not a decimal point in a number
            const before = expr[i - 1];
            const after = expr[i + 1];
            if (/\d/.test(before) && /\d/.test(after)) continue;
            return {
              target: expr.substring(0, i).trim(),
              call: expr.substring(i + 1).trim()
            };
          }
        }
      }
      return null;
    }

    // Step 3: Run all inline tests across all methods
    const testResults = [];
    let hasFailure = false;

    for (const m of methods) {
      for (const t of m.tests) {
        const startTime = performance.now();
        let passed = false;
        let gotVal = null;
        let expectedVal = null;
        let errorMsg = null;

        try {
          expectedVal = evaluateExpression(t.expected, { self: {}, locals: {} });
          gotVal = evaluateExpression(t.expr, { self: {}, locals: {} });

          if (t.not) {
            passed = !areEqual(gotVal, expectedVal);
          } else {
            passed = areEqual(gotVal, expectedVal);
          }
          if (!passed) hasFailure = true;
        } catch (err) {
          hasFailure = true;
          errorMsg = err.message || String(err);
        }

        const durationMs = Math.max(0.01, performance.now() - startTime);
        testResults.push({
          lineIndex: t.lineIndex,
          raw: t.raw,
          passed: passed,
          got: gotVal,
          expected: expectedVal,
          error: errorMsg,
          durationMs: durationMs
        });
      }
    }

    // If there were no inline tests in methods, see if there is any method we can invoke with sample values
    if (testResults.length === 0 && methods.length > 0) {
      methods.forEach(m => {
        try {
          const sampleArgs = m.params.map(p => p.type === 'Number' ? 5 : p.type === 'Text' ? 'Strict' : true);
          const sampleSelf = {};
          members.forEach(mem => { sampleSelf[mem.name] = mem.type === 'Number' ? 10 : 0; });
          executeMethod(m, sampleSelf, sampleArgs);
        } catch (e) {
          // ignore sample run errors
        }
      });
    }

    return {
      success: !hasFailure,
      tests: testResults,
      lines: lineTrace,
      members: members,
      methods: methods
    };
  }

  const StrictMiniEval = {
    evaluateSnippet: evaluateSnippet
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = StrictMiniEval;
  }
  if (typeof global !== 'undefined') {
    global.StrictMiniEval = StrictMiniEval;
  }
  if (typeof window !== 'undefined') {
    window.StrictMiniEval = StrictMiniEval;
  }
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
