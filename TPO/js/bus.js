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
						toastPopup.openPopup("toastGraphicPopup", "?ธ์  ๋ฒํธ๋ฅ? ์ฐพ์? ๋ชปํ??ต๋??.");
					} else if (msg === "0"){
						/** Success */
						createBusStationList(data);
						document.getElementById('busNumber').innerHTML = data.getElementsByTagName("itemList")[0].getElementsByTagName("busRouteNm")[0].childNodes[0].nodeValue; 						
					}
				}, function(data, xhr) {
					toastPopup.openPopup("toastPopup", "API๋ฅ? ๋ถ๋ฌ?ค๋?? ?คํจ?์??ต๋??.");
				});			
	};
	
	busNumber.busId = function(strSch){
		tau.changePage("#processing");
		/**
		 *  ?์ฒญ๋ณ??(Request Parameter)
			strSrch - ๊ฒ?ํ  ?ธ์ ๋ฒํธ
			
			์ถ๋ ฅ๊ฒฐ๊ณผ(Response Element)
			busRouteId	string - ?ธ์  ID
      		busRouteNm string - ?ธ์ ๋ช?
      		length string - ?ธ์  ๊ธธ์ด (Km)
      		routeType string - ?ธ์  ? ํ (1:๊ณตํญ, 3:๊ฐ์ , 4:์ง??, 5:?ํ, 6:๊ด์ญ, 7:?ธ์ฒ, 8:๊ฒฝ๊ธฐ, 9:?์?, 0:๊ณต์ฉ)
      		stStationNm string - ๊ธฐ์ 
      		edStationNm string - ์ข์ 
      		term string - ๋ฐฐ์ฐจ๊ฐ๊ฒฉ (๋ถ?)
      		lastBusYn string - ๋ง์ฐจ?ดํ?ฌ๋?
      		firstBusTm string - ๊ธ์ผ์ฒซ์ฐจ?๊ฐ
      		lastBusTm string - ๊ธ์ผ๋ง์ฐจ?๊ฐ
      		firstLowTm string - ๊ธ์ผ??์ฒซ์ฐจ์๊ฐ?
      		lastLowTm string - ๊ธ์ผ??๋ง์ฐจ์๊ฐ?
      		corpNm string - ?ด์?ฌ๋ช
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
						toastPopup.openPopup("toastGraphicPopup", "?ธ์  ๋ฒํธ๋ฅ? ์ฐพ์? ๋ชปํ??ต๋??.");
					} else if (msg === "0"){
						/** Success */
						busIdToStation(data.getElementsByTagName("itemList")[0].getElementsByTagName("busRouteId")[0].childNodes[0].nodeValue); 
						tau.changePage("#busNumberStationList");						
					}
				}, function(data, xhr) {
					toastPopup.openPopup("toastPopup", "API๋ฅ? ๋ถ๋ฌ?ค๋?? ?คํจ?์??ต๋??.");
				});
	};
	

	/**
	 * API ?์ ๋ฐ์?? data๋ฅ? ?์ฑ?์ฌ ?์ฐฉ ?์ ?๊ฐ?? ๋ณด์ฌ์ฃผ๋ ๋ฆฌ์ค?ธ๋? ๋ง๋ ??.
	 * @param {String} API ?์ ๋ฐ์?? XML String
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
	 * arsID ?? ?ด๋น?๋ ?๋ฅ?ฅ์ ??? ๋ฒ์ค ?์ฐฉ ?์?๊ฐ?? ๋ณด์ฌ์ค??.
	 * @param {number} arsID ?๋ฅ?? ๊ณ ์  ๋ฒํธ
	 */
	bus.showBusArrivalTime = function(arsId) {
		tau.changePage("#processing");
		/**
		 *  ๊ณ ์ ๋ฒํธ๋ณ? ?๋ฅ?? ??ชฉ ์กฐํ(getStationByUid)
		 *  [Request Parameter]
		 *  arsId - ?๋ฅ?? ๊ณ ์ ๋ฒํธ
		 *  
		 *  [Response Element]
		 *  stId - ?๋ฅ?? ID
		 *  stNm - ?๋ฅ?๋ช
		 *  arsId - ?๋ฅ?? ๊ณ ์ ๋ฒํธ
		 *  busRouteId - ?ธ์ ID
		 *  rtNm - ?ธ์ ๋ช?
		 *  gpsX - ?๋ฅ?? ์ขํX (WGS84)
		 *  gpsY - ?๋ฅ?? ์ขํY (WGS84)
		 *  stationTp - ?๋ฅ?ํ??? (0:๊ณต์ฉ, 1:?ผ๋ฐ?? ?๋ด/?์ด์ด๋ฒ??, 2:์ข์?? ?๋ด/?์ด์ด๋ฒ??, 3:์งํ์ข์?? ?๋ด/?์ด์ด๋ฒ??, 4:?ผ๋ฐ?? ?์ธ๋ฒ์ค, 5:์ข์?? ?์ธ๋ฒ์ค, 6:๊ณ ์?? ?์ธ๋ฒ์ค, 7:๋ง์๋ฒ์ค)
		 *  firstTm - ์ฒซ์ฐจ?๊ฐ
		 *  lastTm - ๋ง์ฐจ?๊ฐ
		 *  term - ๋ฐฐ์ฐจ๊ฐ๊ฒฉ (๋ถ?)
		 *  routeType - ?ธ์ ? ํ (1:๊ณตํญ, 3:๊ฐ์ , 4:์ง??, 5:?ํ, 6:๊ด์ญ, 7:?ธ์ฒ, 8:๊ฒฝ๊ธฐ, 9:?์?, 0:๊ณต์ฉ)
		 *  nextBus - ๋ง์ฐจ?ดํ?ฌ๋? (N:๋ง์ฐจ?๋, Y:๋ง์ฐจ)
		 *  staOrd - ?์ฒญ?๋ฅ?์๋ฒ?
		 *  vehId1 - ์ฒซ๋ฒ์งธ๋์ฐฉ์?๋ฒ?คID
		 *  plainNo1 - ์ฒซ๋ฒ์งธ๋์ฐฉ์?์ฐจ?๋ฒ??
		 *  sectOrd1 - ์ฒซ๋ฒ์งธ๋์ฐฉ์?๋ฒ?ค์ ?์ฌ๊ตฌ๊ฐ ?๋ฒ
		 *  stationNm1 - ์ฒซ๋ฒ์งธ๋์ฐฉ์?๋ฒ?ค์ ์ต์ข ?๋ฅ?๋ช
		 *  traTime1 - ์ฒซ๋ฒ์งธ๋์ฐฉ์?๋ฒ?ค์ ?ฌํ?๊ฐ
		 *  traSpd1 - ์ฒซ๋ฒ์งธ๋์ฐฉ์?๋ฒ?ค์ ?ฌํ?๋ (Km/h)
		 *  isArrive1 - ์ฒซ๋ฒ์งธ๋์ฐฉ์?๋ฒ?ค์ ์ต์ข ?๋ฅ?? ?์ฐฉ์ถ๋ฐ?ฌ๋? (0:?ดํ์ค?, 1:?์ฐฉ)
		 *  isLast1 - ์ฒซ๋ฒ์งธ๋์ฐฉ์?๋ฒ?ค์ ๋ง์ฐจ?ฌ๋? (0:๋ง์ฐจ?๋, 1:๋ง์ฐจ)
		 *  busType1 - ์ฒซ๋ฒ์งธ๋์ฐฉ์?๋ฒ?ค์ ์ฐจ๋? ํ (0:?ผ๋ฐ๋ฒ์ค, 1:??๋ฒ??, 2:๊ตด์ ๋ฒ์ค)
		 *  vehId2 - ?๋ฒ์งธ๋์ฐฉ์?๋ฒ?คID
		 *  plainNo2 - ?๋ฒ์งธ๋์ฐฉ์?์ฐจ?๋ฒ??
		 *  sectOrd2 - ?๋ฒ์งธ๋์ฐฉ์?๋ฒ?ค์ ?์ฌ๊ตฌ๊ฐ ?๋ฒ
		 *  stationNm2 - ?๋ฒ์งธ๋์ฐฉ์?๋ฒ?ค์ ์ต์ข ?๋ฅ?๋ช
		 *  traTime2 - ?๋ฒ์งธ๋์ฐฉ์?๋ฒ?ค์ ?ฌํ?๊ฐ
		 *  traSpd2 - ?๋ฒ์งธ๋์ฐฉ์?๋ฒ?ค์ ?ฌํ?๋
		 *  isArrive2 - ?๋ฒ์งธ๋์ฐฉ์?๋ฒ?ค์ ์ต์ข ?๋ฅ?? ?์ฐฉ์ถ๋ฐ?ฌ๋? (0:?ดํ์ค?, 1:?์ฐฉ)
		 *  isLast2 - ?๋ฒ์งธ๋์ฐฉ์?๋ฒ?ค์ ๋ง์ฐจ?ฌ๋? (0:๋ง์ฐจ?๋, 1:๋ง์ฐจ)
		 *  busType2 - ?๋ฒ์งธ๋์ฐฉ์?๋ฒ?ค์ ์ฐจ๋? ํ (0:?ผ๋ฐ๋ฒ์ค, 1:??๋ฒ??, 2:๊ตด์ ๋ฒ์ค)
		 *  adirection - ๋ฐฉํฅ
		 *  arrmsg1 - ์ฒซ๋ฒ์งธ๋์ฐฉ์?๋ฒ?ค์ ?์ฐฉ?๋ณด๋ฉ์์ง
		 *  arrmsg2 - ?๋ฒ์งธ๋์ฐฉ์?๋ฒ?ค์ ?์ฐฉ?๋ณด๋ฉ์์ง
		 *  arrmsgSec1 - ์ฒซ๋ฒ์งธ๋์ฐฉ์?๋ฒ?ค์ ?์ฐฉ?๋ณด๋ฉ์์ง
		 *  arrmsgSec2 - ?๋ฒ์งธ๋์ฐฉ์?๋ฒ?ค์ ?์ฐฉ?๋ณด๋ฉ์์ง
		 *  isFullFlag1 - ์ฒซ๋ฒ์งธ๋์ฐฉ์?๋ฒ?ค์ ๋ง์ฐจ?ฌ๋? (0 : ๋ง์ฐจ?๋. 1 : ๋ง์ฐจ)
		 *  isFullFlag2 - ?๋ฒ์งธ๋์ฐฉ์?๋ฒ?ค์ ๋ง์ฐจ?ฌ๋? (0 : ๋ง์ฐจ?๋. 1 : ๋ง์ฐจ)
		 *  nxtStn - ?ค์?๋ฅ?ฅ์๋ฒ?
		 *  posX - ?๋ฅ?? ์ขํX (GRS80)
		 *  posY - ?๋ฅ?? ์ขํY (GRS80)
		 *  rerdieDiv1 - ์ฒซ๋ฒ์งธ๋์ฐฉ์?๋ฒ?ค์ ?ฌ์ฐจ๊ตฌ๋ถ
		 *  rerdieDiv2 - ?๋ฒ์งธ๋์ฐฉ์?๋ฒ?ค์ ?ฌ์ฐจ๊ตฌ๋ถ
		 *  rerideNum1 - ์ฒซ๋ฒ์งธ๋์ฐฉ์?๋ฒ?ค์ ?ฌ์ฐจ?ธ์
		 *  rerideNum2 - ?๋ฒ์งธ๋์ฐฉ์?๋ฒ?ค์ ?ฌ์ฐจ?ธ์
		 *  sectNm - ๊ตฌ๊ฐ๋ช?
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
						toastPopup.openPopup("toastGraphicPopup", "?๋ฅ?? ID๋ฅ? ์ฐพ์? ๋ชปํ??ต๋??.");
					} else if (msg === "0"){
						/** Success */
						createBusArrivalTimeList(data);
						document.getElementById('stationName').innerHTML = data.getElementsByTagName("items")[0].getElementsByTagName("stNm")[0].childNodes[0].nodeValue; 
						tau.changePage("#busArrivalTime");						
					}
				}, function(data, xhr) {
					toastPopup.openPopup("toastPopup", "API๋ฅ? ๋ถ๋ฌ?ค๋?? ?คํจ?์??ต๋??.");
				});
	};
	
	/**
	 *  ๋ฒ์ค ?๋ฅ?? ๋ฆฌ์ค?ธ์?? ?ด๋ฆญ ?? showBusArrivalTime ?จ์๋ฅ? ๋ถ๋ฌ? ๊ท? ?๋ฅ?ฅ์?์ ๋ฒ์ค ?์ฐฉ ?์  ?๊ฐ?? ๋ณด์ฌ์ค??.
	 */
	function clickList(event)
	{
		var target = event.target;
		if (target.classList.contains('li-bus-station') || target.classList.contains('li-bus-station-a')) {
			bus.showBusArrivalTime(target.id);
		}
	}
	
	/**
	 * li-bus-station ?ด๋?ค๋? ๊ฐ์ง? list item ?? ??? ?ด๋ฆญ ?ด๋ฒค?ธ๋? ์ถ๊??๋ค.
	 */
	function addListEvent() {
		var stationList = document.getElementsByClassName("li-bus-station"),
		i;

		for (i = 0; i < stationList.length; i++) {
			stationList[i].addEventListener("click", clickList);
		}
	}
	
	/**
	 * ๋ฒ์ค ?๋ฅ?? ๋ฆฌ์ค?ธ๋? ๋ง๋ ??. ?์ฌ ?์น?? ??? ๊ฑฐ๋ฆฌ, ?๋ฅ?? ๊ณ ์ ๋ฒํธ๋ฅ? ๋ถ๊ฐ?์ผ๋ก? ?์?ด์???.
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
	 * GPS ๋ฐ์?ค๊ธฐ?? ?ฑ๊ณต?์ ?? 1km ๋ฐ๊ฒฝ ?ด์ ์ฃผ๋? ?๋ฅ?๋? API๋ฅ? ?ตํ?? ?ฝ์ด?ค๊ณ  ๋ฆฌ์ค?ธ๋? ๋ง๋ ??.
	 */
	function succeedtoGetGPS(position) {
		/**
		 *  ์ขํ ๊ธฐ๋ฐ ๊ทผ์  ?๋ฅ?? ๋ชฉ๋ก ์กฐํ(getStationByPos)
		 *  [Request Parameter]
		 *  tmX - ๊ธฐ์? ?์น X(WGS84)
		 *  tmY - ๊ธฐ์? ?์น Y(WGS84)
		 *  radius - ๊ฒ?? ๋ฐ๊ฒฝ (0~1500m)
		 *  
		 *  [Response Element]
		 *  stationId - ?๋ฅ?? ID
		 *  stationNm - ?๋ฅ?๋ช
		 *  gpsX - ?๋ฅ?? ์ขํX (WGS84)
		 *  gpsY - ?๋ฅ?? ์ขํY (WGS84)
		 *  arsId - ?๋ฅ?? ๊ณ ์  ๋ฒํธ
		 *  dist - ๊ฑฐ๋ฆฌ
		 *  posX - ?๋ฅ?? ์ขํX (GRS80)
		 *  posY - ?๋ฅ?? ์ขํY (GRS80)
		 *  stationTp - ?๋ฅ?? ??? (0:๊ณต์ฉ, 1:?ผ๋ฐ?? ?๋ด/?์ด์ด๋ฒ??, 2:์ข์?? ?๋ด/?์ด์ด๋ฒ??, 3:์งํ์ข์?? ?๋ด/?์ด์ด๋ฒ??, 4:?ผ๋ฐ?? ?์ธ๋ฒ์ค, 5:์ข์?? ?์ธ๋ฒ์ค, 6:๊ณ ์?? ?์ธ๋ฒ์ค, 7:๋ง์๋ฒ์ค)
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
						toastPopup.openPopup("toastPopup", "์ฃผ๋? ?๋ฅ?๋? ์กฐํ?? ๊ฒฐ๊ณผ๊ฐ ?์ต?๋ค.");
					} else if (msg === "0"){
						/** Success */
						createStationList(data);
						tau.changePage("#surroundingBusStation");						
					}
				}, function(data, xhr) {
					toastPopup.openPopup("toastPopup", "API๋ฅ? ๋ถ๋ฌ?ค๋?? ?คํจ?์??ต๋??.");
				});
	}

	/**
	 * 
	 */
	function failtoGetGPS(error) {
		switch (error.code) {
		case error.PERMISSION_DENIED:
			toastPopup.openPopup("toastPopup", "GPS ๊ถํ?? ๊ฑฐ๋??์?ต๋??.");
			break;
		case error.POSITION_UNAVAILABLE:
			toastPopup.openPopup("toastPopup", "?ฐ๊ฒฐ?? ?๋ฐ?ด์ค?? GPS๋ฅ? ์ผ์ฃผ?ธ์.");
			break;
		case error.TIMEOUT:
			toastPopup.openPopup("toastPopup", "GPS ?์ฒญ ?๊ฐ?? ์ด๊ณผ?์?ต๋??.");
			break;
		case error.UNKNOWN_ERROR:
			toastPopup.openPopup("toastPopup", "?? ?์?? ?ค๋ฅ๊ฐ ๋ฐ์?์ต?๋ค.");
			break;
		}
	}

	/**
	 * GPS๋ฅ? ?ด์ฉ?์ฌ 1km ๋ฐ๊ฒฝ ?ด์ ์ฃผ๋? ?๋ฅ?๋? ์กฐํ?๋ค.
	 */
	bus.showSurroundingStationsByGps = function () {
		if (navigator.geolocation) {
			toastPopup.openPopup("toastPopup", "GPS๋ก? ์ฃผ๋? ?๋ฅ?๋? ์กฐํ?๋ ์ค์?๋ค. ? ์๋ง? ๊ธฐ๋ค?ค์ฃผ?ธ์.");
			navigator.geolocation.getCurrentPosition(succeedtoGetGPS, failtoGetGPS, {
				maximumAge : 10000, timeout : 20000
			});
		} else {
			toastPopup.openPopup("toastPopup", "GPS๋ฅ? ์ง?ํ์ง ?๋ ๊ธฐ๊ธฐ?๋??.");
		}
	};
	
	return bus;
}());
