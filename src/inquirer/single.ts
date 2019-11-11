
import * as inquirer from "inquirer";

import * as fuzzy from "fuzzy";

inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));


export async function singleSelection(keys: string[], msg) {

    const answers = await inquirer.prompt([
        {
            type: "autocomplete",
            name: "key",
            message: msg,
            source: (answers, input) => {
                const fuzzyResult = fuzzy.filter(input || '', keys);
                return Promise.resolve(fuzzyResult.map(el => el.original));
            },
            pageSize: 12,
            validate(val) {
                return val ? true : "You must choose.";
            }
        }
    ]);
    return answers.key;
}
