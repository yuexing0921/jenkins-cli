import { JenkinsCli, CliOption, ParameterType } from "./jenkins-cli";


import { printError, printInfo } from "./utils"

import { singleSelection , multipleSelection  } from "./inquirer"
import { LAST_KEY } from "./config"




export const run = async (options: CliOption) => {


    const jk = new JenkinsCli(options);

    try {
        // get the job list
        const jobs: string[] = await jk.getJobs()
        // Reade the user selected job
        const selectJob = await singleSelection([LAST_KEY].concat(jobs),`Select your jenkins job (${jobs.length})`);

        const parametersInfo = await jk.getParameters(selectJob)
        let parameters = {}
        const parameterMsg = "Select your parameters: "
        for(const k of parametersInfo){
            
            try{
                switch(k.type){
                    case ParameterType.git:
                    case ParameterType.radio:
                        parameters[k.key] = await singleSelection(k.value, parameterMsg + k.description);
                        break;
                    case ParameterType.checkbox:
                        parameters[k.key] = await multipleSelection(k.value, parameterMsg + k.description);
                        break;
                }
            }catch(err){
                console.error(err)
            }
        }
        printInfo(`Building job: ${selectJob}`);
        jk.build(selectJob, parameters)

    } catch (err) {
        printError(err)
    }

}


