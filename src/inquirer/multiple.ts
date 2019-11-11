
import * as inquirer from "inquirer";
import * as SearchCheckbox from "inquirer-search-checkbox";

inquirer.registerPrompt("SearchCheckbox", SearchCheckbox);

export async function multipleSelection(keys: string[],msg) {
   
    const answers = await inquirer.prompt([
        {
            type: "SearchCheckbox",
            name: "key",
            message: msg,
            choices: keys,
            pageSize: 12,
            validate(answer) {
                if (answer.length < 1) {
                    return "You must choose .";
                }
                return true;
            }
        }
    ]);
    return answers.key;
}
