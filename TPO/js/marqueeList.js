var marqueeList = (function() {
	var page, 
	elScroller,
	listHelper,
	list,
	marqueeList = {};
	
	marqueeList.pageBeforeShowHandler = function(pageId) {
		page = document.getElementById(pageId);
		elScroller = page.querySelector(".ui-scroller");
		if (elScroller) {
			list = elScroller.querySelector(".ui-listview.marquee-list");
		}
		if (elScroller && list) {
			listHelper = tau.helper.SnapListMarqueeStyle.create(list, {
				marqueeDelay: 1000,
				marqueeStyle: "endToEnd"
			});
			elScroller.setAttribute("tizen-circular-scrollbar", "");
		}
	};
	
	marqueeList.pageBeforeHideHandler = function() {
		if (listHelper) {
			listHelper.destroy();
			listHelper = null;
			if(elScroller) {
				elScroller.removeAttribute("tizen-circular-scrollbar");
			}
		}
	};

	return marqueeList;
}());