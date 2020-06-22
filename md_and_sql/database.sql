CREATE TABLE todo (
	"id" serial PRIMARY KEY,
    "task" varchar(255) NOT NULL,
    "time_now" TIMESTAMP,
    "start_time" TIMESTAMP,
    "end_time" TIMESTAMP,
    "due_date" TIMESTAMP,
    "priority_marker" varchar(10),
    "complete" varchar(30) NOT NULL
);

INSERT INTO todo (task, priority_marker, time_now, start_time, due_date, complete)
VALUES ('make the app','low','5:00','7:00','6:00','not complete')