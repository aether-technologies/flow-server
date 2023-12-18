import { tools } from './tools.mjs';
import FlowMonitor from './flow-monitor.mjs';
import FlowManager from './flow-manager.mjs';
import FlowRouter from './flow-router.mjs';

// Flow Node interface
export default class BaseFlowNode {
  constructor(id_=null, config={}) {
    this.id = id_ || tools.uuidv4();
    this.config = config;
    this.flowManager = null;
    this.flowMonitor = null;
    this.flowRouter = null;
  }
  
  initialize() {
    this.flowMonitor = new FlowMonitor(this.config);
    this.flowManager = new FlowManager(this.config);
    this.flowRouter = new FlowRouter(this.config);
  }
}