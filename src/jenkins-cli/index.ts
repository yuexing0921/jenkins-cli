import * as Jenkins from "jenkins"
import { JenkinsClientOptions } from "jenkins"

import { jobCache,JobInfo } from "../cache";

import { printError, loadXML, getBranchByRemote } from "../utils"
import { getParametersByGit, getParametersByRadio, getParametersByCheckbox } from "./plugin";

export interface CliOption {
    job: string;
    rebuild: boolean;
    config: JenkinsClientOptions;
}

export enum ParameterType {
    git = "git",
    checkbox = "checkbox",
    radio = "radio",
}


interface Parameter {
    type: ParameterType;
    key: string;
    value: string[];
    description: string;
}

export interface JobCliInfo {
    name: string
    parameters: { [key: string]: string }
}
export class JenkinsCli {
    jenkins;
    cacheJobs: JobInfo[]; 
    constructor(options: CliOption) {
        this.jenkins = Jenkins({
            ...options.config,
            promisify: true
        })
        this.cacheJobs = jobCache.getJob();  
    }

    // get the job list
    async getJobs(): Promise<string[]> {
        const info = await this.jenkins.info()
        return info.jobs.map(job => job.name)
    }

    // get job configuration information
    private async getConfig(selectJob) {
        const configXML = await this.jenkins.job.config(selectJob)
        return await loadXML(configXML)
    }


    // get all parameters for the job
    async getParameters(selectJob): Promise<Parameter[]> {
        try {
            const config: any = await this.getConfig(selectJob)

            let parameters: Parameter[] = []

            const parameterDefinitions: any[] = config.project.properties[0]['hudson.model.ParametersDefinitionProperty'][0].parameterDefinitions
            parameterDefinitions.forEach(p => {
                Object.keys(p).forEach(o => {
                    const po = p[o];
                    switch (o) {
                        case "net.uaznia.lukanus.hudson.plugins.gitparameter.GitParameterDefinition":
                            const values = getParametersByGit(config.project)
                            parameters.push({
                                type: ParameterType.git,
                                key: po[0].name[0],
                                description: po[0].description[0],
                                value: values
                            })
                            break;
                        case "hudson.model.ChoiceParameterDefinition":
                            parameters = parameters.concat(getParametersByRadio(po))
                            break;
                        case "com.cwctravel.hudson.plugins.extended__choice__parameter.ExtendedChoiceParameterDefinition":
                            parameters = parameters.concat(getParametersByCheckbox(po))
                            break;
                        default:
                            break;
                    }
                })
            })
            // If it is git, get the branch from the remote
            for (const p of parameters) {
                if (p.type === ParameterType.git) {
                    p.value = await getBranchByRemote(p.value)
                }
            }
            return parameters
        } catch (err) {
            printError(err)
            return [];
        }

    }

    // todo: Unable to get the latest job queue when a single job takes a lot of time
    async build(selectJob, parameters) {

        await this.jenkins.job.build({ name: selectJob, parameters })

        jobCache.refreshJob({
            name: selectJob,
            parameters
        })

        return await this.jenkins.job.get(selectJob);


        // const log = await this.jenkins.build.logStream(selectJob, info.lastBuild.number)

        // return new Promise((resolve, reject) => {
        //     log.on('data', function(text) {
        //         process.stdout.write(text)
        //     })

        //     log.on('error', function(err) {
        //         printError(err)
        //         reject(err)
        //     })

        //     log.on('end', function() {
        //         resolve(true)
        //     })
        // })
    }
}