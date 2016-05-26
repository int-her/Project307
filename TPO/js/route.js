/*global tau, toastPopup, rest */
function ROUTE() {}
ROUTE.prototype = new Object();

/**@brief
 * This supports Bus functions.
 * @type BUS
 */
Window.prototype.route = new ROUTE();
/**
 * GPS 받아오기에 성공했을 시 google calender에서 목적지를 받아 경로 찾기를 진행한다.
 */

function showPathList(data) {
	var id = document.getElementById("routeNavigation");
	id.innerHTML = "<li>" + data + "</li>";

}

ROUTE.prototype.findway = function () {
//function findWay(position) {
	tau.changePage("#processing");
	
	XmlDocument root = new XmlDocument();

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
				} else if (msg === "0"){
					root = data;	
				}
			}, function(data, xhr) {
				toastPopup.openPopup("API를 불러오는데 실패하였습니다.", true);
			});
	
//	rest.get('http://ws.bus.go.kr/api/rest/pathinfo/getPathInfoByBus',
//			null,
//			{
//		"ServiceKey" : "4we1Svife1ANzIwfRlMm4LIKHZI6BiBr2+8+TMz1QkiwBNUTmqJImecu2GHvh04mEAYTTgh60HoxSa+LdhW0+A==",
//		"startX" : 126.938145, //position.coords.longitude,
//		"startY" : 37.470469, //position.coords.latitude,
//		"endX" : 127.068397,
//		"endY" : 37.498429,
//		"numOfRows" : "999",
//		"pageNo" : "1"
//			}, 
//			function(data, xhr) {
//				var msg = data.getElementsByTagName("headerCd")[0].childNodes[0].nodeValue;				
//				if (msg === "4") {
//					// No result
//					
//				} else if (msg === "0"){
//					// Success
//					root = data;
//				}
//			}, function(data, xhr) {
//				toastPopup.openPopup("API를 불러오는데 실패하였습니다.", true);
//			});
//		
//	rest.get('http://ws.bus.go.kr/api/rest/pathinfo/getPathInfoBySubway',
//			null,
//			{
//		"ServiceKey" : "4we1Svife1ANzIwfRlMm4LIKHZI6BiBr2+8+TMz1QkiwBNUTmqJImecu2GHvh04mEAYTTgh60HoxSa+LdhW0+A==",
//		"startX" : 126.938145, //position.coords.longitude,
//		"startY" : 37.470469, //position.coords.latitude,
//		"endX" : 127.068397,
//		"endY" : 37.498429,
//		"numOfRows" : "999",
//		"pageNo" : "1"
//			}, 
//			function(data, xhr) {
//				var msg = data.getElementsByTagName("headerCd")[0].childNodes[0].nodeValue;				
//				if (msg === "4") {
//					// No result
//				} else if (msg === "0"){
//					// Success
//					root = data;					
//				}
//			}, function(data, xhr) {
//				toastPopup.openPopup("API를 불러오는데 실패하였습니다.", true);
//			});
		
		if(flag == 0){
			showPathList(data);	
			tau.changePage("#showRoute");	
		}

}
