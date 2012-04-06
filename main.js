/* Main logic */

global.Functions = require("./functions.js");
global.TTAPI = require("ttapi");
global.client = null;

if (useDB) {
	global.mysql = require("mysql");

	try {
		client = mysql.createClient({ user: dbLogin, password: dbPassword});
	} catch (e) {
		useDB = false;
		Log(e);
		Log("DB Turned Off");
	}
}

Log("Initializing");

global.bot = new TTAPI(botAuthId, botUserId);
global.djs = [ ];
global.votedDjs = [ ];
global.moderators = [ ];
global.activeDj = null;

// Fields for queue
global.queueActive = false;
global.djQueue = [ ];
global.nextDj = null;
global.nextDjTime = null;
global.refreshIntervalId = null;

// Fields for the bot
global.botVoted = false;
global.botOnTable = false;
global.botIsPlayingSong = false;
global.botStepDownAfterSong = false;

// Listener cache
global.allUsers = {length: 0};

//Current song info
global.currentsong = {
    artist: null,
    song: null,
    djname: null,
    djid: null,
    up: 0,
    down: 0,
    listeners: 0,
    snags: 0
};

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
