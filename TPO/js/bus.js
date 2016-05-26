﻿/*global tau, toastPopup, rest */
function BUS() {
	this.activeStationId = 1;
	this.activeStationName = null;
	this.registerBusId = [];
	this.registerBusAdirection = [];
}
BUS.prototype = new Object();

/**@brief
 * This supports Bus functions.
 * @type BUS
 */
Window.prototype.bus = new BUS();

function onOpenFail(error) {
	toastPopup.openPopup("즐겨찾기 등록 실패!");
	//toastPopup.openPopup(error.message);
}

BUS.prototype._writeFavoriteFile = function(fs, file, preSave) {
	fs.write(preSave);
	fs.write("\n");
	fs.write(this.activeStationId);
	fs.write(" ");
	fs.write(this.activeStationId.length);
	for (var i = 0; i < this.registerBusId.length; ++i) {
		fs.write(" ");
		fs.write(this.registerBusId[i]);
		fs.write(" ");
		fs.write(this.registerBusAdirection[i]);
	}
	fs.close();
	
	toastPopup.openCheckPopup("위젯에 등록되었습니다.", true, 2);
};

BUS.prototype._readFavoriteFile = function(fs, file) {
	var txt;
	
	fs.position = 0;
	txt = fs.read(file.length);
	fs.close();
	
	return txt;
} 

/**
 * 즐겨찾기 버스 목록을 저장할 파일을 만든다.
 */
BUS.prototype._createBusFavoriteFile = function() {
	var documentsDir, 
		tpoDir = null, 
		tpoFile;
	
	// document 폴더에 저장한다.
	tizen.filesystem.resolve("documents", function(result) {
        documentsDir = result;
        try {
        	tpoDir = documentsDir.createDirectory("TPO_files");
        } catch (error) {
        	if (error.name === "IOError") {
        		tpoDir = documentsDir.resolve("TPO_files");
        	}
        }
        
        if (tpoDir !== null) {
        	try {
        		tpoFile = tpoDir.createFile("TPO_favorite.tpo");
        		tpoFile.openStream("rw", function(fs) {
            		bus._writeFavoriteFile(fs, tpoFile, "");
            	}, onOpenFail, "UTF-8");
        	} catch (error) {
        		if (error.name === "IOError") {
        			try {
        				tpoFile = tpoDir.resolve("TPO_favorite.tpo");
        				tpoFile.openStream("r", function(fs) {
        					var txt = bus._readFavoriteFile(fs, tpoFile);
        	        		tpoDir.deleteFile(tpoFile.fullPath, function() {
    	        				tpoFile = tpoDir.createFile("TPO_favorite.tpo");
    	        				tpoFile.openStream("w", function(fs) {
    	        	        		bus._writeFavoriteFile(fs, tpoFile, txt);
    	        	        	}, onOpenFail, "UTF-8");
    	        			});
        	        	}, onOpenFail, "UTF-8");
        			} catch (error) {
        				
        			}
        		}
        	}
        }
     });
};


/**
 * 선택한 정류장에서 선택한 버스들을 즐겨찾기에 등록한다.
 */
BUS.prototype.registerFavoriteBus = function() {
	var page = document.getElementById('busFavorite'),
		checkbox = page.querySelectorAll(".li-checkbox"),
		j = 0;
	
	for (var i = 0; i < checkbox.length; ++i) {
		if (checkbox[i].checked) {
			this.registerBusId[j] = checkbox[i].id;
			this.registerBusAdirection[j++] = checkbox[i].adirection;
		}
	}
	
	this._createBusFavoriteFile();
};

/**
 * 선택한 정류장의 모든 버스 번호를 list에 checkbox와 함께 추가한다.
 * @param data {String} XML Data
 */
BUS.prototype._createFavoriteBusList = function(data) {
	var lv = document.getElementById('lvBusFavorite'),
		x = data.getElementsByTagName("itemList");
	
	lv.innerHTML = "";
	document.getElementById('favoriteStationName').innerHTML = this.activeStationName;
	for (var i = 0; i < x.length; ++i) {
		lv.innerHTML += "<li class='li-has-checkbox' id=" + x[i].getElementsByTagName("rtNm")[0].childNodes[0].nodeValue + 
		"><label>" + x[i].getElementsByTagName("rtNm")[0].childNodes[0].nodeValue + 
		"<input type='checkbox' class='li-checkbox' id=" + x[i].getElementsByTagName("rtNm")[0].childNodes[0].nodeValue + 
		"adirection=" + x[i].getElementsByTagName("adirection")[0].childNodes[0].nodeValue +  
		"/></label></li>";
	}
};

/**
 * 현재 도착 시간을 보고 있는 정류장 번호를 기반으로 즐겨찾기를 등록하는 페이지로 이동한다.
 */
BUS.prototype.showFavoriteBus = function() {
	tau.changePage("#processing");
	rest.get('http://ws.bus.go.kr/api/rest/stationinfo/getStationByUid',
			null,
			{
		"ServiceKey" : "4we1Svife1ANzIwfRlMm4LIKHZI6BiBr2+8+TMz1QkiwBNUTmqJImecu2GHvh04mEAYTTgh60HoxSa+LdhW0+A==",
		"arsId" : this.activeStationId,
			},
			function(data, xhr) {
				var msg = data.getElementsByTagName("headerCd")[0].childNodes[0].nodeValue;				
				if (msg === "4") {
					/** No result */
					toastPopup.openCheckPopup("정류장 번호를 찾지 못하였습니다.", true);
				} else if (msg === "0") {
					/** Success */
					bus._createFavoriteBusList(data);
					tau.changePage("#busFavorite");
				}
			}, function(data, xhr) {
				toastPopup.openPopup("API를 불러오는데 실패하였습니다.", true);
			});		
};

/**
 *  버스 정류장 리스트에서 클릭 시 showBusArrivalTime 함수를 불러와 그 정류장에서의 버스 도착 예정 시간을 보여준다.
 */
function clickList(event)
{
	var target = event.target;
	if (target.classList.contains('li-bus-station') || target.classList.contains('li-bus-station-a') ||
			target.classList.contains('li-bus-station-sub')) {
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
 * 숫자의 앞에 0을 채워넣어준다.
 */
function leadingZeros(n, digits) {
	  var zero = '';
	  n = n.toString();

	  if (n.length < digits) {
	    for (var i = 0; i < digits - n.length; i++)
	      zero += '0';
	  }
	  return zero + n;
}

/**
 * XML 데이터를 이용하여 정류소 목록을 보여주는 페이지를 만들어준다
 * @param {String} API 에서 받아온 XML String
 */
function createBusStationList(data) {
	var lv = document.getElementById("lvBusNumber");
	lv.innerHTML = "";
	var x = data.getElementsByTagName("itemList");
	for (var i = 0; i < x.length; ++i) {
		//숫자 앞이 0인경우
		if(x[i].getElementsByTagName("stationNo")[0].childNodes[0].nodeValue < 10000) {
			var str = parseInt(x[i].getElementsByTagName("stationNo")[0].childNodes[0].nodeValue, 10);
			lv.innerHTML += "<li id='" + x[i].getElementsByTagName("stationNo")[0].childNodes[0].nodeValue +
			"' onclick = 'bus.showBusArrivalTime(leadingZeros(" +str + ", 5));'>" + x[i].getElementsByTagName("stationNm")[0].childNodes[0].nodeValue + "</li>";
		}
		else
			lv.innerHTML += "<li id='" + x[i].getElementsByTagName("stationNo")[0].childNodes[0].nodeValue +
			"' onclick = 'bus.showBusArrivalTime(" + x[i].getElementsByTagName("stationNo")[0].childNodes[0].nodeValue.toString() + ");'>" + x[i].getElementsByTagName("stationNm")[0].childNodes[0].nodeValue + "</li>";	
	}
}
	
/**
 * routeId를 입력받아 document의 header에 busNumber를 입력해주고
 * 그 버스가 경유하는 정류소 목록을 받아온다.
 */
function routeIdtoStation(busRouteId) {
	rest.get('http://ws.bus.go.kr/api/rest/busRouteInfo/getStaionByRoute',
			null,
			{
		"ServiceKey" : "4we1Svife1ANzIwfRlMm4LIKHZI6BiBr2+8+TMz1QkiwBNUTmqJImecu2GHvh04mEAYTTgh60HoxSa+LdhW0+A==",
		"busRouteId" : busRouteId
			},
			function(data, xhr) {
				var msg = data.getElementsByTagName("headerCd")[0].childNodes[0].nodeValue;				
				if (msg === "4") {
					/** No result */
					toastPopup.openCheckPopup("노선 번호를 찾지 못하였습니다.", true, 2);
				} else if (msg === "0") {
					/** Success */
					createBusStationList(data);
					document.getElementById('busNumber').innerHTML = data.getElementsByTagName("itemList")[0].getElementsByTagName("busRouteNm")[0].childNodes[0].nodeValue;
					tau.changePage("#busNumberStationList");	
				}
			}, function(data, xhr) {
				toastPopup.openPopup("API를 불러오는데 실패하였습니다.", true);
			});		
}
	
/**
 * 원하는 버스 번호를 입력받으면 그 버스의 routeId를 찾아주고 list까지 만들어
 * 페이지를 넘겨준다.
 */
BUS.prototype.busId = function(strSch){
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
		"ServiceKey" : "4we1Svife1ANzIwfRlMm4LIKHZI6BiBr2+8+TMz1QkiwBNUTmqJImecu2GHvh04mEAYTTgh60HoxSa+LdhW0+A==",
		"strSrch" : strSch
			}, 
			function(data, xhr) {
				var msg = data.getElementsByTagName("headerCd")[0].childNodes[0].nodeValue;				
				if (msg === "4") {
					/** No result */
					toastPopup.openCheckPopup("노선 번호를 찾지 못하였습니다.", true, 2);
				} else if (msg === "0"){
					var temp = data.getElementsByTagName("itemList");
					if(temp[0].getElementsByTagName("busRouteNm")[0].childNodes[0].nodeValue != strSch){
						toastPopup.openCheckPopup("노선 번호를 찾지 못하였습니다.", true, 2);
					}
					/** success*/
					else{
						routeIdtoStation(temp[0].getElementsByTagName("busRouteId")[0].childNodes[0].nodeValue); 
					} 
				}
			}, function(data, xhr) {
				toastPopup.openPopup("API를 불러오는데 실패하였습니다.", true);
			});
};
	

/**
 * API 에서 받아온 data를 파싱하여 도착 예상 시간을 보여주는 리스트를 만든다.
 * @param {String} API 에서 받아온 XML String
 */
BUS.prototype.createBusArrivalTimeList = function(data) {
	var lv = document.getElementById('lvBusArrivalTime'),
		x = data.getElementsByTagName("itemList"),
		title = document.getElementById('stationName');
		
	lv.innerHTML = "";
	title.innerHTML = x[0].getElementsByTagName("stNm")[0].childNodes[0].nodeValue;
	this.activeStationId = x[0].getElementsByTagName("arsId")[0].childNodes[0].nodeValue;
	this.activeStationName = title.innerHTML;
	
	for (var i = 0; i < x.length; ++i) {
		lv.innerHTML += "<li class='li-has-multiline' id='" + x[i].getElementsByTagName("rtNm")[0].childNodes[0].nodeValue +
		"' onclick = 'bus.busId(" + x[i].getElementsByTagName("rtNm")[0].childNodes[0].nodeValue + ");'" +
		"><div>" + x[i].getElementsByTagName("rtNm")[0].childNodes[0].nodeValue + 
		"</div><div class='ui-li-sub-text li-text-sub'>" + 
		x[i].getElementsByTagName("arrmsg1")[0].childNodes[0].nodeValue +
		"</div></li>";
	}
}
	
/**
 * arsID 에 해당하는 정류장에 대한 버스 도착 예상시간을 보여준다.
 * @param {number} arsID 정류장 고유 번호
 */
BUS.prototype.showBusArrivalTime = function(arsId) {
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
		"ServiceKey" : "4we1Svife1ANzIwfRlMm4LIKHZI6BiBr2+8+TMz1QkiwBNUTmqJImecu2GHvh04mEAYTTgh60HoxSa+LdhW0+A==",
		"arsId" : arsId
			}, 
			function(data, xhr) {
				var msg = data.getElementsByTagName("headerCd")[0].childNodes[0].nodeValue;				
				if (msg === "4") {
					// No result
					toastPopup.openCheckPopup("정류소 ID를 찾지 못하였습니다.", true, 2);
				} else if (msg === "0"){
					// Success
					bus.createBusArrivalTimeList(data);
					tau.changePage("#busArrivalTime");						
				}
			}, function(data, xhr) {
				toastPopup.openPopup("API를 불러오는데 실패하였습니다.", true);
			});
};

/**
 *  버스 정류장 리스트에서 클릭 시 showBusArrivalTime 함수를 불러와 그 정류장에서의 버스 도착 예정 시간을 보여준다.
 */
function clickStationList(event)
{
	var target = event.target;
	if (target.classList.contains('bus-station') || target.classList.contains('li-bus-station')) {
		bus.showBusArrivalTime(target.id);
	}
}

/**
 * li-bus-station 클래스를 가진 list item 에 대해 클릭 이벤트를 추가한다.
 */
function addListClickEvent() {
	var stationList = document.getElementsByClassName("li-bus-station"),
	i;

	for (i = 0; i < stationList.length; i++) {
		stationList[i].addEventListener("click", clickStationList);
	}
}

/**
 * 주변 버스 정류장 리스트를 만든다. 현재 위치에 대한 거리, 정류장 고유번호를 부가적으로 표시해준다.
 */
function createStationList(data) {
	var lv = document.getElementById('lvBusStation'),
		x = data.getElementsByTagName('itemList');
	
	lv.innerHTML = "";
	for (var i = 0; i < x.length; ++i) {
		if (i >= 20) {
			break;
		}
		lv.innerHTML += "<li class='li-has-multiline li-bus-station' id=" + x[i].getElementsByTagName("arsId")[0].childNodes[0].nodeValue + 
		"><div class='ui-marquee ui-marquee-gradient bus-station' id=" + x[i].getElementsByTagName("arsId")[0].childNodes[0].nodeValue + 
		"><a class='bus-station' id=" + x[i].getElementsByTagName("arsId")[0].childNodes[0].nodeValue + 
		">" + x[i].getElementsByTagName("stationNm")[0].childNodes[0].nodeValue + 
		"</a></div><div class='ui-li-sub-text li-text-sub bus-station' id=" + x[i].getElementsByTagName("arsId")[0].childNodes[0].nodeValue + ">" + 
		x[i].getElementsByTagName("dist")[0].childNodes[0].nodeValue + "m" +
		"(" + x[i].getElementsByTagName("arsId")[0].childNodes[0].nodeValue + ")" +
		"</div></li>";
	}
	addListClickEvent();
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
		"ServiceKey" : "4we1Svife1ANzIwfRlMm4LIKHZI6BiBr2+8+TMz1QkiwBNUTmqJImecu2GHvh04mEAYTTgh60HoxSa+LdhW0+A==",
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
					toastPopup.openCheckPopup("주변 정류소를 조회한 결과가 없습니다.", true);
				} else if (msg === "0"){
					// Success
					createStationList(data);
					tau.changePage("#surroundingBusStation");						
				}
			}, function(data, xhr) {
				toastPopup.openPopup("API를 불러오는데 실패하였습니다.", true);
			});
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
 * GPS를 이용하여 1km 반경 내의 주변 정류소를 조회한다.
 */
BUS.prototype.showSurroundingStationsByGps = function () {
	if (navigator.geolocation) {
		tau.changePage("#processing");
		navigator.geolocation.getCurrentPosition(succeedtoGetGPS, failtoGetGPS, {
			maximumAge : 10000, timeout : 20000
		});
	} else {
		toastPopup.openPopup("GPS를 지원하지 않는 기기입니다.");
	}
};