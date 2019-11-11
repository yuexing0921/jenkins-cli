import * as opn from "opn";

import { JenkinsCli, CliOption, ParameterType } from "./jenkins-cli";

import { printError, printInfo, alert } from "./utils"

import { singleSelection, multipleSelection } from "./inquirer"

import { REBUILD } from "./config"


export const run = async (options: CliOption) => {

    const jk = new JenkinsCli(options);

    try {
        // get the job list
        const jobs: string[] = await jk.getJobs()

        const cacheKeys = jk.cacheJobs.map(k => k.name)
        if (jk.cacheJobs.length > 0) {
            cacheKeys.splice(0, 0, REBUILD)
        }

        // Reade the user selected job
        const selectJob = await singleSelection(concatFilters(cacheKeys, jobs), `Select your jenkins job (${jobs.length})`);


        if (selectJob === REBUILD) {
            const cacheJob = jk.cacheJobs[0]
            return buildJob(jk, cacheJob.name, cacheJob.parameters)
        }

        const cacheJob = jk.cacheJobs.find(k => k.name === selectJob) || { parameters: {} }

        // get all parameters for the job
        const parametersInfo = await jk.getParameters(selectJob)
        let parameters = {}
        // Reade the user selected parameters
        const parameterMsg = "Select your parameters: "
        for (const k of parametersInfo) {

            switch (k.type) {
                case ParameterType.git:
                case ParameterType.radio:
                    parameters[k.key] = await singleSelection(concatFilters([cacheJob.parameters[k.key]], k.value), parameterMsg + k.description);
                    break;
                case ParameterType.checkbox:
                    parameters[k.key] = await multipleSelection(concatFilters(cacheJob.parameters[k.key] || [], k.value), parameterMsg + k.description);
                    break;
            }
        }
        buildJob(jk, selectJob, parameters)

    } catch (err) {
        printError(err)
    }

}

async function buildJob(jk: JenkinsCli, job, parameters) {
    try {
        printInfo(`Building job: ${job} `)
        const buildInfo = await jk.build(job, parameters)
        alert(`Jenkins job: ${job}`, "Click for details.", () => {
            opn(buildInfo.url)
        })
    } catch (err) {
        printError(err)
    }
}

function concatFilters(arr1: string[], arr2: string[]) {
    return Array.from(new Set(arr1.concat(arr2))).filter(k => k)
}