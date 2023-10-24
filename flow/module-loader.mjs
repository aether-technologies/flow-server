import Flow from "./flow.mjs";
import { promises as fs } from 'fs';
import * as path from 'path';

export default class ModuleLoaderFlow extends Flow {
    constructor() {
        super("ModuleLoaderFlow");
        this.root = '../../..';
    }
    
    async run(flowMessage) {
        try {
            // the module path should be specified in the flowMessage
            const modulePath = flowMessage.content;
            let split_path = modulePath.split(".");
            split_path.pop();
            let module_path = split_path.join(".");
            split_path = modulePath.split("/");
            const file_name = split_path.pop();
            
            console.log("Searching for module: " + module_path);
            const file_path = findFileInDirectory(this.root, file_name);
            console.log(" - ",file_path);

            const module = await import(file_path);
            
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

const fs = require('fs');
const path = require('path');

function findFileInDirectory(directoryPath, fileName) {
    const files = fs.readdirSync(directoryPath);
    for (const file of files) {
        const filePath = path.join(directoryPath, file);
        const fileStat = fs.statSync(filePath);
        if (fileStat.isDirectory()) {
            const foundFilePath = findFileInDirectory(filePath, fileName);
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