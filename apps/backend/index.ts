import { config } from "dotenv"
config({ path: "../../packages/db/.env" })
import express, { json } from "express";
import  jwt, {JwtPayload} from "jsonwebtoken";
import { prismaClient } from "db/client";
const app = express()
const JWT_SECRET = "DEPLOY"
app.use(express.json())
app.post("/signup", async (req, res) => {
    const username = req.body.username 
    const password = req.body.password
    if(!password ||!username) {
        res.status(401).json({message: "Empty Username/ password"})
    } try{
    const user = await prismaClient.user.create({
        data: {
            username,password
        }
})
if(user) {
    res.status(200).json({message:"User created"})
} else {
    return res.status(404).json({message:"Error creatingUser"})
}} catch (Err) {
    res.status(410).send(Err)
}
})
function generateToken() {
    return Math.random().toString(36).slice(2)
}
app.post("/signin", async(req, res) => {
    const username = req.body.username 
    const password = req.body.password
    if(!password ||!username) {
        res.status(401).json({message: "Empty Username/ password"})
    }
    try {
    const user = await prismaClient.user.findFirst({
        where : {username : username
        }
    })
    if(!user) {
        return res.status(404).json({message:"Error Finding User"})
    }
    const token = jwt.sign({userId: user.id}, JWT_SECRET)
    res.json({token: token})
} 
catch {
    res.status(500).json({message : "Error connecting to DB"})
}
})

app.post("/todo", async (req, res) => {
    const task = req.body.task
    const done = req.body.done 
    const auth = req.headers.authorization
    if(!auth) {
        res.json({message:"Invalid Token"})
        return
    }
    const token = auth.split(" ")[1]!
    let decoded;
    try {
        decoded = jwt.verify(token, JWT_SECRET) as JwtPayload
    } catch {
        res.status(403).json({ message: "Invalid token" })
        return
    }
    const userId = decoded.userId
    try {
        const todo = await prismaClient.todo.create({
            data : {
                task, done , 
                userId
            }
        })
        if(!todo) {
            return res.json({message: "Error adding todo"})
        } else {
            return res.status(200).send({message : "todo created"})
        }
    } catch {
        res.json({message : "Error connecting to DB "})
    }
})
app.get("/todos", async (req, res) => {
    const auth = req.headers.authorization
    if(!auth) {
        res.status(401).send({message :"Invalid Token"})
        return
    }
    const token = auth.split(" ")[1]!
    let decoded;
    try {
        decoded = jwt.verify(token, JWT_SECRET) as JwtPayload
    } catch {
        res.status(403).json({ message: "Invalid token" })
        return
    }
    const userId = decoded.userId
    try {
        const todos = await prismaClient.todo.findMany({
            where : {
                userId
            }
        })
        if(!todos) {
            res.status(404).send({message : "Error fetching todos"})
        } 
        res.status(200).send(todos)
    } catch {
        res.json({message : "Error connecting to DB "})
    }
})
app.listen(8080)