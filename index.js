import BaseFlowNode from './flow/base-flow-node.mjs'
import WssFlowConnector from './flow/connectors/wss-flow-connector.mjs';
import LocalFlowConnector from './flow/connectors/local-flow-connector.mjs';

import FlowRouter from './flow/flow-router.mjs';
import FlowManager from './flow/flow-manager.mjs';
import FlowMonitor from './flow/flow-monitor.mjs';
import FlowConnector from './flow/flow-connector.mjs';
import FlowMessage from './flow/flow-message.mjs';
import Flow from './flow/flow.mjs';

import ModuleLoaderFlow from './flow/module-loader.mjs'

export default class FlowNode extends BaseFlowNode {
  constructor(id="ServerFlowNode") {
    super(id);

    this.initialize();
    this.flowRouter.addConnector(new LocalFlowConnector());
    this.flowRouter.addConnector(new WssFlowConnector('WSS-1', 8000));
  }
}

export {
  Flow,
  FlowMessage,
  FlowConnector,
  FlowRouter,
  FlowManager,
  FlowMonitor
}
