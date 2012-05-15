/*
 Created by: Mike Wills (http://mikewills.me)
 Use: This is the Config file where bot-specific information is setup. You can multiple copies
      of this for multiple bots.
*/

// Bot details
global.botAuthId = "auth+live+43ce6d0ba3e55fcd90e10359aaa2040fe5665c37";
global.botUserId = "4f471af5590ca24b6600145b";
global.botRoomId = "4fb1a97beb35c163e40000d6";
global.botName = "Kindergarden Cop";
global.botLaptop = "linux";

// Database configuration
global.useDB = true;
global.dbName = "tt_bot_stats";
global.dbTablePrefix = "kc_";
global.dbLogin = "ttbot";
global.dbPassword = "DMcZJSDNqCNDQ2ES";

// flags
global.logtoconsole = true;
global.useAutoBop = true;
global.useAutoDj = true;
global.useQueue = false;
global.useMaxPlays = true;
global.maxPlays = 3;
global.nextDjQueueTimeout = 60; // In seconds
global.useSongComments = false;
global.useAfkWarn = true;
global.afkPlayCount = 2;
global.checkSongLength = true;
global.maxSongLength = 600; // In seconds

global.msgWelcome = "Welcome @{username}! Please, read our !rules if this is your first time and have fun!";
global.msgClosed = "Sorry, the fire is out and no one is here. We'll be back next weekend.";
global.msgInfo = "@{username}: We do not use a DJ queue or list in this room. To check how many more DJs you need to wait use the !wait command. Due to TT rules ( http://turntable.fm/static/faq.html#34 ) the bot will only vote on songs after 20% of the room votes up or down.";
global.msgRules = "@{username}: [1] No more dubstep. [2] Please wait the number DJ(s) I tell you between 4 song sets (I will suspend the wait if seats stay open). [3] While DJing hit awesome for the other DJs to show your support. [4] Be nice.";
global.msgAbout = "I am a bot made by PodcastMike. He keeps my parts at http://murl.me/atwill";
global.msgBugs = "If you find a bug or have a feature idea, please post them at https://github.com/MikeWills/Music-at-Will/issues or email support@mikewills.me";
global.msgHelp = "Here is what I can do for you @{username}: !rules | !info | !count | !wait (or !q) | !issue";
global.msgModHelp = "Moderators can also: !addsong | !skip | !realcount | !autodj | !autobop";

global.msgPlayCount = "Play count is: {playcount}";
global.msgLastSong = "@{username}, thank you for your awesome tunes!";
global.msgLongSong = "Songs longer than {longsongtime} minutes are generally frowned upon here.";
global.msgAFKWarn = "If you continue to not awesome songs, I will be forced to remove you as DJ for not following the rules.";
global.msgAFKBoot = "I was forced to remove you as DJ because you didn't awesome songs.";
global.msgOneAndDone = "We are doing doing 1 and done. You play one awesome song then you're booted. Be sure to join the queue by typing !q+";

global.msgQueueRules = "@{username}: 0-10 people = no queue; 10-30 people = 2 songs, queue in effect, (Requires DJ to sign up for the waiting list); 30+ people = 1 song, queue in effect, (Requires DJ to sign up for the waiting list).";
global.msgAddedToQueue = "@{username}, you have been added to the queue. You are # {queuesize} in the waiting list.";
global.msgRemovedFromQueue = "";
global.msgNoQueue = "There currently isn't a queue.";
global.msgQueueEnabled = "The queue is in effect at this time. Please, sign in by typing !q+.";
global.msgQueueDisabled = "The queue has ended as we have less than {queuethreshold} listeners.";
global.msgNextQueuedDj = "Okay, @{username} you can step up now.  Please step up within {timeout} seconds or you will loose your spot.";
global.msgWrongQueuedDj = "I'm sorry, but it's @{username}'s turn.";
global.msgQueueOnTable = "Your just being silly. You are already on the table @{username}.";
global.msgEmptyQueue = "There is no one on the queue. Anyone can step up";
global.msgQueueStatus = "There are {queuesize} DJs waiting. The full list (in order) is: {queuedDjs}";
global.msgMaxPlays = "At this time, you can pay up to {maxplays} songs while DJing.";

global.msgDjJoinTable = "";
global.msgDJLeaveTable = "";
global.msgBotJoinTable = "Imma help you out for a bit.";
global.msgBotLeaveTable = "Looks like I'm not needed anymore.";

// Okay defualts are set. Lets load the bot.
require("./main.js");
