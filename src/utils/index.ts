/** @format */

import chalk from 'chalk';

import * as path from 'path';

import { parseString } from "xml2js"

import * as Git from "simple-git/promise";

import * as notifier from "node-notifier";

import {
  existsSync,
  readFileSync,
} from 'fs-extra';
import { safeLoad } from 'js-yaml';
import { ROOT_PATH } from '../config';

const git = Git();

export const resolve = (p)=> {
  return path.resolve(p)
}


export const alert = (title: string, message: string) => {
	notifier.notify({
		title ,
    message,
    icon: path.join(ROOT_PATH,'../public/jenkins.png'),
    timeout: 8
	});
}

export const sleep = (timeout) =>{
  return new Promise(resolve =>{
    setTimeout(resolve,timeout)
  })
}
export const printSuccess = msg => {
	console.log();
	console.log(chalk.green(msg));
};

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


export const loadXML = (xml: string) => {
  return new Promise((resolve, reject) => {
    parseString(xml, (err, result) => {
      if(err) {
        return reject(err)
      }

      return resolve(result)
    })
  })
}

export const getBranchByRemote = async (url):Promise<string[]> =>{

  const branch = await git.listRemote(["--heads", url])
  
  return branch.match(/refs\/heads\/(\S+)/g) || []
}

