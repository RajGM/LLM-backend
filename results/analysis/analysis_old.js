const fs = require('fs');
const path = require('path');

// Function to read and parse the JSON file
function readJSONFile(filePath) {
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
}

// Function to calculate the Misinformation Propagation Rate (MPR)
function calculateMPR(sourceDMI, targetDMI) {
  return targetDMI - sourceDMI;
}

// Function to calculate the Mean
function calculateMean(data) {
  const sum = data.reduce((acc, value) => acc + value, 0);
  return sum / data.length;
}

// Function to calculate Variance
function calculateVariance(data, mean) {
  const squaredDiffs = data.map(value => Math.pow(value - mean, 2));
  return calculateMean(squaredDiffs);
}

// Function to perform ANOVA
function performANOVA(groups) {
  const overallMean = calculateMean(groups.flat());
  const groupMeans = groups.map(group => calculateMean(group));
  const withinGroupVariance = groups.map(group => calculateVariance(group, groupMeans[groups.indexOf(group)])).reduce((acc, val) => acc + val, 0) / groups.length;
  const betweenGroupVariance = calculateVariance(groupMeans, overallMean);
  
  return {
    overallMean,
    groupMeans,
    withinGroupVariance,
    betweenGroupVariance
  };
}

// Function to categorize Taxonomy Analysis based on MPR
function categorizeTaxonomy(mprI0, mprI1, mprI2) {
  // Define the threshold values for categorization
  const thresholds = {
    factualError: 1,  // |MPR| <= 1
    lie: 3            // 1 < |MPR| <= 3
  };

  const categorize = (mpr) => {
    if (Math.abs(mpr) <= thresholds.factualError) return 'Factual Error';
    if (Math.abs(mpr) <= thresholds.lie) return 'Lie';
    return 'Propaganda';
  };

  return {
    I0: categorize(mprI0),
    I1: categorize(mprI1),
    I2: categorize(mprI2)
  };
}

// Function to process a single file and return the results
function processFile(filePath, fileNameWithoutExtension) {
  const data = readJSONFile(filePath);
  const { neighborRanges, nodes } = data;

  let result = [];

  // Loop through each neighbor range
  neighborRanges.forEach((range) => {
    const startNodeIndex = range[0];
    const endNodeIndex = range[1];

    // Extract the nodes for the current range
    const nodesInRange = nodes.slice(startNodeIndex, endNodeIndex + 1);

    // Ensure we have at least two nodes to calculate MPR
    if (nodesInRange.length < 2) return;

    // Capture the prompt from the first node in the range
    const prompt = nodesInRange[0].prompt;

    // Calculate MPR for I0, I1, and I2 between the first and last node in the range
    const firstNode = nodesInRange[0];
    const lastNode = nodesInRange[nodesInRange.length - 1];

    const mprI0 = calculateMPR(firstNode.articles[0].misInformationIndexArray.I0, lastNode.articles[0].misInformationIndexArray.I0);
    const mprI1 = calculateMPR(firstNode.articles[0].misInformationIndexArray.I1, lastNode.articles[0].misInformationIndexArray.I1);
    const mprI2 = calculateMPR(firstNode.articles[0].misInformationIndexArray.I2, lastNode.articles[0].misInformationIndexArray.I2);

    // Perform Taxonomy Analysis based on MPR values
    const taxonomyAnalysis = categorizeTaxonomy(mprI0, mprI1, mprI2);

    // Calculate ANOVA - Using I0, I1, and I2 values across the range
    const groupI0 = nodesInRange.map(node => node.articles[0].misInformationIndexArray.I0);
    const groupI1 = nodesInRange.map(node => node.articles[0].misInformationIndexArray.I1);
    const groupI2 = nodesInRange.map(node => node.articles[0].misInformationIndexArray.I2);

    const anovaI0 = performANOVA([groupI0]);
    const anovaI1 = performANOVA([groupI1]);
    const anovaI2 = performANOVA([groupI2]);

    // Put everything into a single object for this file
    result.push({
      range: `${startNodeIndex}-${endNodeIndex}`,
      prompt,
      calculations: {
        [fileNameWithoutExtension]: {
          "Misinformation Propagation Rate": {
            mprI0,
            mprI1,
            mprI2
          },
          "Taxonomy Analysis": {
            I0: taxonomyAnalysis.I0,
            I1: taxonomyAnalysis.I1,
            I2: taxonomyAnalysis.I2
          },
          "ANOVA Results": {
            anovaI0,
            anovaI1,
            anovaI2
          }
        }
      }
    });
  });

  return result;
}

// Function to process all files in a directory and group calculations by range
function processAllFiles(directoryPath) {
  const allFiles = fs.readdirSync(directoryPath);
  const groupedResult = {};

  allFiles.forEach((file) => {
    const filePath = path.join(directoryPath, file);
    const fileNameWithoutExtension = path.parse(file).name; // Get file name without extension
    if (file.endsWith('.json')) {
      const fileResults = processFile(filePath, fileNameWithoutExtension);

      // Group results by range and prompt
      fileResults.forEach((fileResult) => {
        const { range, prompt, calculations } = fileResult;

        // Initialize the group if it doesn't exist
        if (!groupedResult[range]) {
          groupedResult[range] = {
            prompt,
            calculations: {}
          };
        }

        // Merge calculations for this file into the existing range
        Object.assign(groupedResult[range].calculations, calculations);
      });
    }
  });

  return groupedResult;
}

// Function to write results to a new JSON file
function writeResultsToFile(outputFilePath, data) {
  fs.writeFileSync(outputFilePath, JSON.stringify(data, null, 2));
  console.log(`Results written to ${outputFilePath}`);
}

// Main execution function
function main() {
  const directoryPath = './'; // Directory with all input JSON files
  const outputFilePath = './raw/processed_results_old.json'; // Path for output file
  const result = processAllFiles(directoryPath);
  writeResultsToFile(outputFilePath, result);
}

// Execute the main function
main();
