const Router = require("express");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require('uuid');
const { createToken } = require("../utils/constant");
const { docClient } = require("../utils/aws");
const { QueryCommand, PutCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");
const authenticate= require("../middleware/auth")

const router = Router();

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!(email?.trim()) || !(password?.trim())) {
            return res.status(400).json({ message: "Invalid data sent.", success: false });
        }
        const params = {
            TableName: 'auth',
            IndexName: 'EmailIndex',
            KeyConditionExpression: 'email = :email',
            ExpressionAttributeValues: {
                ':email': email.trim()
            }
        };
        const result = await docClient.send(new QueryCommand(params));
        const user = result.Items[0];
        if (!user) {
            return res.status(401).json({ message: "User doesn't exist.", success: false });
        }
        const correctPassword = await bcrypt.compare(password.trim(), user.password);
        if (!correctPassword) {
            return res.status(400).json({ message: "Incorrect password.", success: false });
        }
        const token = createToken({ id: user.id, username: user.username });
        res.cookie('token', token);
        res.status(200).json({ message: "Logged in.", success: true });
    } catch (error) {
        console.log("Error ", error.message);
        return res.status(500).json({ message: "Internal error occurred.", success: false });
    }
});

router.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!(email?.trim()) || !(password?.trim()) || !(username?.trim())) {
            return res.status(400).json({ message: "Invalid data sent.", success: false });
        }
        const checkParams = {
            TableName: 'auth',
            IndexName: 'EmailIndex',
            KeyConditionExpression: 'email = :email',
            ExpressionAttributeValues: {
                ':email': email.trim()
            }
        };
        const checkResult = await docClient.send(new QueryCommand(checkParams));
        if (checkResult.Items.length > 0) {
            return res.status(400).json({ message: "User already exists.", success: false });
        }
        const userId = uuidv4();
        const newUser = {
            id: userId,
            email: email.trim(),
            password: await bcrypt.hash(password.trim(), 10),
            username: username.trim(),
            creationDate: new Date().toISOString()
        };
        const putParams = {
            TableName: 'auth',
            Item: newUser
        };
        await docClient.send(new PutCommand(putParams));
        const token = createToken({ id: userId, username: username.trim() });
        res.cookie('token', token);
        res.status(200).json({ message: "User created.", success: true });
    } catch (error) {
        console.log("Error ", error.message);
        return res.status(500).json({ message: "Internal error occurred.", success: false });
    }
});

router.get("/logout", (req, res) => {
    res.clearCookie("token");
    console.log("cleared cookies");
    res.status(200).json({ message: "Logged out.", success: true });
});

const getUserById = async (userId) => {
    const params = {
        TableName: 'auth',
        Key: { id: userId }
    };
    try {
        const data = await docClient.send(new GetCommand(params));
        delete data.Item.password
        return data.Item;
    } catch (error) {
        console.error('Error fetching user details:', error);
        throw new Error('Error fetching user details');
    }
};

router.get("/",authenticate ,async (req,res)=>{
    try {
        const userId= req.userId
        if (!userId) {
            return res.status(400).json({ error: "Please login.",success:false });
        }
        const userDetails = await getUserById(userId);
        if (!userDetails) {
            return res.status(404).json({ error: "User not found",success:false });
        }
        res.json({user:userDetails,success:true});
    } catch (error) {
        console.log("Error ", error.message);
        return res.status(500).json({ message: "Internal error occurred.", success: false });
    }
})

module.exports = router;
