
import * as Jenkins from "jenkins"
import { JenkinsClientOptions } from "jenkins"

export interface CliOption {
    lastJob: string;
    config: JenkinsClientOptions;
}

export const run = (options: CliOption) => {
    const jenkins = Jenkins({
        ...options.config,
        promisify: true
    })

    jenkins
        .info()
        .then(data => console.log(data))
        .catch(err => console.log(err))
}