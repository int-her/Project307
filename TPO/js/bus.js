/*global tau, toastPopup, rest */
var bus = (function() {
	var bus = {};
	
	function createBusStationList(data){
		var id = document.getElementById("lvBusNumber");
		id.innerHTML = "";
		var x = data.getElementsByTagName("itemList");
		for (var i = 0; i < x.length; ++i) {
			if (i >= 20) {
				break;
			}
			id.innerHTML += "<li id=" + x[i].getElementsByTagName("stationNm")[0].childNodes[0].nodeValue + 
							">" + x[i].getElementsByTagName("stationNm")[0].childNodes[0].nodeValue + "</li>";
		}
		
	};
	
	function routeIdtoStation(busRouteId){
		tau.changePage("#processing");
		
		rest.get('http://ws.bus.go.kr/api/rest/busRouteInfo/getStaionByRoute',
				null,
				{
					"ServiceKey" : "DELETED",
					"busRouteId" : busRouteId
				},
				function(data, xhr) {
					var msg = data.getElementsByTagName("headerCd")[0].childNodes[0].nodeValue;				
					if (msg === "4") {
						/** No result */
						window.history.go(-2);
						toastPopup.openPopup("toastGraphicPopup", "?�선 번호�? 찾�? 못하?�?�니??.");
					} else if (msg === "0"){
						/** Success */
						createBusStationList(data);
						document.getElementById('busNumber').innerHTML = data.getElementsByTagName("itemList")[0].getElementsByTagName("busRouteNm")[0].childNodes[0].nodeValue; 						
					}
				}, function(data, xhr) {
					toastPopup.openPopup("toastPopup", "API�? 불러?�는?? ?�패?��??�니??.");
				});			
	};
	
	busNumber.busId = function(strSch){
		tau.changePage("#processing");
		/**
		 *  ?�청변??(Request Parameter)
			strSrch - 검?�할 ?�선번호
			
			출력결과(Response Element)
			busRouteId	string - ?�선 ID
      		busRouteNm string - ?�선�?
      		length string - ?�선 길이 (Km)
      		routeType string - ?�선 ?�형 (1:공항, 3:간선, 4:지??, 5:?�환, 6:광역, 7:?�천, 8:경기, 9:?��?, 0:공용)
      		stStationNm string - 기점
      		edStationNm string - 종점
      		term string - 배차간격 (�?)
      		lastBusYn string - 막차?�행?��?
      		firstBusTm string - 금일첫차?�간
      		lastBusTm string - 금일막차?�간
      		firstLowTm string - 금일?�?�첫차시�?
      		lastLowTm string - 금일?�?�막차시�?
      		corpNm string - ?�수?�명
		 */
		rest.get('http://ws.bus.go.kr/api/rest/busRouteInfo/getBusRouteList',
				null,
				{
					"ServiceKey" : "DELETED",
					"strSrch" : strSch
				}, 
				function(data, xhr) {
					var msg = data.getElementsByTagName("headerCd")[0].childNodes[0].nodeValue;				
					if (msg === "4") {
						/** No result */
						window.history.go(-2);
						toastPopup.openPopup("toastGraphicPopup", "?�선 번호�? 찾�? 못하?�?�니??.");
					} else if (msg === "0"){
						/** Success */
						busIdToStation(data.getElementsByTagName("itemList")[0].getElementsByTagName("busRouteId")[0].childNodes[0].nodeValue); 
						tau.changePage("#busNumberStationList");						
					}
				}, function(data, xhr) {
					toastPopup.openPopup("toastPopup", "API�? 불러?�는?? ?�패?��??�니??.");
				});
	};
	

	/**
	 * API ?�서 받아?? data�? ?�싱?�여 ?�착 ?�상 ?�간?? 보여주는 리스?��? 만든??.
	 * @param {String} API ?�서 받아?? XML String
	 */
	function createBusArrivalTimeList(data) {
		var lv = document.getElementById('lvBusArrivalTime');
		lv.innerHTML = "";
		var x = data.getElementsByTagName("itemList");
		for (var i = 0; i < x.length; ++i) {
			if (i >= 20) {
				break;
			}
			lv.innerHTML += "<li class='li-has-multiline' id=" + x[i].getElementsByTagName("rtNm")[0].childNodes[0].nodeValue + 
							">" + x[i].getElementsByTagName("rtNm")[0].childNodes[0].nodeValue + 
							"<span class='ui-li-sub-text li-text-sub'>" + 
							x[i].getElementsByTagName("arrmsg1")[0].childNodes[0].nodeValue +
							"</span></li>";
		}
	}
	
	/**
	 * arsID ?? ?�당?�는 ?�류?�에 ?�?? 버스 ?�착 ?�상?�간?? 보여준??.
	 * @param {number} arsID ?�류?? 고유 번호
	 */
	bus.showBusArrivalTime = function(arsId) {
		tau.changePage("#processing");
		/**
		 *  고유번호�? ?�류?? ??�� 조회(getStationByUid)
		 *  [Request Parameter]
		 *  arsId - ?�류?? 고유번호
		 *  
		 *  [Response Element]
		 *  stId - ?�류?? ID
		 *  stNm - ?�류?�명
		 *  arsId - ?�류?? 고유번호
		 *  busRouteId - ?�선ID
		 *  rtNm - ?�선�?
		 *  gpsX - ?�류?? 좌표X (WGS84)
		 *  gpsY - ?�류?? 좌표Y (WGS84)
		 *  stationTp - ?�류?��??? (0:공용, 1:?�반?? ?�내/?�어촌버??, 2:좌석?? ?�내/?�어촌버??, 3:직행좌석?? ?�내/?�어촌버??, 4:?�반?? ?�외버스, 5:좌석?? ?�외버스, 6:고속?? ?�외버스, 7:마을버스)
		 *  firstTm - 첫차?�간
		 *  lastTm - 막차?�간
		 *  term - 배차간격 (�?)
		 *  routeType - ?�선?�형 (1:공항, 3:간선, 4:지??, 5:?�환, 6:광역, 7:?�천, 8:경기, 9:?��?, 0:공용)
		 *  nextBus - 막차?�행?��? (N:막차?�님, Y:막차)
		 *  staOrd - ?�청?�류?�순�?
		 *  vehId1 - 첫번째도착예?�버?�ID
		 *  plainNo1 - 첫번째도착예?�차?�번??
		 *  sectOrd1 - 첫번째도착예?�버?�의 ?�재구간 ?�번
		 *  stationNm1 - 첫번째도착예?�버?�의 최종 ?�류?�명
		 *  traTime1 - 첫번째도착예?�버?�의 ?�행?�간
		 *  traSpd1 - 첫번째도착예?�버?�의 ?�행?�도 (Km/h)
		 *  isArrive1 - 첫번째도착예?�버?�의 최종 ?�류?? ?�착출발?��? (0:?�행�?, 1:?�착)
		 *  isLast1 - 첫번째도착예?�버?�의 막차?��? (0:막차?�님, 1:막차)
		 *  busType1 - 첫번째도착예?�버?�의 차량?�형 (0:?�반버스, 1:?�?�버??, 2:굴절버스)
		 *  vehId2 - ?�번째도착예?�버?�ID
		 *  plainNo2 - ?�번째도착예?�차?�번??
		 *  sectOrd2 - ?�번째도착예?�버?�의 ?�재구간 ?�번
		 *  stationNm2 - ?�번째도착예?�버?�의 최종 ?�류?�명
		 *  traTime2 - ?�번째도착예?�버?�의 ?�행?�간
		 *  traSpd2 - ?�번째도착예?�버?�의 ?�행?�도
		 *  isArrive2 - ?�번째도착예?�버?�의 최종 ?�류?? ?�착출발?��? (0:?�행�?, 1:?�착)
		 *  isLast2 - ?�번째도착예?�버?�의 막차?��? (0:막차?�님, 1:막차)
		 *  busType2 - ?�번째도착예?�버?�의 차량?�형 (0:?�반버스, 1:?�?�버??, 2:굴절버스)
		 *  adirection - 방향
		 *  arrmsg1 - 첫번째도착예?�버?�의 ?�착?�보메시지
		 *  arrmsg2 - ?�번째도착예?�버?�의 ?�착?�보메시지
		 *  arrmsgSec1 - 첫번째도착예?�버?�의 ?�착?�보메시지
		 *  arrmsgSec2 - ?�번째도착예?�버?�의 ?�착?�보메시지
		 *  isFullFlag1 - 첫번째도착예?�버?�의 만차?��? (0 : 만차?�님. 1 : 만차)
		 *  isFullFlag2 - ?�번째도착예?�버?�의 만차?��? (0 : 만차?�님. 1 : 만차)
		 *  nxtStn - ?�음?�류?�순�?
		 *  posX - ?�류?? 좌표X (GRS80)
		 *  posY - ?�류?? 좌표Y (GRS80)
		 *  rerdieDiv1 - 첫번째도착예?�버?�의 ?�차구분
		 *  rerdieDiv2 - ?�번째도착예?�버?�의 ?�차구분
		 *  rerideNum1 - 첫번째도착예?�버?�의 ?�차?�원
		 *  rerideNum2 - ?�번째도착예?�버?�의 ?�차?�원
		 *  sectNm - 구간�?
		 */
		rest.get('http://ws.bus.go.kr/api/rest/stationinfo/getStationByUid',
				null,
				{
					"ServiceKey" : "DELETED",
					"arsId" : arsId
				}, 
				function(data, xhr) {
					var msg = data.getElementsByTagName("headerCd")[0].childNodes[0].nodeValue;				
					if (msg === "4") {
						/** No result */
						window.history.go(-2);
						toastPopup.openPopup("toastGraphicPopup", "?�류?? ID�? 찾�? 못하?�?�니??.");
					} else if (msg === "0"){
						/** Success */
						createBusArrivalTimeList(data);
						document.getElementById('stationName').innerHTML = data.getElementsByTagName("items")[0].getElementsByTagName("stNm")[0].childNodes[0].nodeValue; 
						tau.changePage("#busArrivalTime");						
					}
				}, function(data, xhr) {
					toastPopup.openPopup("toastPopup", "API�? 불러?�는?? ?�패?��??�니??.");
				});
	};
	
	/**
	 *  버스 ?�류?? 리스?�에?? ?�릭 ?? showBusArrivalTime ?�수�? 불러?� �? ?�류?�에?�의 버스 ?�착 ?�정 ?�간?? 보여준??.
	 */
	function clickList(event)
	{
		var target = event.target;
		if (target.classList.contains('li-bus-station') || target.classList.contains('li-bus-station-a')) {
			bus.showBusArrivalTime(target.id);
		}
	}
	
	/**
	 * li-bus-station ?�래?��? 가�? list item ?? ?�?? ?�릭 ?�벤?��? 추�??�다.
	 */
	function addListEvent() {
		var stationList = document.getElementsByClassName("li-bus-station"),
		i;

		for (i = 0; i < stationList.length; i++) {
			stationList[i].addEventListener("click", clickList);
		}
	}
	
	/**
	 * 버스 ?�류?? 리스?��? 만든??. ?�재 ?�치?? ?�?? 거리, ?�류?? 고유번호�? 부가?�으�? ?�시?��???.
	 */
	function createStationList(data) {
		var lv = document.getElementById('lvBusStation');
		lv.innerHTML = "";
		var x = data.getElementsByTagName("itemList");
		for (var i = 0; i < x.length; ++i) {
			if (i >= 20) {
				break;
			}
			lv.innerHTML += "<li class='li-has-multiline li-bus-station' id=" + x[i].getElementsByTagName("arsId")[0].childNodes[0].nodeValue + 
							"><div class='ui-marquee ui-marquee-gradient'><a class='li-bus-station-a' id=" + 
							x[i].getElementsByTagName("arsId")[0].childNodes[0].nodeValue + 
							">" + x[i].getElementsByTagName("stationNm")[0].childNodes[0].nodeValue + 
							"</a></div><div class='ui-li-sub-text li-text-sub'>" + 
							x[i].getElementsByTagName("dist")[0].childNodes[0].nodeValue + "m" +
							"(" + x[i].getElementsByTagName("arsId")[0].childNodes[0].nodeValue + ")" +
							"</div></li>";
		}
		addListEvent();
	}
	
	/**
	 * GPS 받아?�기?? ?�공?�을 ?? 1km 반경 ?�의 주�? ?�류?��? API�? ?�하?? ?�어?�고 리스?��? 만든??.
	 */
	function succeedtoGetGPS(position) {
		/**
		 *  좌표 기반 근접 ?�류?? 목록 조회(getStationByPos)
		 *  [Request Parameter]
		 *  tmX - 기�? ?�치 X(WGS84)
		 *  tmY - 기�? ?�치 Y(WGS84)
		 *  radius - 검?? 반경 (0~1500m)
		 *  
		 *  [Response Element]
		 *  stationId - ?�류?? ID
		 *  stationNm - ?�류?�명
		 *  gpsX - ?�류?? 좌표X (WGS84)
		 *  gpsY - ?�류?? 좌표Y (WGS84)
		 *  arsId - ?�류?? 고유 번호
		 *  dist - 거리
		 *  posX - ?�류?? 좌표X (GRS80)
		 *  posY - ?�류?? 좌표Y (GRS80)
		 *  stationTp - ?�류?? ?�?? (0:공용, 1:?�반?? ?�내/?�어촌버??, 2:좌석?? ?�내/?�어촌버??, 3:직행좌석?? ?�내/?�어촌버??, 4:?�반?? ?�외버스, 5:좌석?? ?�외버스, 6:고속?? ?�외버스, 7:마을버스)
		 */
		rest.get('http://ws.bus.go.kr/api/rest/stationinfo/getStationByPos',
				null,
				{
					"ServiceKey" : "DELETED",
					"tmX" : position.coords.longitude,
					"tmY" : position.coords.latitude,
					"radius" : "1000",
					"numOfRows" : "999",
					"pageNo" : "1"
				}, 
				function(data, xhr) {
					var msg = data.getElementsByTagName("headerCd")[0].childNodes[0].nodeValue;				
					if (msg === "4") {
						/** No result */
						toastPopup.openPopup("toastPopup", "주�? ?�류?��? 조회?? 결과가 ?�습?�다.");
					} else if (msg === "0"){
						/** Success */
						createStationList(data);
						tau.changePage("#surroundingBusStation");						
					}
				}, function(data, xhr) {
					toastPopup.openPopup("toastPopup", "API�? 불러?�는?? ?�패?��??�니??.");
				});
	}

	/**
	 * 
	 */
	function failtoGetGPS(error) {
		switch (error.code) {
		case error.PERMISSION_DENIED:
			toastPopup.openPopup("toastPopup", "GPS 권한?? 거�??�었?�니??.");
			break;
		case error.POSITION_UNAVAILABLE:
			toastPopup.openPopup("toastPopup", "?�결?? ?�바?�스?? GPS�? 켜주?�요.");
			break;
		case error.TIMEOUT:
			toastPopup.openPopup("toastPopup", "GPS ?�청 ?�간?? 초과?�었?�니??.");
			break;
		case error.UNKNOWN_ERROR:
			toastPopup.openPopup("toastPopup", "?? ?�없?? ?�류가 발생?�습?�다.");
			break;
		}
	}

	/**
	 * GPS�? ?�용?�여 1km 반경 ?�의 주�? ?�류?��? 조회?�다.
	 */
	bus.showSurroundingStationsByGps = function () {
		if (navigator.geolocation) {
			toastPopup.openPopup("toastPopup", "GPS�? 주�? ?�류?��? 조회?�는 중입?�다. ?�시�? 기다?�주?�요.");
			navigator.geolocation.getCurrentPosition(succeedtoGetGPS, failtoGetGPS, {
				maximumAge : 10000, timeout : 20000
			});
		} else {
			toastPopup.openPopup("toastPopup", "GPS�? 지?�하지 ?�는 기기?�니??.");
		}
	};
	
	return bus;
}());
