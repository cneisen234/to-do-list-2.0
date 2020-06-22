const express = require("express");
const bodyParser = require("body-parser");
const pool = require("./modules/pool.js");
const router = require("./routes/router.js");
const app = express();


// set up our middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("server/public"));

// *** Set up our HTTP Routers ***
app.use("/todo", router);

// *** Simple routes for testing ***
app.get("/", (req, res) => res.send(pool));

app.get("/dbtest", (req, res) => {
    // very simple DB test, just to make sure
    // that our database is connected correctly
    // GET http://localhost:5000/dbtest
    pool.query("Select 1;")
        .then(() => res.send("Database Connected Successfully!"))
        .catch((error) => res.send(`Error Connecting to Database: ${error}`));
});
//loading on port 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log("server running on: ", PORT);
});
