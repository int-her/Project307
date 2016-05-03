/*global tau */
/*jslint unparam: true */
(function(tau) {
	'use strict';
	var page, elScroller, list, listHelper = [], i, len;
	
	/*
	var motionScroll = function(e) {
		var page = document.getElementsByClassName('ui-page-active')[0], 
		tmpList = page.querySelector(".ui-listview"),
		snapListWidget;
		
		if (Math.round(e.acceleration.y) >= 1) {
			if (tmpList) {
				for (i = 0; i < len; ++i) {
					if (list === tmpList) {
						snapListWidget = listHelper[i].getSnapList();
						var selectedIndex = snapListWidget.getSelectedIndex();
						snapListWidget.scrollToPosition(++selectedIndex);

						break;
					}
				}
			}
		}		
	};
	*/
	
	if (tau.support.shape.circle) {
		document.addEventListener("pagebeforeshow", function(e) {
			page = e.target;
			
			elScroller = page.querySelector(".ui-scroller");
			if (elScroller) {
				list = elScroller.querySelectorAll(".ui-listview:not(.marquee-list)");
				if (list) {
					len = list.length;
					for (i = 0; i < len; ++i) {
						listHelper[i] = tau.helper.SnapListStyle.create(list[i], {animate: "scale"});
					}
				}
			}
			
			window.addEventListener('devicemotion', motionScroll);
		});

		
		
		document.addEventListener("pagebeforehide", function(e) {
			len = listHelper.length;
			if (len) {
				for (i = 0; i < len; i++) {
					listHelper[i].destroy();
				}
				listHelper = [];
			}
			window.removeEventListener('devicemotion', motionScroll);
		});
	}
}(tau));
