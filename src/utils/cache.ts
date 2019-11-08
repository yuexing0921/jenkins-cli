
import * as fse from "fs-extra";
import { HOME_DIR } from "../config";

export class Cache<T> {
	private cacheFile: string;
	protected cacheInfo: T;

	constructor(filename: string) {
		this.cacheFile = `./${HOME_DIR}/${filename}`;
		fse.ensureFileSync(this.cacheFile);
	}

	protected readFile = () => {
		return fse.readFileSync(this.cacheFile, "utf8");
	};

	protected writeToFile = () => {
		return fse.writeFile(this.cacheFile, JSON.stringify(this.cacheInfo), "utf8");
	};
}

export class LastJobCache extends Cache<string[]> {
	constructor() {
		super("last-build-job-cache.json");
		try {
			this.cacheInfo = JSON.parse(this.readFile());
		} catch {
			this.cacheInfo = [];
		}
	}

	getJob() {
		return this.cacheInfo;
	}

	refreshJob(job: string[]) {
		this.cacheInfo = job;
		this.writeToFile();
	}
}

export const lastJobCache = new LastJobCache();
