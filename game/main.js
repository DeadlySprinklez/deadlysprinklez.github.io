var pastries = 0;
function pastryClick(number) {
	pastries = pastries + number;
	document.getElementById('pastries').innerHTML = "You currently have " + pastries + " pastries!";
};
var cursors = 0
function buyCursor() {
	var cursorCost = Math.floor(10 * Math.pow(1.1,cursors));
	if(pastries >= cursorCost){
		cursors = cursors + 1;
		pastries = pastries - cursorCost;
		document.getElementById('cursors').innerHTML = "You have " + cursors + " cursors!";
		document.getElementById('pastries').innerHTML = "You currently have " + pastries + " pastries!";
	};
	var nextCost = Math.floor(10 * Math.pow(1.1,cursors));
	document.getElementById('cursorCost').innerHTML = "The next cursor is being sold for " + nextCost + " pastries.";
};