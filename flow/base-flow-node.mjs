import { tools } from './tools.mjs';
import FlowMonitor from './flow-monitor.mjs';
import FlowManager from './flow-manager.mjs';
import FlowRouter from './flow-router.mjs';

// Flow Node interface
export default class BaseFlowNode {
  constructor(id_=null) {
    this.id = id_ || tools.uuidv4();
    this.flowManager = null;
    this.flowMonitor = null;
    this.flowRouter = null;
  }
  
  initialize() {
    this.flowMonitor = new FlowMonitor();
    this.flowManager = new FlowManager();
    this.flowRouter = new FlowRouter();
  }
}