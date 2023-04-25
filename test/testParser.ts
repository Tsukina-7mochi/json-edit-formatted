import { JSONParser, JSONSymbol } from '../mod.ts';
import { asserts } from './deps.ts';

const assertEquals = asserts.assertEquals;

Deno.test('[JSONSymbol] stringify #1', () => {
  const symbol = new JSONSymbol('string', ['a', 'b', 'c']);

  assertEquals(symbol.stringify(), 'abc');
});

Deno.test('[JSONSymbol] stringify #2', () => {
  const symbol1 = new JSONSymbol('string', ['a', 'b', 'c']);
  const symbol2 = new JSONSymbol('string', ['x', 'y', 'z']);
  const symbol3 = new JSONSymbol('string', [symbol1, '-', symbol2]);

  assertEquals(symbol3.stringify(), 'abc-xyz');
});

Deno.test('[JSONParser] parseWs', () => {
  const parser = new JSONParser('   \t  \r \n abc');
  const parsed = parser.parseWs();

  assertEquals(parsed, new JSONSymbol('ws', ['   \t  \r \n ']));
  assertEquals(parser.index, '   \t  \r \n '.length);
});

Deno.test('[JSONParser] parseLiteral: false', () => {
  const parser = new JSONParser('false, ');
  const parsed = parser.parseLiteral();

  assertEquals(parsed, new JSONSymbol('literal', ['false']));
  assertEquals(parser.index, 'false'.length);
});

Deno.test('[JSONParser] parseLiteral: true', () => {
  const parser = new JSONParser('true, ');
  const parsed = parser.parseLiteral();

  assertEquals(parsed, new JSONSymbol('literal', ['true']));
  assertEquals(parser.index, 'true'.length);
});

Deno.test('[JSONParser] parseLiteral: null', () => {
  const parser = new JSONParser('null, ');
  const parsed = parser.parseLiteral();

  assertEquals(parsed, new JSONSymbol('literal', ['null']));
  assertEquals(parser.index, 'null'.length);
});

Deno.test('[JSONParser] parseNumber: integer #1', () => {
  const parser = new JSONParser('1234567890, ');
  const parsed = parser.parseNumber();

  assertEquals(parsed, new JSONSymbol('number', ['1234567890']));
  assertEquals(parser.index, '1234567890'.length);
});

Deno.test('[JSONParser] parseNumber: integer #2', () => {
  const parser = new JSONParser('-1, ');
  const parsed = parser.parseNumber();

  assertEquals(parsed, new JSONSymbol('number', ['-1']));
  assertEquals(parser.index, '-1'.length);
});

Deno.test('[JSONParser] parseNumber: float', () => {
  const parser = new JSONParser('3.141592, ');
  const parsed = parser.parseNumber();

  assertEquals(parsed, new JSONSymbol('number', ['3.141592']));
  assertEquals(parser.index, '3.141592'.length);
});

Deno.test('[JSONParser] parseNumber: float exponential #1', () => {
  const parser = new JSONParser('-0.1e+2, ');
  const parsed = parser.parseNumber();

  assertEquals(parsed, new JSONSymbol('number', ['-0.1e+2']));
  assertEquals(parser.index, '-0.1e+2'.length);
});

Deno.test('[JSONParser] parseNumber: float exponential #2', () => {
  const parser = new JSONParser('-0.1E-2, ');
  const parsed = parser.parseNumber();

  assertEquals(parsed, new JSONSymbol('number', ['-0.1E-2']));
  assertEquals(parser.index, '-0.1E-2'.length);
});

Deno.test('[JSONParser] parseString #1', () => {
  const parser = new JSONParser('"foo", ');
  const parsed = parser.parseString();

  assertEquals(parsed, new JSONSymbol('string', ['"foo"']));
  assertEquals(parser.index, '"foo"'.length);
});

Deno.test('[JSONParser] parseString #2', () => {
  const parser = new JSONParser('"", ');
  const parsed = parser.parseString();

  assertEquals(parsed, new JSONSymbol('string', ['""']));
  assertEquals(parser.index, '""'.length);
});

Deno.test('[JSONParser] parseString #3', () => {
  const parser = new JSONParser('"abc\\"efg", ');
  const parsed = parser.parseString();

  assertEquals(parsed, new JSONSymbol('string', ['"abc\\"efg"']));
  assertEquals(parser.index, '"abc\\"efg"'.length);
});

Deno.test('[JSONParser] parseBeginArray #1', () => {
  const parser = new JSONParser('[123');
  const parsed = parser.parseBeginArray();

  assertEquals(parsed, new JSONSymbol('begin-array', ['', '[', '']));
  assertEquals(parser.index, '['.length);
});

Deno.test('[JSONParser] parseBeginArray #2', () => {
  const parser = new JSONParser('\t[\n 123');
  const parsed = parser.parseBeginArray();

  assertEquals(parsed, new JSONSymbol('begin-array', ['\t', '[', '\n ']));
  assertEquals(parser.index, '\t[\n '.length);
});

Deno.test('[JSONParser] parseBeginObject #1', () => {
  const parser = new JSONParser('{123');
  const parsed = parser.parseBeginObject();

  assertEquals(parsed, new JSONSymbol('begin-object', ['', '{', '']));
  assertEquals(parser.index, '['.length);
});

Deno.test('[JSONParser] parseBeginObject #2', () => {
  const parser = new JSONParser('\t{\n 123');
  const parsed = parser.parseBeginObject();

  assertEquals(parsed, new JSONSymbol('begin-object', ['\t', '{', '\n ']));
  assertEquals(parser.index, '\t{\n '.length);
});

Deno.test('[JSONParser] parseEndArray #1', () => {
  const parser = new JSONParser(']123');
  const parsed = parser.parseEndArray();

  assertEquals(parsed, new JSONSymbol('end-array', ['', ']', '']));
  assertEquals(parser.index, ']'.length);
});

Deno.test('[JSONParser] parseEndArray #2', () => {
  const parser = new JSONParser('\t]\n 123');
  const parsed = parser.parseEndArray();

  assertEquals(parsed, new JSONSymbol('end-array', ['\t', ']', '\n ']));
  assertEquals(parser.index, '\t]\n '.length);
});

Deno.test('[JSONParser] parseEndObject #1', () => {
  const parser = new JSONParser('}123');
  const parsed = parser.parseEndObject();

  assertEquals(parsed, new JSONSymbol('end-object', ['', '}', '']));
  assertEquals(parser.index, '}'.length);
});

Deno.test('[JSONParser] parseEndObject #2', () => {
  const parser = new JSONParser('\t}\n 123');
  const parsed = parser.parseEndObject();

  assertEquals(parsed, new JSONSymbol('end-object', ['\t', '}', '\n ']));
  assertEquals(parser.index, '\t}\n '.length);
});

Deno.test('[JSONParser] parseNameSeparator #1', () => {
  const parser = new JSONParser(':123');
  const parsed = parser.parseNameSeparator();

  assertEquals(parsed, new JSONSymbol('name-separator', ['', ':', '']));
  assertEquals(parser.index, ':'.length);
});

Deno.test('[JSONParser] parseNameSeparator #2', () => {
  const parser = new JSONParser('\t:\n 123');
  const parsed = parser.parseNameSeparator();

  assertEquals(parsed, new JSONSymbol('name-separator', ['\t', ':', '\n ']));
  assertEquals(parser.index, '\t:\n '.length);
});

Deno.test('[JSONParser] parseValueSeparator #1', () => {
  const parser = new JSONParser(',123');
  const parsed = parser.parseValueSeparator();

  assertEquals(parsed, new JSONSymbol('value-separator', ['', ',', '']));
  assertEquals(parser.index, ','.length);
});

Deno.test('[JSONParser] parseValueSeparator #2', () => {
  const parser = new JSONParser('\t,\n 123');
  const parsed = parser.parseValueSeparator();

  assertEquals(parsed, new JSONSymbol('value-separator', ['\t', ',', '\n ']));
  assertEquals(parser.index, '\t,\n '.length);
});

Deno.test('[JSONParser] parseNameSeparator #1', () => {
  const parser = new JSONParser(':123');
  const parsed = parser.parseNameSeparator();

  assertEquals(parsed, new JSONSymbol('name-separator', ['', ':', '']));
  assertEquals(parser.index, ':'.length);
});

Deno.test('[JSONParser] parseValue: true', () => {
  const parser = new JSONParser('true, ');
  const parsed = parser.parseValue();

  assertEquals(parsed, new JSONSymbol('literal', ['true']));
  assertEquals(parser.index, 'true'.length);
});

Deno.test('[JSONParser] parseValue: false', () => {
  const parser = new JSONParser('false, ');
  const parsed = parser.parseValue();

  assertEquals(parsed, new JSONSymbol('literal', ['false']));
  assertEquals(parser.index, 'false'.length);
});

Deno.test('[JSONParser] parseValue: null', () => {
  const parser = new JSONParser('null, ');
  const parsed = parser.parseValue();

  assertEquals(parsed, new JSONSymbol('literal', ['null']));
  assertEquals(parser.index, 'null'.length);
});

Deno.test('[JSONParser] parseValue: object', () => {
  const parser = new JSONParser('{"a": 1}, ');
  const parsed = parser.parseValue();

  assertEquals(
    parsed,
    new JSONSymbol('object', [
      new JSONSymbol('begin-object', ['', '{', '']),
      new JSONSymbol('member', [
        new JSONSymbol('string', ['"a"']),
        new JSONSymbol('name-separator', ['', ':', ' ']),
        new JSONSymbol('number', ['1']),
      ]),
      new JSONSymbol('end-object', ['', '}', '']),
    ]),
  );
  assertEquals(parser.index, '{"a": 1}'.length);
});

Deno.test('[JSONParser] parseValue: array', () => {
  const parser = new JSONParser('[1], ');
  const parsed = parser.parseValue();

  assertEquals(
    parsed,
    new JSONSymbol('array', [
      new JSONSymbol('begin-array', ['', '[', '']),
      new JSONSymbol('number', ['1']),
      new JSONSymbol('end-array', ['', ']', '']),
    ]),
  );
  assertEquals(parser.index, '[1]'.length);
});

Deno.test('[JSONParser] parseValue: string', () => {
  const parser = new JSONParser('"foo", ');
  const parsed = parser.parseValue();

  assertEquals(parsed, new JSONSymbol('string', ['"foo"']));
  assertEquals(parser.index, '"foo"'.length);
});

Deno.test('[JSONParser] parseMember #1', () => {
  const parser = new JSONParser('"abc":123');
  const parsed = parser.parseMember();

  assertEquals(
    parsed,
    new JSONSymbol('member', [
      new JSONSymbol('string', ['"abc"']),
      new JSONSymbol('name-separator', ['', ':', '']),
      new JSONSymbol('number', ['123']),
    ]),
  );
  assertEquals(parser.index, '"abc":123'.length);
});

Deno.test('[JSONParser] parseMember #2', () => {
  const parser = new JSONParser('"abc" :\tnull');
  const parsed = parser.parseMember();

  assertEquals(
    parsed,
    new JSONSymbol('member', [
      new JSONSymbol('string', ['"abc"']),
      new JSONSymbol('name-separator', [' ', ':', '\t']),
      new JSONSymbol('literal', ['null']),
    ]),
  );
  assertEquals(parser.index, '"abc" :\tnull'.length);
});

Deno.test('[JSONParser] parseObject #1', () => {
  const parser = new JSONParser('{}, ');
  const parsed = parser.parseObject();

  assertEquals(
    parsed,
    new JSONSymbol('object', [
      new JSONSymbol('begin-object', ['', '{', '']),
      new JSONSymbol('end-object', ['', '}', '']),
    ]),
  );
  assertEquals(parser.index, '{}'.length);
});

Deno.test('[JSONParser] parseObject #2', () => {
  const parser = new JSONParser('\t{  }\n, ');
  const parsed = parser.parseObject();

  assertEquals(
    parsed,
    new JSONSymbol('object', [
      new JSONSymbol('begin-object', ['\t', '{', '  ']),
      new JSONSymbol('end-object', ['', '}', '\n']),
    ]),
  );
  assertEquals(parser.index, '\t{  }\n'.length);
});

Deno.test('[JSONParser] parseObject #3', () => {
  const parser = new JSONParser('{"a": 1}, ');
  const parsed = parser.parseObject();

  assertEquals(
    parsed,
    new JSONSymbol('object', [
      new JSONSymbol('begin-object', ['', '{', '']),
      new JSONSymbol('member', [
        new JSONSymbol('string', ['"a"']),
        new JSONSymbol('name-separator', ['', ':', ' ']),
        new JSONSymbol('number', ['1']),
      ]),
      new JSONSymbol('end-object', ['', '}', '']),
    ]),
  );
  assertEquals(parser.index, '{"a": 1}'.length);
});

Deno.test('[JSONParser] parseObject #4', () => {
  const parser = new JSONParser('{"a": 1, "b": 2}, ');
  const parsed = parser.parseObject();

  assertEquals(
    parsed,
    new JSONSymbol('object', [
      new JSONSymbol('begin-object', ['', '{', '']),
      new JSONSymbol('member', [
        new JSONSymbol('string', ['"a"']),
        new JSONSymbol('name-separator', ['', ':', ' ']),
        new JSONSymbol('number', ['1']),
      ]),
      new JSONSymbol('value-separator', ['', ',', ' ']),
      new JSONSymbol('member', [
        new JSONSymbol('string', ['"b"']),
        new JSONSymbol('name-separator', ['', ':', ' ']),
        new JSONSymbol('number', ['2']),
      ]),
      new JSONSymbol('end-object', ['', '}', '']),
    ]),
  );
  assertEquals(parser.index, '{"a": 1, "b": 2}'.length);
});

Deno.test('[JSONParser] parseObject #5', () => {
  const parser = new JSONParser('{"a": {"b": 1}}, ');
  const parsed = parser.parseObject();

  assertEquals(
    parsed,
    new JSONSymbol('object', [
      new JSONSymbol('begin-object', ['', '{', '']),
      new JSONSymbol('member', [
        new JSONSymbol('string', ['"a"']),
        new JSONSymbol('name-separator', ['', ':', ' ']),
        new JSONSymbol('object', [
          new JSONSymbol('begin-object', ['', '{', '']),
          new JSONSymbol('member', [
            new JSONSymbol('string', ['"b"']),
            new JSONSymbol('name-separator', ['', ':', ' ']),
            new JSONSymbol('number', ['1']),
          ]),
          new JSONSymbol('end-object', ['', '}', '']),
        ]),
      ]),
      new JSONSymbol('end-object', ['', '}', '']),
    ]),
  );
  assertEquals(parser.index, '{"a": {"b": 1}}'.length);
});

Deno.test('[JSONParser] parseArray #1', () => {
  const parser = new JSONParser('[], ');
  const parsed = parser.parseArray();

  assertEquals(
    parsed,
    new JSONSymbol('array', [
      new JSONSymbol('begin-array', ['', '[', '']),
      new JSONSymbol('end-array', ['', ']', '']),
    ]),
  );
  assertEquals(parser.index, '[]'.length);
});

Deno.test('[JSONParser] parseArray #2', () => {
  const parser = new JSONParser('\t[  ]\n, ');
  const parsed = parser.parseArray();

  assertEquals(
    parsed,
    new JSONSymbol('array', [
      new JSONSymbol('begin-array', ['\t', '[', '  ']),
      new JSONSymbol('end-array', ['', ']', '\n']),
    ]),
  );
  assertEquals(parser.index, '\t{  }\n'.length);
});

Deno.test('[JSONParser] parseArray #3', () => {
  const parser = new JSONParser('["a"], ');
  const parsed = parser.parseArray();

  assertEquals(
    parsed,
    new JSONSymbol('array', [
      new JSONSymbol('begin-array', ['', '[', '']),
      new JSONSymbol('string', ['"a"']),
      new JSONSymbol('end-array', ['', ']', '']),
    ]),
  );
  assertEquals(parser.index, '["a"]'.length);
});

Deno.test('[JSONParser] parseArray #4', () => {
  const parser = new JSONParser('["a", 2, false], ');
  const parsed = parser.parseArray();

  assertEquals(
    parsed,
    new JSONSymbol('array', [
      new JSONSymbol('begin-array', ['', '[', '']),
      new JSONSymbol('string', ['"a"']),
      new JSONSymbol('value-separator', ['', ',', ' ']),
      new JSONSymbol('number', ['2']),
      new JSONSymbol('value-separator', ['', ',', ' ']),
      new JSONSymbol('literal', ['false']),
      new JSONSymbol('end-array', ['', ']', '']),
    ]),
  );
  assertEquals(parser.index, '["a", 2, false]'.length);
});

Deno.test('[JSONParser] parseArray #5', () => {
  const parser = new JSONParser('[[1]], ');
  const parsed = parser.parseArray();

  assertEquals(
    parsed,
    new JSONSymbol('array', [
      new JSONSymbol('begin-array', ['', '[', '']),
      new JSONSymbol('array', [
        new JSONSymbol('begin-array', ['', '[', '']),
        new JSONSymbol('number', ['1']),
        new JSONSymbol('end-array', ['', ']', '']),
      ]),
      new JSONSymbol('end-array', ['', ']', '']),
    ]),
  );
  assertEquals(parser.index, '[[1]]'.length);
});

Deno.test('[JSONParser] parseJsonText #1', () => {
  const parser = new JSONParser('{}');
  const parsed = parser.parseJsonText();

  assertEquals(
    parsed,
    new JSONSymbol('json-text', [
      new JSONSymbol('ws', ['']),
      new JSONSymbol('object', [
        new JSONSymbol('begin-object', ['', '{', '']),
        new JSONSymbol('end-object', ['', '}', '']),
      ]),
      new JSONSymbol('ws', ['']),
    ]),
  );
  assertEquals(parser.index, '{}'.length);
});

Deno.test('[JSONParser] parseJsonText #2', () => {
  const parser = new JSONParser('[]');
  const parsed = parser.parseJsonText();

  assertEquals(
    parsed,
    new JSONSymbol('json-text', [
      new JSONSymbol('ws', ['']),
      new JSONSymbol('array', [
        new JSONSymbol('begin-array', ['', '[', '']),
        new JSONSymbol('end-array', ['', ']', '']),
      ]),
      new JSONSymbol('ws', ['']),
    ]),
  );
  assertEquals(parser.index, '[]'.length);
});
