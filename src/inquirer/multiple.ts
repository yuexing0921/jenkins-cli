
import * as inquirer from "inquirer";
import * as SearchCheckbox from "inquirer-search-checkbox";

inquirer.registerPrompt("SearchCheckbox", SearchCheckbox);

import {genInquirerKeys } from "./"
import { LAST_KEY } from "../config";

export async function multipleSelection(keys: string[]) {
    
   
    const answers = await inquirer.prompt([
        {
            type: "SearchCheckbox",
            name: "key",
            message: `Select your jenkins job (${keys.length})`,
            default: LAST_KEY,
            choices: keys,
            pageSize: 12,
            validate(answer) {
                if (answer.length < 1) {
                    return "You must choose at least one job.";
                }
                return true;
            }
        }
    ]);
    return genInquirerKeys(answers.key);
}
