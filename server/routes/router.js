const express = require('express'); //express
const moment = require("moment"); //moment on backend
const pool = require("../modules/pool.js"); //database pool
const router = express.Router(); //path from server to router
// DB CONNECTION

// GET
router.get("/", (req, res) => {
    // create our SQL
    let queryText = "SELECT * from todo;";
    // send our query to the pool (to postgres)
    pool.query(queryText)
        .then((result) => {
            // result is the result of our query!
            res.send(result.rows).status(200);
        })
        .catch((error) => {
            console.log(`Error making query: ${queryText}`);
            res.sendStatus(500);
        });
});

// POST
// url = "/"
router.post("/", (req, res) => {
    // HTTP REQUEST BODY
    const todo = req.body; // pull the object out out of the HTTP REQUEST
    const task = todo.task;
    const complete = todo.complete;
    const priority = todo.priority_marker;
    const currentTime = todo.time_now;
    const endTimeStamp = todo.end_time;
    const dueDate = todo.due_date;
    const timeStamp = todo.start_time;
    if (todo === undefined) {
        // stop, dont touch the database
        res.sendStatus(400); // 400 BAD REQUEST
        return;
    }

    const queryText = `
        INSERT INTO todo (task, complete, priority_marker, time_now, start_time, due_date, end_time) 
        VALUES ($1, $2, $3, $4, $5, $6, $7);`; //grabs database
    pool
      .query(queryText, [task, complete, priority, currentTime, timeStamp, dueDate, endTimeStamp])
      .then(function (result) {
        // result.rows: 'INSERT 0 1';
        // it worked!
        res.sendStatus(200); // 200: OK
      })
      .catch(function (error) {
        console.log("Sorry, there was an error with your query: ", error);
        res.sendStatus(500); // HTTP SERVER ERROR
      });
});

router.put("/time/:id", (req, res) => {
  let id = req.params.id; // grabs id and places it in path 
  let time = moment.utc().format(); //grabs current date and time
  let queryText =
    `UPDATE todo SET start_time = '${time}' WHERE (start_time is NULL AND id = $1)`; 
    //....and uopdates it with put to start time
  pool
    .query(queryText, [id])

    .then(function (result) {
      console.log("Update todo item for id of", id);
      // it worked!
      res.send(result.rows);
    })
    .catch(function (error) {
      console.log("Sorry, there was an error with your query: ", error);
      res.sendStatus(500); // HTTP SERVER ERROR
    });
});
// --------------------------------------------------
// PUT
router.put("/:id", (req, res) => {
    let id = req.params.id; // grabs id and places it in path
  let time = moment.utc().format(); //grabs current time
    let queryText =
        `UPDATE todo SET complete = 'completed', end_time = '${time}' WHERE (id = $1)`;
    pool.query(queryText, [id])

        .then(function (result) {
            console.log("Update todo item for id of", id);
            // it worked!
            res.send(result.rows);
        })
        .catch(function (error) {
            console.log("Sorry, there was an error with your query: ", error);
            res.sendStatus(500); // HTTP SERVER ERROR
        });
});


// DELETE
router.delete('/:id', (req, res) => {
    let id = req.params.id; // id of the thing to delete
    console.log('Delete route called with id of', id);

    const queryText = `
    DELETE FROM todo WHERE id=$1;`
    pool.query(queryText, [id])
        .then(function (result) {
            res.sendStatus(201);
        }).catch(function (error) {
            console.log('Sorry, there was an error with your query: ', error);
            res.sendStatus(500);

        });
}); //end DELETE

module.exports = router;