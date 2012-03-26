/*
 Created by: Mike Wills (http://mikewills.me)
 Use: This is the Config file where bot-specific information is setup. You can multiple copies
      of this for multiple bots.
*/

// Bot details
global.botAuthId = "auth+live+##############";
global.botUserId = "##############";
global.botRoomId = "##############";
global.botName = "PodGeek";
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
global.nextDjQueueTimeout = 30; // In seconds
global.useSongComments = true;
global.useAfkWarn = true;
global.checkSongLength = true;
global.maxSongLength = 600; // In seconds

// Max Plays Per time DJing at first threshold
global.level1Threshold = 10;
global.level1DjMaxPlays = 0;  // 0 = unlimited
global.level1DjQueueActive = false;
global.level2Threshold = 30;
global.level2DjMaxPlays = 2;  // 0 = unlimited
global.level2DjQueueActive = true;
global.level3Threshold = 200;
global.level3DjMaxPlays = 1;  // 0 = unlimited
global.level3DjQueueActive = true;

global.msgWelcome = "Welcome @{username}! Please, type !info and !rules to find out how you can share your DJ talent and have fun.";
global.msgInfo = "@{username}: This room encourages DJs at the table to support each other by awesoming every song. Please, avoid being away from keyboard (AFK) as this will make you lose your DJ spot. A queue will be triggered after the room reaches certain capacity (please, refer to !qrules for more information). To sign up for the queue, please type !q+.";
global.msgRules = "@{username}: Music At Will operates under the following rules: [1] When there is less than 10 people in the room, there is no queue in effect and you can play as many songs as you want; [2] A queue will be in effect when the room reaches 10 + people; and [3] While up at the table, be sure to support other DJs. DJs who do not awesome songs will be removed at the end of the songs.";
global.msgAbout = "I am a bot made by PodcastMike. He keeps my parts at http://murl.me/atwill";
global.msgBugs = "If you find a bug or have a feature idea, please post them at https://github.com/MikeWills/Music-at-Will/issues or email support@mikewills.me";
global.msgHelp = "Here is what I can do for you @{username}: !rules | !info | !qrules | !count | !wait (or !q) | !whois | !issue";
global.msgModHelp = "Moderators can also: !awesome | !lame | !addsong | !skip | !realcount | !autodj | !autobop";

global.msgEndOfSong = "";
global.msgPlayCount = "Play count is: {playcount}";
global.msgLastSong = "@{username}, thank you for your awesome tunes!";
global.msgLongSong = "Songs longer than {longsongtime} minutes are generally frowned upon here.";
global.msgLameSong = "";

global.msgQueueRules = "@{username}: 0-10 people = no queue; 10-30 people = 2 songs, queue in effect, (Requires DJ to sign up for the waiting list); 30+ people = 1 song, queue in effect, (Requires DJ to sign up for the waiting list).";
global.msgAddedToQueue = "@{username}, you have been added to the queue. You are # {queuesize} in the waiting list. We appreciate your patience.";
global.msgRemovedFromQueue = "";
global.msgNoQueue = "There currently isn't a queue.";
global.msgQueueEnabled = "The queue is in effect at this time. Please, sign in by typing !q+.";
global.msgQueueDisabled = "The queue has ended as we have less than {queuethreshold} listeners.";
global.msgNextQueuedDj = "Okay, @{username} you can step up now.  Please step up within {timeout} seconds or you will loose your spot.";
global.msgWrongQueuedDj = "I'm sorry, but it's @{username}'s turn. You can add yourself to the queue by typing !q+.";
global.msgQueueOnTable = "Your just being silly. You are already on the table @{username}.";
global.msgEmptyQueue = "There is no one on the queue. Anyone can step up";
global.msgQueueStatus = "There are {queuesize} DJs waiting. The full list (in order) is: {queuedDjs}";

global.msgDjJoinTable = "";
global.msgDJLeaveTable = "";
global.msgBotJoinTable = "Imma help you out for a bit.";
global.msgBotLeaveTable = "Looks like I'm not needed anymore.";

// Okay defualts are set. Lets load the bot.
require("./main.js");