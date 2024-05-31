import Flow from "./flow.mjs";
import { promises as fs } from 'fs';
import * as path from 'path';

export default class ModuleLoaderFlow extends Flow {
    constructor(id, config = {}) {
        super(id || "ModuleLoaderFlow", config);
        this.root = config.root || '../../../../../'; //This path stuff needs polishing and testing
    }
    
    async run(flowMessage) {
        if(this.logging) console.log("FlowMessage :: ",flowMessage);
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
            
            if(this.logging) console.log("Searching for module: " + modulePath);
            const file_path = await this.findFileInDirectory('./', file_name);
            if(this.logging) console.log(" - ",this.root + file_path);

            const module = await import(this.root + file_path);
            
        } catch (error) {
            console.error(`Failed to import module at path: ${modulePath}`);
            console.error(error);
        }
    }
    
    async findFileInDirectory(directoryPath, fileName) {
        const files = await fs.readdir(directoryPath);
        for (const file of files) {
            const filePath = path.join(directoryPath, file);
            const fileStat = await fs.stat(filePath);
            if (fileStat.isDirectory()) {
                const foundFilePath = await this.findFileInDirectory(filePath, fileName);
                if (foundFilePath) {
                    return foundFilePath;
                }
            } else if (file.startsWith(fileName) && (file.endsWith('.js') || file.endsWith('.mjs'))) {
                return filePath;
            }
        }
        return null;
    }
}
