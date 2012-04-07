/*
 Created by: Mike Wills (http://mikewills.me)
 Use: This is the Config file where bot-specific information is setup. You can multiple copies
      of this for multiple bots.
*/

// Bot details
global.botAuthId = "auth+live+##############";
global.botUserId = "##############";
global.botRoomId = "##############";
global.botName = "BotName";
global.botLaptop = "linux";

// Database configuration
global.useDB = false;
global.dbName = "tt_bot_stats";
global.dbTablePrefix = "bot_";
global.dbLogin = "botname";
global.dbPassword = "password";

// flags
global.logtoconsole = true;
global.useAutoBop = true;
global.useAutoDj = true;
global.useQueue = true;
global.useMaxPlays = true;
global.maxPlays = 3;
global.nextDjQueueTimeout = 60; // In seconds
global.useSongComments = true;
global.useAfkWarn = true;
global.afkPlayCount = 2;
global.checkSongLength = true;
global.maxSongLength = 600; // In seconds

global.msgWelcome = "Welcome @{username}! Please, type !info and !rules to find out about my room and have fun!";
global.msgClosed = "Sorry, the fire is out and no one is here. We'll be back next weekend.";
global.msgInfo = "@{username}: Please play family-friendly music that you and your friends enjoy listening to around a campfire.";
global.msgRules = "@{username}: Rules: [1] Family-friendly music only. Anyone not following the rule will be booted. [2] Songs MUST NOT have swear words. [3] A DJ can play 3 songs then the bot will remove them. [4] A queue in effect. Type !q+ to add yourself to the list. [5] Have fun and keep the chat family-friendly as well! [6] When DJing, you must support your fellow DJs by clicking the awesome button.";
global.msgAbout = "I am a bot made by PodcastMike. He keeps my parts at http://murl.me/atwill";
global.msgBugs = "If you find a bug or have a feature idea, please post them at https://github.com/MikeWills/Music-at-Will/issues or email support@mikewills.me";
global.msgHelp = "Here is what I can do for you @{username}: !rules | !info | !count | !wait (or !q) | !whois | !issue";
global.msgModHelp = "Moderators can also: !awesome | !lame | !addsong | !skip | !realcount | !autodj | !autobop";

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