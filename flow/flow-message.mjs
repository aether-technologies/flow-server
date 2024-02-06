import { tools } from './tools.mjs';

export default class FlowMessage {
    constructor(sender, recipient, content, origin, metadata = {}) {
        this.id = tools.uuidv4();
        this.gid = tools.uuidv4();
        this.origin = origin;
        this.sender = sender;
        this.recipient = recipient;
        this.content = content;
        this.metadata = metadata;
        this.time = new Date().toISOString();
        this.hops = 0;
    }

    createResponse(content, metadata={}) {
        let response = new FlowMessage(this.recipient, this.sender, content, this.origin, metadata || {});
        response.gid = this.gid;
        return response;
    }
}
