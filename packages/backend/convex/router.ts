import { httpRouter } from 'convex/server';

const http = httpRouter();

// Import all the functions so they get registered
import './courses';
import './lessons';
import './mux';
import './admin';
import './auth';
import './achievements';
import './community';
import './consulting';
import './credentials';
import './events';
import './governance';
import './multimedia';
import './ai';
import './web3';

export default http;
