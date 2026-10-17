import {serveDir} from './upstream/lib.mjs';
const server=await serveDir(process.cwd());
console.log('Film preview: '+server.url('films/galileo/index.html'));
console.log('Relationship lab: '+server.url('films/relationship-lab/index.html'));
