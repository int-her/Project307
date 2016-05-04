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
		} else if (pageid === "busArrivalTime") {
			// Î≤ÑÏä§ ?àÏÉÅ ?ÑÏ∞© ?úÍ∞Ñ ?òÏù¥ÏßÄ
			window.history.go(-3);
		} else {
			window.history.back();
		}
	}
}

function init() {
	// Î≤ÑÏä§ ?ïÎ•ò?? ID ?ÖÎ†•
	document.getElementById('inputBusID').addEventListener('pagebeforeshow', function() {
		document.getElementById('txtBusID').value = "";
	});
	document.getElementById('txtBusID').addEventListener('keypress', function(event) {
		if (event.keyCode === 13) {
			// enter
			bus.busId(document.getElementById('txtBusID').value);
		}
	});
	
	
	document.getElementById('inputStationID').addEventListener('pagebeforeshow', function() {
		document.getElementById('txtStationID').value = "";
	});
	// Enter station number
	document.getElementById('txtStationID').addEventListener('keypress', function(event) {
		if (event.keyCode === 13) {
			// enter
			busStation.showBusArrivalTime(document.getElementById('txtStationID').value);
		}
	});
	
	// Î°úÎî© ?òÏù¥ÏßÄ
	document.getElementById('processing').addEventListener("pageshow", function(event) {
		var page = event.target,
		processing = page.querySelector(".ui-processing");
		processing.style.visibility = "";
	});
	document.getElementById('processing').addEventListener("pagebeforehide", function(event) {
		var page = event.target,
		processing = page.querySelector(".ui-processing");
		processing.style.visibility = "hidden";
	});
	
	// Ï£ºÎ? ?ïÎ•ò?? ?òÏù¥ÏßÄ?? Marquee list ?§Ï†ï
	document.getElementById('surroundingBusStation').addEventListener('pagebeforeshow', function() {
		marqueeList.pageBeforeShowHandler('surroundingBusStation');
	});
	document.getElementById('surroundingBusStation').addEventListener('pagebeforehide', marqueeList.pageBeforeHideHandler);
	 
	// Ï£ºÎ? ?ïÎ•ò?? Í≤Ä?? ?¥Î¶≠ ?¥Î≤§?? Ï∂îÍ?
	document.getElementById('searchSurrounding').addEventListener('click', bus.showSurroundingStationsByGps);
	
	var handler = page.querySelector(".ui-more"),
	popupCircle = page.querySelector("#moreoptionsPopupCircle"),
	elSelector = page.querySelector("#selector"),
	selector,
	clickHandlerBound;

	function clickHandler(event) {
		tau.openPopup(popupCircle);
	}

	document.getElementById("busArrivalTime").addEventListener( "pagebeforeshow", function() {
		var radius = window.innerHeight / 2 * 0.8;

		clickHandlerBound = clickHandler.bind(null);
		handler.addEventListener("click", clickHandlerBound);
		selector = tau.widget.Selector(elSelector, {itemRadius: radius});
	});
	document.getElementById("busArrivalTime").addEventListener( "pagebeforehide", function() {
		handler.removeEventListener("click", clickHandlerBound);
		selector.destroy();
	});
	elSelector.addEventListener("click", function(event) {
		var target = event.target;
		// 'ui-selector-indicator' is default indicator class name of Selector component
		if (target.classList.contains("ui-selector-indicator")) {
			tau.closePopup(popupCircle);
		}
	});

	// tizen hardware ?§Ïóê ?Ä?? ?¥Î≤§?? Ï∂îÍ?
	window.addEventListener('tizenhwkey', keyEventHandler);
}

window.onload = init();