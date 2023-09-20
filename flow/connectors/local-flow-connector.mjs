import FlowConnector from '../flow-connector.mjs';

export default class LocalFlowConnector extends FlowConnector {
  constructor() {
    super('localnode');
    this.local = true;
    this.connected = true;
  }
  sendMessage(message) {
    this.receiveMessage(message);
  }
}
