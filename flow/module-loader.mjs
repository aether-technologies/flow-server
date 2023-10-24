import Flow from "./flow.mjs";
import { promises as fs } from 'fs';
import * as path from 'path';

export default class ModuleLoaderFlow extends Flow {
    constructor() {
        super("ModuleLoaderFlow");
        this.root = '../../../../../'; //This path stuff needs polishing and testing
    }
    
    async run(flowMessage) {
        console.log("FlowMessage :: ",flowMessage);
        let modulePath = flowMessage.content;
        let split_path;
        try {
            // the module path should be specified in the flowMessage
            if(modulePath.includes(".")) {
                split_path = modulePath.split(".");
                split_path.pop();
                modulePath = split_path.join(".");
            }
            split_path = modulePath.split("/");
            const file_name = split_path.pop();
            
            console.log("Searching for module: " + modulePath);
            const file_path = await findFileInDirectory('./', file_name);
            console.log(" - ",this.root + file_path);

            const module = await import(this.root + file_path);
            
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

function fileExists(path) {
    try {
        fs.accessSync(path, fs.constants.F_OK);
        return true;
    } catch (err) {
        return false;
    }
}

async function findFileInDirectory(directoryPath, fileName) {
    console.log("fs :: ",fs);
    const files = await fs.readdir(directoryPath);
    for (const file of files) {
        const filePath = path.join(directoryPath, file);
        const fileStat = await fs.stat(filePath);
        if (fileStat.isDirectory()) {
            const foundFilePath = await findFileInDirectory(filePath, fileName);
            if (foundFilePath) {
                return foundFilePath;
            }
        } else if (file.startsWith(fileName) && (file.endsWith('.js') || file.endsWith('.mjs'))) {
            return filePath;
        }
    }
    return null;
}

new ModuleLoaderFlow();