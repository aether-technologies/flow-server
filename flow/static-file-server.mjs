import { promises as fs } from 'fs';
import path from 'path';
import { Flow } from './flow.mjs';

export default class StaticFileServerFlow extends Flow {
    constructor(id, config = {}) {
      super(id, config);
      this.base_web_path = path.normalize(path.join(__dirname, GLOBAL_CONFIG.WEB_DIR || '../www'));
      this.root_endpoint = GLOBAL_CONFIG.ROOT_ENDPOINT || '/'+GLOBAL_CONFIG.NAME;
        
      this.initialize();
    }
    async initialize() {
      if (GLOBAL_CONFIG.SSL_CERTIFICATE) {
        const options = {
          key: await fs.readFile(GLOBAL_CONFIG.SSL_PRIVATE_KEY),
          cert: await fs.readFile(GLOBAL_CONFIG.SSL_CERTIFICATE)
        };
        this.RESTServer = https.createServer(options, this.handleRequest);
        this.listen(GLOBAL_CONFIG.PORT, () => {
          console.log(`Secure server running at https://localhost:${GLOBAL_CONFIG.PORT}`);
        });
      } else {
        this.RESTServer = http.createServer(this.handleRequest);
        this.RESTServer.listen(GLOBAL_CONFIG.PORT, () => {
          console.log(`Server running at http://localhost:${GLOBAL_CONFIG.PORT}`);
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
      if (requestPath.startsWith(root_endpoint)) {
        // Remove the root_endpoint from the relativePath
        requestPath = requestPath.slice(root_endpoint.length);
      }
    
      // console.log("requestPath: ", requestPath);
      const relativePath = requestPath === '/' || requestPath === '' ? '/index.html' : requestPath;
      // console.log("relativePath: ", relativePath);
      const filePath = path.join(base_web_path, relativePath);
      // console.log("filePath: ", filePath);
    
      try {
        await fs.access(filePath);
      } catch(error) {
        if(info_logging) console.error(error);
        res.writeHead(404);
        res.end('404 Not Found');
        return;
      }
    
      if(filePath) {
    
        try {
          const contentType = getContentType(path.extname(filePath));
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


new StaticFileServerFlow();