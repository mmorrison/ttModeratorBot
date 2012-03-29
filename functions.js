/* Functions */

/* ============== */
/* Log - Log the information to the console */
/* ============== */
global.Log = function(data) {
	if (logtoconsole) {
		console.log(botName, ">>>", data);
	}
};

/* ============== */
/* OnReady Event */
/* ============== */
global.OnReady = function(data) {
	Log("Bot Ready");
	bot.roomRegister(botRoomId);
};

/* ============== */
/* OnRoomChanged Event */
/* ============== */
global.OnRoomChanged = function(data) {
	Log("Room Changed");

	// Register all of the users in the room.
	RegisterUsers(data.users);
	UpdateDjs();

	/* Check if the queue should be enabled. */
	EnableQueue();

	/* Check if the bot needs to step up to the table */
	CheckAutoDj();
};

/* ============== */
/* OnRegistered Event */
/* ============== */
global.OnRegistered = function(data) {
	Log("Registered");
	if (data.user.length === 0) return;
	for (var i = 0; i < data.user.length; ++i) { /* Add to the cached user list */
		allUsers[data.user[i].userid] = BaseUser().extend(data.user[i]);
		++allUsers.length; /* Give new users a welcome message */
		var text = msgWelcome.replace(/\{username\}/gi, data.user[i].name);
		TellUser(data.user[i].userid, text);
	}
};

/* ============== */
/* OnDeregistered Event */
/* ============== */
global.OnDeregistered = function(data) {
	Log("Deregistered");
	Log(data);

	/* Remove the user from the cache */
	if (data.user.length !== 0) {
		for (var i = 0, len = data.user.length; i < len; ++i) {
			allUsers[data.user[i].userid].Remove();
		}
	}

	/* Remove the user from the Queue if they were on it. */
	RemoveFromQueue(data.user[0].userid);
};

/* ============== */
/* OnNewModerator Event */
/* ============== */
global.OnNewModerator = function(data) {};

/* ============== */
/* OnRemModerator Event */
/* ============== */
global.OnRemModerator = function(data) {};

/* ============== */
/* OnAddDJ Event */
/* ============== */
global.OnAddDJ = function(data) {
	Log("Add DJ");

	UpdateDjs();

	/* Check if they are from the queue if there is one */
	NewDjFromQueue(data);
};

/* ============== */
/* OnRemDJ Event */
/* ============== */
global.OnRemDJ = function(data) {
	Log("Remove DJ");

	if (IsBot(data.user[0].userid)) {
		StepDown();
	}

	UpdateDjs();

	/* Notify the next DJ on the list */
	NextDjOnQueue();
};

/* ============== */
/* OnNewSong Event */
/* ============== */
global.OnNewSong = function(data) {
	Log("New Song");

	if (IsBot(data.room.metadata.current_dj)) {
		botIsPlayingSong = true;
		Log("Bot DJing");
	}

	/* Update the play count if active */
	if (djMaxPlays !== 0) {
		allUsers[data.room.metadata.current_dj].Increment_SongCount();
		SpeakPlayCount();
	}

	/* Check if queue status needs updating and update max plays */
	EnableQueue();

	/* If the bot is on the table, vote up the song */
	if (botOnTable) {
		AwesomeSong();
	}
};

/* ============== */
/* OnEndSong Event */
/* ============== */
global.OnEndSong = function(data) {
	Log("End Song");

	if (IsBot(data.room.metadata.current_dj)) {
		botIsPlayingSong = false;
	}

	/* Reset bot details */
	botVoted = false;

	/* Check if the Dj has played their set */
	CheckIfDjShouldBeRemoved(data.room.metadata.current_dj);
};

/* ============== */
/*  */
/* ============== */
global.OnSnagged = function(data) {};

/* ============== */
/*  */
/* ============== */
global.OnUpdateVotes = function(data) { /* If autobop is enabled, determine if the bot should autobop or not based on votes */
	if (useAutoBop) {
		var percentAwesome = 0;
		var percentLame = 0;

		if (data.room.metadata.upvotes !== 0) {
			percentAwesome = (data.room.metadata.upvotes / data.room.metadata.listeners) * 100;
		}
		if (data.room.metadata.downvotes !== 0) {
			percentLame = (data.room.metadata.downvotes / data.room.metadata.listeners) * 100;
		}

		if ((percentAwesome - percentLame) > 25) {
			AwesomeSong();
		}

		if ((percentLame - percentAwesome) > 25) {
			LameSong();
		}
	}
};

/* ============== */
/* OnNoSong Event */
/* ============== */
global.OnNoSong = function(data) {};

/* ============== */
/* OnUpdateUser Event */
/* ============== */
global.OnUpdateUser = function(data) {};

/* ============== */
/* OnBootedUser Event */
/* ============== */
global.OnBootedUser = function(data) {};

/* ============== */
/* OnSpeak Event */
/* ============== */
global.OnSpeak = function(data) {
	Command("speak", data);
};

/* ============== */
/* OnPmmed Event */
/* ============== */
global.OnPmmed = function(data) {
	if (data.senderid != '4f471af5590ca24b6600145b') {
		Command("pm", data);
	}
};

/* ============== */
/* Command - Processes all spoken commands */
/* ============== */
global.Command = function(source, data) {
	var text = "";
	var pm = false;
	var speak = false; /* First break apart the comand */
	var result = data.text.match(/^\!(.*?)( .*)?$/);
	var requestedUser = "";
	var requestedUserName = "";

	if (source == "speak") {
		speak = true;
		requestedUser = data.userid;
		requestedUserName = data.name;
	}
	if (source == "pm") {
		pm = true;
		requestedUser = data.senderid;
		requestedUserName = allUsers[requestedUser].name;
	}

	if (result) {
		var command = result[1].trim().toLowerCase();
		var param = '';

		if (result.length == 3 && result[2]) {
			param = result[2].trim().toLowerCase();
		}

		if (command == "q+") {
			AddToQueue(data);
		} else if (command == "q-") {
			RemoveFromQueue(data.userid);
		} else if (command == "q" || command == "wait") {
			QueueStatus();
		} else if (command == "rules") {
			text = msgRules.replace(/\{username\}/gi, requestedUserName);
			TellUser(requestedUser, text);
		} else if (command == "info") {
			text = msgInfo.replace(/\{username\}/gi, requestedUserName);
			TellUser(requestedUser, text);
		} else if (command == "qrules") {
			text = msgQueueRules.replace(/\{username\}/gi, requestedUserName);
			TellUser(requestedUser, text);
		} else if (command == "help") {
			text = msgHelp.replace(/\{username\}/gi, requestedUserName);
			TellUser(requestedUser, text);
			if (IsMod(requestedUser)) {
				Pause(250);
				text = msgModHelp.replace(/\{username\}/gi, requestedUserName);
				TellUser(requestedUser, text);
			}
		} else if (command == "whois" || command == "about") {
			Speak(msgAbout);
		} else if (command == "count") {
			SpeakPlayCount();
		} else if (command == "issue" || command == "bug" || command == "feature" || command == "idea") {
			TellUser(requestedUser, msgBugs);
		}

		/**** MODERATOR FUNCTIONS ****/
		/*else if (command == "a" || command == "awesome") {
			if (IsMod(data.userid)) {
				AwesomeSong();
			}
		} else if (command == "l" || command == "lame") {
			if (IsMod(data.userid)) {
				LameSong();
			}
		}*/
		else if (command == "realcount") {
			if (IsMod(data.userid)) {
				if (param === "") {
					TellUser(requestedUser, "Usage: !realcount xxxxx");
				} else {
					SetRealCount(param);
				}
			}
		} else if (command == "skip") {
			if (IsMod(requestedUser)) {
				bot.skip();
			}
		} else if (command == "autodj" && pm) {
			if (IsMod(requestedUser)) {
				if (param == "true" || param == "false") {
					useAutoDj = param;
					TellUser(requestedUser, "Auto DJ set to " + useAutoDj);
				} else {
					TellUser(requestedUser, "Usage: !autodj true or false. Currently it is set to " + useAutoDj);
				}
			}
		} else if (command == "autobop" && pm) {
			if (IsMod(requestedUser)) {
				if (param == "true" || param == "false") {
					useAutoBop = param;
					TellUser(requestedUser, "Auto bop set to " + useAutoBop);
				} else {
					TellUser(requestedUser, "Usage: !autobop true or false. Currently it is set to " + useAutoBop);
				}
			}
		} else if (command == "consolelog" && pm) {
			if (IsMod(requestedUser)) {
				if (param == "true" || param == "false") {
					logtoconsole = param;
					TellUser(data.userid, "Auto DJ set to " + logtoconsole);
				} else {
					TellUser(data.userid, "Usage: !consolelog true or false. Currently it is set to " + logtoconsole);
				}
			}
		} else if (command == "setlaptop" && pm) {
			if (IsMod(requestedUser)) {
				if (param === "") {
					TellUser(requestedUser, "Usage: !setlaptop xxxxx");
				} else {
					bot.modifyLaptop(param);
				}
			}
		} else if (command == "setavatar" && pm) {
			if (IsMod(requestedUser)) {
				if (param === "") {
					TellUser(requestedUser, "Usage: !setavatar #");
				} else {
					bot.setAvatar(param);
				}
			}
		} else if (command == "addsong") {
			AddSong(requestedUser);
		}

		/* Catch all */
		else {
			Speak("Unknown Command");
		}
	}

	/* Catch all for the morons that can't read. */
	if (data.text == "q+") {
		Log("Add to Queue");
		AddToQueue(data);
	}
};

/* ============== */
/* RegisterUsers -  */
/* ============== */
global.RegisterUsers = function(pUsers) {
	Log("Registering Users");
	if (!pUsers || !pUsers.length) return;
	for (var i = 0; i < pUsers.length; ++i) {
		var sUser = pUsers[i];
		allUsers[sUser.userid] = BaseUser().extend(sUser);
		++allUsers.length;
	}
	Log("Done registering users");
};

/* ============== */
/* AwesomeSong -  */
/* ============== */
global.AwesomeSong = function(userid) {
	if (!botVoted) {
		bot.vote('up');
		botVoted = true;
	}
}; /* ============== */
/* AwesomeSong -  */
/* ============== */
global.LameSong = function(userid) {
	if (!botVoted) {
		bot.vote('down');
		botVoted = true;
	}
};

/* ============== */
/* EnableQueue - Check to see if the queue should be enabled or if the playcount should be updated */
/* ============== */
/* global.EnableQueue = function() {
	queueActive = useQueue;
};*/

try {
	require("./enableQueue.js");
} catch (e) {
	Log("Missing custom EnableQueue, loading default.");
	require("./enableQueueDefault.js");
}

/* ============== */
/* AddToQueue */
/* ============== */
global.AddToQueue = function(data) {
	var text = "";

	if (queueActive && useQueue) { /* Check if they are a DJ */
		if (djs.indexOf(data.userid) == -1) { /* Check if they are already on the queue*/
			if (djQueue.indexOf(data.userid) == -1) {
				djQueue.push(data.userid);
				text = msgAddedToQueue.replace(/\{username\}/gi, data.name).replace(/\{queuesize\}/gi, djQueue.length);
				TellUser(data.userid, text);
				Log(djQueue);
			}
		} else {
			text = msgQueueOnTable.replace(/\{username\}/gi, data.name);
			TellUser(data.userid, text);
		}
	} else {
		TellUser(data.userid, msgNoQueue);
	}
};

/* ============== */
/* RemoveFromQueue */
/* ============== */
global.RemoveFromQueue = function(userid) {
	if (queueActive && useQueue) {
		if (djQueue.indexOf(userid) != -1) {
			djQueue.splice(djQueue.indexOf(userid), 1);
		}
	}
};

/* ============== */
/* NewDjFromQueue */
/* ============== */
global.NewDjFromQueue = function(data) {
	if (queueActive && useQueue) {
		var text = "";

		if (djQueue.length > 0) {
			if (data.user[0].userid != djQueue[0]) {
				bot.remDj(data.user[0].userid);
				Log(nextDj);
				text = msgWrongQueuedDj.replace(/\{username\}/gi, allUsers[nextDj].name);
				TellUser(data.user[0].userid, text);
			} else {
				RemoveFromQueue(data.user[0].userid);
				clearInterval(refreshIntervalId);
				nextDj = "";
			}
		}
	}
};

/* ============== */
/* NextDjOnQueue */
/* ============== */
global.NextDjOnQueue = function() {
	if (queueActive && useQueue) {
		if (djQueue.length > 0) {
			var text = msgNextQueuedDj.replace(/\{username\}/gi, allUsers[djQueue[0]].name).replace(/\{timeout\}/gi, nextDjQueueTimeout);
			Speak(text);
			nextDj = djQueue[0];
			nextDjTime = new Date();
			refreshIntervalId = setInterval(CheckForNextDjFromQueue, 5000);
		} else {
			Speak(msgEmptyQueue);
		}
	}
};

/* ============== */
/* CheckForNextDjFromQueue */
/* ============== */
global.CheckForNextDjFromQueue = function() {
	if (nextDj !== "" && djQueue[0] == nextDj) {
		var currentTime = new Date();
		if (currentTime.getTime() - nextDjTime.getTime() > (nextDjQueueTimeout * 1000)) {
			RemoveFromQueue(nextDj);
			clearInterval(refreshIntervalId);
			NextDjOnQueue();
		}
	}
};

/* ============== */
/* QueueStatus */
/* ============== */
global.QueueStatus = function() { /**/
	var djList = "";
	for (var i = 0; i < djQueue.length; i++) {
		djList += allUsers[djQueue[i]].name + ", ";
	}
	var text = msgQueueStatus.replace(/\{queuesize\}/gi, djQueue.length).replace(/\{queuedDjs\}/gi, djList);
	Speak(text);
};

/* ============== */
/* CheckIfDjShouldBeRemoved */
/* ============== */
global.CheckIfDjShouldBeRemoved = function(userid) {
	if (allUsers[userid].songCount >= djMaxPlays && djMaxPlays !== 0 && !IsBot(userid)) {
		allUsers[userid].RemoveDJ();
		Speak(msgLastSong.replace(/\{username\}/gi, allUsers[userid].name));
	}
	if (botStepDownAfterSong) {
		allUsers[userid].RemoveDJ();
		botStepDownAfterSong = false;
	}
};

/* ============== */
/*  */
/* ============== */
global.SpeakPlayCount = function() {
	var count = ['x', 'x', 'x', 'x', 'x'];
	for (var i = 0; i < djs.length; i++) {
		count[i] = allUsers[djs[i]].songCount;
	}
	var playCount = count[0] + '-' + count[1] + '-' + count[2] + '-' + count[3] + '-' + count[4];
	Speak(msgPlayCount.replace(/\{playcount\}/gi, playCount));
};

/* ============== */
/* SetRealCount */
/* ============== */
global.SetRealCount = function(param) {
	var array = param.split('-');
	if (array.length != 5) {
		Speak("Invalid syntax");
		return;
	}
	for (var i = 0; i < array.length; i++) {
		if (array[i] != 'x') {
			allUsers[djs[i]].songCount = array[i];
		}
	}
	SpeakPlayCount();
};

/* ============== */
/* CheckAutoDj - The bot will see if it should step up the decks */
/* ============== */
global.CheckAutoDj = function() {
	if (useAutoDj) {
		bot.roomInfo(function(data) {
			if (data.room.metadata.djcount <= (data.room.metadata.max_djs - 2)) {
				if (!botOnTable) {
					StepUp();
				}
			}

			if (data.room.metadata.djcount == data.room.metadata.max_djs) {
				if (botOnTable && !botIsPlayingSong) {
					StepDown();
				} else if (botOnTable && botIsPlayingSong) {
					botStepDownAfterSong = true;
				}
			}
		});
	}
};

/* ============== */
/* StepUp - Bot steps up to the decks */
/* ============== */
global.StepUp = function(text) {
	bot.addDj();
	Speak(msgBotJoinTable);
	botOnTable = true;
};

/* ============== */
/* StepUp - Bot steps up to the decks */
/* ============== */
global.StepDown = function(text) {
	Speak(msgBotLeaveTable);
	bot.remDj();
	botOnTable = false;
};

/* ============== */
/* AddSong - Add song to bot playlist */
/* ============== */
global.AddSong = function(userid) {
	if (IsMod(userid)) {
		Log("Add Song");
		bot.roomInfo(true, function(data) {
			var newSong = data.room.metadata.current_song._id;
			var songName = data.room.metadata.current_song.metadata.song;
			bot.playlistAdd(newSong);
			bot.vote('up');
		});
	} else {
		Log("Not mod on add");
	}
};

/* ============== */
/* Speak - Bot broadcasts to everyone */
/* ============== */
global.Speak = function(text) {
	bot.speak(text);
};

/* ============== */
/* TellUser - Give information to a specific user */
/* ============== */
global.TellUser = function(userid, text) {
	if (!IsBot(userid)) {
		if (!IphoneUser(userid)) {
			bot.pm(text, userid);
		} else {
			bot.speak(text);
		}
	}
};

/* ============== */
/* IphoneUser - Checks to see if the user is on an iPhone (can't PM) */
/* ============== */
global.IphoneUser = function(userid) {
	return allUsers[userid].IsiOS();
};

/* ============== */
/* IsMod - Check to see if the user is a moderator */
/* ============== */
global.IsMod = function(userid) {
	if (moderators.indexOf(userid) != -1) {
		Log("Moderator");
		return true;
	} else {
		Log("Not Moderator");
		return false;
	}
};

/* ============== */
/* UpdateDjs - Check to see if the user is a moderator */
/* ============== */
global.UpdateDjs = function() {
	bot.roomInfo(function(data) { /* Update the list since we are here */
		djs = data.room.metadata.djs;
		moderators = data.room.metadata.moderator_id;
	});
};

/* ============== */
/* IsDj - Check to see if the user is a moderator */
/* ============== */
global.IsDj = function(userid) {
	bot.roomInfo(function(data) { /* Update the list since we are here */
		djs = data.room.metadata.djs;

		for (var dj in data.room.metadata.djs) {
			if (userid == dj) {
				return true;
			}
		}
		return false;
	});
};


/* ============== */
/* IsBot - Check to see if the user is a moderator */
/* ============== */
global.IsBot = function(userid) {
	return userid == botUserId;
};

/* ============== */
/* Pause */
/* ============== */
global.Pause = function(ms) {
	ms += new Date().getTime();
	while (new Date() < ms) {}
};

/* ============== */
/* Pause */
/* ============== */
Object.defineProperty(Object.prototype, "extend", {
	enumerable: false,
	value: function(from) {
		var props = Object.getOwnPropertyNames(from);
		var dest = this;
		props.forEach(function(name) {
			if (name in dest) {
				var destination = Object.getOwnPropertyDescriptor(from, name);
				Object.defineProperty(dest, name, destination);
			}
		});
		return this;
	}
});

/* ============== */
/* BaseUser - The base user object for tracking the users. */
/* ============== */
BaseUser = function() {
	return {
		userid: -1,
		name: "I said what what",
		isBanned: false,
		isMod: false,
		isOwner: false,
		isDJ: false,
		laptop: "pc",
		afkWarned: false,
		afkCount: 0,
		songCount: 0,
		bootAfterSong: false,
		joinedTime: Date.now(),
		Boot: function(pReason) {
			bot.bootUser(this.userid, pReason ? pReason : "");
		},
		IsiOS: function() {
			return this.laptop === "iphone";
		},
		IsBot: function() {
			return this.userid == botUserId;
		},
		RemoveDJ: function() {
			if (this.IsBot()) return;
			bot.remDj(this.userid);
		},
		Increment_SongCount: function() {
			++this.songCount;
			Log(this.name + "'s song count: " + this.songCount);
		},
		Remove: function() {
			var sUserId = this.userid;
			delete allUsers[sUserId];
		},
		Initialize: function() {
			this.songCount = 0;
			this.afkTime = Date.now();
			this.afkWarned = false;
			this.bootAfterSong = false;
			this.isDJ = djs.indexOf(this.userid) != -1;
			this.isMod = IsMod(this.userid);
			this.joinedTime = Date.now();
		}
	};
};
