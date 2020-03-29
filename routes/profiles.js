
var express = require("express");
var router = express.Router();


router.post("/:profileID", async function (req, res, next) {

	var profileID = req.params.profileID;
	var cloneFromBoardID = null;

	if (req.body.cloneFromBoardID !== "GLOBAL")
		cloneFromBoardID = req.body.cloneFromBoardID;

	var cloneFromProfileID = req.body.cloneFromProfileID;

	const DownloadDirectoryDS = require("./DownloadDirectoryDS");
	const FileSystem = require("./FileSystem");

	var results = [];

	try {
		var profileExists = await DownloadDirectoryDS.profileExists(null, profileID);
		if (!profileExists) {
			results.push(await DownloadDirectoryDS.createProfile(null, profileID, true));

			if (cloneFromBoardID != "NONE" && cloneFromProfileID != "NONE") {
				results.push(await FileSystem.copyProfileFiles(null, profileID, cloneFromBoardID, cloneFromProfileID));
			}
			results.push(await DownloadDirectoryDS.cloneBoardMedia(null, profileID, cloneFromBoardID, cloneFromProfileID, "audio"));
			results.push(await DownloadDirectoryDS.cloneBoardMedia(null, profileID, cloneFromBoardID, cloneFromProfileID, "video"));
		}
		else
			throw new Error("the profile already exists");
		res.status(200).json(results[0]);
	}
	catch (err) {
		res.status(500).json(err.message);
	}
});

router.delete("/:profileID", async function (req, res, next) {

	var profileID = req.params.profileID;

	const DownloadDirectoryDS = require("./DownloadDirectoryDS");
	const FileSystem = require("./FileSystem");

	try {
		var profileExists = await DownloadDirectoryDS.profileExists(null, profileID);
		var i;
		if (profileExists) {
			i = await DownloadDirectoryDS.deleteMedia(null, profileID, "audio", null);
			i = await DownloadDirectoryDS.deleteMedia(null, profileID, "video", null);
			i = await DownloadDirectoryDS.deleteProfile(null, profileID);
			i = await FileSystem.deleteProfile(null, profileID);
		}
		else
			throw new Error("the profile " + profileID + " does not exist");
		res.status(200).json(i);
	}
	catch (err) {
		res.status(500).json(err.message);
	}
});

router.get("/", async function (req, res, next) {

	const DownloadDirectoryDS = require("./DownloadDirectoryDS");
	try {
		var i = await DownloadDirectoryDS.listGlobalProfiles(null);
		res.status(200).json(i);
	}
	catch (err) {
		res.status(500).json(err.message);
	}
});

router.get("/:profileID", async function (req, res, next) {

	var profileID = req.params.profileID;

	const DownloadDirectoryDS = require("./DownloadDirectoryDS");
	try {
		var i = await DownloadDirectoryDS.listGlobalProfiles(profileID);
		res.status(200).json(i);
	}
	catch (err) {
		res.status(500).json(err.message);
	}
});


router.get("/:profileID/DownloadDirectoryJSON", async function (req, res, next) {
	const DownloadDirectoryDS = require("./DownloadDirectoryDS");
	var profileID = req.params.profileID;
	var result = [];
	try {
		result = await DownloadDirectoryDS.DirectoryJSON(null, profileID);
		res.status(200).json(result);
	}
	catch (err) {
		res.status(500).json(err);
	}

});

router.delete("/:profileID/:mediaType/:mediaLocalName", async function (req, res, next) {

	var boardID = null;
	var profileID = req.params.profileID;
	var mediaType = req.params.mediaType;
	var mediaLocalName = req.params.mediaLocalName;

	const FileSystem = require("./FileSystem");
	const DownloadDirectoryDS = require("./DownloadDirectoryDS");

	try {
		var results = [];
		var mediaExists = await (DownloadDirectoryDS.mediaExists(boardID, profileID, mediaType, mediaLocalName));
		if (mediaExists) {
			results = await DownloadDirectoryDS.deleteMedia(boardID, profileID, mediaType, mediaLocalName);
			results = await FileSystem.deleteMedia(boardID, profileID, mediaLocalName);
		}
		else
			throw new Error(mediaType + " named " + mediaLocalName + " does not exist");
		res.status(200).json(results);

	}
	catch (err) {
		res.status(500).json(err.message);
	}
});

router.post("/:profileID/:mediaType/ReorderMedia", async function (req, res, next) {

	const DownloadDirectoryDS = require("./DownloadDirectoryDS");

	var mediaArray = req.body.mediaArray;
	var boardID = null;
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


router.post("/:profileID/AddFileFromGDrive", async function (req, res, next) {

	var oAuthToken = req.body.oauthToken;

	var fileId = req.body.fileId;
	var profileID = req.params.profileID;
	var results = [];

	const FileSystem = require("./FileSystem");

	try {
		results = await FileSystem.addGDriveFile(null, profileID, fileId, oAuthToken);
		res.status(200).json(results);
	}
	catch (err) {
		if (err.message.indexOf("already exists for profile") > -1)
			res.status(409).send(err.message);
		else
			res.status(500).json(err.message);
	}
});

module.exports = router;