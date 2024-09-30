const { spawn } = require('child_process');
const NEWS = require('./news'); // Import the NEWS.js

// Step 2: Function to run the child script for each news item
async function runChildScript(domain, news, newsNumber, outputFileName) {
    return new Promise((resolve, reject) => {
        const child = spawn('node', ['test.js'], {
            stdio: 'inherit',
            env: {
                ...process.env, // Pass the environment variables from the parent
                DOMAIN: domain,
                NEWS: news,
                NEWS_NUMBER: newsNumber,
                OUTPUT_FILE: outputFileName
            }
        });

        child.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Child process exited with code ${code}`));
            } else {
                resolve();
            }
        });
    });
}

// Step 3: Loop through each domain and news, then spawn child processes
async function runAllScripts() {
    const promises = [];

    for (const [domain, newsArray] of Object.entries(NEWS)) {
        newsArray.forEach((news, index) => {
            const newsNumber = `News${index + 1}`;
            const outputFileName = `${domain}_${newsNumber}_output.json`;

            // Spawn the child script for each news item in parallel
            promises.push(runChildScript(domain, news, newsNumber, outputFileName));
        });
    }

    // Wait for all child processes to complete
    try {
        await Promise.all(promises);
        console.log('All child processes have completed.');
    } catch (error) {
        console.error('An error occurred while running child scripts:', error);
    }
}

// Run the scripts
//runAllScripts();

// Step 2: Process each news item one by one
async function processNewsSequentially() {
    for (const [domain, newsArray] of Object.entries(NEWS)) {
        for (let index = 0; index < newsArray.length; index++) {
            const news = newsArray[index];
            const newsNumber = `News${index + 1}`;
            const outputFileName = `${domain}_${newsNumber}_output.json`;

            try {
                console.log(`Processing ${domain} - ${newsNumber}...`);
                await runChildScript(domain, news, newsNumber, outputFileName);
                console.log(`Finished processing ${domain} - ${newsNumber}`);
            } catch (error) {
                console.error(`Error processing ${domain} - ${newsNumber}:`, error);
            }
        }
    }
}

// Run the sequential processing
processNewsSequentially();