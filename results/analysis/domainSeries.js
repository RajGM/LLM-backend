const fs = require('fs');
const path = require('path');

// Function to extract Misinformation Propagation Rate data and save it to a new file
const extractMisinformationData = (inputFile, outputFile) => {
    console.log(inputFile, outputFile)
    
    // Read the input JSON file
    fs.readFile(inputFile, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }

        const jsonData = JSON.parse(data);
        const result = {};

        let index = 0;
        // Iterate over all keys (e.g., "1-30", "31-60", etc.)
        Object.keys(jsonData).forEach((rangeKey) => {
            const range = jsonData[rangeKey];
            const calculations = range?.calculations || {};
            //console.log(rangeKey)
            //console.log(range)
            //console.log(calculations)

            // Iterate over each news-file-name within this range
            Object.keys(calculations).forEach((newsFileName) => {
                const newsData = calculations[newsFileName];

                // If the news-file-name doesn't exist in the result, initialize it
                if (!result[newsFileName]) {
                    result[newsFileName] = {
                        Node0_to_NodeFirst: [],
                        Node0_to_NodeLast: [],
                        NodeFirst_to_NodeLast: []
                    };
                }

                // Push Misinformation Propagation Rate data into corresponding arrays
                result[newsFileName].Node0_to_NodeFirst.push(newsData?.Node0_to_NodeFirst?.['Misinformation Propagation Rate'] || {});
                result[newsFileName].Node0_to_NodeLast.push(newsData?.Node0_to_NodeLast?.['Misinformation Propagation Rate'] || {});
                result[newsFileName].NodeFirst_to_NodeLast.push(newsData?.NodeFirst_to_NodeLast?.['Misinformation Propagation Rate'] || {});

                index++;
                console.log(newsFileName)
                
            });
        });

        // Write the extracted data to the output file
        fs.writeFile(outputFile, JSON.stringify(result, null, 2), 'utf8', (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return;
            }
            console.log('Data extraction complete. File saved to', outputFile);
        });
    });
};

// Define the input and output file paths
const inputFilePath = path.join(__dirname, 'raw','controlled_random','analysis.json');
const outputFilePath = path.join(__dirname, 'controlled_random','range_analysis.json');

// Run the extraction
extractMisinformationData(inputFilePath, outputFilePath);
