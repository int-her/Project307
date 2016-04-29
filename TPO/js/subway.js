var stationInfo = (function(){
	stationInfo = {};
	
	function realtimeStationArrival() {
		rest.get('http://swopenAPI.seoul.go.kr/api/subway/sample/xml/realtimeStationArrival/0/5/낙성대',
				null,
				null,
				function(data, xhr) {
					var code = data.getElementsByTagName("code")[0].childNodes[0].nodeValue;
					if (code != "INFO-000") {
						toastPopup.openPopup("toastPopup", "Fail to load API. Error Code : " + code);
					} else if (code === "INFO-000") {
						var rt = document.getElementById('rtSubwayStation');
						rt.innerHTML = "";
						var list = data.getElementsByTagName("row");
						for (var i=0; i<list.length; ++i) {
							rt.innerHTML += "<li>" + list[i].getElementsByTagName("arvlMsg2")[0].childNodes[0].nodeValue + "</li>";
						}
						tau.changePage("#testAPI");
					}
					
				},
				function(data, xhr) {
					toastPopup.openPopup("toastPopup", "API 로드에 실패했습니다.");
				}
		)
	}
	stationInfo.realtimeStationArrival = realtimeStationArrival;
	
	return stationInfo;
}());