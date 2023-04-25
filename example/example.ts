import { JSONParser, replaceJsonValue } from '../mod.ts';

const value = `{
  "keys": {
    "key1": {
      "value1": 0,
      "value2": 1,
      "value3": 2
    },
    "key2": ["a", "b", "c"]
  },
  "text": "foo"
}
`;

const parser = new JSONParser(value);
const jsonTree = parser.parseJsonText();
replaceJsonValue(jsonTree, ['keys', 'key1', 'value2'], '-1');
replaceJsonValue(jsonTree, ['keys', 'key2', 1], '"X"');
replaceJsonValue(jsonTree, ['text'], '"bar"');

console.log(jsonTree.stringify());
