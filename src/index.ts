import { JenkinsCli, CliOption, ParameterType } from "./jenkins-cli";


import { printError, printInfo, alert } from "./utils"

import { singleSelection, multipleSelection } from "./inquirer"



import * as opn from "opn";

export const run = async (options: CliOption) => {

    const jk = new JenkinsCli(options);

    try {
        // get the job list
        const jobs: string[] = await jk.getJobs()

        // Reade the user selected job
        const selectJob = await singleSelection(concatFilters(jk.cacheJobs.map(k => k.name), jobs), `Select your jenkins job (${jobs.length})`);

        const cacheJob = jk.cacheJobs.find(k => k.name === selectJob) || {parameters:{}}
        console.log(cacheJob)
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
                    parameters[k.key] = await multipleSelection(concatFilters(cacheJob.parameters[k.key], k.value), parameterMsg + k.description);
                    break;
            }
        }

        printInfo(`Building job: ${selectJob} `)
        const buildInfo = await jk.build(selectJob, parameters)
        alert(`Jenkins job: ${selectJob}`, "Click for details.", () => {
            opn(buildInfo.url)
        })

    } catch (err) {
        printError(err)
    }

}


function concatFilters(arr1: string[], arr2: string[]) {
    return Array.from(new Set(arr1.concat(arr2))).filter(k => k)
}