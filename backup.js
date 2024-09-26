const edgesGraph1 = [
    // Way 1: Nodes 1 to 15
    [0, 1], , [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10],
    [10, 11], [11, 12], [12, 13], [13, 14], [14, 15],

    [0, 16], [16, 17], [17, 18], [18, 19], [19, 20], [20, 21], [21, 22], [22, 23], [23, 24],
    [24, 25], [25, 26], [26, 27], [27, 28], [28, 29], [29, 30],

    [0, 31], [31, 32], [32, 33], [33, 34], [34, 35], [35, 36], [36, 37], [37, 38], [38, 39],
    [39, 40], [40, 41], [41, 42], [42, 43], [43, 44], [44, 45],

    [0, 46], [46, 47], [47, 48], [48, 49], [49, 50], [50, 51], [51, 52], [52, 53], [53, 54],
    [54, 55], [55, 56], [56, 57], [57, 58], [58, 59], [59, 60],

    [0, 61], [61, 62], [62, 63], [63, 64], [64, 65], [65, 66], [66, 67], [67, 68], [68, 69],
    [69, 70], [70, 71], [71, 72], [72, 73], [73, 74], [74, 75],

    [0, 76], [76, 77], [77, 78], [78, 79], [79, 80], [80, 81], [81, 82], [82, 83], [83, 84],
    [84, 85], [85, 86], [86, 87], [87, 88], [88, 89], [89, 90],

    [0, 91], [91, 92], [92, 93], [93, 94], [94, 95], [95, 96], [96, 97], [97, 98], [98, 99],
    [99, 100], [100, 101], [101, 102], [102, 103], [103, 104], [104, 105],

    [106, 107], [107, 108], [108, 109],
    [106, 110], [110, 111], [111, 112],
    [106, 113], [113, 114], [114, 115]
];

// Distribute news from NEWS by category
// for (const [category, articles] of Object.entries(NEWS)) {
//     // Iterate over articles in each category
//     for (let i = 0; i < articles.length; i++) {
//         const content = articles[i]; // Get the news article
//         // Generate questions based on the news article
//         const questions = await generateQuestions(content);

//         // Generate external auditor answers based on the article and questions
//         const auditorAnswers = await answerQuestions(content, questions, "You are an external fact checker that answers yes/no questions based on a given text. Return your response as a JSON object with an 'answers' key containing an array of 1 (for Yes) or 0 (for No).");

//         // Send the news to a random node (excluding Node 0) for processing
//         await graph.sendInfo(0, `info-${category}-0${i}`, content, questions, auditorAnswers, `You are an avid news reader who likes to read about news and share it with others, often in a hoax way and distorting the original facts and mostly hyping up.`); // Use the agent's prompt for the node
//     }
// }

// const processPromises = [];
// this.nodes.forEach(node => {
//     // Collect promises for each node's processing
//     processPromises.push(node.processInfo());
// });

// // // Wait for all nodes to complete processing
//  await Promise.all(processPromises);


class Graph {
    constructor() {
        this.nodes = new Map();
    }

    addNode(id, prompt) {
        const node = new Node(id, prompt, this); // Pass the current graph instance (this) to each node
        this.nodes.set(id, node);
        return node;
    }

    addEdge(sourceId, targetId) {
        const sourceNode = this.nodes.get(sourceId);
        const targetNode = this.nodes.get(targetId);
        if (sourceNode && targetNode) {
            sourceNode.addNeighbor(targetId); // Add neighbor by ID
        }
    }

    // Send info from Node 0 with the initial article, generated questions, and auditor answers
    async sendInfo(sourceId, infoId, content, questions) {
        const sourceNode = this.nodes.get(sourceId);
        if (sourceNode) {
            console.log("INSIDE SOURCE NODE:", sourceNode)
            if (!questions || questions.length === 0) {
                console.error("No questions generated for Node 0");
                return;
            }

            const info = new Info(infoId, content, sourceId, questions); // Pass down the generated questions

            // Add answers for Node 0 and Auditor to the info object
            info.node0Answers = node0Answers;
            info.auditorAnswers = auditorAnswers;

            sourceNode.receiveInfo(info);
            await sourceNode.processInfo(); // Ensure Node 0 processes before sending to neighbors
        }
    }

    // Method to capture the current structure of the graph
    captureGraphStructure() {
        // Capture nodes and their edges
        const graphStructure = {
            nodes: Array.from(this.nodes.values()).map(node => ({
                id: node.id,
                prompt: node.prompt,   // The prompt used by the node
                articles: node.articles, // The articles processed by the node
                neighbors: node.neighbors.map(neighbor => neighbor.id) // Neighbors (edges)
            })),
            edges: Array.from(this.nodes.entries()).flatMap(([sourceId, node]) =>
                node.neighbors.map(neighbor => ({ source: sourceId, target: neighbor.id }))
            ),
        };

        return graphStructure;
    }

    // Function to calculate the size of the data in bytes
    getSizeInBytes(obj) {
        return Buffer.byteLength(JSON.stringify(obj));
    }

    saveGraphToFile(filename) {
        const graphData = {
            nodes: Array.from(this.nodes.values()).map(node => ({
                id: node.id,
                articles: node.articles // Ensure each node's articles are included
            })),
            edges: Array.from(this.nodes.entries()).flatMap(([sourceId, node]) =>
                node.neighbors.map(neighbor => ({ source: sourceId, target: neighbor.id }))
            ),
        };

        // Log the structure that will be written to the file
        //console.log(`Saving the following graph data structure: ${JSON.stringify(graphData, null, 2)}`);

        try {
            // Write the full data in chunks if needed
            fs.writeFileSync(filename, JSON.stringify(graphData, null, 4));
            console.log(`Graph data has been saved to ${filename}`);
        } catch (error) {
            console.error(`Error writing to file: ${error.message}`);
        }
    }

    // saveGraphToFile(filename) {
    //     const graphStructure = this.captureGraphStructure();

    //     try {
    //         fs.writeFileSync(filename, JSON.stringify(graphStructure, null, 4)); // Save to file
    //         console.log(`Graph structure has been saved to ${filename}`);
    //     } catch (error) {
    //         console.error(`Error writing to file: ${error.message}`);
    //     }
    // }

    async processAllNodes() {

        //-------------------
        const processPromises = Array.from(this.nodes.values()).map((node) => node.processInfo());

        // Wait for all nodes to complete processing
        await Promise.all(processPromises);
        console.log("All nodes have completed processing.");
        //  ---------

        // After all nodes have finished processing, write the graph data to the file
        this.saveGraphToFile('grapht.json');
    }

}