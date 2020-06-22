$(document).ready(function () {
    // Establish Click Listeners
    $("#list").on("click", ".deleteThis", deleteListItem);
    $("#list").on("click", ".markReady", markComplete);
    $("#pastDue").on("click", ".markReady", markComplete);
    $("#completeList").on("click", ".deleteThis", deleteListItem);
    $("#justStarted").on("click", ".deleteThis", deleteListItem);
    $("#pastDue").on("click", ".deleteThis", deleteListItem);
    $("#justStarted").on("click", ".startTimeButton", startTimer);
    $("#addTask").on("click", addListItem);
    //allows item to be added with enter key
    let keypress = document.querySelector("#task");
    keypress.addEventListener("keydown", function (event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            addListItem(event);
        }
    });
    //function for clock at top of page
    function clock () {
    let time = moment().format('MMMM Do YYYY, h:mm:ss a');
    $('#time').empty();
    $("#time").append(time);
    }
    clock();
    setInterval(clock, 1000);
    // load existing list items on page load
    getList();
    setInterval(getList, 1000);

}); // end doc ready

function addListItem(event) {
    //posts information from input fields to the server

    const task = $("#task").val();
    const complete = $("#complete").val();
    const priority = $("#priority").val();
    const currentTime = moment().format("L, h:mm:ss a");
    let dueDate = ""
    if(priority === 'low') {
        //if priority is low, put due date to 7 days from add date
        dueDate = moment().add(7, "days").format("L, h:mm:ss a");
    } else if (priority === 'medium') {
         //if priority is medium, put due date to 2 days from add date
        dueDate = moment().add(2, "days").format("L, h:mm:ss a");
    } else {
         //if priority is high, put due date to 4 hours from add date
        dueDate = moment().add(4, "hours").format("L, h:mm:ss a");
    }
    //grabs info from database
    const todoObject = {
      task: task,
      complete: complete,
      priority_marker: priority,
      time_now: currentTime,
      due_date: dueDate,
    };
    let taskChecker = document.getElementById("task");
   
    //checks to make sure input fields aren't empty
    if (
        taskChecker.value === ""
    ) {
        alert("please enter task");
    } else {
        //...otherwise post info to the server
        $.ajax({
            method: "POST",
            url: "/todo",
            data: todoObject,
        })
            .then(function (response) {
                console.log("Server received our list item!");
                getList();
            })
            .catch(function (response) {
                //runs if post request fails
                alert("sorry, unable to post at this time, internal error");
            });
        $("#task").val("");
    }
}
//-------------------------------------------------------------

                 


function getList() {
    //grabs info from server and populates on DOM
    $.ajax({
        type: "GET",
        url: "/todo",
    }).then(function (response) {
        //clears fields
        $("#list").empty();
        $("#completeList").empty();
        $("#justStarted").empty();
        $("#pastDue").empty();
            for (let i = 0; i < response.length; i++) {
                //time vars
                let formattedStartTime = moment(response[i].start_time).format('MMMM Do YYYY, h:mm:ss a')
                let formattedTimeNow = moment(response[i].time_now).format('MMMM Do YYYY, h:mm:ss a')
                let formattedEndTime = moment(response[i].end_time).format('MMMM Do YYYY, h:mm:ss a')
                let formattedDueDate = moment(response[i].due_date).format('MMMM Do YYYY, h:mm:ss a')
                let countDown = moment(response[i].due_date).diff(moment())
                let countDownSeconds = countDown/1000
                let countDownMin = countDownSeconds/60
                let countDownHours = countDownMin/60
                let countDownDays = countDownHours/24
                let countdownHoursUpdate = countDownHours - (24 * Math.floor(countDownDays))
                let countdownMinUpdate = countDownMin - (60 * Math.floor(countDownHours))
                let countdownSecondsUpdate = countDownSeconds - (60 * Math.floor(countDownMin))
                //past due box
                if (
                  countDownDays < 0 &&
                  response[i].complete === "incomplete"
                ) {
                  $("#pastDue").append(
                    `<section class="container-fluid"><div class="row smallBorder"><div class="col-12 smallBorder">Task Name: ${response[i].task}</div></div>
                        <div class="row smallBorder"><div class="incompleteMarker col-5 smallBorder">Status: <span>${response[i].complete}</span></div><div class="col-7 smallBorder">Task Added At:</br> ${formattedTimeNow}</div></div>
                        <div class="row smallBorder"><div class="completeMarker col-6 smallBorder">priority level: ${response[i].priority_marker} </br>Due Date: ${formattedDueDate}</div><div class="endTime col-6 smallBorder">Due in:</br> <span id="due">PAST DUE</Span></div></div>
                        <div class="row smallBorder"><button class="markReady btn btn-sm btn-success col-5" data-id='${response[i].id}'>Complete</button><button class="deleteThis btn btn-sm btn-danger col-6"data-id='${response[i].id}'>Delete</button></div>
                        </section>`
                  );
                  //task added box
                } else if (
                  response[i].complete === "incomplete" &&
                  response[i].start_time === null
                ) {
                  $("#justStarted").append(
                    `<section class="container-fluid"><div class="row smallBorder"><div class="col-12 smallBorder">Task Name: ${
                      response[i].task
                    }</div></div>
                        <div class="row smallBorder"><div class="incompleteMarker col-5 smallBorder">Status: ${
                          response[i].complete
                        }</div><div class="col-7 smallBorder">Task Added At:</br> ${formattedTimeNow}</div></div>
                        <div class="row smallBorder"><div class="completeMarker col-6 smallBorder">priority level: ${
                          response[i].priority_marker
                        } </br>Due Date: ${formattedDueDate}</div><div class="endTime col-6 smallBorder">Due in:</br> ${Math.floor(
                      countDownDays
                    )} Days, ${Math.floor(
                      countdownHoursUpdate
                    )} Hours, ${Math.floor(
                      countdownMinUpdate
                    )} Minutes, ${Math.floor(
                      countdownSecondsUpdate
                    )} Seconds</div></div>
                        <div class="row smallBorder"><button class="startTimeButton btn btn-sm btn-primary col-6" data-id='${
                          response[i].id
                        }'>Start</button><button class="deleteThis btn btn-sm btn-danger col-6"data-id='${
                      response[i].id
                    }'>Delete</button></div>
                        </section>`
                  );
                  //task started box
                } else if (
                  response[i].complete === "incomplete" &&
                  response[i].start_time !== null
                ) {
                  $("#list").append(
                    `<section class="container-fluid"><div class="row smallBorder"><div class="col-5 smallBorder">Task Name: ${
                      response[i].task
                    }</div><div class="startTime col-7 smallBorder">Start Time:</br> ${formattedStartTime}</div></div>
                        <div class="row smallBorder"><div class="incompleteMarker col-5 smallBorder">Status: ${
                          response[i].complete
                        }</div><div class="col-7 smallBorder">Task Added At:</br> ${formattedTimeNow}</div></div>
                        <div class="row smallBorder"><div class="completeMarker col-6 smallBorder">priority level: ${
                          response[i].priority_marker
                        } </br>Due Date: ${formattedDueDate}</div><div class="endTime col-6 smallBorder">Due In:</br> ${Math.floor(
                      countDownDays
                    )} Days, ${Math.floor(
                      countdownHoursUpdate
                    )} Hours, ${Math.floor(
                      countdownMinUpdate
                    )} Minutes, ${Math.floor(
                      countdownSecondsUpdate
                    )} Seconds</div></div>
                        <div class="row smallBorder"><button class="markReady btn btn-sm btn-success col-5" data-id='${
                          response[i].id
                        }'>Complete</button><button class="deleteThis btn btn-sm btn-danger col-6"data-id='${
                      response[i].id
                    }'>Delete</button></div>
                        </section>`
                  );
                }
                //task complete box
                else if (
                  response[i].complete === "completed"
                ) {
                  $("#completeList").append(
                    `<section class="container-fluid"><div class="row smallBorder"><div class="col-5 smallBorder">Task Name: ${response[i].task}</div><div class="completeStartTime col-7 smallBorder">Start Time:</br> ${formattedStartTime}</div></div>
                        <div class="row smallBorder"><div class="completeMarker col-5 smallBorder">Status: ${response[i].complete}</div><div class="endTime col-7 smallBorder">End Time:</br> ${formattedEndTime}</div></div>
                        <div class="row smallBorder"><button class="deleteThis btn btn-danger btn-sm col-5"data-id='${response[i].id}'>Delete</button><div class="col-7 smallBorder">Task Added At:</br> ${formattedTimeNow}</div></section>`
                  );
                }
                                   

                                  }
                                })
} // end getList


//----------------------------------------------
function deleteListItem(event) {
    //targets delete button
    const element = event.target;
    //grabs data tag of button
    let todoId = $(element).data().id;
    //sweet alerts!
    swal({
        title: "Are you sure?",
        text: "Once deleted, you will not be able to recover this task!",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    }).then((willDelete) => {
        //if confirmed, delete
        if (willDelete) {
            $.ajax({
                type: "DELETE",
                url: "/todo/" + todoId,
            }).then(function (response) {
                $(element).parent().parent().remove();
                console.log("item list deleted");
            });
            swal("Poof! Your list item has been deleted!", {
                icon: "success",
            });
        } else {
            swal("Your list item is safe!");
            return;
        }
    });
}
// //-------------------------------------------------------------

function markComplete(event) {
    //targets complete button
    const element = event.target;
    //grabs data value of button
    let todoId = $(element).data().id;
    //changes incomplete to complete
    $.ajax({
        type: "PUT",
        url: "/todo/" + todoId,
    }).then(function (response) {
        console.log("marked as complete");
        //refreshes page to show current changes on DOM
        location.reload();
    });
}


//-----------------------------------------------------------------
//function for timestamp at start button
function startTimer(event) {
    //targets start button
  const element = event.target;
  //grabs data info from start button
  let todoId = $(element).data().id;
  $.ajax({
    type: "PUT",
    url: "/todo/time/" + todoId,
  }).then(function (response) {
    console.log("marked as complete");
    //refreshes page to show current changes on DOM
    location.reload();
  });
}
