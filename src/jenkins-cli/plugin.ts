import { ParameterType } from ".";

export const getParametersByGit = (project:any)=>{
    return project.scm[0].userRemoteConfigs[0]['hudson.plugins.git.UserRemoteConfig'][0]['url'][0]
}


// hudson.model.ChoiceParameterDefinition
export const getParametersByRadio = (configs:{name:[string],description:[string],choices:any[]}[]) =>{
    return  configs.map(k => ({
        type: ParameterType.radio,
        key: k.name[0],
        value: k.choices[0].a[0].string,
        description: k.description[0],
    }));
}

// com.cwctravel.hudson.plugins.extended__choice__parameter.ExtendedChoiceParameterDefinition
export const getParametersByCheckbox = (configs:{name:[string],description:[string],value:string[]}[]) =>{
    return  configs.map(k => ({
        type: ParameterType.checkbox,
        key: k.name[0],
        description: k.description[0],
        value: k.value[0].split(",")
    }));
}