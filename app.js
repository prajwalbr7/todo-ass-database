const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3003, () => {
      console.log("Server Running at http://localhost:3003/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

///TO Return Query Request:
const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};
///GET API STATUS
app.get("/todos/", async (request, response) => {
  let data = null;
  let GetQuery = "";
  const { search_q = "", status, priority } = request.query;

  switch (true) {
    case hasStatusProperty(request.query):
      GetQuery = `SELECT * FROM todo WHERE status LIKE '%${status}%';`;
      break;
    case hasPriorityProperty(request.query):
      GetQuery = `SELECT * FROM todo WHERE priority LIKE '%${priority}%';`;
      break;
    case hasPriorityAndStatusProperties(request.query):
      GetQuery = `SELECT * FROM todo WHERE priority LIKE '%${priority}%' AND
      status LIKE '%${status}%';`;
    default:
      GetQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%';`;
  }
  data = await db.all(GetQuery);
  response.send(data);
});
///GET With Id
app.get("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const GetIdQuery = `SELECT * FROM todo WHERE id=${todoId};`;
  const GetResult = await db.get(GetIdQuery);
  response.send(GetResult);
});
///POST
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const InsertQuery = `INSERT INTO todo(id,todo,priority,status)VALUES(${id},'${todo}',
    '${priority}','${status}');`;
  let result = await db.run(InsertQuery);

  console.log(result);
  response.send(`Todo Successfully Added`);
});
///PUT
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status, priority, todo } = request.body;
  let UpdateQuery = "";
  let data = null;

  switch (true) {
    case hasStatusProperty(request.body):
      UpdateQuery = `UPDATE todo SET status='${status}' WHERE id=${todoId};`;
      data = await db.run(UpdateQuery);
      response.send(`Status Updated`);
      break;
    case hasPriorityProperty(request.body):
      UpdateQuery = `UPDATE todo SET priority='${priority}' WHERE id=${todoId};`;
      data = await db.run(UpdateQuery);
      response.send(`Priority Updated`);
      break;
    default:
      UpdateQuery = `UPDATE todo SET todo='${todo}' WHERE id=${todoId};`;
      data = await db.run(UpdateQuery);
      response.send(`Todo Updated`);
      break;
  }
});
///delete
app.delete("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `DELETE FROM todo WHERE id=${todoId};`;
  await db.run(deleteQuery);
  response.send("Todo Deleted");
});
module.exports = app;
