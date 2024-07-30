const {Router}= require("express")
const memoriesMiddleware =require("../middleware/multer")
const authenticate = require("../middleware/auth");
const { docClient } = require("../utils/aws");
const { GetCommand, ScanCommand, QueryCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require('uuid');

const router=Router();

router.get('/self',authenticate, async (req, res) => {
    try {
        const params = {
            TableName: 'memories',
            IndexName: 'UserIdIndex',
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': req.userId
            }
        };
        const result = await docClient.send(new QueryCommand(params));
        const memories = result.Items;
        if (!memories || memories.length === 0) {
            return res.status(200).json({ message: "You haven't posted any memories yet.", posts: [], success: true });
        }

        res.status(200).json({ posts: memories, success: true });
    } catch (error) {
        console.log("Error ", error.message);
        return res.status(500).json({ message: "Internal error occurred.", success: false });
    }
});



router.get("/:id?", async (req, res) => {
    try {
        const { id } = req.params;

        if (id) {
            // Fetch a single memory by ID
            const params = {
                TableName: 'memories',
                Key: { id }
            };

            const result = await docClient.send(new GetCommand(params));
            const memory = result.Item;

            if (!memory) {
                return res.status(404).json({ message: "Memory not found.", success: false });
            }

            if (memory.privatePost) {
                return res.status(403).json({ message: "This memory is private.", success: false });
            }

            return res.status(200).json({ memory, success: true });
        } else {
            const params = {
                TableName: 'memories',
                FilterExpression: 'attribute_not_exists(privatePost) OR privatePost = :privatePostValue',
                ExpressionAttributeValues: {
                    ':privatePostValue': false
                }
            };

            const result = await docClient.send(new ScanCommand(params));
            const memories = result.Items;

            return res.status(200).json({ memories, success: true });
        }
    } catch (error) {
        console.error("Error fetching memories: ", error.message);
        return res.status(500).json({ message: "Internal error occurred.", success: false });
    }
});

router.use(authenticate);

router.post("/", memoriesMiddleware.fields([{name:"photoMemories", maxCount:7}]), async (req, res) => {
    try {
        const { location, description, startDate, endDate, thoughtfulMemories, privatePost } = req.body;
        const photoMemories = req.files.photoMemories;
        
        if (!location || !description || !startDate || !endDate) {
            return res.status(400).json({ message: "Missing required fields.", success: false });
        }
        
        let photoUrls = [];
        if (photoMemories && photoMemories.length > 0) {
            photoUrls = photoMemories.map(file => file.location); 
        }
        
        let parsedThoughtfulMemories = [];
        if (thoughtfulMemories) {
            try {
                parsedThoughtfulMemories = JSON.parse(thoughtfulMemories);
                if (!Array.isArray(parsedThoughtfulMemories)) {
                    throw new Error("thoughtfulMemories must be an array of strings");
                }
            } catch (error) {
                return res.status(400).json({ message: "Invalid thoughtfulMemories format.", success: false });
            }
        }
        
        const newMemory = {
            id: uuidv4(),
            userId: req.userId,
            username:req.username, 
            location,
            description,
            startDate,
            endDate,
            thoughtfulMemories: parsedThoughtfulMemories,
            photoMemories: photoUrls,
            privatePost: privatePost ?true:false,
            createdAt: new Date().toISOString()
        };

        const params = {
            TableName: 'memories',
            Item: newMemory
        };

        await docClient.send(new PutCommand(params));

        res.status(201).json({ message: "Memory created successfully.", memory: newMemory, success: true });
    } catch (error) {
        console.log("Error ", error.message);
        return res.status(500).json({ message: "Internal error occurred.", success: false });
    }
});

module.exports=router;