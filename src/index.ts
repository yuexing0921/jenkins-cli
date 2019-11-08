
import * as Jenkins from "jenkins"
import { JenkinsClientOptions } from "jenkins"

import { printError,printInfo } from "./utils"

import { singleSelection } from "./inquirer"
import { LAST_KEY } from "./config"

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
        const selectJob = await singleSelection([LAST_KEY].concat(jobs));

		printInfo(`Building job: ${selectJob}`);
    } catch (err) {
        printError(err)
    }

}
