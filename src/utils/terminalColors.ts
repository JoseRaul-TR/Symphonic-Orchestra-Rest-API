/**
 * ANSI escape codes for terminal colors/styles.
 * Reset MUST be appended after every colored string.
 */
const RESET = "\x1b[0m";

const COLORS = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  brightBlue: "\x1b[94m",

  bold: "\x1b[1m",
} as const;

/**
 * Wraps text in ANSI color/style codes.
 */
const style = (text: string, ...codes: string[]): string =>
  `${codes.join("")}${text}${RESET}`;

export const terminal = {
  success: (msg: string) => console.log(style(`✔ ${msg} ✔`, COLORS.green)),

  error: (msg: string) =>
    console.error(style(`✖ ${msg} ✖`, COLORS.red, COLORS.bold)),

  warning: (msg: string) => console.warn(style(`⚠ ${msg} ⚠`, COLORS.yellow)),

  info: (msg: string) => console.log(style(`ℹ ${msg} ℹ`, COLORS.brightBlue)),

  startup: (msg: string) =>
    console.log(style(msg, COLORS.magenta, COLORS.bold)),

  shutdown: (msg: string) => console.log(style(msg, COLORS.blue, COLORS.bold)),

  db: (msg: string) => console.log(style(`🛢️ ${msg} 🛢️`, COLORS.brightBlue)),
};
