function changeTab(tabName) {
	if (typeof tabName != "string") {
		return false;
	}
	tabs.find(e => e.id == "selected").removeAttribute("id");
	window.setTimeout(function() {
		tabs.find(e => e.classList[1] == tabName).setAttribute("id", "selected");
	}, 125);
	pages.find(e => e.style.display != "none").style.filter = "opacity(0)";
	window.setTimeout(function() {
		pages.filter(e => e.classList[1] != tabName).forEach(e => e.style.display = "none");
		let focus = pages.find(e => e.classList[1] == tabName)
		focus.style.display = "initial";
		window.setTimeout(function() {
			focus.style.filter = "opacity(1)";
		}, 50);
	}, 125);
}

function buildTab(dataFill, targetTab) {
	let focus = "";
	for (i in dataFill) {
		focus = "";
		if (dataFill[i].author == "DeadlySprinklez") {
			if (targetTab.querySelector(".none-self")) {
				targetTab.querySelector(".none-self").innerHTML = "";
			}
			targetTab.querySelector(".none-self").insertAdjacentHTML("beforebegin", entry.innerHTML + "<br>");
			// jumps back once (hits the <br>) and then twice (expected to hit an <a>)
			focus = targetTab.querySelector(".none-self").previousElementSibling.previousElementSibling;
		}
		else {
			if (targetTab.querySelector(".none-others")) {
				targetTab.querySelector(".none-others").innerHTML = "";
			}
			targetTab.querySelector(".none-others").insertAdjacentHTML("beforebegin", entry.innerHTML + "<br>");
			// jumps back once (hits the <br>) and then twice (expected to hit an <a>)
			focus = targetTab.querySelector(".none-others").previousElementSibling.previousElementSibling;
		}
		// first, fill in the link data
		focus.href = dataFill[i].url;
		// go into the "entry" <div>
		focus = focus.firstElementChild;
		if (dataFill[i].disabled == true) {
			focus.setAttribute("class", focus.class + " disabled")
		}
		// either fill in or delete the "entryRequires" section
		if (dataFill[i].requires != null || typeof dataFill[i].requires != "undefined") {
			focus.lastElementChild.insertAdjacentHTML("beforeend", dataFill[i].requires)
		}
		else {
			focus.lastElementChild.remove();
		}
		// flows through the <a> to the <table> in the "entry" <div>
		while (focus.nodeName != "TABLE") {
			if (!focus.firstElementChild) {
				throw "There was no table data found - tell DeadlySprinklez their site is broken!"
			}
			focus = focus.firstElementChild;
		}
		// cycle through the <table> element until we get to the <tr> element
		while (focus.nodeName != "TR") {
			focus = focus.firstElementChild;
		}
		// store the <td> cells in the <tr> element in a temp variable - 0 is image, 1 is text
		let data = focus.children;
		// and now let's fill in all the data!
		data[0].firstElementChild.src = dataFill[i].thumbnail; // fill in the thumbnail
		data[0].firstElementChild.width = 80; // but keep it constrained to size just in case
		data[0].firstElementChild.height = 45;
		data[1].children[0].innerHTML = dataFill[i].title; // fill in the title
		data[1].children[3].innerHTML = dataFill[i].description; // fill in the description
		if (dataFill[i].author != "DeadlySprinklez" && dataFill[i].author) { // and if I'm not the author AND there's a name given
			data[1].children[0].insertAdjacentHTML("afterend", " by ");
			data[1].children[1].innerHTML = dataFill[i].author; // fill in the author
		}
		if (dataFill[i].source) { // if a source link is given, add it in
			data[1].children[1].insertAdjacentHTML("afterend", " <a class=\"initial\" href=\"" + dataFill[i].source + "\">(source)</a>")
		}
	}
}

function fetchEntries() {
	fetch("entries.json").then(response => response.json())
	.then(function(json) {
		entries = json;
		buildTab(entries.tabs.sound, sound);
		buildTab(entries.tabs.rows, rows);
		buildTab(entries.tabs.vfx, vfx);
		buildTab(entries.tabs.rooms, rooms);
	})
	.catch(function(err) {
		console.warn("Tools weren't loaded! Attempting reload in 5 seconds.\n" + err);
		setTimeout(fetchEntries, 5000);
		return;
	});
};

// the pages, opened by the tabs
const sound = document.querySelector(".sound.page");
const rows = document.querySelector(".rows.page");
const vfx = document.querySelector(".vfx.page");
const rooms = document.querySelector(".rooms.page");
const pages = [sound, rows, vfx, rooms];


// the tabs, hiding the pages until clicked
const soundTab = document.querySelector(".sound.tab");
const rowsTab = document.querySelector(".rows.tab");
const vfxTab = document.querySelector(".vfx.tab");
const roomsTab = document.querySelector(".rooms.tab");
const tabs = [soundTab, rowsTab, vfxTab, roomsTab];
		
const entryBase = document.getElementById("entry");
var entries = null;

for (i in tabs) {
	tabs[i].addEventListener("mousedown", e => changeTab(e.target.classList[1]));
}
fetchEntries();

window.onkeydown = function(event) {
	switch (event.key) {
		case "1":
			changeTab("sound");
			break;
		case "2":
			changeTab("rows");
			break;
		case "3":
			changeTab("vfx");
			break;
		case "4":
			changeTab("rooms");
			break;
	}
}
document.addEventListener("DOMContentLoaded", function() {
	sound.style.display = "none";
	sound.style.filter = "opacity(0)";
	vfx.style.display = "none";
	vfx.style.filter = "opacity(0)";
	rooms.style.display = "none";
	rooms.style.filter = "opacity(0)";
});