// reference: RFC 8259

type JSONSymbolType =
  | 'json-text'
  | 'begin-array'
  | 'begin-object'
  | 'end-array'
  | 'end-object'
  | 'name-separator'
  | 'value-separator'
  | 'ws'
  | 'literal'
  | 'object'
  | 'member'
  | 'array'
  | 'number'
  | 'string';

class JSONSymbol<T extends JSONSymbolType> {
  type: T;
  children: (JSONSymbol<JSONSymbolType> | string)[];

  constructor(
    type: T,
    children: JSONSymbol<T>["children"]
  ) {
    this.type = type;
    this.children = children;
  }

  stringify(): string {
    return this.children.map((v) => {
      if(typeof v === 'string') {
        return v;
      }
      return v.stringify();
    }).join('');
  }
}

const wsRegExp = /[ \t\r\n]*/y;
const literalRegExp = /(false|null|true)/y;
const numberRegExp = /-?(0|[1-9]\d*)(\.\d+)?([eE]][+\-]?\d+)?/y;

class JSONParser {
  index = 0;
  text: string;

  constructor(text: string) {
    this.text = text;
  }

  #assertText(actual: string, expected: string) {
    if(actual !== expected) {
      throw Error(`at ${this.index}: ${expected} expected, got ${actual}`);
    }
  }

  #takeChar() {
    if(this.index >= this.text.length) {
      throw Error('Unexpected end of data');
    }
    const letter = this.text[this.index];
    this.index += 1;
    return letter;
  }

  #parseWsLetter<T extends JSONSymbolType>(type: T, letter: string): JSONSymbol<T> | null {
    const oldIndex = this.index;
    const leadingWs = this.parseWs();

    const value = this.#takeChar();
    if(value !== letter) {
      this.index = oldIndex;
      return null;
    }

    const followingWs = this.parseWs();

    return new JSONSymbol(type, [
      ...leadingWs.children,
      value,
      ...followingWs.children
    ]);
  }

  parseJsonText(): JSONSymbol<'json-text'> {
    const leadingWs = this.parseWs();

    const objectOrArray = this.parseObject() ?? this.parseArray();
    if(objectOrArray === null) {
      throw Error(`at ${this.index}, object or array expected`);
    }

    const followingWs = this.parseWs();

    return new JSONSymbol('json-text', [leadingWs, objectOrArray, followingWs]);
  }

  parseBeginArray(): JSONSymbol<'begin-array'> | null {
    return this.#parseWsLetter('begin-array', '[');
  }

  parseBeginObject(): JSONSymbol<'begin-object'> | null {
    return this.#parseWsLetter('begin-object', '{');
  }

  parseEndArray(): JSONSymbol<'end-array'> | null {
    return this.#parseWsLetter('end-array', ']');
  }

  parseEndObject(): JSONSymbol<'end-object'> | null {
    return this.#parseWsLetter('end-object', '}');
  }

  parseNameSeparator(): JSONSymbol<'name-separator'> | null {
    return this.#parseWsLetter('name-separator', ':');
  }

  parseValueSeparator(): JSONSymbol<'value-separator'> | null {
    return this.#parseWsLetter('value-separator', ',');
  }

  parseWs(): JSONSymbol<'ws'> {
    wsRegExp.lastIndex = this.index;
    const value = this.text.match(wsRegExp)?.[0] ?? '';
    this.index += value.length;

    return new JSONSymbol('ws', [value]);
  }

  parseLiteral(): JSONSymbol<'literal'> | null {
    literalRegExp.lastIndex = this.index;
    const value = this.text.match(literalRegExp)?.[0];
    if(typeof value !== 'string') {
      return null;
    }

    return new JSONSymbol('literal', [value]);
  }

  parseValue(): JSONSymbol<'literal' | 'object' | 'array' | 'number' | 'string'> | null {
    const literalSymbol = this.parseLiteral();
    if(literalSymbol !== null) {
      return literalSymbol;
    }

    const objectSymbol = this.parseObject();
    if(objectSymbol !== null) {
      return objectSymbol;
    }

    const arraySymbol = this.parseArray();
    if(arraySymbol !== null) {
      return arraySymbol;
    }

    const numberSymbol = this.parseNumber();
    if(numberSymbol !== null) {
      return numberSymbol;
    }

    const stringSymbol = this.parseString();
    if(stringSymbol !== null) {
      return stringSymbol;
    }

    return null;
  }

  parseObject(): JSONSymbol<'object'> | null {
    const children = [];
    const beginObject = this.parseBeginObject();
    if(beginObject === null) {
      return null;
    }
    children.push(beginObject);

    const member = this.parseMember();
    if(member === null) {
      const endObject = this.parseEndObject();
      if(endObject === null) {
        throw Error(`at ${this.index}, } expected, got ${this.text[this.index]}`);
      }

      children.push(endObject);
      return new JSONSymbol('object', children);
    }
    children.push(member);

    while(true) {
      const valueSeparator = this.parseValueSeparator();
      if(valueSeparator === null) {
        const endObject = this.parseEndObject();
        if(endObject === null) {
          throw Error(`at ${this.index}, } expected, got ${this.text[this.index]}`);
        }

        children.push(endObject);
        break;
      } else {
        children.push(valueSeparator);

        const member = this.parseMember();
        if(member === null) {
          throw Error(`at ${this.index}, string expected, got ${this.text[this.index]}`);
        }
        children.push(member);
      }
    }

    return new JSONSymbol('object', children);
  }

  parseMember(): JSONSymbol<'member'> | null {
    const string = this.parseString();
    if(string === null) {
      return null;
    }

    const nameSeparator = this.parseNameSeparator();
    if(nameSeparator === null) {
      throw Error(`at ${this.index}, : expected, got ${this.text[this.index]}`);
    }

    const value = this.parseValue();
    if(value === null) {
      throw Error(`at ${this.index}, value expected, got ${this.text[this.index]}`);
    }

    return new JSONSymbol('member', [string, nameSeparator, value]);
  }

  parseArray(): JSONSymbol<'array'> | null {
    const children = [];
    const beginArray = this.parseBeginArray();
    if(beginArray === null) {
      return null;
    }
    children.push(beginArray);

    const value = this.parseValue();
    if(value === null) {
      const endArray = this.parseEndArray();
      if(endArray === null) {
        throw Error(`at ${this.index}, ] expected, got ${this.text[this.index]}`);
      }

      children.push(endArray);
      return new JSONSymbol('array', children);
    }
    children.push(value);

    while(true) {
      const valueSeparator = this.parseValueSeparator();
      if(valueSeparator === null) {
        const endArray = this.parseEndArray();
        if(endArray === null) {
          throw Error(`at ${this.index}, ] expected, got ${this.text[this.index]}`);
        }

        children.push(endArray);
        break;
      } else {
        children.push(valueSeparator);

        const value = this.parseValue();
        if(value === null) {
          throw Error(`at ${this.index}, value expected`);
        }
        children.push(value);
      }
    }

    return new JSONSymbol('array', children);
  }

  parseNumber(): JSONSymbol<'number'> | null {
    numberRegExp.lastIndex = this.index;
    const value = this.text.match(numberRegExp)?.[0];
    if(typeof value !== 'string') {
      return null;
    }
    this.index += value.length;

    return new JSONSymbol('number', [value]);
  }

  parseString(): JSONSymbol<'string'> | null {
    if(this.text[this.index] !== '"') {
      return null;
    }
    let value = this.#takeChar();
    let escaped = false;

    while(true) {
      const char = this.#takeChar();
      const charCode = char.charCodeAt(0);
      if(charCode < 0x20) {
        throw Error(`at ${this.index}: 0x${charCode} is not a valid character`);
      }
      value += char;

      if(escaped) {
        escaped = false;
      } else {
        if(char === '"') {
          break;
        }
        if(char === '\\') {
          escaped = true;
        }
      }
    }

    return new JSONSymbol('string', [value]);
  }
}

export default JSONParser;

export type { JSONSymbolType }
export { JSONSymbol, JSONParser };
