
import * as fse from "fs-extra";
import { JENKINS_DIR } from "./config";
import { JobCliInfo } from "./jenkins-cli";

export interface JobInfo extends JobCliInfo {
	date: number
	count: number
}

export class Cache<T> {
	private fileName: string;
	protected cacheInfo: T;

	constructor(fileName: string) {
		this.fileName = fileName;
		fse.ensureFileSync(this.fileName);
	}

	protected readFile = () => {
		return fse.readFileSync(this.fileName, "utf8");
	};
	protected writeToFile = () => {
		return fse.writeFile(this.fileName, JSON.stringify(this.cacheInfo, null, 2), "utf8");
	};
}


export class JobCache extends Cache<JobInfo[]> {
	constructor(dir: string) {
		const fileName = (dir ?  dir + "/" : `${JENKINS_DIR}`) + "build-job-cache.json"
		super(fileName);
		try {
			this.cacheInfo = JSON.parse(this.readFile());
		} catch {
			this.cacheInfo = [];
		}
	}

	getJob() {
		return this.cacheInfo;
	}

	refreshJob(job: JobCliInfo) {
		const index = this.cacheInfo.findIndex(k => k.name === job.name);
		let count = 0;
		if (this.cacheInfo.length && index !== -1) {
			count = this.cacheInfo[index].count
			this.cacheInfo.splice(index, 1);
		}
		this.cacheInfo.splice(0, 0, {
			...job,
			date: Date.now(),
			count: count + 1
		});
		this.writeToFile();
	}
}
