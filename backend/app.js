const express= require("express");
const { init } = require("./utils/aws");
const cookiesParser= require("cookie-parser")
const cors= require('cors')
const app= express()
const authRouter= require("./routes/auth")
const memoriesRouter= require("./routes/memories")

require("dotenv").config()
app.use(express.json())

app.use(cookiesParser())
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials:true
}))


init().then(() => {
    console.log('AWS clients initialized and table schema created.');
}).catch((error) => {
    console.error('Initialization error:', error);
});

app.use('/api/v1/user',authRouter)
app.use('/api/v1/memories',memoriesRouter)

app.get("/",(req,res)=>{
    res.json({message:"Api running."})
})


app.listen(3000,()=>console.log("Running on 3000"))