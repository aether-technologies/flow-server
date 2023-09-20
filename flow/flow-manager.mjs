import FlowMonitor from './flow-monitor.mjs';
import FlowRouter from './flow-router.mjs';

export default class FlowManager {
    static instance;
    flows = {};
    constructor() {
      if (FlowManager.instance) {
        return FlowManager.instance;
      }
      FlowManager.instance = this;
      this.flowMonitor = new FlowMonitor();
      this.flowRouter = new FlowRouter();
      this.logging = true;
      this.updateFlowMonitor();
    }
    
    async handleFlowMessage(message) {
      try {
        if(this.logging) console.log(`[FlowManager][info] Handling message '${message.id}' from ${message.origin}:${message.sender} for ${message.recipient}`);
        let flow = this.getFlow(message.recipient);
        if (!flow) {
          console.log(`[FlowManager][info] Flow ${message.recipient} not found.  Returning message.`);
          return message;
        }
        let response = await flow.run(message);
        if(response) {
          response.gid = message.gid;
        }
        return response;
      } catch (e) {
        console.error('[FlowManager][error] Error handling Flow message', e);
        return { error: e.message };
      }
    }
    
    getFlow(id) {
      return this.flows[id];
    }

    // Method to add a Flow
    addFlow(flowName, flowInstance) {
      if (!this.flows[flowName]) {
        this.flows[flowName] = flowInstance;
        console.log(`[FlowManager][info] Flow '${flowName}' added.`);
        this.updateFlowMonitor();
        this.updateFlowRouter();
      } else {
        console.log(`[FlowManager][info] Flow '${flowName}' already exists.`);
      }
    }

    // Method to remove a Flow
    removeFlow(flowName) {
      if (this.flows[flowName]) {
        delete this.flows[flowName];
        console.log(`[FlowManager][info] Flow '${flowName}' removed.`);
        this.updateFlowMonitor();
      } else {
        console.log(`[FlowManager][info] Flow '${flowName}' doesn't exist.`);
      }
    }

    updateFlowMonitor() {
      console.debug(`[FlowManager][debug] Updating Flow Monitor`);
      this.flowMonitor.setAvailableFlowsAndUsage(this.flows);
    }
    updateFlowRouter() {
      console.debug(`[FlowManager][debug] Updating Flow Router`);
      this.flowRouter.connectors.forEach(connector => this.flowRouter.sendFlowDiscoveryMessage(connector));
    }
}
