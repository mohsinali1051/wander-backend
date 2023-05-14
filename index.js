import { config } from "dotenv";
import {Configuration, OpenAIApi} from "openai"

import cors from 'cors';
import express from 'express';
var app = express();
app.use(cors());

config()
const open_ai = new OpenAIApi(new Configuration({
    apiKey: process.env.API_KEY
}))

app.get('/', async (req, res) => {
    const place = req.query.place;
    const days = req.query.days;
    console.log(place)
    console.log(days)

    const response = await open_ai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{role:"user", content: "Generate a plan of " + days + "days of tour to " + place + ", also give me website links of each place for guide"}]
    })

    var voyagePlan =  response.data.choices[0].message.content
    // console.log(voyagePlan)
    res.send(voyagePlan)
    
});

var server = app.listen(8080,function(){
  console.log("server is created ");
});






