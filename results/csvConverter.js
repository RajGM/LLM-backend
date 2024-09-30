const fs = require('fs');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Get all JSON files in the directory
const directoryPath = './'; // Directory where the JSON files are located

// Function to process each JSON file and convert to CSV
function processJsonFile(fileName) {
    const jsonData = JSON.parse(fs.readFileSync(fileName, 'utf-8'));

    // Prepare CSV Writer for nodes
    const nodesCsvWriter = createCsvWriter({
        path: `${path.basename(fileName, '.json')}_nodes.csv`,
        header: [
            { id: 'id', title: 'ID' },
            { id: 'prompt', title: 'Prompt' },
            { id: 'infoId', title: 'Info ID' },
            { id: 'content', title: 'Content' },
            { id: 'nodeXAnswers', title: 'Node X Answers' },
            { id: 'node0Answers', title: 'Node 0 Answers' },
            { id: 'auditorAnswers', title: 'Auditor Answers' },
            { id: 'questions', title: 'Questions' },
            { id: 'misInformationIndexArray', title: 'Misinformation Index Array' },
            { id: 'sender', title: 'Sender' }
        ]
    });

    // Format nodes for CSV
    const nodesData = jsonData.nodes.map(node => {
        return {
            id: node.id,
            prompt: node.prompt,
            infoId: node.articles[0].infoId || '', // assuming each node has at least one article
            content: node.articles[0].content || '',
            nodeXAnswers: JSON.stringify(node.articles[0].nodeXAnswers || []), // Convert arrays to strings
            node0Answers: JSON.stringify(node.articles[0].node0Answers || []),
            auditorAnswers: JSON.stringify(node.articles[0].auditorAnswers || []),
            questions: JSON.stringify(node.articles[0].questions || []),
            misInformationIndexArray: JSON.stringify(node.articles[0].misInformationIndexArray || {}),
            sender: node.articles[0].sender || ''
        };
    });

    // Write nodes to CSV
    nodesCsvWriter.writeRecords(nodesData)
        .then(() => {
            console.log(`Nodes CSV file for ${fileName} written successfully.`);
        })
        .catch(err => {
            console.error(`Error writing nodes CSV file for ${fileName}:`, err);
        });
}

// Read all files in the directory and process the JSON files
fs.readdir(directoryPath, (err, files) => {
    if (err) {
        console.error('Unable to scan directory:', err);
        return;
    }

    // Filter JSON files and process each
    files.filter(file => file.endsWith('.json')).forEach(file => {
        processJsonFile(path.join(directoryPath, file));
    });
});
