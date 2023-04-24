# JSON editor library preserving formats

A library for editing JSON content while maintaining the its format

## Usage

```typescript
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
const jsonAST = parser.parseJsonText();
replaceJsonValue(jsonAST, ['keys', 'key1', 'value2'], '-1')
replaceJsonValue(jsonAST, ['keys', 'key2', 1], '"X"')
replaceJsonValue(jsonAST, ['text'], '"bar"')

console.log(jsonAST.stringify());
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
