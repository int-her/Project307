/*global busStation, marqueeList */
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
	document.getElementById('busArrivalTime').addEventListener('pagebeforeshow', function() {
		document.getElementById('txtBusID').value = "";
	});
	
	/** Enter bus number */
	document.getElementById('txtBusID').addEventListener('keypress', function(event) {
		if (event.keyCode === 13) {
			/** Press the enter */
			busStation.showBusArrivalTime(document.getElementById('txtBusID').value);
		}
	});
	
	/** Set marquee List */
	document.getElementById('surroundingBusStation').addEventListener('pagebeforeshow', function() {
		marqueeList.pageBeforeShowHandler('surroundingBusStation');
	});
	document.getElementById('surroundingBusStation').addEventListener('pagebeforehide', marqueeList.pageBeforeHideHandler);
	
	/** When click list element, find bus stations around */ 
	document.getElementById('searchSurrounding').addEventListener('click', busStation.showSurroundingStationsByGps);
	
	window.addEventListener('tizenhwkey', keyEventHandler);
}

window.onload = init();