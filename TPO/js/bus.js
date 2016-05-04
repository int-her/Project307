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
						toastPopup.openPopup("toastGraphicPopup", "노선 번호를 찾지 못하였습니다.");
					} else if (msg === "0"){
						/** Success */
						createBusStationList(data);
						document.getElementById('busNumber').innerHTML = data.getElementsByTagName("itemList")[0].getElementsByTagName("busRouteNm")[0].childNodes[0].nodeValue; 						
					}
				}, function(data, xhr) {
					toastPopup.openPopup("toastPopup", "API를 불러오는데 실패하였습니다.");
				});		
	};
	
	busNumber.busId = function(strSch){
		tau.changePage("#processing");
		/**
		 *  요청변수(Request Parameter)
			strSrch - 검색할 노선번호
			
			출력결과(Response Element)
			busRouteId	string - 노선 ID
      		busRouteNm string - 노선명
      		length string - 노선 길이 (Km)
      		routeType string - 노선 유형 (1:공항, 3:간선, 4:지선, 5:순환, 6:광역, 7:인천, 8:경기, 9:폐지, 0:공용)
      		stStationNm string - 기점
      		edStationNm string - 종점
      		term string - 배차간격 (분)
      		lastBusYn string - 막차운행여부
      		firstBusTm string - 금일첫차시간
      		lastBusTm string - 금일막차시간
      		firstLowTm string - 금일저상첫차시간
      		lastLowTm string - 금일저상막차시간
      		corpNm string - 운수사명
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
						toastPopup.openPopup("toastGraphicPopup", "노선 번호를 찾지 못하였습니다.");
					} else if (msg === "0"){
						/** Success */
						busIdToStation(data.getElementsByTagName("itemList")[0].getElementsByTagName("busRouteId")[0].childNodes[0].nodeValue); 
						tau.changePage("#busNumberStationList");						
					}
				}, function(data, xhr) {
					toastPopup.openPopup("toastPopup", "API를 불러오는데 실패하였습니다.");
				});
	};
	

	/**
	 * API 에서 받아온 data를 파싱하여 도착 예상 시간을 보여주는 리스트를 만든다.
	 * @param {String} API 에서 받아온 XML String
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
	 * arsID 에 해당하는 정류장에 대한 버스 도착 예상시간을 보여준다.
	 * @param {number} arsID 정류장 고유 번호
	 */
	bus.showBusArrivalTime = function(arsId) {
		tau.changePage("#processing");
		/**
		 *  고유번호별 정류소 항목 조회(getStationByUid)
		 *  [Request Parameter]
		 *  arsId - 정류소 고유번호
		 *  
		 *  [Response Element]
		 *  stId - 정류소 ID
		 *  stNm - 정류소명
		 *  arsId - 정류소 고유번호
		 *  busRouteId - 노선ID
		 *  rtNm - 노선명
		 *  gpsX - 정류소 좌표X (WGS84)
		 *  gpsY - 정류소 좌표Y (WGS84)
		 *  stationTp - 정류소타입 (0:공용, 1:일반형 시내/농어촌버스, 2:좌석형 시내/농어촌버스, 3:직행좌석형 시내/농어촌버스, 4:일반형 시외버스, 5:좌석형 시외버스, 6:고속형 시외버스, 7:마을버스)
		 *  firstTm - 첫차시간
		 *  lastTm - 막차시간
		 *  term - 배차간격 (분)
		 *  routeType - 노선유형 (1:공항, 3:간선, 4:지선, 5:순환, 6:광역, 7:인천, 8:경기, 9:폐지, 0:공용)
		 *  nextBus - 막차운행여부 (N:막차아님, Y:막차)
		 *  staOrd - 요청정류소순번
		 *  vehId1 - 첫번째도착예정버스ID
		 *  plainNo1 - 첫번째도착예정차량번호
		 *  sectOrd1 - 첫번째도착예정버스의 현재구간 순번
		 *  stationNm1 - 첫번째도착예정버스의 최종 정류소명
		 *  traTime1 - 첫번째도착예정버스의 여행시간
		 *  traSpd1 - 첫번째도착예정버스의 여행속도 (Km/h)
		 *  isArrive1 - 첫번째도착예정버스의 최종 정류소 도착출발여부 (0:운행중, 1:도착)
		 *  isLast1 - 첫번째도착예정버스의 막차여부 (0:막차아님, 1:막차)
		 *  busType1 - 첫번째도착예정버스의 차량유형 (0:일반버스, 1:저상버스, 2:굴절버스)
		 *  vehId2 - 두번째도착예정버스ID
		 *  plainNo2 - 두번째도착예정차량번호
		 *  sectOrd2 - 두번째도착예정버스의 현재구간 순번
		 *  stationNm2 - 두번째도착예정버스의 최종 정류소명
		 *  traTime2 - 두번째도착예정버스의 여행시간
		 *  traSpd2 - 두번째도착예정버스의 여행속도
		 *  isArrive2 - 두번째도착예정버스의 최종 정류소 도착출발여부 (0:운행중, 1:도착)
		 *  isLast2 - 두번째도착예정버스의 막차여부 (0:막차아님, 1:막차)
		 *  busType2 - 두번째도착예정버스의 차량유형 (0:일반버스, 1:저상버스, 2:굴절버스)
		 *  adirection - 방향
		 *  arrmsg1 - 첫번째도착예정버스의 도착정보메시지
		 *  arrmsg2 - 두번째도착예정버스의 도착정보메시지
		 *  arrmsgSec1 - 첫번째도착예정버스의 도착정보메시지
		 *  arrmsgSec2 - 두번째도착예정버스의 도착정보메시지
		 *  isFullFlag1 - 첫번째도착예정버스의 만차여부 (0 : 만차아님. 1 : 만차)
		 *  isFullFlag2 - 두번째도착예정버스의 만차여부 (0 : 만차아님. 1 : 만차)
		 *  nxtStn - 다음정류장순번
		 *  posX - 정류소 좌표X (GRS80)
		 *  posY - 정류소 좌표Y (GRS80)
		 *  rerdieDiv1 - 첫번째도착예정버스의 재차구분
		 *  rerdieDiv2 - 두번째도착예정버스의 재차구분
		 *  rerideNum1 - 첫번째도착예정버스의 재차인원
		 *  rerideNum2 - 두번째도착예정버스의 재차인원
		 *  sectNm - 구간명
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
						// No result
						window.history.go(-2);
						toastPopup.openPopup("toastGraphicPopup", "정류소 ID를 찾지 못하였습니다.");
					} else if (msg === "0"){
						// Success
						createBusArrivalTimeList(data);
						document.getElementById('stationName').innerHTML = data.getElementsByTagName("itemList")[0].getElementsByTagName("stNm")[0].childNodes[0].nodeValue; 
						tau.changePage("#busArrivalTime");						
					}
				}, function(data, xhr) {
					toastPopup.openPopup("toastPopup", "API를 불러오는데 실패하였습니다.");
				});
	};
	
	/**
	 *  버스 정류장 리스트에서 클릭 시 showBusArrivalTime 함수를 불러와 그 정류장에서의 버스 도착 예정 시간을 보여준다.
	 */
	function clickList(event)
	{
		var target = event.target;
		if (target.classList.contains('li-bus-station') || target.classList.contains('li-bus-station-a')) {
			bus.showBusArrivalTime(target.id);
		}
	}
	
	/**
	 * li-bus-station 클래스를 가진 list item 에 대해 클릭 이벤트를 추가한다.
	 */
	function addListEvent() {
		var stationList = document.getElementsByClassName("li-bus-station"),
		i;

		for (i = 0; i < stationList.length; i++) {
			stationList[i].addEventListener("click", clickList);
		}
	}
	
	/**
	 * 버스 정류장 리스트를 만든다. 현재 위치에 대한 거리, 정류장 고유번호를 부가적으로 표시해준다.
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
	 * GPS 받아오기에 성공했을 시 1km 반경 내의 주변 정류소를 API를 통하여 읽어오고 리스트를 만든다.
	 */
	function succeedtoGetGPS(position) {
		/**
		 *  좌표 기반 근접 정류소 목록 조회(getStationByPos)
		 *  [Request Parameter]
		 *  tmX - 기준 위치 X(WGS84)
		 *  tmY - 기준 위치 Y(WGS84)
		 *  radius - 검색 반경 (0~1500m)
		 *  
		 *  [Response Element]
		 *  stationId - 정류소 ID
		 *  stationNm - 정류소명
		 *  gpsX - 정류소 좌표X (WGS84)
		 *  gpsY - 정류소 좌표Y (WGS84)
		 *  arsId - 정류소 고유 번호
		 *  dist - 거리
		 *  posX - 정류소 좌표X (GRS80)
		 *  posY - 정류소 좌표Y (GRS80)
		 *  stationTp - 정류소 타입 (0:공용, 1:일반형 시내/농어촌버스, 2:좌석형 시내/농어촌버스, 3:직행좌석형 시내/농어촌버스, 4:일반형 시외버스, 5:좌석형 시외버스, 6:고속형 시외버스, 7:마을버스)
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
						// No result
						toastPopup.openPopup("toastPopup", "주변 정류소를 조회한 결과가 없습니다.");
					} else if (msg === "0"){
						// Success
						createStationList(data);
						tau.changePage("#surroundingBusStation");						
					}
				}, function(data, xhr) {
					toastPopup.openPopup("toastPopup", "API를 불러오는데 실패하였습니다.");
				});
	}

	/**
	 * 
	 */
	function failtoGetGPS(error) {
		switch (error.code) {
		case error.PERMISSION_DENIED:
			toastPopup.openPopup("toastPopup", "GPS 권한이 거부되었습니다.");
			break;
		case error.POSITION_UNAVAILABLE:
			toastPopup.openPopup("toastPopup", "연결된 디바이스의 GPS를 켜주세요.");
			break;
		case error.TIMEOUT:
			toastPopup.openPopup("toastPopup", "GPS 요청 시간이 초과되었습니다.");
			break;
		case error.UNKNOWN_ERROR:
			toastPopup.openPopup("toastPopup", "알 수없는 오류가 발생했습니다.");
			break;
		}
	}

	/**
	 * GPS를 이용하여 1km 반경 내의 주변 정류소를 조회한다.
	 */
	bus.showSurroundingStationsByGps = function () {
		if (navigator.geolocation) {
			toastPopup.openPopup("toastPopup", "GPS로 주변 정류소를 조회하는 중입니다. 잠시만 기다려주세요.");
			navigator.geolocation.getCurrentPosition(succeedtoGetGPS, failtoGetGPS, {
				maximumAge : 10000, timeout : 20000
			});
		} else {
			toastPopup.openPopup("toastPopup", "GPS를 지원하지 않는 기기입니다.");
		}
	};
	
	
	return bus;
}());
