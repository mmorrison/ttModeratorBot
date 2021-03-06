global.EnableQueue = function() {
	var maxPlaysChanged = false;
	bot.roomInfo(function(data) {
		var listenerCount = data.room.metadata.listeners;

		if (listenerCount <= level1Threshold) {
			/* Disable the Queue */
			if (queueActive && useQueue) {
				queueActive = level1DjQueueActive;
				Speak(msgQueueDisabled);
				Log("Queue off");
			}
			/* Set the play count */
			if (djMaxPlays != level1DjMaxPlays){
				djMaxPlays = level1DjMaxPlays;
				Speak(msgMaxPlays.replace(/\{maxplays\}/gi,djMaxPlays));
			}
			
		} else if (listenerCount <= level2Threshold && listenerCount > level1Threshold) {
			/* Enable the Queue */
			if (!queueActive && useQueue) {
				queueActive = level2DjQueueActive;
				Speak(msgQueueEnabled);
				Log("Queue activated");
			}
			/* Set the play count */
			if (djMaxPlays != level2DjMaxPlays){
				djMaxPlays = level2DjMaxPlays;
				Speak(msgMaxPlays.replace(/\{maxplays\}/gi,djMaxPlays));
			}
			
		} else if (listenerCount <= level3Threshold && listenerCount > level2Threshold) {
			/* Enable the Queue */
			if (!queueActive && useQueue) {
				queueActive = level3DjQueueActive;
				Speak(msgQueueEnabled);
				Log("Queue activated");
			}
			/* Set the play count */
			if (djMaxPlays != level3DjMaxPlays){
				djMaxPlays = level3DjMaxPlays;
				Speak(msgMaxPlays.replace(/\{maxplays\}/gi,djMaxPlays));
			}
			
		}
	});
};