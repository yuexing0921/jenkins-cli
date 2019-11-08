/** @format */

import chalk from 'chalk';

import * as path from 'path';

import {
  existsSync,
  readFileSync,
} from 'fs-extra';
import { safeLoad } from 'js-yaml';

export const resolve = (p)=> {
  return path.resolve(p)
}

export const printInfo = msg => {
	console.log();
  console.log(chalk.blue(msg));
  console.log();
};

export const printError = (msg: string) => {
  console.error(msg)
  console.log();
  console.log(chalk.bgRed(msg));
  console.log();
};

export const loadYaml = (path: string) => {
  if (!existsSync(path)) {
    throw new Error('no such file or directory');
  }

  const yamlFile = readFileSync(path, 'utf8');
  return safeLoad(yamlFile);
};
