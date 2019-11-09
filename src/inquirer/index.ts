

import { lastJobCache } from "../cache";

export { multipleSelection } from "./multiple";

export { singleSelection } from "./single";

import { LAST_KEY } from "../config";



export async function genLastJob(key: string) {
	if (key === LAST_KEY) {
		const lastJob = lastJobCache.getJob();
		if (!lastJob.name) {
			lastJobCache.refreshJob({
				name: key,
				parameters: {}
			})
			return Promise.resolve("");
		} else {
			key = lastJobCache.getJob().name;
		}
	}
	return Promise.resolve(key);
}
