# JSON editor library preserving formats

A library for editing JSON content while maintaining the its format

## Usage

```typescript
import {
  JSONParser,
  replaceJSONValue,
} from 'https://raw.githubusercontent.com/Tsukina-7mochi/json-edit-formatted/{version}/mod.ts';

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
// ->
// {
//   "keys": {
//     "key1": {
//       "value1": 0,
//       "value2": -1,
//       "value3": 2
//     },
//     "key2": ["a", "X", "c"]
//   },
//   "text": "bar"
// }
//
```
