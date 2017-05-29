var test = require('tape')
var lexer = require('./index.js')

test('lexer', function (t) {
  t.test('literals', function (t) {
    testCase(t, 'true', [{ type: 'literal', value: true, raw: 'true' }])
    testCase(t, 'false', [{ type: 'literal', value: false, raw: 'false' }])
    testCase(t, 'null', [{ type: 'literal', value: null, raw: 'null' }])
    t.end()
  })
  t.test('numbers', function (t) {
    testCase(t, '1', [{ type: 'number', value: 1, raw: '1' }])
    testCase(t, '1.0', [{ type: 'number', value: 1, raw: '1.0' }])
    testCase(t, '1.000', [{ type: 'number', value: 1, raw: '1.000' }])
    testCase(t, '1.5', [{ type: 'number', value: 1.5, raw: '1.5' }])
    testCase(t, '-1.5', [{ type: 'number', value: -1.5, raw: '-1.5' }])
    testCase(t, '123e5', [{ type: 'number', value: 123e5, raw: '123e5' }])
    testCase(t, '123e-5', [{ type: 'number', value: 123e-5, raw: '123e-5' }])
    t.end()
  })
  t.test('strings', function (t) {
    testCase(t, '""', [{ type: 'string', value: '', raw: '""' }])
    testCase(t, '"a"', [{ type: 'string', value: 'a', raw: '"a"' }])
    testCase(t, '"abcd"', [{ type: 'string', value: 'abcd', raw: '"abcd"' }])
    testCase(t, '"\\"\\/\\b\\t\\n\\f\\r\\\\"', [{ type: 'string', value: '"/\b\t\n\f\r\\', raw: '"\\"\\/\\b\\t\\n\\f\\r\\\\"' }])
    testCase(t, '"hi \\u0066\\u0069\\u006E\\u006E"', [{ type: 'string', value: 'hi finn', raw: '"hi \\u0066\\u0069\\u006E\\u006E"' }])
    t.end()
  })
  t.test('illegals', function (t) {
    expectError(t, '012', 'Illegal octal literal.')
    expectError(t, '2e', 'Illegal empty exponent.')
    expectError(t, '1.', 'Illegal trailing decimal.')
    expectError(t, '-', 'A negative sign may only precede numbers.')
    expectError(t, '"hi', 'Unterminated string.')
    expectError(t, '"\\x"', 'Invalid escape sequence.')
    expectError(t, '"\\u00G0"', 'Invalid Unicode escape sequence.')
    expectError(t, '"\0"', 'Unescaped ASCII control characters are not permitted.')
    expectError(t, 'undefined', 'Unrecognized token.')
    t.end()
  })
  t.test('arrays', function (t) {
    testCase(t, '[]', [
      { type: 'punctuator', value: '[', raw: '[' },
      { type: 'punctuator', value: ']', raw: ']' }
    ])
    testCase(t, '[1]', [
      { type: 'punctuator', value: '[', raw: '[' },
      { type: 'number', value: 1, raw: '1' },
      { type: 'punctuator', value: ']', raw: ']' }
    ])
    testCase(t, '[1,2]', [
      { type: 'punctuator', value: '[', raw: '[' },
      { type: 'number', value: 1, raw: '1' },
      { type: 'punctuator', value: ',', raw: ',' },
      { type: 'number', value: 2, raw: '2' },
      { type: 'punctuator', value: ']', raw: ']' }
    ])
    testCase(t, '[true,2,"3"]', [
      { type: 'punctuator', value: '[', raw: '[' },
      { type: 'literal', value: true, raw: 'true' },
      { type: 'punctuator', value: ',', raw: ',' },
      { type: 'number', value: 2, raw: '2' },
      { type: 'punctuator', value: ',', raw: ',' },
      { type: 'string', value: '3', raw: '"3"' },
      { type: 'punctuator', value: ']', raw: ']' }
    ])
    t.end()
  })
  t.test('objects', function (t) {
    testCase(t, '{"a":"b"}', [
      { type: 'punctuator', value: '{', raw: '{' },
      { type: 'string', value: 'a', raw: '"a"' },
      { type: 'punctuator', value: ':', raw: ':' },
      { type: 'string', value: 'b', raw: '"b"' },
      { type: 'punctuator', value: '}', raw: '}' }
    ])
    testCase(t, '\t\t\n\t{"a":  \t  "b"}', [
      { type: 'whitespace', value: '\t\t\n\t', raw: '\t\t\n\t' },
      { type: 'punctuator', value: '{', raw: '{' },
      { type: 'string', value: 'a', raw: '"a"' },
      { type: 'punctuator', value: ':', raw: ':' },
      { type: 'whitespace', value: '  \t  ', raw: '  \t  ' },
      { type: 'string', value: 'b', raw: '"b"' },
      { type: 'punctuator', value: '}', raw: '}' }
    ])
    testCase(t, '{"a" : "b"}', [
      { type: 'punctuator', value: '{', raw: '{' },
      { type: 'string', value: 'a', raw: '"a"' },
      { type: 'whitespace', value: ' ', raw: ' ' },
      { type: 'punctuator', value: ':', raw: ':' },
      { type: 'whitespace', value: ' ', raw: ' ' },
      { type: 'string', value: 'b', raw: '"b"' },
      { type: 'punctuator', value: '}', raw: '}' }
    ])
    testCase(t, '\t{"a" : "b"\n}\t', [
      { type: 'whitespace', value: '\t', raw: '\t' },
      { type: 'punctuator', value: '{', raw: '{' },
      { type: 'string', value: 'a', raw: '"a"' },
      { type: 'whitespace', value: ' ', raw: ' ' },
      { type: 'punctuator', value: ':', raw: ':' },
      { type: 'whitespace', value: ' ', raw: ' ' },
      { type: 'string', value: 'b', raw: '"b"' },
      { type: 'whitespace', value: '\n', raw: '\n' },
      { type: 'punctuator', value: '}', raw: '}' },
      { type: 'whitespace', value: '\t', raw: '\t' }
    ])
    testCase(t, '{"a":{"b":1}}', [
      { type: 'punctuator', value: '{', raw: '{' },
      { type: 'string', value: 'a', raw: '"a"' },
      { type: 'punctuator', value: ':', raw: ':' },
      { type: 'punctuator', value: '{', raw: '{' },
      { type: 'string', value: 'b', raw: '"b"' },
      { type: 'punctuator', value: ':', raw: ':' },
      { type: 'number', value: 1, raw: '1' },
      { type: 'punctuator', value: '}', raw: '}' },
      { type: 'punctuator', value: '}', raw: '}' }
    ])
    t.end()
  })

  const newLine = String.fromCharCode(10)
  const backslash = String.fromCharCode(92)

  t.test('errors', function (t1) {
    t1.test('Unescaped ASCII control characters are not permitted.', function (t2) {
      testCase(t2, `"break${newLine}break"`, [
        { type: 'string', value: null, raw: `"break${newLine}break"`, issue: { message: 'Unescaped ASCII control characters are not permitted.', start: 6, length: 1 } }
      ], { throwOnError: false })
      testCase(t2, `"break${newLine}${newLine}break"`, [
        { type: 'string', value: null, raw: `"break${newLine}${newLine}break"`, issue: { message: 'Unescaped ASCII control characters are not permitted.', start: 6, length: 1 } }
      ], { throwOnError: false })
      testCase(t2, `{"foo":"break${newLine}break"}`, [
        { type: 'punctuator', value: '{', raw: '{' },
        { type: 'string', value: 'foo', raw: '"foo"' },
        { type: 'punctuator', value: ':', raw: ':' },
        { type: 'string', value: null, raw: `"break${newLine}break"`, issue: { message: 'Unescaped ASCII control characters are not permitted.', start: 6, length: 1 } }
      ], { throwOnError: false })
      testCase(t2, `{"foo":"break${backslash}"${newLine}}`, [
        { type: 'punctuator', value: '{', raw: '{' },
        { type: 'string', value: 'foo', raw: '"foo"' },
        { type: 'punctuator', value: ':', raw: ':' }, {
          type: 'string',
          value: null,
          raw: `"break${backslash}"${newLine}}`,
          issue: {
            message: 'Unescaped ASCII control characters are not permitted.',
            start: 8,
            length: 1
          }
        }], { throwOnError: false })
      t2.end()
    })
    t1.test('Invalid Unicode escape sequence.', function (t2) {
      testCase(t2, `"${backslash}u"`, [
        { type: 'string', value: null, raw: `"${backslash}u"`, issue: { message: 'Invalid Unicode escape sequence.', start: 1, length: 2 } }
      ], { throwOnError: false })
      testCase(t2, `"${backslash}u0"`, [
        { type: 'string', value: null, raw: `"${backslash}u0"`, issue: { message: 'Invalid Unicode escape sequence.', start: 1, length: 2 } }
      ], { throwOnError: false })
      testCase(t2, `"${backslash}u00"`, [
        { type: 'string', value: null, raw: `"${backslash}u00"`, issue: { message: 'Invalid Unicode escape sequence.', start: 1, length: 2 } }
      ], { throwOnError: false })
      testCase(t2, `"${backslash}u000"`, [
        { type: 'string', value: null, raw: `"${backslash}u000"`, issue: { message: 'Invalid Unicode escape sequence.', start: 1, length: 2 } }
      ], { throwOnError: false })
      testCase(t2, `{"foo":"break${backslash}ubreak"}`, [
        { type: 'punctuator', value: '{', raw: '{' },
        { type: 'string', value: 'foo', raw: '"foo"' },
        { type: 'punctuator', value: ':', raw: ':' }, {
          type: 'string',
          value: null,
          raw: `"break${backslash}ubreak"`,
          issue: {
            message: 'Invalid Unicode escape sequence.',
            start: 6,
            length: 2
          }
        }], { throwOnError: false })
      t2.end()
    })
    t1.test('Invalid escape sequence.', function (t2) {
      testCase(t2, `"${backslash}x"`, [
        { type: 'string', value: null, raw: `"${backslash}x"`, issue: { message: 'Invalid escape sequence.', start: 1, length: 2 } }
      ], { throwOnError: false })
      testCase(t2, `"${backslash}xbreak"`, [
        { type: 'string', value: null, raw: `"${backslash}xbreak"`, issue: { message: 'Invalid escape sequence.', start: 1, length: 2 } }
      ], { throwOnError: false })
      testCase(t2, `{"foo":"break${backslash}xbreak"}`, [
        { type: 'punctuator', value: '{', raw: '{' },
        { type: 'string', value: 'foo', raw: '"foo"' },
        { type: 'punctuator', value: ':', raw: ':' }, {
          type: 'string',
          value: null,
          raw: `"break${backslash}xbreak"`,
          issue: {
            message: 'Invalid escape sequence.',
            start: 6,
            length: 2
          }
        }], { throwOnError: false })
      t2.end()
    })
    t1.test('Unterminated string.', function (t2) {
      testCase(t2, `"foo`, [
        { type: 'string', value: null, raw: `"foo`, issue: { message: 'Unterminated string.', start: 0, length: 4 } }
      ], { throwOnError: false })
      testCase(t2, `{"foo":"bar}`, [
        { type: 'punctuator', value: '{', raw: '{' },
        { type: 'string', value: 'foo', raw: '"foo"' },
        { type: 'punctuator', value: ':', raw: ':' }, {
          type: 'string',
          value: null,
          raw: `"bar}`,
          issue: {
            message: 'Unterminated string.',
            start: 0,
            length: 5
          }
        }], { throwOnError: false })
      t2.end()
    })
    t1.test('Illegal octal literal.', function (t2) {
      testCase(t2, `012`, [
        { type: 'number', value: null, raw: `012`, issue: { message: 'Illegal octal literal.', start: 0, length: 3 } }
      ], { throwOnError: false })
      testCase(t2, `012 `, [
        { type: 'number', value: null, raw: `012`, issue: { message: 'Illegal octal literal.', start: 0, length: 3 } }
      ], { throwOnError: false })
      testCase(t2, `{"foo":012}`, [
        { type: 'punctuator', value: '{', raw: '{' },
        { type: 'string', value: 'foo', raw: '"foo"' },
        { type: 'punctuator', value: ':', raw: ':' }, {
          type: 'number',
          value: null,
          raw: `012`,
          issue: {
            message: 'Illegal octal literal.',
            start: 0,
            length: 3
          }
        }], { throwOnError: false })
      testCase(t2, `{"foo":012-}`, [
        { type: 'punctuator', value: '{', raw: '{' },
        { type: 'string', value: 'foo', raw: '"foo"' },
        { type: 'punctuator', value: ':', raw: ':' }, {
          type: 'number',
          value: null,
          raw: `012`,
          issue: {
            message: 'Illegal octal literal.',
            start: 0,
            length: 3
          }
        }], { throwOnError: false })
      testCase(t2, `{"foo":012}`, [
        { type: 'punctuator', value: '{', raw: '{' },
        { type: 'string', value: 'foo', raw: '"foo"' },
        { type: 'punctuator', value: ':', raw: ':' }, {
          type: 'number',
          value: null,
          raw: `012`,
          issue: {
            message: 'Illegal octal literal.',
            start: 0,
            length: 3
          }
        }], { throwOnError: false })
      testCase(t2, `{"foo":012}`, [
        { type: 'punctuator', value: '{', raw: '{' },
        { type: 'string', value: 'foo', raw: '"foo"' },
        { type: 'punctuator', value: ':', raw: ':' }, {
          type: 'number',
          value: null,
          raw: `012`,
          issue: {
            message: 'Illegal octal literal.',
            start: 0,
            length: 3
          }
        }], { throwOnError: false })
      t2.end()
    })
    t1.test('Illegal trailing decimal.', function (t2) {
      testCase(t2, `0..120e-`, [
        { type: 'number', value: null, raw: `0..120e-`, issue: { message: 'Illegal trailing decimal.', start: 2, length: 1 } }
      ], { throwOnError: false })
      t2.end()
    })
    t1.test('Illegal empty exponent.', function (t2) {
      testCase(t2, `1e`, [
        { type: 'number', value: null, raw: `1e`, issue: { message: 'Illegal empty exponent.', start: 0, length: 2 } }
      ], { throwOnError: false })
      t2.end()
    })
    t1.test('A negative sign may only precede numbers.', function (t2) {
      testCase(t2, `-&`, [
        { type: 'number', value: null, raw: `-`, issue: { message: 'A negative sign may only precede numbers.', start: 0, length: 1 } }
      ], { throwOnError: false })
      testCase(t2, `--0023312312312`, [
        { type: 'number', value: null, raw: `--0023312312312`, issue: { message: 'A negative sign may only precede numbers.', start: 0, length: 1 } }
      ], { throwOnError: false })
      t2.end()
    })
    t1.test('Unrecognized token.', function (t2) {
      testCase(t2, `&`, [
        { type: 'unknown', value: null, raw: `&`, issue: { message: 'Unrecognized token.', start: 0, length: 1 } }
      ], { throwOnError: false })
      t2.end()
    })
  })
})

function attr (attribute, arr) {
  return arr.map(function (elem) {
    return elem[attribute]
  })
}

function testCase (t, json, result, options) {
  var lexed = lexer(json, options)

  t.deepEqual(attr('type', lexed), attr('type', result), json + ' types')
  t.deepEqual(attr('value', lexed), attr('value', result), json + ' values')
  t.deepEqual(attr('raw', lexed), attr('raw', result), json + ' raw')
  t.deepEqual(attr('issue', lexed), attr('issue', result), json + ' issue')
}

function expectError (t, json, message) {
  try {
    var result = lexer(json)
  } catch (e) {
    return t.equal(e.message, 'Parsing error: ' + message, json)
  }
  t.fail('Did not throw: ' + json + ' ' + JSON.stringify(result))
}
