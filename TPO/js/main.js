/*global bus, marqueeList, moreoption */
function keyEventHandler(event) {
	if( event.keyName === "back" ) {
		var page = document.getElementsByClassName('ui-page-active')[0],
			pageid = page ? page.id : "";
		if( pageid === "main" ) {
			try {
				tizen.application.getCurrentApplication().exit();
			} catch (ignore) {
			}
		} else if (pageid === "busArrivalTime" || pageid === "busNumberStationList") {
			window.history.go(-3);
		} else {
			window.history.back();
		}
	}
}

function init() {
	// 버스 정류장 ID 입력
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
			bus.showBusArrivalTime(document.getElementById('txtStationID').value);
		}
	});
	
	// 로딩 페이지
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
	
	// Marquee list 초기화 
	document.getElementById('surroundingBusStation').addEventListener('pagebeforeshow', function() {
		marqueeList.pageBeforeShowHandler('surroundingBusStation');
	});
	document.getElementById('surroundingBusStation').addEventListener('pagebeforehide', marqueeList.pageBeforeHideHandler);

	// More option 초기화
	document.getElementById('busArrivalTime').addEventListener('pagebeforeshow', function() {
		moreoption.pageBeforeShowHandler('busArrivalTime');
	});
	document.getElementById('busArrivalTime').addEventListener('pagebeforehide', moreoption.pageBeforeHideHandler);
	
	// 주변 정류장 클릭
	document.getElementById('searchSurrounding').addEventListener('click', bus.showSurroundingStationsByGps);

	window.addEventListener('tizenhwkey', keyEventHandler);
}

window.onload = init();