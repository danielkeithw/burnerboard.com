var express = require("express");
var router = express.Router();
var UserStore = require("./UserStore");

router.use(async function (req, res, next) {
 
	var JWT = req.headers["authorization"].replace("Bearer ", "");

	if (JWT) {
		try {
			var i = await UserStore.verifyJWT(JWT);
			next();
		}
		catch (err) {
			res.status(403).send(err.message.substr(0, 30) + "... Please Try Again.");
		}
	}
	else res.status(403).json({
		success: false,
		message: "No token provided."
	});

});

router.get("/", function (req, res, next) {
	res.status(400).send("Not Found");
});

router.get("/currentStatuses", async function (req, res, next) {

	try {
		var i = 1;

		const BatteryQueries = require("./BatteryQueries");
		var results = [];

		results = await BatteryQueries.queryBatteryData();
		res.status(200).json(results);
	}
	catch (err) {
		res.status(500).json(err);
	}
});


router.get("/allProfiles/", async function (req, res, next) {

	const DownloadDirectoryDS = require("./DownloadDirectoryDS");
	try {
		var i = await DownloadDirectoryDS.listProfiles(null, null);
		res.status(200).json(i);
	}
	catch (err) {
		res.status(500).json(err.message);
	}
});

module.exports = router;
