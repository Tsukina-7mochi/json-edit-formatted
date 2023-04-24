import { JSONSymbol, JSONSymbolType } from "./parser.ts";

const replaceJsonValue = function(jsonTree: JSONSymbol<'json-text'>, path: (string | number)[], rawValue: string) {
  if(typeof jsonTree.children[1] === 'string') {
    throw Error('input JSON AST is invalid');
  }
  let symbol: JSONSymbol<JSONSymbolType> = jsonTree.children[1];

  for(const key_ of path) {
    if(symbol.type !== 'object' && symbol.type !== 'array') {
      throw Error('index can only be applied to object or array');
    }

    if(typeof key_ === 'string') {
      const key = `"${key_}"`;
      if(symbol.type !== 'object') {
        throw Error(`string key (${key}) must be applied to object`);
      }

      let found = false;
      for(const child of symbol.children) {
        if(typeof child === 'string') {
          continue;
        }

        if(
          child.type === 'member' &&
          typeof child.children[0] !== 'string' &&
          child.children[0].type === 'string' &&
          child.children[0].stringify() === key
        ) {
          const value = child.children[2];
          if(typeof value === 'string') {
            throw Error('member has invalid value');
          }
          symbol = value;
          found = true;
          break;
        }
      }

      if(!found) {
        throw Error(`key ${key} does not exist`);
      }
    } else {
      const key = key_;
      if(symbol.type !== 'array') {
        throw Error(`string key (${key}) must be applied to object`);
      }

      let found = false;
      let index = 0;
      for(const child of symbol.children) {
        if(typeof child === 'string') {
          continue;
        }
        if(child.type === 'literal' || child.type === 'object' || child.type === 'array' || child.type === 'number' || child.type === 'string') {
          if(index === key) {
            symbol = child;
            found = true;
            break;
          }
          index += 1;
        }
      }

      if(!found) {
        throw Error(`array index ${key} is out of bounds`);
      }
    }
  }

  if(symbol.type !== 'literal' && symbol.type !== 'string' && symbol.type !== 'number') {
    throw Error(`symbol to replace must be value, not ${symbol.type}`);
  }

  symbol.children = [rawValue];

  return jsonTree;
}

export {
  replaceJsonValue
};
