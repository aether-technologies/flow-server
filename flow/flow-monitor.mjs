import { tools } from './tools.mjs';

export default class FlowMonitor {

    constructor() {
      if(FlowMonitor.exists) {
        return FlowMonitor.instance;
      }
      this.logging = false;
      this.nodeUsageData = {};
      this.availableFlowsAndUsage = {};
      FlowMonitor.instance = this;
      FlowMonitor.exists = true;
    }

    // update usage data for a specific node
    updateNodeUsageData(nodeId) {
        // To get cpuUsage, maybe you want to use os.loadavg() or other method
        this.nodeUsageData[nodeId] = {
            cpuInfo: tools.os.cpus(),
            loadavg: tools.os.loadavg(),
            memoryUsage: tools.os.totalmem() - tools.os.freemem()
        };
    }
    // get usage data for a specific node
    getNodeUsageData(nodeId) {
        return this.nodeUsageData[nodeId];
    }

    setAvailableFlowsAndUsage(flowsAndUsage) {
        this.availableFlowsAndUsage = flowsAndUsage;
    }
    getAvailableFlowsAndUsage() {
      //TODO: Eventually, this should be a map of flows and current usage of each
      return Object.keys(this.availableFlowsAndUsage);
    }
}
