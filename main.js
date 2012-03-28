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

global.bot = new TTAPI(botAuthId, botUserId);
global.djs = [ ];

// Fields for queue
global.queueActive = false;
global.djQueue = [ ];
global.nextDj = null;
global.nextDjTime = null;
global.refreshInvalidId = null;

// Fields for the bot
global.botVoted = false;
global.botOnTable = false;
global.botIsPlayingSong = false;
global.botStepDownAfterSong = false;

// Listener cache
global.allUsers = {length: 0};

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
bot.on("endsong", OnEndSong);
bot.on("snagged", OnSnagged);
bot.on("update_votes", OnUpdateVotes);
bot.on("nosong", OnNoSong);
bot.on("update_user", OnUpdateUser);
bot.on("booted_user", OnBootedUser);
bot.on("ready", OnReady);
Log("Done");

Log("Ready");