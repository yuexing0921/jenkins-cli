
import * as Jenkins from "jenkins"
import { JenkinsClientOptions } from "jenkins"
import { printError } from "./utils"

export interface CliOption {
    lastJob: string;
    config: JenkinsClientOptions;
}

export const run = async (options: CliOption) => {
   
    const jenkins = Jenkins({
        ...options.config,
        promisify: true
    })
    
    try{
        const info = await jenkins.info()
        const jobs = info.jobs.map(job => job.name)
    }catch(err){
        printError(err)
    }

}
