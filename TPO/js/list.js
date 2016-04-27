/*global tau */
/*jslint unparam: true */
(function(tau) {
	'use strict';
	var page, elScroller, list, listHelper = [], i, len;

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
		});

		document.addEventListener("pagebeforehide", function(e) {
			len = listHelper.length;
			if (len) {
				for (i = 0; i < len; i++) {
					listHelper[i].destroy();
				}
				listHelper = [];
			}
		});
	}
}(tau));
