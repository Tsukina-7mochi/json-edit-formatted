import { JSONSymbol, replaceJSONValue } from '../mod.ts';
import { asserts } from './deps.ts';

const assertEquals = asserts.assertEquals;

Deno.test('[Editor] replaceJSONValue: object #1', () => {
  // {"a": 1, "b": 2}
  const tree = new JSONSymbol('json-text', [
    new JSONSymbol('ws', ['']),
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
    new JSONSymbol('ws', ['']),
  ]);

  replaceJSONValue(tree, ['b'], '0');

  assertEquals(
    tree,
    // {"a": 1, "b": 0}
    new JSONSymbol('json-text', [
      new JSONSymbol('ws', ['']),
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
          new JSONSymbol('number', ['0']),
        ]),
        new JSONSymbol('end-object', ['', '}', '']),
      ]),
      new JSONSymbol('ws', ['']),
    ]),
  );
});

Deno.test('[Editor] replaceJSONValue: object #2', () => {
  // {"a": {"b": 1}}
  const tree = new JSONSymbol('json-text', [
    new JSONSymbol('ws', ['']),
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
    new JSONSymbol('ws', ['']),
  ]);

  replaceJSONValue(tree, ['a', 'b'], '0');

  assertEquals(
    tree,
    // {"a": {"b": 0}}
    new JSONSymbol('json-text', [
      new JSONSymbol('ws', ['']),
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
              new JSONSymbol('number', ['0']),
            ]),
            new JSONSymbol('end-object', ['', '}', '']),
          ]),
        ]),
        new JSONSymbol('end-object', ['', '}', '']),
      ]),
      new JSONSymbol('ws', ['']),
    ]),
  );
});

Deno.test('[Editor] replaceJSONValue: array #1', () => {
  // ["a", 2, false]
  const tree = new JSONSymbol('json-text', [
    new JSONSymbol('ws', ['']),
    new JSONSymbol('array', [
      new JSONSymbol('begin-array', ['', '[', '']),
      new JSONSymbol('string', ['"a"']),
      new JSONSymbol('value-separator', ['', ',', ' ']),
      new JSONSymbol('number', ['2']),
      new JSONSymbol('value-separator', ['', ',', ' ']),
      new JSONSymbol('literal', ['false']),
      new JSONSymbol('end-array', ['', ']', '']),
    ]),
    new JSONSymbol('ws', ['']),
  ]);

  replaceJSONValue(tree, [1], '0');

  assertEquals(
    tree,
    // ["a", 0, false]
    new JSONSymbol('json-text', [
      new JSONSymbol('ws', ['']),
      new JSONSymbol('array', [
        new JSONSymbol('begin-array', ['', '[', '']),
        new JSONSymbol('string', ['"a"']),
        new JSONSymbol('value-separator', ['', ',', ' ']),
        new JSONSymbol('number', ['0']),
        new JSONSymbol('value-separator', ['', ',', ' ']),
        new JSONSymbol('literal', ['false']),
        new JSONSymbol('end-array', ['', ']', '']),
      ]),
      new JSONSymbol('ws', ['']),
    ]),
  );
});

Deno.test('[Editor] replaceJSONValue: array #1', () => {
  // [[0, 1], [2, 3]]]
  const tree = new JSONSymbol('json-text', [
    new JSONSymbol('ws', ['']),
    new JSONSymbol('array', [
      new JSONSymbol('begin-array', ['', '[', '']),
      new JSONSymbol('array', [
        new JSONSymbol('begin-array', ['', '[', '']),
        new JSONSymbol('number', ['1']),
        new JSONSymbol('value-separator', ['', ',', ' ']),
        new JSONSymbol('number', ['2']),
        new JSONSymbol('end-array', ['', ']', '']),
      ]),
      new JSONSymbol('value-separator', ['', ',', ' ']),
      new JSONSymbol('array', [
        new JSONSymbol('begin-array', ['', '[', '']),
        new JSONSymbol('number', ['3']),
        new JSONSymbol('value-separator', ['', ',', ' ']),
        new JSONSymbol('number', ['4']),
        new JSONSymbol('end-array', ['', ']', '']),
      ]),
      new JSONSymbol('end-array', ['', ']', '']),
    ]),
    new JSONSymbol('ws', ['']),
  ]);

  replaceJSONValue(tree, [1, 1], '0');

  assertEquals(
    tree,
    // [[0, 1], [2, 0]]
    new JSONSymbol('json-text', [
      new JSONSymbol('ws', ['']),
      new JSONSymbol('array', [
        new JSONSymbol('begin-array', ['', '[', '']),
        new JSONSymbol('array', [
          new JSONSymbol('begin-array', ['', '[', '']),
          new JSONSymbol('number', ['1']),
          new JSONSymbol('value-separator', ['', ',', ' ']),
          new JSONSymbol('number', ['2']),
          new JSONSymbol('end-array', ['', ']', '']),
        ]),
        new JSONSymbol('value-separator', ['', ',', ' ']),
        new JSONSymbol('array', [
          new JSONSymbol('begin-array', ['', '[', '']),
          new JSONSymbol('number', ['3']),
          new JSONSymbol('value-separator', ['', ',', ' ']),
          new JSONSymbol('number', ['0']),
          new JSONSymbol('end-array', ['', ']', '']),
        ]),
        new JSONSymbol('end-array', ['', ']', '']),
      ]),
      new JSONSymbol('ws', ['']),
    ]),
  );
});
