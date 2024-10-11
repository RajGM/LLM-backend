const fs = require('fs');
const path = require('path');

// Function to read and parse the JSON file
function readJSONFile(filePath) {
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
}

// Helper function to ensure data is an array
function ensureArray(data) {
  return Array.isArray(data) ? data : [data];
}

// Function to calculate the Misinformation Propagation Rate (MPR)
function calculateMPR(sourceDMI, targetDMI) {
  return targetDMI - sourceDMI;
}

// Function to calculate Mean
function calculateMean(data) {
  const arrayData = ensureArray(data);  // Ensure data is an array
  const sum = arrayData.reduce((acc, value) => acc + value, 0);
  return sum / arrayData.length;
}

// Function to calculate Variance
function calculateVariance(data, mean) {
  const arrayData = ensureArray(data);  // Ensure data is an array
  const squaredDiffs = arrayData.map(value => Math.pow(value - mean, 2));
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

// Function to perform calculations for the specific comparison
function performCalculations(sourceNode, targetNode) {
  const mprI0 = calculateMPR(sourceNode.articles[0].misInformationIndexArray.I0, targetNode.articles[0].misInformationIndexArray.I0);
  const mprI1 = calculateMPR(sourceNode.articles[0].misInformationIndexArray.I1, targetNode.articles[0].misInformationIndexArray.I1);
  const mprI2 = calculateMPR(sourceNode.articles[0].misInformationIndexArray.I2, targetNode.articles[0].misInformationIndexArray.I2);

  // Perform Taxonomy Analysis based on MPR values
  const taxonomyAnalysis = categorizeTaxonomy(mprI0, mprI1, mprI2);

  // Prepare groups for ANOVA
  const groupI0 = [sourceNode.articles[0].misInformationIndexArray.I0, targetNode.articles[0].misInformationIndexArray.I0];
  const groupI1 = [sourceNode.articles[0].misInformationIndexArray.I1, targetNode.articles[0].misInformationIndexArray.I1];
  const groupI2 = [sourceNode.articles[0].misInformationIndexArray.I2, targetNode.articles[0].misInformationIndexArray.I2];

  const anovaI0 = performANOVA([groupI0]);
  const anovaI1 = performANOVA([groupI1]);
  const anovaI2 = performANOVA([groupI2]);

  return {
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

    // Nodes for calculation
    const node0 = nodes[0]; // Assuming Node0 is the original node for the network
    const nodeFirst = nodesInRange[0];
    const nodeLast = nodesInRange[nodesInRange.length - 1];

    // Perform the calculations for each comparison
    const Node0_to_NodeFirst = performCalculations(node0, nodeFirst);
    const Node0_to_NodeLast = performCalculations(node0, nodeLast);
    const NodeFirst_to_NodeLast = performCalculations(nodeFirst, nodeLast);

      // Initialize the Dynamic Misinformation Index (DMI) series
      const DMISeries = {
        I0: [],
        I1: [],
        I2: []
      };

          // Loop through all nodes in the range and collect the DMI values
    nodesInRange.forEach(node => {
      const { I0, I1, I2 } = node.articles[0].misInformationIndexArray;
      DMISeries.I0.push(I0);
      DMISeries.I1.push(I1);
      DMISeries.I2.push(I2);
    });

     // Perform ANOVA on all news files in the current range
     const allNewsAnovaResults = performRangeANOVA(DMISeries);

    // Put everything into a single object for this file
    result.push({
      range: `${startNodeIndex}-${endNodeIndex}`,
      prompt,
      calculations: {
        [fileNameWithoutExtension]: {
          Node0_to_NodeFirst,
          Node0_to_NodeLast,
          NodeFirst_to_NodeLast,
          DMISeries, // Save the DMI series here for each news
          allNewsAnovaResults 
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

// Function to perform ANOVA for all news files passed through a range
function performRangeANOVA(DMISeries) {
  // Perform ANOVA on the collected I0, I1, I2 values within a range
  const anovaI0 = performANOVA(DMISeries.I0);
  const anovaI1 = performANOVA(DMISeries.I1);
  const anovaI2 = performANOVA(DMISeries.I2);

  return {
    "ANOVA I0": anovaI0,
    "ANOVA I1": anovaI1,
    "ANOVA I2": anovaI2
  };
}

// Function to perform between-group variance analysis
function performBetweenGroupVarianceAnalysis(results) {
  const ranges = Object.keys(results); // Extract all the ranges
  const betweenGroupResults = {};

  // Step 1: Between-Group Variance for Same News Across Different Ranges
  const newsFiles = new Set();

  // Collect unique news file names
  ranges.forEach((range) => {
    const calculations = results[range].calculations;
    Object.keys(calculations).forEach(newsFile => {
      newsFiles.add(newsFile); // Add all unique news files
    });
  });

  // For each unique news file, compare its DMI across all ranges
  newsFiles.forEach(newsFile => {
    const dmiSeriesI0 = [];
    const dmiSeriesI1 = [];
    const dmiSeriesI2 = [];

    ranges.forEach(range => {
      const calculations = results[range].calculations;
      if (calculations[newsFile]) {  // If the news file exists in this range
        const DMISeries = calculations[newsFile].DMISeries;
        dmiSeriesI0.push(DMISeries.I0);
        dmiSeriesI1.push(DMISeries.I1);
        dmiSeriesI2.push(DMISeries.I2);
      }
    });

    // Perform between-group variance analysis for this news file across all ranges
    const anovaI0 = performANOVA(dmiSeriesI0);
    const anovaI1 = performANOVA(dmiSeriesI1);
    const anovaI2 = performANOVA(dmiSeriesI2);

    // Store the results for this news file across ranges
    betweenGroupResults[newsFile] = {
      "Between_Range_ANOVA_Results": {
        "anovaI0": anovaI0,
        "anovaI1": anovaI1,
        "anovaI2": anovaI2
      }
    };
  });

  // Step 2: Between-Group Variance for All News Across All Ranges
  const globalDmiSeriesI0 = [];
  const globalDmiSeriesI1 = [];
  const globalDmiSeriesI2 = [];

  // Collect DMISeries from all news across all ranges
  ranges.forEach(range => {
    const calculations = results[range].calculations;
    Object.keys(calculations).forEach(newsFile => {
      const DMISeries = calculations[newsFile].DMISeries;
      globalDmiSeriesI0.push(DMISeries.I0);
      globalDmiSeriesI1.push(DMISeries.I1);
      globalDmiSeriesI2.push(DMISeries.I2);
    });
  });

  // Perform global between-group variance analysis for all news across all ranges
  const globalAnovaI0 = performANOVA(globalDmiSeriesI0);
  const globalAnovaI1 = performANOVA(globalDmiSeriesI1);
  const globalAnovaI2 = performANOVA(globalDmiSeriesI2);

  // Store the global variance results
  betweenGroupResults["Global"] = {
    "Between_Range_ANOVA_Results": {
      "anovaI0": globalAnovaI0,
      "anovaI1": globalAnovaI1,
      "anovaI2": globalAnovaI2
    }
  };

  return betweenGroupResults;
}

// Main execution function
function main() {
  const directoryPath = './'; // Directory with all input JSON files
  const outputFilePath = './raw/allfilesWithinRange.json'; // Path for output file
  const result = processAllFiles(directoryPath);
  writeResultsToFile(outputFilePath, result);

  // Step 2: Load processed results from the file
  const processedResults = readJSONFile(outputFilePath);

  // Step 3: Perform between-group variance analysis
  const betweenGroupVarianceResults = performBetweenGroupVarianceAnalysis(processedResults);

  // Step 4: Write the between-group variance analysis results to a new file
  const outputVarianceFilePath = './raw/allSameNewsAcrossRange.json';
  writeResultsToFile(outputVarianceFilePath, betweenGroupVarianceResults);

}

// Execute the main function
main();
