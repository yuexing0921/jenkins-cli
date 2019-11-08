

import { lastJobCache } from "../utils/cache";

export { multipleSelection } from "./multiple";

export { singleSelection } from "./single";

import {LAST_KEY} from "../config";


export async function genInquirerKeys(key: string[]) {
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
