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
	document.getElementById('searchSurrounding').addEventListener('click', busStation.findSurroundingStationsByGps);
	
	window.addEventListener('tizenhwkey', keyEventHandler);
}

window.onload = init();