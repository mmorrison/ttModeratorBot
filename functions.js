/* Functions */

/* ============== */
/* Log - Log the information to the console */
/* ============== */
global.Log = function(data){
	if (logtoconsole){
		console.log(botName, ">>>", data);
	}
};

/* ============== */
/* OnRoomChanged Event */
/* ============== */
global.OnRoomChanged = function(data){
	Log("Room Changed");

	/* Load up the initial list of DJs. */
	djs = data.room.metadata.djs;

	/* Set the initial play count to 0. */
	Log("Setting play count.");
	for (var i = 0; i < djs.length; i++){
		djPlayCount[djs[i]] = 0;
	}

	/* Check if the queue should be enabled. */
	EnableQueue();

	/* Check if the bot needs to step up to the table */
	CheckAutoDj();
};

/* ============== */
/* OnRegistered Event */
/* ============== */
global.OnRegistered = function(data){
	Log("Registered");

	/* Add to iPhone if iPhone User */
	if (data.user[0].laptop == "iphone"){ iPhoneUserList.push(data.user[0].userid); }

	/* Give new users a welcome message */
	var text = msgWelcome.replace(/\{username\}/gi,data.user[0].name);
	TellUser(text,data.user[0].userid);
};

/* ============== */
/* OnDeregistered Event */
/* ============== */
global.OnDeregistered = function(data){
	Log("Deregistered");

	/* Remove the user from the iPhone list if iPhone User */
	if (data.user[0].laptop == "iphone"){ delete iPhoneUserList[data.user[0].userid]; }

	/* Remove the user from the Queue if they were on it. */
	RemoveFromQueue(data.user[0].name);
};

/* ============== */
/* OnNewModerator Event */
/* ============== */
global.OnNewModerator = function(data){ };

/* ============== */
/* OnRemModerator Event */
/* ============== */
global.OnRemModerator = function(data){ };

/* ============== */
/* OnAddDJ Event */
/* ============== */
global.OnAddDJ = function(data){
	Log("Add DJ;");

	/* Add a play count for the DJ */
	djSongCount[data.user[0].userid] = 0;

	/* Check if they are from the queue if there is one */
	NewDjFromQueue(data);

	/* Update the DJ list */
	UpdateDjs();
};

/* ============== */
/* OnRemDJ Event */
/* ============== */
global.OnRemDJ = function(data){
	Log("Remove DJ");

	/* Remove thier DJ count*/
	delete djPlayCount[data.user[0].userid];

	/* Update the DJ list */
	UpdateDjs();

	/* Notify the next DJ on the list */
	NextDjOnQueue();
};

/* ============== */
/* OnNewSong Event */
/* ============== */
global.OnNewSong = function(data){
	Log("New Song");

	/* Check if queue status needs updating and update max plays */
	EnableQueue();

	/* Update the play count if active */
	if (djMaxPlays !== 0) {
		djPlayCount[data.room.metadata.current_dj]++;
		SpeakPlayCount();
	}

	/* If the bot is on the table, vote up the song */
	if (botOnTable){
		bot.vote('up');
		botVoted = true;
	}
};

/* ============== */
/* OnEndSong Event */
/* ============== */
global.OnEndSong = function(data){
	Log("End Song");

	/* Reset bot details */
	botVoted = false;

	/* Check if the Dj has played their set */
	CheckIfDjShouldBeRemoved(data.room.metadata.current_dj);
};

/* ============== */
/*  */
/* ============== */
global.OnSnagged = function(data){ };

/* ============== */
/*  */
/* ============== */
global.OnUpdateVotes = function(data){
	/* If autobop is enabled, determine if the bot should autobop or not based on votes */
	if (useAutoBop) {
		var percentAwesome = 0;
		var percentLame = 0;

		if (data.room.metadata.upvotes !== 0){ percentAwesome = (data.room.metadata.upvotes / data.room.metadata.listeners) * 100; }
		if (data.room.metadata.downvotes !== 0){ percentLame = (data.room.metadata.downvotes / data.room.metadata.listeners) * 100; }

		if ((percentAwesome - percentLame) > 25) {
			if (!botVoted) {
				bot.vote('up');
				botVoted = true;
			}
		}

		if ((percentLame - percentAwesome) > 25) {
			if (!botVoted) {
				bot.vote('down');
				botVoted = true;
			}
		}
	}
};

/* ============== */
/* OnNoSong Event */
/* ============== */
global.OnNoSong = function(data) { };

/* ============== */
/* OnUpdateUser Event */
/* ============== */
global.OnUpdateUser = function(data) { };

/* ============== */
/* OnBootedUser Event */
/* ============== */
global.OnBootedUser = function(data) { };

/* ============== */
/* OnSpeak Event */
/* ============== */
global.OnSpeak = function(data){
	Command("speak", data);
};

/* ============== */
/* OnPmmed Event */
/* ============== */
global.OnPmmed = function(data){
	Command("pm", data);
};

/* ============== */
/* Command - Processes all spoken commands */
/* ============== */
global.Command = function(source, data){
	var text = "";
	var pm = false;
	var speak = false;
	/* First break apart the comand */
	var result = data.text.match(/^\!(.*?)( .*)?$/);

	if (source == "speak") { speak = true; }
	if (source  == "pm") { pm = true; }

	if (result) {
		var command = result[1].trim().toLowerCase();
		var param = '';

		if (result.length == 3 && result[2]) {
			param = result[2].trim().toLowerCase();
		}

		if (command == "q+"){ AddToQueue(data); }
		else if (command == "q-") { RemoveFromQueue(data.name); }
		else if (command == "q" || command == "wait") { QueueStatus(); }
		else if (command == "a" || command == "awesome") { AwesomeSong(data.userid); }
		else if (command == "l" || command == "lame") { LameSong(data.userid); }
		else if (command == "rules") {
			text = msgRules.replace(/\{username\}/gi,data.name);
			TellUser(text);
		}
		else if (command == "info") {
			text = msgInfo.replace(/\{username\}/gi,data.name);
			TellUser(text);
		}
		else if (command == "qrules") {
			text = msgQueueRules.replace(/\{username\}/gi,data.name);
			TellUser(text);
		}
		else if (command == "help") {
			text = msgHelp.replace(/\{username\}/gi,data.name);
			TellUser(text);
			if (IsModerator(data.userid)) {
				Pause(250);
				text = msgModHelp.replace(/\{username\}/gi,data.name);
				TellUser(text);
			}
		}
		else if (command == "whois" || command == "about"){
			Speak(msgAbout);
		}
		else if (command == "count") { SpeakPlayCount(); }
		else if (command == "issue" || command == "bug" || command == "feature" || command == "idea" ){ Speak(msgBugs); }

		/**** MODERATOR FUNCTIONS ****/
		else if (command == "realcount"){
			if (IsModerator(data.userid)){
				if (param === ""){
					Speak("Usage: !realcount xxxxx");
				} else {
					SetRealCount(param);
				}
			}
		}
		else if (command == "skip") { if (IsModerator(data.userid)){ bot.skip(); } }
		else if (command == "autodj" && pm) {
			if (IsModerator(data.userid)) {
				if (param == "true" || param == "false"){
					useAutoDj = param;
					TellUser(data.userid, "Auto DJ set to " + useAutoDj);
				} else {
					TellUser(data.userid, "Usage: !autodj true or false. Currently it is set to " + useAutoDj);
				}
			}
		}
		else if (command == "autobop" && pm) {
			if (IsModerator(data.userid)) {
				if (param == "true" || param == "false"){
					useAutoDj = param;
					TellUser(data.userid, "Auto bop set to " + useAutoBop);
				} else {
					TellUser(data.userid, "Usage: !autobop true or false. Currently it is set to " + useAutoBop);
				}
			}
		}
		else if (command == "consolelog" && pm) {
			if (IsModerator(data.userid)) {
				if (param == "true" || param == "false"){
					useAutoDj = param;
					TellUser(data.userid, "Auto DJ set to " + logtoconsole);
				} else {
					TellUser(data.userid, "Usage: !consolelog true or false. Currently it is set to " + logtoconsole);
				}
			}
		}
		else if (command == "setlaptop" && pm){
			if (IsModerator(data.userid)) {
				if (param === ""){
					Speak("Usage: !setlaptop xxxxx");
				} else {
					bot.modifyLaptop(param);
				}
			}
		}
		else if (command == "setavatar" && pm){
			if (IsModerator(data.userid)) {
				if (param === ""){
					Speak("Usage: !setavatar #");
				} else {
					bot.setAvatar(param);
				}
			}
		}
		else if (command == "addsong") {
			TellUser (data.userid, "Not yet implemented");
		}

		/* Catch all */
		else { Speak("Unknown Command"); }
	}
};

/* ============== */
/* EnableQueue - Check to see if the queue should be enabled or if the playcount should be updated */
/* ============== */
global.EnableQueue = function(){
	bot.roomInfo(function(data) {
		var listenerCount = data.room.metadata.listeners;

		if (listenerCount <= level1Threshold){
			if (queueActive){
				queueActive = false;
				Speak(msgQueueDisabled);
				Log("Queue off");
				djMaxPlays = level1DjMaxPlays;
			}
		} else if (listenerCount <= level2Threshold && listenerCount > level1Threshold) {
			if (!queueActive){
				queueActive = false;
				Speak(msgQueueEnabled);
				Log("Queue activated");
				djMaxPlays = level2DjMaxPlays;
			} else {
				djMaxPlays = level2DjMaxPlays;
			}
		} else if (listenerCount <= level3Threshold && listenerCount > level2Threshold) {
			if (!queueActive){
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
global.AddToQueue = function(data){
	var text = "";

	if (queueActive) {
		/* Check if they are a DJ */
		if (djs.indexOf(data.userid) == -1) {
			/* Check if they are already on the queue*/
			if (djQueue.indexOf(data.name) == -1){
				djQueue.push(data.name);

				text = msgAddedToQueue.replace(/\{username\}/gi,data.name);
				TellUser(data.userid, text);
				Log(djQueue);
			}
		} else {
			text = msgOnQueue.replace(/\{username\}/gi,data.name);
			TellUser(data.userid, text);
		}
	} else {
		TellUser(data.userid, msgNoQueue);
	}
};

/* ============== */
/* RemoveFromQueue */
/* ============== */
global.RemoveFromQueue = function(name){
	if (queueActive) {
		if (djQueue.indexOf(name) != -1){ djQueue.splice(djQueue.indexOf(name), 1); }
	}
};

/* ============== */
/* NewDjFromQueue */
/* ============== */
global.NewDjFromQueue = function(data){
	if (queueActive){
		var text = "";

		if (djQueue.length > 0){
			if (data.user[0].name != djQueue[0]) {
				bot.remDj(data.user[0].userid);
				text = msgWrongQueuedDj.replace(/\{username\}/gi,nextDj);
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
global.NextDjOnQueue = function(){
	if (queueActive){
		if (djQueue.length > 0){
			var text = msgNextQueuedDj.replace(/\{username\}/gi, djQueue[0]).replace(/\{timeout\}/gi, nextDjQueueTimeout);
			Speak(text);
			nextDj = djQueue[0];
			nextDjTime = new Date();
			refreshIntervalId = setInterval(CheckForNextDjFromQueue, 5000);
		} else { Speak(msgEmptyQueue); }
	}
};

/* ============== */
/* CheckForNextDjFromQueue */
/* ============== */
global.CheckForNextDjFromQueue = function(){
	if (nextDj !== "" && queuedDjs[0] == nextDj){
		var currentTime = new Date();
		if (currentTime.getTime() - nextDjTime.getTime() > (nextDjQueueTimeout * 1000)){
			RemoveFromQueue(nextDj);
			clearInterval(refreshIntervalId);
			NextDjOnQueue();
		}
	}
};

/* ============== */
/* QueueStatus */
/* ============== */
global.QueueStatus = function(){
	/**/
	var text = msgQueueStatus.replace(/\{queuesize\}/gi, queuedDjs.length).replace(/\{queuedDjs\}/gi, queuedDjs);
	Speak(text);
};

/* ============== */
/* CheckIfDjShouldBeRemoved */
/* ============== */
global.CheckIfDjShouldBeRemoved = function(userid){
	if (djPlayCount[dj] >= djMaxPlays && djMaxPlays !== 0) {
		bot.remDj(dj);
		delete djPlayCount[dj];
		Speak(msgLastSong.replace(/\{username\}/gi, data.room.metadata.current_song.djname));
    }
};

/* ============== */
/*  */
/* ============== */
global.SpeakPlayCount = function(){
	var playCount = "";
	for (var i = 0; i < djs.length; i++) {
		if (djPlayCount[djs[i]] !== undefined) {
			playCount += djPlayCount[djs[i]];
		}
	}
	Speak(msgPlayCount.replace(/\{playcount\}/gi, playCount));
};

/* ============== */
/* SetRealCount */
/* ============== */
global.SetRealCount = function(){
	for (var i = 0; i < param.length; i++) {
		var count = param.substring(i, i + 1);
		djPlayCount[djs[i]] = count;
	}
	PlayCount();
};

/* ============== */
/* CheckAutoDj - The bot will see if it should step up the decks */
/* ============== */
global.CheckAutoDj = function(){
	if (useAutoDj){
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
global.StepUp = function(text){
	bot.addDj();
	Speak(msgBotJoinTable);
	botOnTable = true;
};

/* ============== */
/* StepUp - Bot steps up to the decks */
/* ============== */
global.StepDown = function(text){
	bot.speak(msgBotLeaveTable);
	bot.remDj();
	botOnTable = false;
};

/* ============== */
/* Speak - Bot broadcasts to everyone */
/* ============== */
global.Speak = function(text){
	if (!IphoneUser){
		bot.pm(text, userid);
	} else {
		bot.speak(text);
	}
};

/* ============== */
/* TellUser - Give information to a specific user */
/* ============== */
global.TellUser = function(userid, text){
	if (!IphoneUser){
		bot.pm(text, userid);
	} else {
		bot.speak(text);
	}
};

/* ============== */
/* IphoneUser - Checks to see if the user is on an iPhone (can't PM) */
/* ============== */
global.IphoneUser = function(userid){
	if (iPhoneUserList.indexOf(userid) != -1){ return true; } else { return false; }
};

/* ============== */
/* IsModerator - Check to see if the user is a moderator */
/* ============== */
global.IsModerator = function(userid){
	bot.roomInfo(function(data) {
		for (var mod in data.room.metadata.moderator_id) {
			if (userid == mod){
				return true;
			}
		}
		return false;
	});
};

/* ============== */
/* IsDj - Check to see if the user is a moderator */
/* ============== */
global.UpdateDjs = function(){
	bot.roomInfo(function(data) {
		/* Update the list since we are here */
		djs = data.room.metadata.djs;
	});
};

/* ============== */
/* IsDj - Check to see if the user is a moderator */
/* ============== */
global.IsDj = function(userid){
	bot.roomInfo(function(data) {
		/* Update the list since we are here */
		djs = data.room.metadata.djs;

		for (var dj in data.room.metadata.djs) {
			if (userid == dj){
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
/* BaseUser - The base user object for tracking the users. */
/* ============== */
BaseUser = function(){return {
	userid: -1,
	name: "I said what what",
	isBanned: false,
	isMod: false,
	isOwner: false
	isDJ: false,
	laptop: "pc",
	afkWarned: false,
	afkTime: Date.now(),
	songCount: 0,
	totalSongCount: 0,
	bootAfterSong: false,
	joinedTime: Date.now(),
	Boot: function(pReason){ mBot.bootUser(this.userid, pReason ? pReason : ""); },
	IsiOS: function(){ return this.laptop === "iphone"; },
	IsBot: function(){ return this.userid == mUserId; },
	RemoveDJ: function(){
	    if(!mIsModerator || !this.isDJ || this.IsBot()) return;
	    mJustRemovedDJ.push(this.userid);
	    mBot.remDj(this.userid);
	},
	Increment_SongCount : function(){
	  ++this.songCount;
	  ++this.totalSongCount;
	  Log(this.name + "'s song count: " + this.songCount + " total of: " + this.totalSongCount);
	},
	Remove: function(){
		//delete mUsers[this.userid];
		var sUserId = this.userid;
		mRecentlyLeft[sUserId] = setTimeout(function(){
			if(!mRecentlyLeft[sUserId]) return;
			delete mUsers[sUserId];
			delete mRecentlyLeft[sUserId];
		}, mTimeForCacheFlush);
		this.Save();///Save(mRoomShortcut, this);
	},
	Initialize: function(){
		this.songCount = 0;
		this.afkTime = Date.now();
		this.afkWarned = false;
		this.bootAfterSong = false;
		this.isDJ = mDJs.indexOf(this.userid) != -1;
		this.isMod = mModerators.indexOf(this.userid) != -1;
		this.isOwner = mOwners.indexOf(this.userid) != -1;
		this.joinedTime = Date.now();
	}
};