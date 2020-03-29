const yes = require("yes-https");
const express = require("express");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const index = require("./routes/index");
const boards = require("./routes/boards");
const users = require("./routes/users");
const profiles = require("./routes/profiles");

const bbcom = express();
const debug = require("debug")("burnerboard.com:server");
const http = require("http");

require("@google-cloud/debug-agent").start();
 
// uncomment after placing your favicon in /public
//bbcom.use(favicon(path.join(__dirname, "public", "favicon.ico")));
bbcom.use(logger("dev"));
bbcom.use(bodyParser.json());
bbcom.use(bodyParser.urlencoded({ extended: false }));
bbcom.use(cookieParser());

bbcom.use(yes({
	ignoreFilter: (req) => {
		return ((req.path.endsWith("/DownloadDirectoryJSON") && req.path.startsWith("/boards/")));
	}
}));

bbcom.use(express.static("./client/build"));
bbcom.get("/", function (req, res) {
	res.redirect("/index.html");
});

bbcom.use("/", index);
bbcom.use("/boards", boards);
bbcom.use("/profiles", profiles);
bbcom.use("/users", users);

// catch 404 and forward to error handler
bbcom.use(function (req, res, next) {
	var err = new Error("Not Found");
	err.status = 404;
	next(err);
});

// error handler
bbcom.use(function (err, req, res, next) {
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
server.on("error", onError);
server.on("listening", onListening);

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

function onError(error) {
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
}

function onListening() {
	var addr = server.address();
	var bind = typeof addr === "string"
		? "pipe " + addr
		: "port " + addr.port;
	debug("Listening on " + bind);
}
