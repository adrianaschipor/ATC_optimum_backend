const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const database = require("./config/database.config");

const HOST = "127.0.0.1";
const PORT = 8080;

// App
const app = express();

var corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};

app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

app.get("/", (req, res) => {
  res.send("Hello Optimum User!\n");
});

database
  .authenticate()
  .then(() => console.log("Successfully connected to database"))
  .catch((err) => console.log("ErrorL:" + err));

user_model = require("./models/user.model");
building_model = require("./models/building.model");
office_model = require("./models/office.model");
desk_model = require("./models/desk.model");
remote_model = require("./models/remoteReq.model");
attachment_model = require("./models/attachment.model");
deskReq_model = require("./models/deskReq.model");

require("./routes/auth.routes")(app);
require("./routes/user.routes")(app);
require("./routes/building.routes")(app);
require("./routes/office.routes")(app);
require("./routes/desk.routes")(app);
require("./routes/remoteReq.routes")(app);

var port = process.env.PORT || PORT;
const server = app.listen(port);
console.log(`Running on http://${HOST}:${PORT}`);
