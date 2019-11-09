import * as Jenkins from "jenkins"
import { JenkinsClientOptions } from "jenkins"

import { printError, loadXML, getBranchByRemote } from "../utils"
import { getParametersByGit, getParametersByRadio, getParametersByCheckbox } from "./plugin";


export interface CliOption {
    lastJob: string;
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

export class JenkinsCli {
    jenkins;
    constructor(options: CliOption) {
        this.jenkins = Jenkins({
            ...options.config,
            promisify: true
        })
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


    async getParameters(selectJob): Promise<Parameter[]> {
        try {
            // 2. 
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

    async build(selectJob, parameters) {
        return this.jenkins.job.build({ name: selectJob, parameters })
    }
}