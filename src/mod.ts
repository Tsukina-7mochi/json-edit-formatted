import JSONParser from "./parser.ts";
import { replaceJsonValue } from "./editor.ts";

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
