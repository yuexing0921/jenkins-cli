import * as Jenkins from "jenkins"
import Axios, { AxiosInstance } from 'axios'
import { JenkinsClientOptions } from "jenkins"

import { JobCache, JobInfo } from "../cache";

import { printError } from "../utils"
import {  getParametersByRadio, getParametersByCheckbox } from "./plugin";

export interface CliOption {
    dir: string;
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

export interface CrumbInfo {
    name: string
    value: string
}
export class JenkinsCli {
    jenkins;
    cacheJobs: JobInfo[];
    private jobCache: JobCache;
    private axios: AxiosInstance;
    private crumb: CrumbInfo;
    constructor(options: CliOption) {
        this.jenkins = Jenkins({
            ...options.config,
            promisify: true
        })
        this.jobCache = new JobCache(options.dir);
        // this.jenkins.on('log', console.log);
        this.cacheJobs = this.jobCache.getJob();
        this.axios = Axios.create({
            baseURL: options.config.baseUrl,
            timeout: 5000000
        })
        this.axios.interceptors.response.use(

            response => {
                const {status,data,statusText} = response
             
              if (status === 200) {
                return Promise.resolve(data)
              } else {
                return Promise.reject(new Error(statusText || 'Error'))
              }
            },
            error => {
              return Promise.reject(error)
            }
          )
        this.setCrumb()
    }

     // get the crumb
     private async setCrumb() {
        const result:any = await this.axios.get("/crumbIssuer/api/json")
        
        this.crumb = {
            name: result.crumbRequestField,
            value: result.crumb
        }   
    }

    // get the crumb
    private async fetch(url,data) {
       
        return this.axios.post(url,data,{
            headers:{
                [this.crumb.name]:this.crumb.value
            }
        })
    }

    // get the job list
    async getJobs(): Promise<string[]> {
        const info = await this.jenkins.info()
        return info.jobs.map(job => job.name)
    }




    // get all parameters for the job
    async getParameters(selectJob): Promise<Parameter[]> {
        try {
            // get job configuration information
            const config: any = await this.jenkins.job.get(selectJob)

            let parameters: Parameter[] = []

            const parameterDefinitions: any[] = config.actions[0].parameterDefinitions
            parameterDefinitions.forEach(po => {

                switch (po._class) {
                    case "net.uaznia.lukanus.hudson.plugins.gitparameter.GitParameterDefinition":
                        
                        parameters.push({
                            type: ParameterType.git,
                            key: po.name,
                            description: po.description,
                            value: po.name
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
            // If it is git, get the branch from the remote
            for (const p of parameters) {
                if (p.type === ParameterType.git) {
                    const result:any = await this.fetch(`/job/${selectJob}/descriptorByName/net.uaznia.lukanus.hudson.plugins.gitparameter.GitParameterDefinition/fillValueItems?param=${p.value}`,{})                    
                    p.value = result.values.map(k => k.value)
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

        this.jobCache.refreshJob({
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