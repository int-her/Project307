/*global tau, toastPopup, rest */
function ROUTE() {}
ROUTE.prototype = new Object();

/**@brief
 * This supports Route functions.
 * @type ROUTE
 */


var shortestDistance = 999999999999999;
var shortestPath = null;

Window.prototype.route = new ROUTE();
/**
 * GPS 받아오기에 성공했을 시 google calender에서 목적지를 받아 경로 찾기를 진행한다.
 */

function showPathList(data) {
	var id = document.getElementById("routeNavigation");
	id.innerHTML = "<li>" + data + "</li>";

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
		"ServiceKey" : "4we1Svife1ANzIwfRlMm4LIKHZI6BiBr2+8+TMz1QkiwBNUTmqJImecu2GHvh04mEAYTTgh60HoxSa+LdhW0+A==",
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
		"ServiceKey" : "4we1Svife1ANzIwfRlMm4LIKHZI6BiBr2+8+TMz1QkiwBNUTmqJImecu2GHvh04mEAYTTgh60HoxSa+LdhW0+A==",
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
//function findWay(position) {
	tau.changePage("#processing");
	var flag = 0;
	
	rest.get('http://ws.bus.go.kr/api/rest/pathinfo/getPathInfoByBus',
			null,
			{
		"ServiceKey" : "4we1Svife1ANzIwfRlMm4LIKHZI6BiBr2+8+TMz1QkiwBNUTmqJImecu2GHvh04mEAYTTgh60HoxSa+LdhW0+A==",
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
			});
}
