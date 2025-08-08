const express = require("express");
const { connectmongodb } = require("./connect");
const router = require("./routes/route")

const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 8000;

require('dotenv').config();

//connect
connectmongodb("mongodb://127.0.0.1:27017/ecom").then(
  () => console.log("mongodb connected")
);

// ..middlewear - plugin //very very important for accesing data from body
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//jump to router for api routing

app.use('/api', router)

app.listen(PORT, () => console.log(`Server started at PORT: ${PORT}`));
