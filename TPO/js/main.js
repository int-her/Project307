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
		} else if (pageid === "subwayArrivalTime") {
			window.history.go(-5);
		} else if (pageid === "surroundingBusStation" || pageid === "busFavorites") {
			window.history.go(-2);
		} else if (pageid === "busArrivalTime" || pageid === "busNumberStationList") {
			window.history.go(-2);
		} else if (pageid === "surroundingSubwayStation" || pageid === "lvAllSubwayStation") { // subway
			window.history.go(-2);
		} else if (pageid === "processing") {
			window.history.go(-1);
		} else if (pageid === "busArrivalTime_MoreOptions") {
			tau.closePopup(popup);
		} else if (pageid === "showFavoriteStation_MoreOptions") {
			tau.closePopup(popup);
		} else {
			window.history.back();
		}
	}
}

function init() {
	var marqueeSurrounding = new MARQUEELIST(),
		marqueeStation = new MARQUEELIST(),
		marqueeFavorite = new MARQUEELIST(),
		marqueeDestination = new MARQUEELIST(),
		marqueeRoute = new MARQUEELIST(),
		marqueeWidget,
		moreoption = new MOREOPTION(),
		moreoptionFavorite = new MOREOPTION();
	
	
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
	
	document.getElementById('busFavorites').addEventListener('pagebeforeshow', function() {
		var title = document.getElementById('activeStationName');
		
		marqueeWidget = new tau.widget.Marquee(title, 
				{
			marqueeStyle: "endToEnd",
			delay: "3000",
			iteration: "infinite"
				});
		marqueeWidget.start();	
	});
	document.getElementById('busArrivalTime').addEventListener('pagebeforeshow', function() {
		var title = document.getElementById('stationName');
		
		marqueeWidget = new tau.widget.Marquee(title, 
				{
			marqueeStyle: "endToEnd",
			delay: "3000",
			iteration: "infinite"
				});
		marqueeWidget.start();
		
		moreoption.pageBeforeShowHandler('busArrivalTime', function(event) {
			var target = event.target,
			dataTitle,
			dataIndex;

			if (target.classList.contains("ui-selector-indicator")) {
				dataIndex = target.getAttribute("data-index");
				if (dataIndex === "0") {
					tau.closePopup(moreoption.popup);
					busFavorites.showBusListInStation(0);
				} else {
					tau.closePopup(moreoption.popup);
				}
			} else {
				dataTitle = target.getAttribute("data-title");
				if (dataTitle === "즐겨찾기 등록") {
					tau.closePopup(moreoption.popup);
					busFavorites.showBusListInStation(0);
				}
			}
		});
	});
	document.getElementById('busArrivalTime').addEventListener('pagebeforehide', function() {
		moreoption.pageBeforeHideHandler();
	});
	document.getElementById('showFavoriteStation').addEventListener('pagebeforeshow', function() {
		moreoptionFavorite.pageBeforeShowHandler('showFavoriteStation', function(event) {
			var target = event.target,
			dataTitle,
			dataIndex;

			if (target.classList.contains("ui-selector-indicator")) {
				dataIndex = target.getAttribute("data-index");
				if (dataIndex === "0") {
					tau.closePopup(moreoptionFavorite.popup);
					busFavorites.changeToDeleteMode("showFavoriteStation");
				} else {
					tau.closePopup(moreoptionFavorite.popup);
				}
			} else {
				dataTitle = target.getAttribute("data-title");
				if (dataTitle === "삭제") {
					tau.closePopup(moreoptionFavorite.popup);
					busFavorites.changeToDeleteMode("showFavoriteStation");
				}
			}
		});
	});
	document.getElementById('showFavoriteStation').addEventListener('pagebeforehide', function() {
		moreoptionFavorite.pageBeforeHideHandler();
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
	document.getElementById('showFavoriteStation').addEventListener('pagebeforeshow', function() {
		marqueeFavorite.pageBeforeShowHandler('showFavoriteStation');
	});
	document.getElementById('showFavoriteStation').addEventListener('pagebeforehide', function() {
		marqueeFavorite.pageBeforeHideHandler();
	});
	document.getElementById('routeFind').addEventListener('pagebeforeshow', function() {
		marqueeRoute.pageBeforeShowHandler('routeFind');
		
		if (route.destination === "") {
			document.getElementById('destination').innerHTML = "설정";
		} else {
			document.getElementById('destination').innerHTML = route.destination;
		}
	});
	document.getElementById('routeFind').addEventListener('pagebeforehide', function() {
		marqueeRoute.pageBeforeHideHandler();
	});
	document.getElementById('routeDestination').addEventListener('pagebeforeshow', function() {
		marqueeDestination.pageBeforeShowHandler('routeDestination');
	});
	document.getElementById('routeDestination').addEventListener('pagebeforehide', function() {
		marqueeDestination.pageBeforeHideHandler();
	});
	
	
	// 주변 정류장 클릭
	document.getElementById('searchSurrounding').addEventListener('click', function() {
		bus.showSurroundingStationsByGps();
	});
	
	// 즐겨찾기 등록
	document.getElementById('btnRegister').addEventListener('click', function() {
		busFavorites.confirm(0);
	});
	
	// 즐겨찾기 수정
	document.getElementById('btnModify').addEventListener('click', function() {
		busFavorites.confirm(1);
	});
	
	// 즐겨찾기 삭제
	document.getElementById('btnDelete').addEventListener('click', function() {
		var listview = document.querySelector('#showFavoriteStation .ui-listview'),
		list = listview.getElementsByTagName("li"),
		listLength = list.length,
		i,
		j = 0,
		stationId = [];
		
		for (i = 0; i < listLength; ++i) {
			if (list[i].classList.contains("select")) {
				stationId[j++] = list[i].id;
			}
		}
		
		if (j == 0) {
			toastPopup.openCheckPopup("하나 이상의 즐겨찾기를 선택해주세요.", false);
		} else {
			busFavorites.deleteFavorites(stationId);
		}
	});

	// 등록한 즐겨찾기 보기
	document.getElementById('viewBusFavorites').addEventListener('click', function(){
		busFavorites.showRegisteredStation();
	});
	
	/** When click list element, find subway stations around */ 
	document.getElementById('searchSurroundingSubway').addEventListener('click', function(){
		subway.showSurroundingStationsByGps();
	});
	
	/** Test - image zoom in & out
	document.getElementById('viewMap').addEventListener('pagebeforshow', function() {
		window.addEventListener('rotarydetent', zoom.rotaryEventHandler);
	});
	
	document.getElementById('viewMap').addEventListener('pagebeforhide', function() {
		window.removeEventListener('rotarydetent', zoom.rotaryEventHandler);
	}); */
	
	function clickToSetDestination(e) {
		route.setDestination(e);
	}
	
	document.getElementById('routeDestination').addEventListener('pagebeforeshow', function() {
		var lv = document.getElementById('lvDestination'),
		elems = lv.getElementsByTagName("li");
	
		for (var i = 0; i < elems.length; ++i) {
			elems[i].addEventListener("click", clickToSetDestination);
		}
	});
	document.getElementById('routeDestination').addEventListener('pagebeforehide', function() {
		var lv = document.getElementById('lvDestination'),
		elems = lv.getElementsByTagName("li");
	
		for (var i = 0; i < elems.length; ++i) {
			elems[i].removeEventListener("click", clickToSetDestination);
		}	
	});
	
	window.addEventListener('tizenhwkey', keyEventHandler);
}

window.onload = init();
