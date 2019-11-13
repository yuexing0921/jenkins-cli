import { ParameterType } from ".";


// hudson.model.ChoiceParameterDefinition
export const getParametersByRadio = (config: { name: string, description: string, choices: string[] }) => {
    return {
        type: ParameterType.radio,
        key: config.name,
        value: config.choices,
        description: config.description,
    }
}

// com.cwctravel.hudson.plugins.extended__choice__parameter.ExtendedChoiceParameterDefinition
export const getParametersByCheckbox = (configs: { name: string, description: string, value: string[] }[]) => {
    return configs.map(k => ({
        type: ParameterType.checkbox,
        key: k.name,
        description: k.description,
        value: k.value || []
    }));
}