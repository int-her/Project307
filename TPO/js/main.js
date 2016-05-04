function keyEventHandler(event) {
	if( event.keyName === "back" ) {
		var page = document.getElementsByClassName('ui-page-active')[0],
			pageid = page ? page.id : "";
		if( pageid === "main" ) {
			try {
				tizen.application.getCurrentApplication().exit();
			} catch (ignore) {
			}
		} else {
			window.history.back();
		}
	}
}

function init() {
	/** Set marquee List */
	document.getElementById('surroundingBusStation').addEventListener('pagebeforeshow', function() {
		marqueeList.pageBeforeShowHandler('surroundingBusStation');
	});
	document.getElementById('surroundingBusStation').addEventListener('pagebeforehide', marqueeList.pageBeforeHideHandler);
	
	/** When click list element, find bus stations around */ 
	document.getElementById('searchSurrounding').addEventListener('click', busStation.findSurroundingStationsByGps);
	
	/** When click list element, find subway stations around */ 
	document.getElementById('searchSurroundingSubway').addEventListener('click', subway.findSurroundingStationsByGps);
	
	/** Test - image zoom in & out */
	document.getElementById('viewMap').addEventListener('pagebeforshow', function() {
		window.addEventListener('rotarydetent', zoom.rotaryEventHandler);
	});
	
	document.getElementById('viewMap').addEventListener('pagebeforhide', function() {
		window.removeEventListener('rotarydetent', zoom.rotaryEventHandler);
	});
	
	
	window.addEventListener('tizenhwkey', keyEventHandler);
}

window.onload = init();
