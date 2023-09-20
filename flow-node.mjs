import BaseFlowNode from './flow/base-flow-node.mjs'
import WssFlowConnector from './flow/connectors/wss-flow-connector.mjs';
import LocalFlowConnector from './flow/connectors/local-flow-connector.mjs';
// import Echo from './flow/test/echo-flow.mjs'
import ModuleLoaderFlow from './flow/module-loader.mjs'

export default class ServerFlowNode extends BaseFlowNode {
  constructor() {
    super('TestServer0');

    this.initialize();
    this.flowRouter.addConnector(new LocalFlowConnector());
    this.flowRouter.addConnector(new WssFlowConnector('WSS-1', 8000));
  }
}
