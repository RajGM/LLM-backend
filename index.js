const fs = require('fs').promises;
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();
const app = express();
app.use(bodyParser.json());

app.use(cors());

app.post('/', async (req, res) => {
    try {
        console.log("POST REQEST JHERE")
        // Read two separate files asynchronously
        const file1 = fs.readFile('./results/analysis/raw/allfilesWithinRange.json', 'utf-8');
        const file2 = fs.readFile('./results/analysis/raw/allSameNewsAcrossRange.json', 'utf-8');
        
        // Wait for both files to be read
        const [data1, data2] = await Promise.all([file1, file2]);

        // Parse the JSON data from both files
        const jsonData1 = JSON.parse(data1);
        const jsonData2 = JSON.parse(data2);
       

        console.log(typeof jsonData1, typeof jsonData2)

        // Combine both results in an array or any other structure you prefer
        res.json({
            file1Data: jsonData1,
            file2Data: jsonData2,
            file3Data: jsonData3
        });

    } catch (error) {
        console.error("Error processing article:", error);
        res.status(500).json({ error: 'An error occurred while processing the article.' });
    }
});

app.post('/domaindata', async (req, res) => {
    try {
        console.log("POST REQEST JHERE")
        // Read two separate files asynchronously
        const file1 = fs.readFile('./results/analysis/raw/domain_data.json', 'utf-8');
        const file2 = fs.readFile('./results/analysis/raw/extracted_data_all_ranges.json', 'utf-8');
        const file3 = fs.readFile('./results/analysis/raw/controlled_random/check.json', 'utf-8');

        // Wait for both files to be read
        const [data1, data2, data3] = await Promise.all([file1, file2, file3]);

        // Parse the JSON data from both files
        const jsonData1 = JSON.parse(data1);
        const jsonData2 = JSON.parse(data2);
        const jsonData3 = JSON.parse(data3);

        console.log(typeof jsonData1, typeof jsonData2, typeof jsonData3)

        // Combine both results in an array or any other structure you prefer
        res.json({
            file1Data: jsonData1,
            file2Data: jsonData2,
            file3Data: jsonData3
        });

    } catch (error) {
        console.error("Error processing article:", error);
        res.status(500).json({ error: 'An error occurred while processing the article.' });
    }
});


app.get('*', async (req, res) => {
    try {
        // Extract tab and subtab from the query parameters
        
        // Extract tab and subtab from the path (req.url)
        const urlParts = req.url.split('/').filter(Boolean); // Split by '/' and filter out empty strings

        // Assuming the format is /tab/subtab.json
        const tab = urlParts[0];    // First part is the tab (e.g., 'same_agents')
        const subtab = urlParts[1]; // Second part is the subtab (e.g., 'politics-0.json')

        // Build the file path dynamically based on the tab and subtab
        const filePath = path.join(__dirname, 'results', tab, 'json', subtab);
       // console.log(filePath)
        // Read and parse the file
        const data = await fs.readFile(filePath, 'utf-8');
        const jsonData = JSON.parse(data);

        // Return the JSON data as a response
        res.json(jsonData);
    } catch (error) {
        console.error("Error processing article:", error);
        res.status(500).json({ error: 'An error occurred while processing the article.' });
    }
});

const PORT = 3000 | process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
