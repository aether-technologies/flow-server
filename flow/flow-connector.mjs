import FlowRouter from './flow-router.mjs';

// Flow Connector interface
export default class FlowConnector {
  constructor(id) {
    // A unique identifier for this connector
    // This needs to match the other side of this connector
    this.id = id;
    // Reference to the flow router (to send messages back)
    this.flowRouter = new FlowRouter();
    // List of flows available on this connector
    this.flowList = [];
    this.connected = false;
  }
  // Receives a message from the flow router and sends it to the flow manager on the other side
  sendMessage(flowMessage) {
    throw new Error('sendMessage has not been implemented!');
  }

  handleFlowDiscoveryMessage(flowDiscoveryMessage) {
    if(flowDiscoveryMessage.recipient == this.id) {
      console.log(`[${this.id}][info] FlowDiscoveryMessage :: `+JSON.stringify(flowDiscoveryMessage, null, 2));
      this.flowRouter.handleFlowDiscoveryMessage(flowDiscoveryMessage, this);
    } else {
      console.log(`[${this.id}][info] Forwarding FlowDiscoveryMessage for '${flowDiscoveryMessage.recipient}'`);
      this.flowRouter.routeFlowMessage(flowDiscoveryMessage);
    }
  }
  
  receiveMessage(message) {
    console.log(`[${this.id}][info] Received message with id '${message.id}`);
    if (!this.flowRouter) {
      throw new Error(`[${this.id}][error] No FlowRouter set for this connector`);
    }
    if (message.discovery) {
      this.handleFlowDiscoveryMessage(message);
    } else {
      this.flowRouter.forwardMessageToManager(message);
    }
  }

  isConnected() {
    return this.connected;
  }
}
// export default IFlowConnector;
