import { tools }  from '../../tools.mjs';
import FlowConnector from '../flow-connector.mjs';
import FlowMessage from '../flow-message.mjs';

class WssFlowConnector extends FlowConnector {
    constructor(id, port) {
        super(id);
        this.wss = new tools.ws({ port: port });
        this.wss.on('connection', this.handleConnection.bind(this));
        this.connected = false;
        this.initMessageObject = {
          id: "00000000-0000-0000-0000-000000000000",
          gid: "00000000-0000-0000-0000-000000000000",
          origin: this.id,
          sender: this.id,
          recipient: this.id,
          content: this.id,
          time: "undefined",
          hops: 0
        };
        this.initMessageString = JSON.stringify(this.initMessageObject);

        console.log(`[WssFlowConnector] Initialized connector `+this.id);
    }
    handleConnection(conn) {
      conn.on('message', (data) => {
        data = String(data);
        // Deserialize the received data into a FlowMessage
        if(data != this.initMessageString) {
          let flowMessage = Object.assign(new FlowMessage(), JSON.parse(data));
          this.receiveMessage(flowMessage);
        } else {
          //TODO: Do we need to do something here?
          console.log(`[${this.id}][info] Confirmation received from client-side connection.`);
        }
      });
      this.initialize(conn);
    }
    sendMessage(flowMessage) {
      // Serialize the FlowMessage into a JSON string
      let data = JSON.stringify(flowMessage);
      this.wss.clients.forEach((client) => {
        // if (client.readyState === tools.ws.OPEN) { // <- tools.ws.OPEN is 'undefined' here
        if (client.readyState === 1) {
          client.send(data);
        }
      });
    }
    initialize(connection) {
      connection.send(this.initMessageString);
      this.connected = true;
    }
}



export default WssFlowConnector;
