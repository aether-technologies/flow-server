import http from 'http';
import https from 'https';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import Flow from './flow.mjs';

const __dirname = path.dirname(new URL(import.meta.url).pathname).slice(os.platform() === 'win32' ? 1 : 0);

export default class StaticFileServerFlow extends Flow {
    constructor(id, config = {}) {
      super(id, config);
      this.base_web_path = path.normalize(config.WEB_DIR || path.join(__dirname, '../www'));
      this.root_endpoint = config.ROOT_ENDPOINT || '/'+config.NAME;
        
      this.initialize(config);
    }
    async initialize(config) {
      if (config.SSL_CERTIFICATE) {
        const options = {
          key: await fs.readFile(config.SSL_PRIVATE_KEY),
          cert: await fs.readFile(config.SSL_CERTIFICATE)
        };
        this.RESTServer = https.createServer(options, this.handleRequest.bind(this));
        this.listen(config.PORT, () => {
          console.log(`Secure server running at https://localhost:${config.PORT}`);
        });
      } else {
        this.RESTServer = http.createServer(this.handleRequest.bind(this));
        this.RESTServer.listen(config.PORT, () => {
          console.log(`Server running at http://localhost:${config.PORT}`);
        });
      }
    }
    
    async run(flowMessage) {
      throw new Error("StaticFileServerFlow is not designed to handle FlowMessages");
    }
        
    async handleRequest(req, res) {
      // console.log("Handling request: ", req.url);
      // console.log(" - req :: ",req);
      // console.log(" - res :: ",res);
    
      let requestPath = req.url;
    
      // Check if the request is for the specific endpoint
      if (requestPath.startsWith(this.root_endpoint)) {
        // Remove the root_endpoint from the relativePath
        requestPath = requestPath.slice(this.root_endpoint.length);
      }
      
      // console.log("requestPath: ", requestPath);
      const relativePath = requestPath === '/' || requestPath === '' ? '/index.html' : requestPath;
      const filePath = path.join(this.base_web_path, relativePath);
      // console.log("filePath: ", filePath);
    
      try {
        await fs.access(filePath);
      } catch(error) {
        if(this.logging) console.error(error);
        res.writeHead(404);
        res.end('404 Not Found');
        return;
      }
    
      if(filePath) {
    
        try {
          const contentType = this.getContentType(path.extname(filePath));
          const content = await fs.readFile(filePath, 'utf-8');
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content, 'utf-8');
        } catch (err) {
          console.error(err);
          if (err.code === 'ENOENT') {
            res.writeHead(404);
            res.end('404 Not Found');
          } else {
            res.writeHead(500);
            res.end('500 Internal Server Error');
          }
        }
      }
      // console.log("chek end");
    }
    
    getContentType(extname) {
        switch (extname) {
            case '.html':
                return 'text/html';
            case '.css':
                return 'text/css';
            case '.js':
            case '.mjs':
                return 'text/javascript';
            case '.json':
                return 'application/json';
            case '.png':
                return 'image/png';
            case '.jpg':
                return 'image/jpeg'; // Corrected MIME type from 'image/jpg' to 'image/jpeg'
            case '.gif':
                return 'image/gif';
            default:
                return 'text/plain';
        }
    }
}
