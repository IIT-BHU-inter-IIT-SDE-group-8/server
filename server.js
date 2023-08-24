const express = require("express")
const app = express()
require("dotenv").config({ path: "./env/config.env" })

app.listen(process.env.PORT, ()=>{
    console.log(`Server working on port: ${process.env.PORT}`)
})