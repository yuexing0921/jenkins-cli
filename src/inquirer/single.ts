
import * as inquirer from "inquirer";

import * as fuzzy from "fuzzy";

inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

import {genInquirerKeys } from "./"
import { LAST_KEY } from "../config";

export async function singleSelection(jobs: string[]) {
    
    const answers = await inquirer.prompt([
		{
			type: "autocomplete",
			name: "key",
            message: `Select your jenkins job (${jobs.length})`,
            source: (answers, input) =>{
                const fuzzyResult = fuzzy.filter(input || '', jobs);
                return Promise.resolve(fuzzyResult.map(el => el.original));
              },
            default: LAST_KEY,
            pageSize: 12,
            validate(val) {
                return val ? true : "You must choose at least one job.";
            }
		}
	]);
    return genInquirerKeys(answers.key);
}
