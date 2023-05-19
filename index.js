const express = require("express")
const mongodb = require("mongodb")
const mongoclient = mongodb.MongoClient;
const URL = "mongodb+srv://admin:iXatwYMuvUwaIeMd@cluster0.jvegpfy.mongodb.net/?retryWrites=true&w=majority"
const app = express()
const bcrypt = require("bcryptjs");
const jwt=require("jsonwebtoken")
const secret ="587vnzmcy9dbsuwtlhx2i1r3fpgoake6"
const cors = require("cors")


app.use(express.json())

app.use(cors({
    origin: "http://localhost:3000"
}))

app.get("/",(req,res)=>{
    res.json("hello world")
})
const authorize=(req,res,next)=>{
    if(req.headers.authorization){
        try{
        const verify=jwt.verify(req.headers.authorization,secret);
        if (verify) {
            next()
        }}catch(error){
            res.status(401).json({message:"Unauthorized"})
        }
     
    }else{
        res.status(401).json({message:"Unauthorized"})
    }
}

 
 

// get method
app.get("/users",authorize,async (req, res) => {

    try {
        const connection = await mongoclient.connect(URL);

        const db = connection.db("pizza_delivery")

        const collection = db.collection("pizza")

        const users = await collection.find({}).toArray();

        await connection.close();
        res.json(users);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Somthing went wrong" })
    }
})




// post method
app.post("/user",authorize,async (req, res) => {


    try {
        const connection = await mongoclient.connect(URL);

        const db = connection.db("pizza_delivery")

        const collection = db.collection("pizza")

        const operation = await collection.insertOne(req.body);

        await connection.close();
        res.json({ message: "Successfully inserted" });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Somthing went wrong" })
    }
})

// app.put("/user/:userId",(req,res) => {

//     const index=users.findIndex(o=> o.id==req.params.userId)
//    users[index].age=req.body.age;
// Object.keys(req.body).forEach((field)=>{
//     users[index][field]=req.body[field]
// })
//     res.json({message : "Edited"})
// })

// app.delete("/users/:userId",(req,res)=>{
//     const index=users.findIndex(o=> o.id==req.params.userId)
//     users.splice(index,1)
//     res.json({message : "Success Delete"})
// })


app.post("/register", async (req, res) => {


    try {
        const connection = await mongoclient.connect(URL);

        const db = connection.db("pizza_delivery")

        const collection = db.collection("login")

        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(req.body.password, salt)

        req.body.password = hash;
        const users = await collection.insertOne(req.body);

       
        res.send({
            users,
            message:"hello"
        })
        await connection.close();
        // res.json(users)
        // res.send("hello")
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Somthing went wrong" })
    }
})


app.post("/login", async (req, res) => {


    try {
        const connection = await mongoclient.connect(URL);

        const db = connection.db("pizza_delivery")
        const collection = db.collection("login")
        const user = await collection.findOne({email : req.body.email})
        if(user){
        const compare= await bcrypt.compare(req.body.password,user.password)
        if(compare){
        const token= jwt.sign({id:user._id},secret)
        console.log(token);
        await connection.close();
        res.json({message:"Login Success",token});
        }else{
            res.json({message:"password is wrong"})
        }
        }else{
            res.status(401).json({message:"user not found"})
        }

     
        // res.json(users)

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Somthing went wrong" })
    }
})




app.listen(8000)