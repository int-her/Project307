var stationInfo = (function(){
	
	function realtimeStationArrival() {
		rest.get('http://swopenAPI.seoul.go.kr/api/subway',
				null,
				{
					"KEY" : "6879744c6379736d38304b416a6264",
					"TYPE" : "xml",
					"SERVICE" : "realtimeStationArrival",
					"START_INDEX" : 0,
					"END_INDEX" : 5,
					"statnNm" : "낙성대"
				},
				function(data, xhr) {
					var code = data.getElementsByTagName("RESULT")[0].childNodes[0].nodeValue;
					if (code != "INFO-000") {
						toastPopup.openPopup("toastPopup", "도착 예정 열차가 없습니다.");
					} else if (code === "INFO-000") {
						var rt = document.getElementById('rtSubwayStation');
						rt.innerHTML = "<div class='ui-content'><ul class='ui-listview'>";
						var list = data.getElementByTagName("row");
						for (var i=0; i<x.length; ++i) {
							rt.innerHTML += "<li>" + list[i].getElementsByTagName("arvlMsg2")[0].nodeValue + "</li>";
						}
						rt.innerHTML += "</ul></div>";
					}
				},
				function(data, xhr) {
					toastPopup.openPopup("toastPopup", "API를 불러오는데 실패하였습니다.");
				}
		)
	}
	
});