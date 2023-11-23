import { tools } from './tools.mjs';

export default class FlowMessage {
    constructor(sender, recipient, content, origin) {
        this.id = tools.uuidv4();
        this.gid = tools.uuidv4();
        this.origin = origin;
        this.sender = sender;
        this.recipient = recipient;
        this.content = content;
        this.time = new Date().toISOString();
        this.hops = 0;
    }
}

// export default FlowMessage;
