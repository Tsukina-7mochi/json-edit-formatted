import { JSONParser, replaceJSONValue } from '../mod.ts';

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

const jsonTree = JSONParser.parse(value);
replaceJSONValue(jsonTree, ['keys', 'key1', 'value2'], '-1');
replaceJSONValue(jsonTree, ['keys', 'key2', 1], '"X"');
replaceJSONValue(jsonTree, ['text'], '"bar"');

console.log(jsonTree.stringify());
