/*global tau*/
function MOREOPTION() {
	this.handler = null;
	this.elSelector = null;
	this.clickHandlerBound = null;
	this.clickElHandlerBound = null;
	this.selector = null;
	this.popup = null;
}

MOREOPTION.prototype = new Object();

MOREOPTION.prototype.clickHandler = function(event) {
	tau.openPopup(this.popup);
};

MOREOPTION.prototype.clickElHandler = function(event) {
	var target = event.target,
		dataTitle,
		dataIndex;
	
	if (target.classList.contains("ui-selector-indicator")) {
		tau.closePopup(this.popup);
	} else {
		dataTitle = target.getAttribute("data-title");
		if (dataTitle === "즐겨찾기 등록") {
			tau.closePopup(this.popup);
			bus.showFavoriteBus();
		} else {
			tau.closePopup(this.popup);
		}
	}
};

MOREOPTION.prototype.pageBeforeShowHandler = function(pageId) {
	var radius = window.innerHeight / 2 * 0.8,
		page = document.getElementById(pageId);
	
	this.popup = page.querySelector("#" + pageId + "_MoreOptions");
	this.handler = page.querySelector(".ui-more");
	this.elSelector = page.querySelector("#selector");
	this.clickHandlerBound = this.clickHandler.bind(this);
	this.clickElHandlerBound = this.clickElHandler.bind(this);
	this.handler.addEventListener("click", this.clickHandlerBound);
	this.elSelector.addEventListener("click", this.clickElHandlerBound);
	this.selector = tau.widget.Selector(this.elSelector, {itemRadius: radius});
};

MOREOPTION.prototype.pageBeforeHideHandler = function() {
	this.handler.removeEventListener("click", this.clickHandlerBound);
	this.elSelector.removeEventListener("click", this.clickElHandlerBound);
	this.selector.destroy();
	this.selector = null;
};
