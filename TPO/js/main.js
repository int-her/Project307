/*global bus, marqueeList, moreoption */
function keyEventHandler(event) {
	if( event.keyName === "back" ) {
		var page = document.getElementsByClassName('ui-page-active')[0],
			popup = document.getElementsByClassName('ui-popup-active')[0],
			pageid = popup ? popup.id : (page ? page.id : "");
		
		if( pageid === "main" ) {
			try {
				tizen.application.getCurrentApplication().exit();
			} catch (ignore) {
			}
		} else if (pageid === "surroundingBusStation" || pageid === "surroundingSubwayStation" ||
				pageid === "busFavorite" || pageid === "subwayArrivalTime" || pageid === "lvAllSubwayStation") {
			window.history.go(-2);
		} else if (pageid === "busArrivalTime" || pageid === "busNumberStationList") {
			window.history.go(-2);
		} else if (pageid === "processing") {
			window.history.go(-1);
		} else if (pageid === "busArrivalTime_MoreOptions") {
			tau.closePopup(popup);
		} else {
			window.history.back();
		}
	}
}

function init() {
	var marqueeSurrounding = new MARQUEELIST(),
		marqueeStation = new MARQUEELIST(),
		marqueeWidget,
		moreoption = new MOREOPTION();
	
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
	
	// More option 초기화
	document.getElementById('busArrivalTime').addEventListener('pagebeforeshow', function() {
		var title = document.getElementById('stationName');
		
		moreoption.pageBeforeShowHandler('busArrivalTime');
		marqueeWidget = new tau.widget.Marquee(title, 
				{
			marqueeStyle: "endToEnd",
			delay: "3000",
			iteration: "infinite"
				});
		marqueeWidget.start();	
	});
	document.getElementById('busArrivalTime').addEventListener('pagebeforehide', function() {
		moreoption.pageBeforeHideHandler();
	});
	
	
	// Marquee list 초기화 
	document.getElementById('surroundingBusStation').addEventListener('pagebeforeshow', function() {
		marqueeSurrounding.pageBeforeShowHandler('surroundingBusStation');
	});
	document.getElementById('surroundingBusStation').addEventListener('pagebeforehide', function() {
		marqueeSurrounding.pageBeforeHideHandler();
	});
	document.getElementById('busNumberStationList').addEventListener('pagebeforeshow', function() {
		marqueeStation.pageBeforeShowHandler('busNumberStationList');
	});
	document.getElementById('busNumberStationList').addEventListener('pagebeforehide', function() {
		marqueeStation.pageBeforeHideHandler();
	});
	
	// 주변 정류장 클릭
	document.getElementById('searchSurrounding').addEventListener('click', function() {
		bus.showSurroundingStationsByGps();
	});
	
	// 즐겨찾기 등록
	document.getElementById('btnRegister').addEventListener('click', function() {
		bus.registerFavoriteBus();
	});

	/** When click list element, find subway stations around */ 
	document.getElementById('searchSurroundingSubway').addEventListener('click', function(){
		subway.showSurroundingStationsByGps();
	});
	
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
