// file:./scripts/server.js
import WssFlowConnector from './connectors/wss-flow-connector.mjs';
import LocalFlowConnector from './connectors/local-flow-connector.mjs';
import FlowRouter from './flow-router.mjs';
import FlowMessage from './flow-message.mjs';

class FlowTestServer {
    constructor() {
        this.flowrouter = new FlowRouter();
        this.wssConnector = new WssFlowConnector('WSS-1', 8000);
        this.localConnector = new LocalFlowConnector();
        this.flowrouter.addConnector(this.wssConnector);
        this.flowrouter.addConnector(this.localConnector);
    }

    start() {
        // Send a test message to the client
        const testMessage = new FlowMessage('Server', 'Client', 'Test content', 'Server');
        this.wssConnector.sendMessage(testMessage);
    }

    stop() {
        // Any stopping logic here
    }
}

export default FlowTestServer;
