/* Main logic */

global.Functions = require("./functions.js");
global.TTAPI = require("ttapi");

if (useDB) {
	global.Db = require("mysql");

	try {
		client = mysql.createClient(dbLogin, dbPassword);
	} catch (e) {
		useDb = false;
	}
}

Log("Initializing");

global.bot = new TTAPI(global.botAuthId, botUserId, botRoomId);
global.djs = [ ];
global.djSongCount = { };
global.djMaxPlays = 0;

// Fields for queue
global.queueActive = false;
global.activeDj = null;
global.startTime = null;
global.djQueue = [ ];
global.djPlayCount = { };
global.nextDj = null;
global.nextDjTime = null;
global.refreshInvalidId = null;

global.botVoted = false;
global.botOnTable = false;

global.iPhoneUserList = [ ];

Log("Done");

Log("Hooking events");
bot.on("roomChanged", OnRoomChanged);
bot.on("registered", OnRegistered);
bot.on("deregistered", OnDeregistered);
bot.on("new_moderator", OnNewModerator);
bot.on("rem_moderator", OnRemModerator);
bot.on("add_dj", OnAddDJ);
bot.on("rem_dj", OnRemDJ);
bot.on("speak", OnSpeak);
bot.on("pmmed", OnPmmed);
bot.on("newsong", OnNewSong);
bot.on("nendsong", OnEndSong);
bot.on("snagged", OnSnagged);
bot.on("update_votes", OnUpdateVotes);
bot.on("nosong", OnNoSong);
bot.on("update_user", OnUpdateUser);
bot.on("booted_user", OnBootedUser);
Log("Done");

Log("Ready");