
import * as Jenkins from "jenkins"
import { JenkinsClientOptions } from "jenkins"

import { printError,printInfo } from "./utils"

import { readCustomEntry } from "./inquirer"

export interface CliOption {
    lastJob: string;
    config: JenkinsClientOptions;
}



export const run = async (options: CliOption) => {

    const jenkins = Jenkins({
        ...options.config,
        promisify: true
    })

    try {
        const info = await jenkins.info()
        const jobs: string[] = info.jobs.map(job => job.name)
        const selectJobs = await readCustomEntry(jobs);
        console.log(selectJobs)

		printInfo(`Building job: ${selectJobs.join(", ")}`);
    } catch (err) {
        printError(err)
    }

}
