import axios from 'axios';
import { v4 } from 'uuid';
import WebSocket, { WebSocketServer } from 'ws';
import os from 'os';

export const tools = {
  axios: axios,
  uuidv4: v4,
  ws: WebSocketServer,
  os: os
};
