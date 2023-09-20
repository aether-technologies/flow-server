import Flow from "./flow.mjs";
export default class ModuleLoaderFlow extends Flow {
    constructor() {
        super("ModuleLoaderFlow");
    }
    
    async run(flowMessage) {
        // the module path should be specified in the flowMessage
        const modulePath = flowMessage.content;
        // check if the path exists
        // note that you need to ensure this path refers to a valid module
        if (!modulePath) {
            throw new Error("Module path is not specified!");
        }
        try {
            const module = await import(modulePath);
            
            // you could also access exported members of the module
            // example: const { default: defaultExport, namedExport } = await import(modulePath);
            // use the module
            // for example, we'll just return it here
            return module;
        } catch (error) {
            console.error(`Failed to import module at path: ${modulePath}`);
            console.error(error);
        }
    }
}

new ModuleLoaderFlow();