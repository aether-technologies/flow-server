import FlowManager from "./flow-manager.mjs";
export default class Flow {
    constructor(id) {
        this.id = id;
        // create an instance of FlowManager
        const flowManager = new FlowManager();
        // add the instance to the FlowManager
        flowManager.addFlow(id, this);
    }
    run(flowMessage) {
        // implement this method in subclass
        throw new Error("Abstract method!");
    }
}
