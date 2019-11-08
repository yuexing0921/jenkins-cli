import * as inquirer from "inquirer";
import * as SearchCheckbox from "inquirer-search-checkbox";

inquirer.registerPrompt("SearchCheckbox", SearchCheckbox);

import { lastJobCache } from "../utils/cache";

const LAST_KEY = "<LAST>";


export async function getJobByKey(key: string[]) {
	if (key.includes(LAST_KEY)) {
		const lastJob = lastJobCache.getJob();

		if (lastJob.length === 0) {
			return Promise.resolve([]);
		} else {
			key = lastJobCache.getJob();
		}
	}

	lastJobCache.refreshJob(key);
	return Promise.resolve(key);
}

export async function readCustomEntry(jobs: string[]) {
	

	let keys = [ LAST_KEY].concat(jobs);

	const answers = await inquirer.prompt([
		{
			type: "SearchCheckbox",
			name: "key",
			message: `Select your jenkins job (${keys.length})`,
			choices: keys.map(name => ({
				name
			})),
			pageSize: 12,
			validate(answer) {
				if (answer.length < 1) {
					return "You must choose at least one job.";
				}
				return true;
			}
		}
	]);
	return getJobByKey(answers.key);
}
