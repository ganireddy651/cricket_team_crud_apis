const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      driver: sqlite3.Database,
      filename: dbPath,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/player/", async (request, response) => {
  const getPlayersQuery = `SELECT * FROM cricket_team;`;
  const dbResponse = await db.all(getPlayersQuery);

  const upDatedData = dbResponse.map((each) => ({
    playerId: each.player_id,
    playerName: each.player_name,
    jerseyNumber: each.jersey_number,
    role: each.role,
  }));

  response.send(upDatedData);
});

app.post("/player/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const createPlayerQuery = `INSERT INTO cricket_team (player_name,jersey_number,role) VALUES("${playerName}",${jerseyNumber},"${role}");`;
  const dbResponse = await db.run(createPlayerQuery);
  const lastId = dbResponse.lastID;
  response.send("Player Added to Team");
});

app.get("/player/:id", async (request, response) => {
  const { id } = request.params;
  const getPlayerQuery = `SELECT * FROM cricket_team where player_id = ${id}`;
  const dbResponse = await db.get(getPlayerQuery);
  response.send({
    playerId: dbResponse.player_id,
    playerName: dbResponse.player_name,
    jerseyNumber: dbResponse.jersey_number,
    role: dbResponse.role,
  });
});

app.put("/player/:id", async (request, response) => {
  const { id } = request.params;
  const { playerName, jerseyNumber, role } = request.body;
  const updatePlayerQuery = `UPDATE cricket_team 
  SET player_name = "${playerName}", 
  jersey_number = ${jerseyNumber}, 
  role = "${role}"
  WHERE player_id = ${id}`;
  const dbResponse = await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

app.delete("/player/:id", async (request, response) => {
  const { id } = request.params;
  const deletePlayerQuery = `DELETE FROM cricket_team where player_id = ${id}`;
  const dbResponse = await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
