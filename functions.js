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

	/* Remove the user from the cache */
	for (var i = 0, len = data.user.length; i < len; ++i) {
		allUsers[data.user[i].userid].Remove();
	}

	/* Remove the user from the Queue if they were on it. */
	RemoveFromQueue(data.user[0].name);
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

	UpdateDjs();

	/* Notify the next DJ on the list */
	NextDjOnQueue();
};

/* ============== */
/* OnNewSong Event */
/* ============== */
global.OnNewSong = function(data) {
	Log("New Song");

	/* Check if queue status needs updating and update max plays */
	EnableQueue();

	/* Update the play count if active */
	if (djMaxPlays !== 0) {
		allUsers[data.room.metadata.current_dj].Increment_SongCount();
		SpeakPlayCount();
	}

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
	Command("pm", data);
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
			RemoveFromQueue(requestedUserName);
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
			if (IsModerator(requestedUser)) {
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
			if (IsModerator(data.userid)) {
				AwesomeSong();
			}
		} else if (command == "l" || command == "lame") {
			if (IsModerator(data.userid)) {
				LameSong();
			}
		}*/
		else if (command == "realcount") {
			//if (IsModerator(data.userid)) {
				if (param === "") {
					TellUser(requestedUser, "Usage: !realcount xxxxx");
				} else {
					SetRealCount(param);
				}
			//}
		} else if (command == "skip") {
			if (IsModerator(requestedUser)) {
				bot.skip();
			}
		} else if (command == "autodj" && pm) {
			if (IsModerator(requestedUser)) {
				if (param == "true" || param == "false") {
					useAutoDj = param;
					TellUser(requestedUser, "Auto DJ set to " + useAutoDj);
				} else {
					TellUser(requestedUser, "Usage: !autodj true or false. Currently it is set to " + useAutoDj);
				}
			}
		} else if (command == "autobop" && pm) {
			if (IsModerator(requestedUser)) {
				if (param == "true" || param == "false") {
					useAutoBop = param;
					TellUser(requestedUser, "Auto bop set to " + useAutoBop);
				} else {
					TellUser(requestedUser, "Usage: !autobop true or false. Currently it is set to " + useAutoBop);
				}
			}
		} else if (command == "consolelog" && pm) {
			if (IsModerator(requestedUser)) {
				if (param == "true" || param == "false") {
					logtoconsole = param;
					TellUser(data.userid, "Auto DJ set to " + logtoconsole);
				} else {
					TellUser(data.userid, "Usage: !consolelog true or false. Currently it is set to " + logtoconsole);
				}
			}
		} else if (command == "setlaptop" && pm) {
			if (IsModerator(requestedUser)) {
				if (param === "") {
					TellUser(requestedUser, "Usage: !setlaptop xxxxx");
				} else {
					bot.modifyLaptop(param);
				}
			}
		} else if (command == "setavatar" && pm) {
			if (IsModerator(requestedUser)) {
				if (param === "") {
					TellUser(requestedUser, "Usage: !setavatar #");
				} else {
					bot.setAvatar(param);
				}
			}
		} else if (command == "addsong") {
			TellUser(requestedUser, "Not yet implemented");
		}

		/* Catch all */
		else {
			Speak("Unknown Command");
		}
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
};
/* ============== */
/* AwesomeSong -  */
/* ============== */
global.c = function(userid) {
	if (!botVoted) {
		bot.vote('down');
		botVoted = true;
	}
};

/* ============== */
/* EnableQueue - Check to see if the queue should be enabled or if the playcount should be updated */
/* ============== */
global.EnableQueue = function() {
	bot.roomInfo(function(data) {
		var listenerCount = data.room.metadata.listeners;

		if (listenerCount <= level1Threshold) {
			if (queueActive) {
				queueActive = false;
				Speak(msgQueueDisabled);
				Log("Queue off");
				djMaxPlays = level1DjMaxPlays;
			}
		} else if (listenerCount <= level2Threshold && listenerCount > level1Threshold) {
			if (!queueActive) {
				queueActive = false;
				Speak(msgQueueEnabled);
				Log("Queue activated");
				djMaxPlays = level2DjMaxPlays;
			} else {
				djMaxPlays = level2DjMaxPlays;
			}
		} else if (listenerCount <= level3Threshold && listenerCount > level2Threshold) {
			if (!queueActive) {
				queueActive = false;
				Speak(msgQueueEnabled);
				Log("Queue activated");
				djMaxPlays = level3DjMaxPlays;
			} else {
				djMaxPlays = level3DjMaxPlays;
			}
		}
	});
};

/* ============== */
/* AddToQueue */
/* ============== */
global.AddToQueue = function(data) {
	var text = "";

	if (queueActive) { /* Check if they are a DJ */
		if (djs.indexOf(data.userid) == -1) { /* Check if they are already on the queue*/
			if (djQueue.indexOf(data.name) == -1) {
				djQueue.push(data.name);

				text = msgAddedToQueue.replace(/\{username\}/gi, data.name);
				TellUser(data.userid, text);
				Log(djQueue);
			}
		} else {
			text = msgOnQueue.replace(/\{username\}/gi, data.name);
			TellUser(data.userid, text);
		}
	} else {
		TellUser(data.userid, msgNoQueue);
	}
};

/* ============== */
/* RemoveFromQueue */
/* ============== */
global.RemoveFromQueue = function(name) {
	if (queueActive) {
		if (djQueue.indexOf(name) != -1) {
			djQueue.splice(djQueue.indexOf(name), 1);
		}
	}
};

/* ============== */
/* NewDjFromQueue */
/* ============== */
global.NewDjFromQueue = function(data) {
	if (queueActive) {
		var text = "";

		if (djQueue.length > 0) {
			if (data.user[0].name != djQueue[0]) {
				bot.remDj(data.user[0].userid);
				text = msgWrongQueuedDj.replace(/\{username\}/gi, nextDj);
				TellUser(data.user[0].userid, text);
			} else {
				RemoveFromQueue(data.user[0].name);
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
	if (queueActive) {
		if (djQueue.length > 0) {
			var text = msgNextQueuedDj.replace(/\{username\}/gi, djQueue[0]).replace(/\{timeout\}/gi, nextDjQueueTimeout);
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
	if (nextDj !== "" && queuedDjs[0] == nextDj) {
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
	var text = msgQueueStatus.replace(/\{queuesize\}/gi, queuedDjs.length).replace(/\{queuedDjs\}/gi, queuedDjs);
	Speak(text);
};

/* ============== */
/* CheckIfDjShouldBeRemoved */
/* ============== */
global.CheckIfDjShouldBeRemoved = function(userid) {
	if (allUsers[userid].songCount >= djMaxPlays && djMaxPlays !== 0) {
		allUsers[userid].RemoveDJ();
		Speak(msgLastSong.replace(/\{username\}/gi, allUsers[userid].name));
		//TellUser(userid, "You can");
	}
};

/* ============== */
/*  */
/* ============== */
global.SpeakPlayCount = function() {
	var playCount = "";
	for (var i = 0; i < djs.length; i++) {
		playCount += allUsers[djs[i]].songCount;
	}
	Speak(msgPlayCount.replace(/\{playcount\}/gi, playCount));
};

/* ============== */
/* SetRealCount */
/* ============== */
global.SetRealCount = function(param) {
	for (var i = 0; i < param.length; i++) {
		var count = param.substring(i, i + 1);
		allUsers[djs[i]].songCount = count;
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
				if (botOnTable) {
					StepDown();
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
/* Speak - Bot broadcasts to everyone */
/* ============== */
global.Speak = function(text) {
	bot.speak(text);
};

/* ============== */
/* TellUser - Give information to a specific user */
/* ============== */
global.TellUser = function(userid, text) {
	if (!IphoneUser(userid) && !allUsers[userid].IsBot()) {
		bot.pm(text, userid);
	} else {
		bot.speak(text);
	}
};

/* ============== */
/* IphoneUser - Checks to see if the user is on an iPhone (can't PM) */
/* ============== */
global.IphoneUser = function(userid) {
	return allUsers[userid].IsiOS();
};

/* ============== */
/* IsModerator - Check to see if the user is a moderator */
/* ============== */
global.IsModerator = function(userid) {
	bot.roomInfo(function(data) {
		for (var mod in data.room.metadata.moderator_id) {
			if (userid == mod) {
				return true;
			}
		}
		return false;
	});
};

/* ============== */
/* UpdateDjs - Check to see if the user is a moderator */
/* ============== */
global.UpdateDjs = function() {
	bot.roomInfo(function(data) { /* Update the list since we are here */
		djs = data.room.metadata.djs;
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
		afkTime: Date.now(),
		songCount: 0,
		totalSongCount: 0,
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
			if (!IsModerator || !this.isDJ || this.IsBot()) return;
			bot.remDj(this.userid);
		},
		Increment_SongCount: function() {
			++this.songCount;
			++this.totalSongCount;
			Log(this.name + "'s song count: " + this.songCount + " total of: " + this.totalSongCount);
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
			this.isMod = IsModerator(this.userid);
			this.joinedTime = Date.now();
		}
	};
};
