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
}
