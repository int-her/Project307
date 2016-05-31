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
		} else if (pageid === "surroundingBusStation" || pageid === "busFavorite") {
			window.history.go(-2);
		} else if (pageid === "busArrivalTime" || pageid === "busNumberStationList") {
			window.history.go(-3);
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
	
	document.getElementById('busFavorite').addEventListener('pagebeforeshow', function() {
		var title = document.getElementById('favoriteStationName');
		
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
					bus.showFavoriteBus();
				} else {
					tau.closePopup(moreoption.popup);
				}
			} else {
				dataTitle = target.getAttribute("data-title");
				if (dataTitle === "즐겨찾기 등록") {
					tau.closePopup(moreoption.popup);
					bus.showFavoriteBus();
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
					bus.changeToDeleteModeOnFavorite("showFavoriteStation");
				} else {
					tau.closePopup(moreoptionFavorite.popup);
				}
			} else {
				dataTitle = target.getAttribute("data-title");
				if (dataTitle === "삭제") {
					tau.closePopup(moreoptionFavorite.popup);
					bus.changeToDeleteModeOnFavorite("showFavoriteStation");
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
	
	// 주변 정류장 클릭
	document.getElementById('searchSurrounding').addEventListener('click', function() {
		bus.showSurroundingStationsByGps();
	});
	
	// 즐겨찾기 등록
	document.getElementById('btnRegister').addEventListener('click', function() {
		bus.registerFavoriteBus();
	});
	
	// 즐겨찾기 삭제
	document.getElementById('btnDelete').addEventListener('click', function() {
		var page = document.getElementById('showFavoriteStation'),
		listview = document.querySelector('#' + pageId + ' .ui-listview'),
		list = listview.getElementsByTagName("li"),
		listLength = list.length
		i,
		j = 0,
		id = [];
		
		for (i = 0; i < listlength; ++i) {
			if (list[i].classList.contains("select")) {
				id[j++] = list[i].id;
			}
		}
		
		bus.deleteFavorite(id);
	});

	// 등록한 즐겨찾기 보기
	document.getElementById('viewFavoriteBus').addEventListener('click', function(){
		bus.showRegisteredStation();
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
	
	window.addEventListener('tizenhwkey', keyEventHandler);
}

window.onload = init();
