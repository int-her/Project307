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
	id.innerHTML = "";
	var x = data.getElementsByTagName("itemList");
	
	for (var i = 0; i < x.length; ++i) {
		id.innerHTML += "<li>" x[i].getElementsByTagName("pathList")[0].childNodes[0].nodevalue + "</li>";
	}
	
}

ROUTE.prototype.findway = function () {
//function findWay(position) {
	tau.changePage("#processing");

	rest.get('http://ws.bus.go.kr/api/rest/pathinfo/getPathInfoByBusNSub',
			null,
			{
		"ServiceKey" : "4we1Svife1ANzIwfRlMm4LIKHZI6BiBr2+8+TMz1QkiwBNUTmqJImecu2GHvh04mEAYTTgh60HoxSa+LdhW0+A==",
		"startX" : 126.938145, //position.coords.longitude,
		"startY" : 37.470469, //position.coords.latitude,
		"endX" : 127.068397,
		"endY" : 37.498429,
		"numOfRows" : "999",
		"pageNo" : "1"
			}, 
			function(data, xhr) {
				var msg = data.getElementsByTagName("headerCd")[0].childNodes[0].nodeValue;				
				if (msg === "4") {
					// No result
					toastPopup.openCheckPopup("버스&지하철 경로가 없습니다", true);
				} else if (msg === "0"){
					// Success
					showPathList(data);	
					tau.changePage("#showRoute");	
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
//					flag = 1;
//					toastPopup.openCheckPopup("버스 경로가 없습니다", true);
//				} else if (msg === "0"){
//					// Success
//					retData = retData + data;						
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
//					flag = 1;
//					toastPopup.openCheckPopup("지하철 경로가 없습니다", true);
//				} else if (msg === "0"){
//					// Success
//					retData = retData + data;						
//				}
//			}, function(data, xhr) {
//				toastPopup.openPopup("API를 불러오는데 실패하였습니다.", true);
//			});
//	
//	if(flag == 0){
//			var x = data.getElementsByTagName("itemList");
//			toastPopup.openPopup(x.length);
//		}
}

/**
 * 
 */
function failtoGetGPS(error) {
	switch (error.code) {
	case error.PERMISSION_DENIED:
		toastPopup.openCheckPopup("GPS 권한을 허용해주세요.", true);
		break;
	case error.POSITION_UNAVAILABLE:
		toastPopup.openCheckPopup("연결된 디바이스의 GPS를 켜주세요.", true);
		break;
	case error.TIMEOUT:
		toastPopup.openPopup("GPS 요청 시간이 초과되었습니다.", true);
		break;
	case error.UNKNOWN_ERROR:
		toastPopup.openPopup("알 수없는 오류가 발생했습니다.", true);
		break;
	}
}

/**
 * GPS를 이용하여 현재 위치를 받아오고 경로 안내 출발지에 대입한다.
 */
/* ROUTE.prototype.getRouteByGps = function () {
	if (navigator.geolocation) {
		tau.changePage("#processing");
		navigator.geolocation.getCurrentPosition(findWay, failtoGetGPS, {
			timeout : 20000
		});
	} else {
		toastPopup.openPopup("GPS를 지원하지 않는 기기입니다.");
	}
};*/