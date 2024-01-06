import express from "express";
import {connectDB} from "./db/index.js";
import dotenv from "dotenv";
import {app} from "./app.js"

const port = process.env.PORT 
dotenv.config({
    path : './.env'
})


connectDB().then(() => {
    try {
        app.listen(port , ()=>{
            console.log("App is Listening at port " + port)
        })
    } catch (error) {
        console.log("Error in app connection " + error)
        
    }
    
}).catch((error) => {
    console.log("Error in database connection " + error)
    throw(error)
})










// 1st method to connect to database , not a very good approach
// const app = express()
// (async () => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("error", (error) =>{
//             console.log("Error " , error)
//             throw error
//         })
//         app.listen(process.env.PORT,()=>{
//             console.log(`App is listening on port ${process.env.PORT}`)
//         })
//     } catch (error) {
//         console.error(`Error ${error}`)
//         throw error
//     }
// })()