function MARQUEELIST() {
	this.elScroller = null;
	this.listHelper = null;
}
MARQUEELIST.prototype = new Object();

MARQUEELIST.prototype.pageBeforeShowHandler = function(pageId) {
	var page = document.getElementById(pageId),
		list;
	this.elScroller = page.querySelector(".ui-scroller");
	if (this.elScroller) {
		list = this.elScroller.querySelector(".ui-listview.marquee-list");
	}
	if (this.elScroller && list) {
		this.listHelper = tau.helper.SnapListMarqueeStyle.create(list, {
			marqueeDelay: 1000,
			marqueeStyle: "endToEnd"
		});
		this.elScroller.setAttribute("tizen-circular-scrollbar", "");
	}
};

MARQUEELIST.prototype.pageBeforeHideHandler = function() {
	if (this.listHelper) {
		this.listHelper.destroy();
		this.listHelper = null;
		if(this.elScroller) {
			this.elScroller.removeAttribute("tizen-circular-scrollbar");
		}
	}
};