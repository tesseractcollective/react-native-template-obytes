type Environment = 'local' | 'dev' | 'staging' | 'prod' | 'production' | 'test';

const PROD_ENVIRONMENTS = ['prod', 'production', 'test'];

export default class Logger {
  static traces: Map<string, any[]> = new Map<string, any[]>();
  static environment: Environment = 'local';
  static setEnv(env: Environment) {
    this.environment = env;
    if (PROD_ENVIRONMENTS.includes(this.environment)) {
      this.debug = () => {};
    } else {
      this.debug = console.debug.bind(console, 'DEBUG');
    }
  }

  static debug = PROD_ENVIRONMENTS.includes(this.environment)
    ? (..._args: any[]) => {}
    : console.debug.bind(console, 'DEBUG');
  static info = console.info.bind(console, 'INFO');
  static error = console.error.bind(console, '❗ERROR');
  static log = console.log.bind(console);

  static debugObscuringPasswords(...args: any) {
    return Logger.debug(...this.copyDataObscuringPasswordFields(args));
  }

  static copyDataObscuringPasswordFields(data: any) {
    if (typeof data !== 'object') {
      return data;
    }
    const copy = Array.isArray(data) ? [...data] : { ...data };
    for (const key in copy) {
      if (typeof copy[key] === 'object') {
        copy[key] = this.copyDataObscuringPasswordFields(data[key]);
      } else if (key === 'password') {
        copy[key] = 'XXXXXXXXXX';
      }
    }
    return copy;
  }

  static trace(groupName: string, ...args: any[]) {
    if (this.traces.has(groupName)) {
      const trace = this.traces.get(groupName)!;
      trace.push(args?.length === 1 ? args[0] : args);
    } else {
      this.traces.set(groupName, args);
    }
  }

  static get pc() {
    return createColors(true);
  }

  static tracePrint(groupName: string, label?: string) {
    if (
      this.traces.has(groupName) &&
      !PROD_ENVIRONMENTS.includes(this.environment)
    ) {
      const trace = this.traces.get(groupName)!;
      const stringified = trace.map(
        (t) =>
          `\r\n -> ${typeof t === 'string' ? t : t.length > 1 && typeof t[0] === 'string' ? t[0] + JSON.stringify(t.slice(1)) : JSON.stringify(t)}`
      );
      console.log(
        this.pc.bgBlue(`\n--DEBUG--------${groupName}--------`),
        label ? `\n${label}` : null,
        ...stringified,
        this.pc.dim(this.pc.bgBlue(`\n--------------END DEBUG--------------\n`))
      );
      this.traces.set(groupName, []);
    }
  }

  static traceExpectTruthy(groupName: string, label: string, value: any) {
    if (!!value) {
      this.trace(groupName, `${label}: ${stringifyIfNeeded(value)}`);
    } else {
      this.trace(
        groupName,
        this.pc.red(`${label}:${stringifyIfNeeded(value)}`)
      );
    }
  }
}

function stringifyIfNeeded(value: any): string {
  return typeof value === 'string' ? value : JSON.stringify(value);
}

let formatter =
  (open: string, close: string, replace = open) =>
  (input: string) => {
    let string = '' + input;
    let index = string.indexOf(close, open.length);
    return ~index
      ? open + replaceClose({ str: string, close, replace, index }) + close
      : open + string + close;
  };

let replaceClose = (args: {
  str: string;
  close: string;
  replace: string;
  index: number;
}) => {
  let result = '';
  let cursor = 0;
  const { str, close, replace } = args;
  let index = args.index;
  do {
    result += str.substring(cursor, index) + replace;
    cursor = index + close.length;
    index = str.indexOf(close, cursor);
  } while (~index);
  return result + str.substring(cursor);
};

let createColors = (enabled = true) => {
  let init = enabled ? formatter : () => String;
  return {
    isColorSupported: enabled,
    reset: init('\x1b[0m', '\x1b[0m'),
    bold: init('\x1b[1m', '\x1b[22m', '\x1b[22m\x1b[1m'),
    dim: init('\x1b[2m', '\x1b[22m', '\x1b[22m\x1b[2m'),
    italic: init('\x1b[3m', '\x1b[23m'),
    underline: init('\x1b[4m', '\x1b[24m'),
    inverse: init('\x1b[7m', '\x1b[27m'),
    hidden: init('\x1b[8m', '\x1b[28m'),
    strikethrough: init('\x1b[9m', '\x1b[29m'),
    black: init('\x1b[30m', '\x1b[39m'),
    red: init('\x1b[31m', '\x1b[39m'),
    green: init('\x1b[32m', '\x1b[39m'),
    yellow: init('\x1b[33m', '\x1b[39m'),
    blue: init('\x1b[34m', '\x1b[39m'),
    magenta: init('\x1b[35m', '\x1b[39m'),
    cyan: init('\x1b[36m', '\x1b[39m'),
    white: init('\x1b[37m', '\x1b[39m'),
    gray: init('\x1b[90m', '\x1b[39m'),
    bgBlack: init('\x1b[40m', '\x1b[49m'),
    bgRed: init('\x1b[41m', '\x1b[49m'),
    bgGreen: init('\x1b[42m', '\x1b[49m'),
    bgYellow: init('\x1b[43m', '\x1b[49m'),
    bgBlue: init('\x1b[44m', '\x1b[49m'),
    bgMagenta: init('\x1b[45m', '\x1b[49m'),
    bgCyan: init('\x1b[46m', '\x1b[49m'),
    bgWhite: init('\x1b[47m', '\x1b[49m'),
  };
};

export const logAuth = (...args: any[]) => {
  Logger.trace('👱🛡️', '. ', ...args);
};
