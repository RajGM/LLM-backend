const fs = require('fs').promises;
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const json = require('body-parser/lib/types/json');

dotenv.config();
const app = express();
app.use(bodyParser.json());

app.use(cors());

// app.post('/', async (req, res) => {
//     try {
//         console.log("POST REQEST JHERE")
//         // Read two separate files asynchronously
//         const file1 = fs.readFile('./display_files/same_agents/allfilesWithinRange.json', 'utf-8');
//         const file2 = fs.readFile('./display_files/same_agents/allSameNewsAcrossRange.json', 'utf-8');
        
//         // Wait for both files to be read
//         const [data1, data2] = await Promise.all([file1, file2]);

//         // Parse the JSON data from both files
//         const jsonData1 = JSON.parse(data1);
//         const jsonData2 = JSON.parse(data2);
       
//         console.log(typeof jsonData1, typeof jsonData2)

//         // Combine both results in an array or any other structure you prefer
//         res.json({
//             file1Data: jsonData1,
//             file2Data: jsonData2,
//             file3Data: jsonData3
//         });

//     } catch (error) {
//         console.error("Error processing article:", error);
//         res.status(500).json({ error: 'An error occurred while processing the article.' });
//     }
// });

app.post('/domaindata', async (req, res) => {
    try {
        console.log("POST REQEST JHERE")
        const file1 = fs.readFile('./display_files/same_agents/lineChart.json', 'utf-8'); //line chart - allSameNewsACrossRange - same agents - but only specific data mpr ONLY - contains mprI0 mprI1 mprI2 in series
        
        const file2 = fs.readFile('./display_files/same_agents/heat_map.json', 'utf-8'); //heatmap - allFiles-NewsWithinRange - same agents - but only specific - I0,I1,I2 in series - top misInfo
        
        const file3 = fs.readFile('./display_files/same_agents/scattered_chart.json', 'utf-8'); //scatter-plot allSameNewsACrossRange - same agents - allCompilerData
        
        //heatmap remaining

        ///----------------------------
        const file4 = fs.readFile('./display_files/controlled_random/lineChart.json', 'utf-8');
        
        const file5 = fs.readFile('./display_files/controlled_random/heat_map.json', 'utf-8');

        const file6 = fs.readFile('./display_files/controlled_random/scattered_chart.json', 'utf-8');

        ///----------------------------

        // Wait for both files to be read
        const [data1, data2, data3, data4, data5, data6] = await Promise.all([file1, file2, file3, file4, file5, file6]);

        // Parse the JSON data from both files
        const jsonData1 = JSON.parse(data1);
        const jsonData2 = JSON.parse(data2);
        const jsonData3 = JSON.parse(data3);
        const jsonData4 = JSON.parse(data4);
        const jsonData5 = JSON.parse(data5);
        const jsonData6 = JSON.parse(data6);

        console.log(typeof jsonData1, typeof jsonData2, typeof jsonData3)

        // Combine both results in an array or any other structure you prefer
        res.json({
            file1Data: jsonData1,
            file2Data: jsonData2,
            file3Data: jsonData3,
            file4Data: jsonData4,
            file5Data: jsonData5,
            file6Data: jsonData6
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
