import { JenkinsCli, CliOption, ParameterType } from "./jenkins-cli";


import { printError, printInfo, alert } from "./utils"

import { singleSelection, multipleSelection } from "./inquirer"

import { LAST_KEY } from "./config"


import * as opn from "opn";

export const run = async (options: CliOption) => {

    const jk = new JenkinsCli(options);

    try {
        // get the job list
        const jobs: string[] = await jk.getJobs()
        // Reade the user selected job
        const selectJob = await singleSelection([LAST_KEY].concat(jobs), `Select your jenkins job (${jobs.length})`);

        // get all parameters for the job
        const parametersInfo = await jk.getParameters(selectJob)
        let parameters = {}
        // Reade the user selected parameters
        const parameterMsg = "Select your parameters: "
        for (const k of parametersInfo) {
            switch (k.type) {
                case ParameterType.git:
                case ParameterType.radio:
                    parameters[k.key] = await singleSelection(k.value, parameterMsg + k.description);
                    break;
                case ParameterType.checkbox:
                    parameters[k.key] = await multipleSelection(k.value, parameterMsg + k.description);
                    break;
            }
        }

        printInfo(`Building job: ${selectJob} ` )
        const buildInfo = await jk.build(selectJob, parameters)
        alert(`Jenkins job: ${selectJob}`, "Click for details.",()=>{
            opn(buildInfo.url)
        })

    } catch (err) {
        printError(err)
    }

}


