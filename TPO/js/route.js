/*global tau, toastPopup, rest */
function ROUTE() {
	this.destination = {
		name: "",
		x: 0.0,
		y: 0.0
	};
}
ROUTE.prototype = new Object();

/**@brief
 * This supports Route functions.
 * @type ROUTE
 */


/**
 * initialize
 */
var shortestDistance = 999999999999999;
var shortestPath = null;

Window.prototype.route = new ROUTE();
/**
 * GPS 받아오기에 성공했을 시 google calender에서 목적지를 받아 경로 찾기를 진행한다.
 */


function autoRefresh_div() {
	
}


function showPathList(data) {
	var id = document.getElementById("routeNavigation");
	id.innerHTML = "<li>" + data + "</li>";

}

function findCurrentRoute() {
	
}

function navigateView() {
	if(shortestDistance == 999999999999999) {
		var navish = document.getElementById("routeNavigation");
		navish.innerHTML = "<li> 경로 검색 결과가 없습니다. </li>";
	}
	else {
		var navish = document.getElementById("routeNavigation");
		navish.innerHTML = shortestPath.getElementsByTagName("pathList").length;
	}
		
	tau.changePage("#showRoute");
}

function getShortestPathAll() {
	rest.get('http://ws.bus.go.kr/api/rest/pathinfo/getPathInfoByBusNSub',
			null,
			{
		"ServiceKey" : "DELETED",
		"startX" : "126.938145", //position.coords.longitude,
		"startY" : "37.470469", //position.coords.latitude,
		"endX" : "127.068397",
		"endY" : "37.498429",
		"numOfRows" : "999",
		"pageNo" : "1"
			}, 
			function(data, xhr) {
				var msg = data.getElementsByTagName("headerCd")[0].childNodes[0].nodeValue;				
				if (msg === "4") {
					navigateView();
					// No result
				} else if (msg === "0"){
					var cn = data.getElementsByTagName("itemList");
					var i;
					for(i=0; i<cn.length; i++) {
						if(cn[i].getElementsByTagName("distance")[0].childNodes[0].nodeValue < shortestDistance) {
							shortestDistance = cn[i].getElementsByTagName("distance")[0].childNodes[0].nodeValue;
							shortestPath = cn[i].cloneNode(true);
							navigateView();
						}
					}	
				}
			}, function(data, xhr) {
				toastPopup.openPopup("API를 불러오는데 실패하였습니다.", true);
			});
}

function getShortestPathSubway() {
	rest.get('http://ws.bus.go.kr/api/rest/pathinfo/getPathInfoBySubway',
			null,
			{
		"ServiceKey" : "DELETED",
		"startX" : "126.938145", //position.coords.longitude,
		"startY" : "37.470469", //position.coords.latitude,
		"endX" : "127.068397",
		"endY" : "37.498429",
		"numOfRows" : "999",
		"pageNo" : "1"
			}, 
			function(data, xhr) {
				var msg = data.getElementsByTagName("headerCd")[0].childNodes[0].nodeValue;				
				if (msg === "4") {
					getShortestPathAll();
					// No result
				} else if (msg === "0"){
					var cn = data.getElementsByTagName("itemList");
					var i;
					for(i=0; i<cn.length; i++) {
						if(cn[i].getElementsByTagName("distance")[0].childNodes[0].nodeValue < shortestDistance) {
							shortestDistance = cn[i].getElementsByTagName("distance")[0].childNodes[0].nodeValue;
							shortestPath = cn[i].cloneNode(true);
							getShortestPathAll();
						}
					}	
				}
			}, function(data, xhr) {
				toastPopup.openPopup("API를 불러오는데 실패하였습니다.", true);
			});
}

ROUTE.prototype.findway = function () {
	if (this.destination === "") {
		toastPopup.openCheckPopup("목적지를 설정해주세요!", false);
		return;
	}
	
	
	
	/*tau.changePage("#processing");
	var shortestDistance = 999999999999999;
	var shortestPath = null;
	
	rest.get('http://ws.bus.go.kr/api/rest/pathinfo/getPathInfoByBus',
			null,
			{
		"ServiceKey" : "DELETED",
		"startX" : "126.938145", //position.coords.longitude,
		"startY" : "37.470469", //position.coords.latitude,
		"endX" : "127.068397",
		"endY" : "37.498429",
		"numOfRows" : "999",
		"pageNo" : "1"
			}, 
			function(data, xhr) {
				var msg = data.getElementsByTagName("headerCd")[0].childNodes[0].nodeValue;				
				if (msg === "4") {
					// No result
					getShortestPathSubway();
				} else if (msg === "0"){
					var cn = data.getElementsByTagName("itemList");
					var i;
					for(i=0; i<cn.length; i++) {
						if(cn[i].getElementsByTagName("distance")[0].childNodes[0].nodeValue < shortestDistance) {
							shortestDistance = cn[i].getElementsByTagName("distance")[0].childNodes[0].nodeValue;
							shortestPath = cn[i].cloneNode(true);
							getShortestPathSubway();
						}
					}
				}
			}, function(data, xhr) {
				toastPopup.openPopup("API를 불러오는데 실패하였습니다.", true);
			});*/
}

ROUTE.prototype.setDestination = function(event) {
	var target = event.target;
	rest.get('https://apis.daum.net/local/v1/search/keyword.xml',
			null,
			{
		"apikey" : "2291e64113c30e56587cdd4aa1d0ce98",
		"query" : this.destination.name
			}, 
			function(data, xhr) {
				var count = data.getElementsByTagName("totalCount")[0].childNodes[0].nodeValue;				
				if (msg === "0") {
					// No result
					toastPopup.openCheckPopup("장소를 검색하지 못하였습니다.", true);
				} else {
					/*var cn = data.getElementsByTagName("itemList");
					var i;
					for(i=0; i<cn.length; i++) {
						if(cn[i].getElementsByTagName("distance")[0].childNodes[0].nodeValue < shortestDistance) {
							shortestDistance = cn[i].getElementsByTagName("distance")[0].childNodes[0].nodeValue;
							shortestPath = cn[i].cloneNode(true);
							getShortestPathSubway();
						}
					}*/
					
					var item = data.getElementsByTagName('item')[0];
					route.destination.name = target.id;
					route.destination.x = parseFloat(item.getElementsByTagName('longitude').childNodes[0].nodeValue); 
					route.destination.y = parseFloat(item.getElementsByTagName('latitude').childNodes[0].nodeValue);
					window.history.back();
				}
			}, function(data, xhr) {
				toastPopup.openPopup("API를 불러오는데 실패하였습니다.", true);
			});
}

ROUTE.prototype.showDestination = function() {
	tau.changePage("#routeDestination");
};
