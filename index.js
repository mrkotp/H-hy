const autocannon = require('autocannon');
const cron = require('node-cron');
require('dotenv').config();

// Configuration
const TARGET_URL = process.env.TARGET_URL || 'https://portfolio-1gpmxr8s91.edgeone.dev/';
const CONNECTIONS = process.env.CONNECTIONS || 500;
const DURATION = process.env.DURATION || 300; // seconds
const PIPELINING = process.env.PIPELINING || 100;
const INTERVAL_MINUTES = process.env.INTERVAL_MINUTES || 10; // Run every 10 minutes

console.log('🚀 Autocannon Runner Started');
console.log('============================');
console.log(`Target URL: ${TARGET_URL}`);
console.log(`Connections: ${CONNECTIONS}`);
console.log(`Duration: ${DURATION} seconds`);
console.log(`Pipelining: ${PIPELINING}`);
console.log(`Interval: Every ${INTERVAL_MINUTES} minutes`);
console.log('============================\n');

function runAutocannon() {
    const startTime = new Date().toLocaleString();
    console.log(`\n⏰ [${startTime}] Starting autocannon test...`);
    
    const instance = autocannon({
        url: TARGET_URL,
        connections: parseInt(CONNECTIONS),
        duration: parseInt(DURATION),
        pipelining: parseInt(PIPELINING),
        workers: 4, // Optimized for Render's environment
        maxConnectionRequests: 100000,
        timeout: 600,
        headers: {
            'User-Agent': 'Autocannon-Render-Runner/1.0'
        }
    }, (err, result) => {
        if (err) {
            console.error(`❌ Error: ${err.message}`);
            return;
        }
        
        const endTime = new Date().toLocaleString();
        console.log(`✅ [${endTime}] Test completed!`);
        console.log(`📊 Requests: ${result.requests.total}`);
        console.log(`📈 Throughput: ${result.throughput.total} bytes/sec`);
        console.log(`⚡ Latency - Avg: ${result.latency.average}ms, Max: ${result.latency.max}ms`);
        console.log(`🎯 2xx Responses: ${result['2xx']}`);
        console.log(`🔴 Non-2xx Responses: ${result.non2xx || 0}`);
        console.log('----------------------------------------\n');
    });

    // Track progress
    autocannon.track(instance, {
        outputStream: process.stdout,
        renderProgressBar: true,
        renderResultsTable: false,
        renderLatencyTable: false
    });

    return instance;
}

// Run immediately on startup
console.log('🚦 Running initial test...');
runAutocannon();

// Schedule regular runs
cron.schedule(`*/${INTERVAL_MINUTES} * * * *`, () => {
    runAutocannon();
});

// Keep the process alive
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down gracefully...');
    process.exit(0);
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    console.error('⚠️ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('⚠️ Unhandled Rejection at:', promise, 'reason:', reason);
});
