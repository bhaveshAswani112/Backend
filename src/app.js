import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express();
app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true
}))

app.use(express.json({    // ==> Configuration to allow json files but in a limit
    limit : "16kb"
}))
app.use(express.urlencoded({    // ==> Configuration to encode url eg some sites convert space to + and some to %20
    extended : true,
    limit : "16kb"
}))

app.use(express.static("public")) // ==> To handle sttaic files
app.use(cookieParser())



// routes

import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import tweetRouter from "./routes/tweet.routes.js"


app.use("/api/v1/users",userRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/tweets", tweetRouter)

export  {app}
