
const express = require("express");
const router = express.Router();
const DownloadDirectoryDS = require("./DownloadDirectoryDS");
const BatteryQueries = require("./BatteryQueries");
const FileSystem = require("./FileSystem");

router.get("/", async (req, res, next) => {

	try {
		var i = await DownloadDirectoryDS.listBoards(null);
		res.status(200).json(i);
	}
	catch (err) {
		res.status(500).json(err.message);
	}
});

router.get("/locations/", async (req, res, next) => {

	try {
		var i = await BatteryQueries.queryBoardLocations();
		res.status(200).json(i);
	}
	catch (err) {
		res.status(500).json(err.message);
	}
});

router.get("/:boardID", async (req, res, next) => {

	var boardID = req.params.boardID;
 
	try {
		var i = await DownloadDirectoryDS.listBoards(boardID);
		res.status(200).json(i);
	}
	catch (err) {
		res.status(500).json(err.message);
	}
});

router.post("/:boardID/profiles/:profileID", async (req, res, next) => {

	var boardID = req.params.boardID;
	var profileID = req.params.profileID;
	var cloneFromBoardID = null;

	if (req.body.cloneFromBoardID !== "GLOBAL")
		cloneFromBoardID = req.body.cloneFromBoardID;

	var cloneFromProfileID = req.body.cloneFromProfileID;

	var results = [];

	try {
		var profileExists = await DownloadDirectoryDS.profileExists(boardID, profileID);
		if (!profileExists) {
			results.push(await DownloadDirectoryDS.createProfile(boardID, profileID, false));

			if (cloneFromBoardID != "NONE" && cloneFromProfileID != "NONE") {
				results.push(await FileSystem.copyProfileFiles(boardID, profileID, cloneFromBoardID, cloneFromProfileID));
			}
			results.push(await DownloadDirectoryDS.cloneBoardMedia(boardID, profileID, cloneFromBoardID, cloneFromProfileID, "audio"));
			results.push(await DownloadDirectoryDS.cloneBoardMedia(boardID, profileID, cloneFromBoardID, cloneFromProfileID, "video"));
		}
		else
			throw new Error("the profile already exists");
		res.status(200).json(results[0]);
	}
	catch (err) {
		res.status(500).json(err.message);
	}

});


router.delete("/:boardID/profiles/:profileID", async (req, res, next) => {

	var boardID = req.params.boardID;
	var profileID = req.params.profileID;

	try {
		var profileExists = await DownloadDirectoryDS.profileExists(boardID, profileID);
		var i;
		if (profileExists) {
			i = await DownloadDirectoryDS.deleteMedia(boardID, profileID, "audio", null);
			i = await DownloadDirectoryDS.deleteMedia(boardID, profileID, "video", null);
			i = await DownloadDirectoryDS.deleteProfile(boardID, profileID);
			i = await FileSystem.deleteProfile(boardID, profileID);
		}
		else
			throw new Error("the profile " + profileID + " does not exist");
		res.status(200).json(i);
	}
	catch (err) {
		res.status(500).json(err.message);
	}
});


router.get("/:boardID/profiles", async (req, res, next) => {

	var boardID = req.params.boardID;
 
	try {
		var i = await DownloadDirectoryDS.listProfiles(boardID, null);
		res.status(200).json(i);
	}
	catch (err) {
		res.status(500).json(err.message);
	}
});

router.get("/:boardID/profiles/:profileID", async (req, res, next) => {

	var boardID = req.params.boardID;
	var profileID = req.params.profileID;
 
	try {
		var i = await DownloadDirectoryDS.listProfiles(boardID, profileID);
		res.status(200).json(i);
	}
	catch (err) {
		res.status(500).json(err.message);
	}
});


router.get("/:boardID/batteryHistory", async (req, res, next) => {
 
	var results = [];

	try {
		results = await BatteryQueries.queryBatteryHistory(req.params.boardID);
		res.status(200).json(results);
	}
	catch (err) {
		res.status(500).json(err);
	}
});

router.get("/:boardID/profiles/:profileID/listFiles", async (req, res, next) => {

	var boardID = req.params.boardID;
	var profileID = req.params.profileID;
	var results = [];

	try {
		results.push(await FileSystem.listProfileFiles(boardID, profileID));
		res.status(200).json(results);
	}
	catch (err) {
		res.status(500).json(err);
	}

});

router.post("/:boardID/activeProfile/:profileID/isGlobal/:isGlobal", async (req, res, next) => {

	var boardID = req.params.boardID;
	var profileID = req.params.profileID;
	var isGlobal = req.params.isGlobal == "true";


	try {
		var boardExists = await DownloadDirectoryDS.boardExists(boardID);
		if (boardExists) {
			var result = await DownloadDirectoryDS.activateBoardProfile(boardID, profileID, isGlobal);
			res.status(200).json(result);
		}
		else {
			throw new Error("Board named " + boardID + " does not exist");
		}
	}
	catch (err) {
		res.status(500).json(err);
	}

});


router.post("/:boardID/deactivateProfile/:profileID/isGlobal/:isGlobal", async (req, res, next) => {

	var boardID = req.params.boardID;
	var profileID = req.params.profileID;
	var isGlobal = req.params.isGlobal == "true";

	try {
		var boardExists = await DownloadDirectoryDS.boardExists(boardID);
		if (boardExists) {
			var result = await DownloadDirectoryDS.deactivateBoardProfile(boardID, profileID, isGlobal);
			res.status(200).json(result);
		}
		else {
			throw new Error("Board named " + boardID + " does not exist");
		}
	}
	catch (err) {
		res.status(500).json(err);
	}

});
router.get("/:boardID/DownloadDirectoryJSON", async (req, res, next) => {

	var boardID = req.params.boardID;
	var result = [];
	try {
		var boardExists = await DownloadDirectoryDS.boardExists(boardID);
		if (boardExists) {
			// get the default profile
			var profileID = await DownloadDirectoryDS.listBoards(boardID);

			// is the deault profile global? if so, null it out!
			if (profileID[0].isProfileGlobal)
				boardID = null;

			result = await DownloadDirectoryDS.DirectoryJSON(boardID, profileID[0].profile);
			res.status(200).json(result);
		}
		else {
			throw new Error("Board named " + boardID + " does not exist");
		}
	}
	catch (err) {
		res.status(500).json(err);
	}

});

router.get("/:boardID/profiles/:profileID/DownloadDirectoryJSON", async (req, res, next) => {

	var boardID = req.params.boardID;
	var profileID = req.params.profileID;
	var result = [];
	try {
		var boardExists = await DownloadDirectoryDS.boardExists(boardID);
		if (boardExists) {
			result = await DownloadDirectoryDS.DirectoryJSON(boardID, profileID);
			res.status(200).json(result);
		}
		else {
			throw new Error("Board named " + boardID + " does not exist");
		}
	}
	catch (err) {
		res.status(500).json(err);
	}

});


router.delete("/:boardID/profiles/:profileID/:mediaType/:mediaLocalName", async (req, res, next) => {

	var boardID = req.params.boardID;
	var profileID = req.params.profileID;
	var mediaType = req.params.mediaType;
	var mediaLocalName = req.params.mediaLocalName;

	try {
		var results = [];
		var boardExists = await DownloadDirectoryDS.boardExists(boardID);
		if (boardExists) {
			var mediaExists = await (DownloadDirectoryDS.mediaExists(boardID, profileID, mediaType, mediaLocalName));
			if (mediaExists) {
				results = await DownloadDirectoryDS.deleteMedia(boardID, profileID, mediaType, mediaLocalName);
				results = await FileSystem.deleteMedia(boardID, profileID, mediaLocalName);
			}
			else
				throw new Error(mediaType + " named " + mediaLocalName + " does not exist");
			res.status(200).json(results);
		}
		else
			throw new Error("Board named " + boardID + " does not exist");
	}
	catch (err) {
		res.status(500).json(err.message);
	}
});

router.delete("/:boardID", async (req, res, next) => {

	var boardID = req.params.boardID;

	try {
		var results = [];
		var boardExists = await DownloadDirectoryDS.boardExists(boardID);
		if (boardExists) {
			results.push(await DownloadDirectoryDS.deleteAllBoardMedia(boardID, "audio"));
			results.push(await DownloadDirectoryDS.deleteAllBoardMedia(boardID, "video"));
			results.push(await DownloadDirectoryDS.deleteProfile(boardID, null));
			results.push(await DownloadDirectoryDS.deleteBoard(boardID));
			results.push(await FileSystem.deleteBoard(boardID));
			res.status(200).json(results);
		}
		else
			throw new Error("Board named " + boardID + " does not exist");
	}
	catch (err) {
		res.status(500).json(err.message);
	}
});

router.get("/", async (req, res, next) => {

	const DownloadDirectoryDS = require("./DownloadDirectoryDS");
	var results = [];
	try {
		results.push(await DownloadDirectoryDS.listBoards());
		res.status(200).json(results);
	}
	catch (err) {
		res.status(500).json(err.message);
	} 
});

router.get("/AddBoard/:boardID", async (req, res, next) => {

	var newBoardID = req.params.boardID;

	try {
		var results = [];
		var boardExists = await DownloadDirectoryDS.boardExists(newBoardID);
		if (!boardExists) {
			results.push(await DownloadDirectoryDS.createNewBoard(newBoardID));
			results.push(await DownloadDirectoryDS.createNewBoardMedia(newBoardID, "video"));
			results.push(await DownloadDirectoryDS.createNewBoardMedia(newBoardID, "audio"));
			results.push(await DownloadDirectoryDS.createProfile(newBoardID, "default", false));
			results.push(await FileSystem.createRootBoardFolder(newBoardID));
			res.status(200).json(results);
		}
		else
			throw new Error("Board named " + newBoardID + " already exists");
	}
	catch (err) {
		res.status(500).json(err.message);
	}
});


router.post("/:boardID/profiles/:profileID/:mediaType/ReorderMedia", async (req, res, next) => {

	var mediaArray = req.body.mediaArray;
	var boardID = req.params.boardID;
	var profileID = req.params.profileID;
	var mediaType = req.params.mediaType;
	var results = [];

	try {
		results = await DownloadDirectoryDS.reorderMedia(boardID, profileID, mediaType, mediaArray);
		res.status(200).json(results);
	}
	catch (err) {
		res.status(500).json(err);
	}

});


router.post("/:boardID/profiles/:profileID/AddFileFromGDrive", async (req, res, next) => {

	var oAuthToken = req.body.oauthToken;

	var fileId = req.body.fileId;
	var currentBoard = req.params.boardID;
	var profileID = req.params.profileID;
	var results = [];

	try {
		results = await FileSystem.addGDriveFile(currentBoard, profileID, fileId, oAuthToken);
		res.status(200).json(results);
	}
	catch (err) {
		if (err.message.indexOf("already exists for board") > -1)
			res.status(409).send(err.message);
		else
			res.status(500).json(err.message);
	}
});

module.exports = router;