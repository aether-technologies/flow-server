import FlowManager from './flow-manager.mjs';
import FlowMonitor from './flow-monitor.mjs';
import FlowMessage from './flow-message.mjs';

export default class FlowRouter {
      constructor(id_=null) {
        if(FlowRouter.exists) {
          return FlowRouter.instance
        }
        this.id = id_ || 'FlowRouter';
        this.logging = true;
        this.max_hops = 5; // Another configurable item.
        this.connectors = [];
        this.connection_timeout = 60*1000; // one minute
        this.flowsMap = new Map();
        this.reverseFlowsMap = new Map();
        this.flowManager = new FlowManager();
        this.flowMonitor = new FlowMonitor();
        FlowRouter.instance = this;
        FlowRouter.exists = true;
        
        this.recentDiscoveryThreads = new Map();
        // Add an interval that cleans up everything in this.recentDiscoveryThreads older than 15 minutes.
        setInterval(() => {
          const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000;
          for (let [key, value] of this.recentDiscoveryThreads) {
            if (value < fifteenMinutesAgo) {
              this.recentDiscoveryThreads.delete(key);
            }
          }
        }, 60 * 1000);  // run every minute
      }
  setConnectors(connectors) {
    this.connectors.forEach(connector => this.addConnector(connector));
  }
  // Add a single connector
  addConnector(connector) {
    connector.flowRouter = this;
    this.connectors.push(connector);
    if(!connector.local) this.sendFlowDiscoveryMessage(connector);
  }
  // Remove a specific connector
  removeConnector(connector) {
    const index = this.connectors.indexOf(connector);
    if (index !== -1) {
      this.connectors.splice(index, 1);
    }
  }
  // receive flow message from chatbox or bot
  routeFlowMessage(message) {
    if(message.hops >= this.max_hops) {
      console.log(`[FlowRouter][warning] Message '${message.id}' has been passed around ${message.hops} times.  Discarding.`);
      return;
    }
    // evaluate load distribution
    let connector = this.evaluateLoadDistribution(message);
    // Check if connector exists before attempting to send message
    if (connector) {
      message.hops++;
      if(this.logging) console.log(`[FlowRouter][info] Routing message '${message.id}' from ${message.origin}:${message.sender} for ${message.recipient} to ${connector.id}`);
      connector.sendMessage(message);
    } else {
      console.log("No available connectors to send message");
    }
  }
  
  // decide which connector to use based on some condition
  // (i.e., load distribution in this case)
  evaluateLoadDistribution(message) {
    if (this.connectors.length == 0) {
      return null;
    }
    
    // get available flows and usage from flowMonitor
    let availableFlows = this.flowMonitor.getAvailableFlowsAndUsage();
    let connector;
  
    if (availableFlows.includes(message.recipient)) {
      connector = this.connectors.find(item => item.id === "localnode");
    } else {
      this.flowsMap.forEach(function (value, key, map) {
        if(value.includes(message.recipient)) {
          connector = this.connectors.find(item => item.id === key);
        }
      }.bind(this));
    }
  
      
    if(!connector) {
      throw new Error("[FlowRouter][error] No suitable connector found for the recipient");
    }
    return connector;
  }

  // Forward a message from a connector to the flow manager
  //TODO: Add queues to prevent stack overflow
  async forwardMessageToManager(flowMessage) {
    console.log(`[FlowRouter][info] Forwarding message '${flowMessage.id}' to manager`);
    let responseMessage = await this.flowManager.handleFlowMessage(flowMessage);
    if(responseMessage) this.routeFlowMessage(responseMessage);
  }

  async sendFlowDiscoveryMessage(connector, replyId=null) {
    const timeout = new Promise((resolve, reject) => {
      const id = setTimeout(() => {
        clearTimeout(id);
        reject('Timed out');
      }, this.connection_timeout)
    });

    const connectorConnected = new Promise((resolve, reject) => {
      if(connector.connected){
        resolve();
      } else {
        const checkInterval = setInterval(() => {
          if(connector.connected){
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
      }
    });

    try {
      await Promise.race([timeout, connectorConnected]);
      const discoveryMessage = new FlowDiscoveryMessage(this, connector);
      if(replyId) discoveryMessage.gid = replyId;
      console.log(`[FlowRouter][info] Sending FlowDiscoveryMessage ${discoveryMessage.id}`);
      connector.sendMessage(discoveryMessage);
      this.recentDiscoveryThreads[discoveryMessage.gid] = (new Date()).getTime();
    } catch (error) {
      console.error(error);
      return;
    }
  }
  async handleFlowDiscoveryMessage(message, connector) {
     console.log(`[FlowRouter][info] Received FlowDiscoveryMessage from ${connector.id}. Handling...`);
     if (!this.flowsMap.has(connector.id)) {
         this.flowsMap.set(connector.id, []);
     }
     const availableFlows = message.content;
     this.updateFlowMap(connector.id, availableFlows);
     if( !Object.keys(this.recentDiscoveryThreads).includes(message.gid) ) {
       this.recentDiscoveryThreads[message.gid] = (new Date()).getTime();
       await this.sendFlowDiscoveryMessage(connector, message.gid);
     }
  }

  updateFlowMap(connectorId, newFlows) {
    const oldFlows = this.flowsMap.get(connectorId) || [];
    this.flowsMap.set(connectorId, newFlows);

    newFlows.forEach(flow => {
      if (!this.reverseFlowsMap.has(flow))  {
        this.reverseFlowsMap.set(flow, []);
      }
      if (!this.reverseFlowsMap.get(flow).includes(connectorId)) {
        this.reverseFlowsMap.get(flow).push(connectorId);
      }
    });

    oldFlows.forEach(flow => {
      if (!newFlows.includes(flow)) {
        const index = this.reverseFlowsMap.get(flow).indexOf(connectorId);
        if (index !== -1) {
          this.reverseFlowsMap.get(flow).splice(index, 1);
        }
      }
    });
  }

}

class FlowDiscoveryMessage extends FlowMessage {
  constructor(flowRouter, flowConnector) {
    super(flowRouter.id, flowConnector.id, flowRouter.flowMonitor.getAvailableFlowsAndUsage(), flowRouter.id);
    this.discovery = true;
  }
}
