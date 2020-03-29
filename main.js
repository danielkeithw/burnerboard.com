const yesHttps = require("yes-https");
const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const bbcom = express();
const debug = require("debug")("burnerboard.com:server");
const http = require("http");
const debugAgent = require("@google-cloud/debug-agent");
debugAgent.start();

const index = require("./routes/index");
const boards = require("./routes/boards");
const users = require("./routes/users");
const profiles = require("./routes/profiles");

bbcom.use(bodyParser.json());
bbcom.use(bodyParser.urlencoded({ extended: false }));
bbcom.use(cookieParser());

bbcom.use(yesHttps({
	ignoreFilter: (req) => {
		return ((req.path.endsWith("/DownloadDirectoryJSON") && req.path.startsWith("/boards/")));
	}
}));

// react compiled app.
bbcom.use(express.static("./client/build"));
bbcom.get("/", function (req, res) {
	res.redirect("/index.html");
});

bbcom.use("/", index);
bbcom.use("/boards", boards);
bbcom.use("/profiles", profiles);
bbcom.use("/users", users);

// catch 404 and forward to error handler
bbcom.use((req, res, next) => {
	var err = new Error("Not Found");
	err.status = 404;
	next(err);
});

// error handler
bbcom.use((err, req, res, next) => {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.bbcom.get("env") === "development" ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.send("error");
});

var port = normalizePort(process.env.PORT || "3001");
bbcom.set("port", port);

var server = http.createServer(bbcom);

server.listen(port);
server.on("error", (error) => {
	if (error.syscall !== "listen") {
		throw error;
	}

	var bind = typeof port === "string"
		? "Pipe " + port
		: "Port " + port;

	// handle specific listen errors with friendly messages
	switch (error.code) {
	case "EACCES":
		console.error(bind + " requires elevated privileges");
		process.exit(1);
		break;
	case "EADDRINUSE":
		console.error(bind + " is already in use");
		process.exit(1);
		break;
	default:
		throw error;
	}
});

server.on("listening", () => {
	var addr = server.address();
	var bind = typeof addr === "string"
		? "pipe " + addr
		: "port " + addr.port;
	debug("Listening on " + bind);
});

function normalizePort(val) {
	var port = parseInt(val, 10);

	if (isNaN(port)) {
		// named pipe
		return val;
	}

	if (port >= 0) {
		// port number
		return port;
	}

	return false;
}




