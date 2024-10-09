const fs = require('fs');
const path = require('path');

// Function to extract misInformationIndexArray from the domain-news JSON file for the specified indices
const extractMisinformationIndex = (inputData) => {
    const result = {};

    // Iterate over each range and corresponding domain-news files
    inputData.forEach(({ range, domains }) => {
        const [start, end] = range.split('-').map(Number);
        result[range] = {};

        domains.forEach((domainFile) => {
            const filePath = path.join(__dirname, '../../same_agents/json/', `${domainFile}.json`);

            // Read the domain-news JSON file
            const fileData = fs.readFileSync(filePath, 'utf8');
            const jsonData = JSON.parse(fileData);

            // Extract misInformationIndexArray for the specified index range (start to end)
            const misInformationIndexArray = jsonData?.nodes
                .slice(start, end + 1)  // Access nodes by their index using slice
                .map((node) => node.articles[0]?.misInformationIndexArray || []);

            const prompt =jsonData.nodes[start].prompt; 
            // Add the data to the result object
            console.log(misInformationIndexArray)
            result[range].prompt = prompt;
            result[range][domainFile] = misInformationIndexArray;
        });
    });

    return result;
};

// Save the result to a new file
const saveResultToFile = (result, outputFile) => {
    fs.writeFileSync(outputFile, JSON.stringify(result, null, 2), 'utf8');
    console.log(`Data saved to ${outputFile}`);
};

// Define input ranges and domain files
const inputData = [
    { range: '1-30', domains: ['crime-0', 'politics-1'] },
    { range: '90-120', domains: ['politics-1', 'education-0'] }
] // Input data structure

const outputFile = path.join(__dirname, 'extracted_data_all_ranges.json');

// Run extraction
const extractedData = extractMisinformationIndex(inputData);
saveResultToFile(extractedData, outputFile);


//const filePath = path.join(__dirname, '../../same_agents/json/',`${domainFile}.json`);
// const inputData = [
//     { range: '1-30', domains: ['crime-0', 'politics-1'] },
//     { range: '90-120', domains: ['politics-1', 'education-0'] }
// ];const outputFile = path.join(__dirname, 'extracted_data_all_ranges.json');
