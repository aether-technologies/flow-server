import FlowManager from "./flow-manager.mjs";
import FlowRouter from "./flow-router.mjs";
export default class Flow {
    constructor(id, config = {}) {
        this.id = id;
        this.logging = config.logging || false;
        // create an instance of FlowManager
        const flowManager = new FlowManager();
        this.flowRouter = new FlowRouter();
        // add the instance to the FlowManager
        flowManager.addFlow(id, this);
    }
    run(flowMessage) {
        // implement this method in subclass
        throw new Error("Abstract method!");
    }
    async send(flowMessage) {
        this.flowRouter.routeFlowMessage(flowMessage);
    }

    // (BNS - 24/11/17) Added to support LLM agents using flows as tools
    name() {
        return config.definition?.name || config.name;
    }

    description() {
        return config.definition?.description || config.description;
    }

    inputFormat() {
        return config.definition?.input || config.inputFormat;
    }

    outputFormat() {
        return config.definition?.output || config.outputFormat;
    }


}
