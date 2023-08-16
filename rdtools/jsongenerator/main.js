function tabSwitch(e) {
	while (!e.target.className.includes("tab") || e.target.className.includes("tabName")) {
		e = {target: e.target.parentNode};
	}
	let target = 0;
	let prevTab = currentTab;
	for (i of e.target.classList) {
		if (Number(i.split("t")[1]) > 0) {
			target = i;
			currentTab = Number(i.split("t")[1]);
			break;
		}
	}

	if (doc.getElementsByClassName(target)[0].className.includes("active") || currentTab == prevTab) {
		return null;
	}

	stopAnimation();

	switch (prevTab) {
		case 2:
			if (fileUpload.value != "" && imgUploaded)
				redrawFrames();
			break;
	}

	while (doc.getElementsByClassName("active")[0]) {
		doc.getElementsByClassName("active")[0].classList.remove("active");
	}
	for (i of doc.getElementsByClassName(target)) {
		i.classList.add("active");
	}
}

function loop() {
	// sheet dividing
	sheetDivider.width = sheetPreview.width;
	sheetDivider.height = sheetPreview.height;
	let ctx = sheetDivider.getContext("2d");
	let fX = Number(frameX.value) || 9;
	let fY = Number(frameY.value) || 9;
	ctx.clearRect(0,0,sheetDivider.width,sheetDivider.height);
	ctx.drawImage(sheetPreview,0,0);
	ctx.strokeStyle = "#FF0000";
	ctx.lineWidth = 4;
	ctx.beginPath();
	ctx.moveTo(fX - 5,fY);
	ctx.lineTo(fX + 5,fY);
	ctx.moveTo(fX,fY - 5);
	ctx.lineTo(fX,fY + 5);
	ctx.stroke();
	ctx.lineWidth = 1;
	ctx.beginPath();
	let i = 1;
	while (fY * i < sheetDivider.height) {
		ctx.moveTo(0,fY * i);
		ctx.lineTo(sheetDivider.width,fY * i);
		i++;
	}
	i = 1;
	while (fX * i < sheetDivider.width) {
		ctx.moveTo(fX * i,0);
		ctx.lineTo(fX * i,sheetDivider.height);
		i++;
	}
	ctx.stroke();

	// row previewing
	ctx = rowPrevPreview.getContext("2d");
	// first fill the canvas with the light blue bg
	ctx.fillStyle = "#0BA4E3";
	ctx.fillRect(0,0,rowPrevPreview.width,rowPrevPreview.height);
	// then place the chosen frame OR nothing if toggle checked
	if (!rowPrevToggle.checked) {
		try {
			ctx.scale(2,2);
			ctx.drawImage(rowPrevFrame,(109 - fX - Number(rowPrevOffsetX.value))/2,(49 - fY + Number(rowPrevOffsetY.value))/2);
			ctx.setTransform(1,0,0,1,0,0);
		}
		catch {}
	}
	// then overlay the image
	ctx.drawImage(rowPreviewOverlay,0,0);
	// draw the draggable marker
	ctx.strokeStyle = "rgba(255,0,0," + 1 * Math.max(0,Math.min(1 - (window.performance.now() - lastDragged - 2500)/1000,1)) + ")";
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo((109 - Number(rowPrevOffsetX.value)) - 5,(49 + Number(rowPrevOffsetY.value)));
	ctx.lineTo((109 - Number(rowPrevOffsetX.value)) + 5,(49 + Number(rowPrevOffsetY.value)));
	ctx.moveTo((109 - Number(rowPrevOffsetX.value)),(49 + Number(rowPrevOffsetY.value)) - 5);
	ctx.lineTo((109 - Number(rowPrevOffsetX.value)),(49 + Number(rowPrevOffsetY.value)) + 5);
	ctx.stroke();

	if (animationFocus) {
		// animation previewing
		if (animationFocus == animationPreview) {
			if (animStarted == null) {
				console.log("starting!");
				animStarted = window.performance.now();
				animFPS = (animExpression.fps == 0 ? 12 : animExpression.fps);
			}
			ctx = animationPreview.getContext("2d");

			// get current frame from the time that the animation started
			let currentFrame = Math.floor((window.performance.now() - animStarted)/(1000/animFPS));

			// if frame count exceeds available frames
			if (currentFrame > animExpression.frames.length - 1) {
				// and if loop is off,
				if (animExpression.loop == "no") {
					// stop animation.
					stopAnimation();
					return null;
				}
				// else loop
				animStarted = window.performance.now();
				currentFrame = 0;
			}
			ctx.putImageData(frames[animExpression.frames[currentFrame]], 0, 0);
		}
		// dialogue previewing
		else if (animationFocus == dialoguePreview) {
			if (animStarted == null) {
				console.log("starting!");
				animStarted = window.performance.now();
				animFPS = (animExpression.fps == 0 ? 12 : animExpression.fps);
			}
			ctx = dialoguePreview.getContext("2d");
			ctx.clearRect(0,0,dialoguePreview.width,dialoguePreview.height);

			// get current frame from the time that the animation started
			let currentFrame = Math.floor((window.performance.now() - animStarted)/(1000/animFPS));
			// if frame count exceeds available frames
			if (currentFrame > animExpression.frames.length - 1) {
				// and if loop is off,
				if (animExpression.loop == "no") {
					// stop animation.
					stopAnimation();
					return null;
				}
				// else loop
				animStarted = window.performance.now();
				currentFrame = 0;
			}
			ctx.drawImage(imgDialogue,0,0);
			let holder = doc.createElement("canvas");
			holder.width = animExpression.portraitSize[0];
			holder.height = animExpression.portraitSize[1];
			let holCtx = holder.getContext("2d");
			holCtx.putImageData(frames[animExpression.frames[currentFrame]], -animExpression.portraitOffset[0], -animExpression.portraitOffset[1]);
			ctx.setTransform(animExpression.portraitScale,0,0,animExpression.portraitScale,0,0);
			ctx.drawImage(holder,1,-2*animExpression.portraitScale);
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(imgDialogueBorder,0,0);
		}
	}

	// requesting another loop
	requestAnimationFrame(loop);
}

function stopAnimation() {
	if (animationFocus) {
		console.log("stopping...");
		animationPreview.getContext("2d").clearRect(0,0,animationPreview.width, animationPreview.height);
		dialoguePreview.getContext("2d").clearRect(0,0,dialoguePreview.width, dialoguePreview.height);
		dialoguePreview.getContext("2d").drawImage(imgDialogue,0,0);
		animationFocus = null;
		animStarted = null;
		animFPS = null;
		requestAnimationFrame(loop);
	}
}

function redrawFrames() {
	if (!frameX.value || !frameY.value || Number(frameX.value) + Number(frameY.value) < 2)
		return null;
	let fX = Number(frameX.value);
	let fY = Number(frameY.value);
	let ctx = sheetPreview.getContext("2d");
	let yM = 0;
	let xM = 0;
	frames = [];
	while (fY * yM < sheetPreview.height) {
		yM++;
		while (fX * xM < sheetPreview.width) {
			xM++;
			frames[frames.length] = ctx.getImageData(fX*(xM-1),fY*(yM-1),fX,fY);
		}
		xM = 0;
	}
	rowPrevFrame.width = fX;
	rowPrevFrame.height = fY;
	rowPrevFrame.style = "width: " + fX*2 + "px; height: " + fY*2 + "px;";
	rowPrevFrameNumber.dispatchEvent(changeevent);

	// clear the frame reference
	frameRefs.innerHTML = "<div class='doc t5'><b><i>You can click on these to add the frames to the currently selected expression!</i></b></div><br>";
	//add frames to the frame reference
	let frameHolder = doc.createElement("canvas");
	frameHolder.width = fX;
	frameHolder.height = fY;
	let fHCtx = frameHolder.getContext("2d");
	let tempHolder = null;
	for (i in frames) {
		tempHolder = frameRefTemplate.content.cloneNode(true);

		fHCtx.putImageData(frames[i],0,0);
		tempHolder.querySelector(".frameRefImg").src = frameHolder.toDataURL("image/png");

		tempHolder.querySelector(".frameRefNum").innerHTML = i;

		frameRefs.appendChild(tempHolder);
	}
	
	// set size of animation preview
	animationPreview.width = fX;
	animationPreview.height = fY;
	animationPreview.style = "width: " + fX*2 + "px; height: " + fY*2 + "px;";
}

function addExpression(skipAddNew = false, skipSaving = false) {
	if (!skipAddNew) {
		let name = "";
		if (Math.random() * 4 > 3) {
			let bRand = Math.floor(nameFragB.length * Math.random());
			name = nameFragA[Math.floor(Math.random() * nameFragA.length)] + nameFragB[bRand].charAt(0).toUpperCase() + nameFragB[bRand].substring(1);
		}
		else name = nameFragB[Math.floor(Math.random() * nameFragB.length)];
		let addedExpression = new Expression(name);
		expressionArray[expressionArray.length] = addedExpression;
	}
	let addedElement = expressionTemplate.content.cloneNode(true);
	expAdd.insertAdjacentHTML("beforebegin", addedElement.firstElementChild.outerHTML);
	expAdd.previousElementSibling.click();
	saveExpression(skipSaving);
}

function removeExpression(e) {
	// before removing the selected expression, it'd be wise to nullify the selected expression index first
	// luckily that's doable through the changeToExpression function, which is on every expression element's onclick event
	// but we gotta keep what that value was in mind too, so save it to a temp variable first
	let toDelete = selExp;
	expList.children[toDelete].click();
	
	// since the element's getting deleted, don't save dead data - clear the text input
	expressionNameInput.value = "";

	// then delete the element
	expList.children[toDelete].remove();

	// delete the expression from the array, too
	expressionArray.splice(toDelete, 1);
}

function saveExpression(justWriteToElements = false) {
	// first, check if an expression is selected
	// if there is no selected expression, don't save
	if (selExp == null) return null;
	if (typeof justWriteToElements != "boolean") justWriteToElements = false;

	// after, save the values to the objects UNLESS SPECIFIED NOT TO
	if (!justWriteToElements) {
		expressionArray[selExp].name = expressionNameInput.value;
		while (expFrames.value.includes(",,")) {
			expFrames.value = expFrames.value.replaceAll(",,", ",");
		}
		if (expFrames.value.endsWith(",")) {
			expFrames.value = expFrames.value.substring(0,expFrames.value.length-1);
		}
		expressionArray[selExp].frames = (expFrames.value == "" ? [] : Array.from(expFrames.value.split(","), x => Number(x)));
		expressionArray[selExp].fps = Number(expFPS.value);
		// ----------------------------------
		// nabbing loop's value is a bit more complicated, but it's worth it
		let loopVal = "";
		// look through each radio input in loopType, try to find what the user wanted
		for (i of loopType.querySelectorAll("input")) {
			if (i.checked == true) loopVal = i.value;
		}
		// if, SOMEHOW, loopType is completely empty and nothing's checked, default to "no"
		if (loopVal == "") loopVal = "no";
		// and then set it
		expressionArray[selExp].loop = loopVal;
		// ---------------------------------
		expressionArray[selExp].loopStart = Number(expLoopStart.value);
		expressionArray[selExp].portraitOffset = [Number(expPOffX.value), Number(expPOffY.value)];
		expressionArray[selExp].portraitSize = [Number(expPSizeX.value), Number(expPSizeY.value)];
		expressionArray[selExp].portraitScale = Number(expPScale.value);
	}


	// then, set visible variables to the values
	let selEl = expList.children[selExp];
	let exp = expressionArray[selExp];
	selEl.querySelector(".expressionName").innerHTML = exp.name;
	selEl.querySelector(".expressionFrames").innerHTML = exp.frames.length + " frame(s)";
	selEl.querySelector(".expressionFramerate").innerHTML = exp.fps;
	selEl.querySelector(".expressionLoop").innerHTML = loopType.querySelector("*[value=\"" + exp.loop + "\"]").nextElementSibling.innerHTML;
	selEl.querySelector(".expressionLoopFrame").innerHTML = "" + exp.loopStart + " (" + (exp.frames[exp.loopStart] == undefined ? "err" : exp.frames[exp.loopStart]) + ")";
	if (exp.portraitOffset)
		selEl.querySelector(".expressionPortraitOffset").innerHTML = exp.portraitOffset.toString();
	if (exp.portraitSize)
		selEl.querySelector(".expressionPortraitSize").innerHTML = exp.portraitSize.toString();
	if (exp.portraitScale)
		selEl.querySelector(".expressionPortraitScale").innerHTML = exp.portraitScale + "x";
}

function changeToExpression(e) {
	stopAnimation();
	let target = e.target;
	while (!target.classList.contains("expression")) {
		target = target.parentNode;
	}

	// debug line of code. floods console. don't use
	// console.log(expList.querySelectorAll(".expression").length, expressionArray.length, Array.prototype.indexOf.call(e.target.parentNode.children, target), e.target, target);

	// first thing's first, let's save the previously selected expression again
	if (selExp != null) {
		saveExpression();
	}
	// find and deselect the selected expression element (targeting multiple just in case)
	for (i of expList.querySelectorAll(".selectedExpression")) {
		i.classList.remove("selectedExpression");
	}
	// get the expression element that was clicked
	let clickTarg = Array.prototype.indexOf.call(expList.children, target);
	// if the selected expression was the same selection already selected,
	if (selExp == clickTarg) {
		// deselect all expressions
		selExp = null;
		// disable all related input interfaces
		for (i of doc.querySelectorAll(".expInput")) {
			if (i.type != "button" && i.type != "radio") i.value = "";
			i.setAttribute("disabled", "");
		}
		// and stop the function
		return null;
	}
	// else, remove disabler from all related inputs
	for (i of doc.querySelectorAll(".expInput")) {
		i.removeAttribute("disabled");
	}
	// set selected expression to the...selected. expression.
	selExp = clickTarg;
	// select the clicked element
	target.classList.add("selectedExpression");
	// and finally, fill all related inputs with currently saved data
	let selExion = expressionArray[selExp];
	expressionNameInput.value = selExion.name;
	expFrames.value = selExion.frames.toString();
	expFPS.value = selExion.fps;
	expLoopStart.value = selExion.loopStart;
	if (selExion.portraitOffset) {
		expPOffX.value = selExion.portraitOffset[0];
		expPOffY.value = selExion.portraitOffset[1];
	}
	if (selExion.portraitSize) {
		expPSizeX.value = selExion.portraitSize[0];
		expPSizeY.value = selExion.portraitSize[1];
	}
	if (selExion.portraitScale)
		expPScale.value = selExion.portraitScale;
	if (selExion.loop)
		loopType.querySelector("*[value=\"" + selExion.loop + "\"]").click();
	else loopType.querySelector("*[value=\"no\"]").click();
}



function toggleHelp() {
	var helpMenu = doc.getElementById("helpMenu");
	var helpButton = doc.getElementById("help").firstElementChild;
	helpMode = !helpMode;
	if (helpMode) {
		helpMenu.style.zIndex = "0";
		helpButton.setAttribute("src", "assets/remove button.png");
	}
	else {
		helpMenu.style.zIndex = "-50";
		helpButton.setAttribute("src", "assets/help button.png");
	}
}
function exportJSON() {

	// first, let's verify everything is okay
	let warnings = "";
	let errors = "";

	// testing for required expressions
	// neutral, happy, barely, missed - respectively
	let arr = [false, false, false, false];
	let names = [];
	let noFrameWarning = false;
	expressionArray.forEach(x => {
		switch (x.name) {
			case "neutral":
				arr[0] = true;
				break;
			case "happy":
				arr[1] = true;
				break;
			case "barely":
				arr[2] = true;
				break;
			case "missed":
				arr[3] = true;
				break;
		}
		// also gonna warn if an expression doesn't have any frames
		if (!noFrameWarning && x.frames.length == 0)
			noFrameWarning = true;
		// also gonna log every name in here to warn for duplicate names
		names[names.length] = x.name;
	});

	if (noFrameWarning) warnings += "\n(Tab 5, Anim. Data) One or more expressions don't have any frames! Make sure you're okay with this before you continue.";

	// if the array hadn't passed all of the checks earlier, prime a warning
	if (arr.includes(false)) {
		if (!arr[0]) warnings += "\nYou're missing a \"neutral\" expression!";
		if (!arr[1]) warnings += "\nYou're missing a \"happy\" expression!";
		if (!arr[2]) warnings += "\nYou're missing a \"barely\" expression!";
		if (!arr[3]) warnings += "\nYou're missing a \"missed\" expression!";
		warnings += "\n(Tab 4, Expressions) The \"neutral\", \"happy\", \"barely\", and \"missed\" expressions are required for custom characters, but if you're doing decorations, you should be able to safely ignore this message.";
	}

	// if the divider warning's still up, prime a warning
	if ((sheetPreview.width / Number(frameX.value) % 1 != 0 || sheetPreview.height / Number(frameY.value) % 1 != 0) && fileUpload.value != "" && imgUploaded) {
		warnings += "\n(Tab 2, Frame Data) Spritesheet does not seem evenly divided! Your frames may be a little bit jank.";
	}

	// name warners/errors
	let namesStr = names.toString();
	for (i of names) {
		// if the first index a name appears is not the same as the *last* index,
		// that means there's at least ONE duplicate name in here. prime a warn!
		if (namesStr.indexOf(i) != namesStr.lastIndexOf(i)) {
			warnings += "\n(Tab 4, Expressions) Some expressions share the same name as each other! Only the expressions named first in the list will be used.";
			break;
		}
	}
	if (names.includes("")) errors += "\n(Tab 4, Expressions) One or more expressions don't have a name! Make sure you name all your expressions.";


	if (errors != "") {
		// if there are errors, stop the user from moving on
		window.alert("Oops - some things are out of place!\n\nERRORS:" + errors + "\n\nWARNINGS:" + (warnings == "" ? "\nNone" : warnings) + "\n\nUnfortunately, since there were errors present, you cannot continue. Make sure to go back and fix them!");
		return null;
	}
	else if (warnings != "") {
		// if there are JUST warnings, ask if the user wants to continue. if not, stop function
		if (!window.confirm("Oops - some things are out of place!\n\nERRORS:\nNone\n\nWARNINGS:" + warnings + "\n\nYou can still continue, but it's recommended to fix this.\nDo you still want to export?")) return null;
	}

	// okay let's actually rewrite the JSONification now
	// -------------------------------------------------

	let finalizeObject = {};

	finalizeObject.size = [Number(frameX.value), Number(frameY.value)];
	if (!rowPrevToggle.checked) {
		finalizeObject.rowPreviewFrame = Number(rowPrevFrameNumber.value);
		finalizeObject.rowPreviewOffset = [Number(rowPrevOffsetX.value), Number(rowPrevOffsetY.value)];
	}
	finalizeObject.clips = expressionArray; // god I hope this works!!

	// ...wow that was it???

	let dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(finalizeObject, null, 4));

	let downloader = doc.createElement("a");
	downloader.setAttribute("href", dataUri);
	downloader.setAttribute("download", fileName.value + ".json");
	downloader.click();
}

function toggleExpressions() {
	expandedExpressions = !expandedExpressions;
	if (!expandedExpressions) {
		doc.styleSheets[0].insertRule(".expression :not(.expressionName):not(table):not(tbody):not(tr):not(td) { display: none; visibility: hidden }");
		expressionExtra.innerHTML = "(show all info?)"
	}
	else {
		doc.styleSheets[0].deleteRule(0);
		expressionExtra.innerHTML = "(show only names?)"
	}
}

class Expression {
	constructor(name) {
		this.name = name;
		this.frames = [];
		this.loop = "no";
		this.fps = 0;
		this.loopStart = 0;
		this.portraitOffset = [0, 0];
		this.portraitSize = [25, 25];
		this.portraitScale = 2;
	}
}

const doc = document; //document shorthand - convenience

var currentTab = 1;
var lastNow = 0;
var animStarted = null;
var animFPS = null;
var animExpression = null;

var selExp = null;
var expressionArray = [];

if (sessionStorage) {
	if (sessionStorage.getItem("expressions")) {
		expressionArray = JSON.parse(sessionStorage.getItem("expressions"));
		for (i in expressionArray) {
			addExpression(true, true);
		}
	}
}

var expandedExpressions = true;

for (i of document.querySelectorAll(".expInput")) {
	i.addEventListener("change", saveExpression);
}

const nameFragA = [
	"epic", "cool", "sad",
	"crazy", "deadly", "not",
	"mixed", "wild", "messy",
	"hyper", "great", "good",
	"bad", "scary", "better",
	"second", "third", "fourth",
	"fifth", "sixth", "seventh",
	"eighth", "ninth", "tenth",
	"red", "orange", "yellow",
	"green", "blue", "purple",
	"violet", //just in case there's anybody who cares abt it
	"golden", "slick", "sick",
	"full", "short", "cut",
	"violent"
];
const nameFragB = [
	"attack", "action", "sequence",
	"dialogue", "drink", "coffee",
	"tea", "dance", "haunt",
	"scare", "walk", "run",
	"flee", "crumble", "collapse",
	"sparkle", "spell", "anger",
	"screech", "yell", "sob",
	"cry", "love", "animation",
	"ramble", "pause", "break",
	"violence"
];

const changeevent = new Event('change'); //used to activate the onchange events specified in the HTML
const clickevent = new Event('click'); //used to activate the onclick events specified in the HTML

let tabs = doc.getElementsByClassName("tab");
for (i of tabs) {
	i.onclick = (e) => {tabSwitch(e)}
}

var lastDragged = 0;
var frames = [];
var imgUploaded = false;
let spctx = sheetPreview.getContext("2d");
spctx.fillStyle = "white";
spctx.textAlign = "center";
spctx.font = "bold 24px Arial";
spctx.fillText("Upload a spritesheet!", sheetPreview.width/2, sheetPreview.height/2 - 13)
spctx.fillText("It'll appear here.", sheetPreview.width/2, sheetPreview.height/2 + 13)

// runs on uploading a file
fileUpload.onchange = (e) => {
	if (!(e.target.value.endsWith(".png") || e.target.value.endsWith(".json"))) {
		let filetype = e.target.value.split(".");
		window.alert("The filetype ." + filetype[filetype.length - 1] + " isn't a compatible filetype! Please use a .png image or a .json file.");
		return null;
	}
	var reader = new FileReader();
	if (e.target.value.endsWith(".json")) {
		// this doesn't count as an image file
		// if the user had any expression data inputted, warn that continuing will wipe said data
		if (expressionArray.length > 0)
			if (!window.confirm("Hey - if you continue with this .json file, all the data you entered will be wiped.\nAre you sure you're good to continue?")) return null;
		// then wipe the data
		expressionArray = [];
		selExp = null;
		for (i of expList.querySelectorAll(".expression")) {
			i.remove();
		}
		reader.onload = (ev) => {
			var jsn = JSON.parse(ev.target.result);
			for (i of jsn.clips) {
				expressionArray[expressionArray.length] = i;
			}
			for (i in expressionArray) {
				addExpression(true, true);
			}
			frameX.value = jsn.size[0];
			frameY.value = jsn.size[1];
			console.log(jsn.rowPreviewFrame);
			if (typeof jsn.rowPreviewFrame == "number") {
				rowPrevToggle.checked = false;
				rowPrevFrameNumber.value = jsn.rowPreviewFrame;
				if (jsn.rowPreviewOffset) {
					rowPrevOffsetX.value = jsn.rowPreviewOffset[0];
					rowPrevOffsetY.value = jsn.rowPreviewOffset[1];
				}
			}
			else {
				rowPrevToggle.checked = true;
			}
			rowPrevToggle.dispatchEvent(changeevent);
		}
		reader.readAsText(e.target.files[0]);
	}
	else {
		imgUploaded = true;
		var sheetCanvases = [sheetPreview];
		var ctxs = [];
		reader.onload = (ev) => {
			var img = new Image();
			img.onload = () => {
				for (canvas of sheetCanvases) {
					canvas.width = img.width;
					canvas.height = img.height;
					ctxs[ctxs.length] = canvas.getContext("2d");
				}
				for (ctx of ctxs) {
					ctx.clearRect(0,0,Infinity,Infinity);
					ctx.drawImage(img,0,0);
				}
			}
			img.src = ev.target.result;
			loop();
		};
		reader.readAsDataURL(e.target.files[0]);
	}
	let name = e.target.value.split("\\");
	fileName.value = name[name.length-1].split(".")[0];
	doc.getElementsByClassName("autofilledConfirmation")[0].classList.remove("hidden");
	setTimeout(sheetDividerZoom.onchange, 100);
};
rowPrevFrameNumber.onchange = (e) => {
	let ctx = rowPrevFrame.getContext("2d");
	ctx.clearRect(0, 0, rowPrevFrame.width, rowPrevFrame.height);
	try {
		ctx.putImageData(frames[Number(e.target.value)],0,0);
	}
	catch {}
}
sheetDividerZoom.onchange = () => {
	sheetDivider.style = "width: " + (sheetDivider.width * sheetDividerZoom.value) + "px; height: " + (sheetDivider.height * sheetDividerZoom.value) + "px";
	return true;
}


if (fileUpload.value) {
	// this implies that the file upload held a value between reloads
	fileUpload.dispatchEvent(changeevent);
	setTimeout(() => {sheetDividerZoom.dispatchEvent(changeevent)}, 1000);
}

for (i of doc.getElementsByTagName("canvas")) {
	i.getContext("2d").imageSmoothingEnabled = false;
}

var isMouseDown = false;
var animationFocus = null;
onmousedown = (e) => {
	if (e.which != 1) {
		return null;
	}
	if (e.target == sheetDivider ||
		e.target == rowPrevPreview ||
		e.target == dialoguePreview ||
		e.target == animationPreview) {
		if (imgUploaded) {
			isMouseDown = true;
			lastDragged = window.performance.now();
			switch (e.target) {
				case sheetDivider:
					frameX.value = Math.max(Math.min(Math.floor(e.layerX / sheetDividerZoom.value), sheetDivider.width), 1);
					frameY.value = Math.max(Math.min(Math.floor(e.layerY / sheetDividerZoom.value), sheetDivider.height), 1);
					break;
				case rowPrevPreview:
					// when clicked, move the offset - this moves the character sprite with it
					let rect = e.target.getBoundingClientRect();
					// also the bounding rectangle is for some reason not an integer so you need to round it
					rowPrevOffsetX.value = (109) - (e.clientX - Math.round(rect.left));
					rowPrevOffsetY.value = e.clientY - Math.round(rect.top) - 49;
					break;
				case dialoguePreview:
				case animationPreview:
					if (animStarted) {
						stopAnimation();
						break;
					}
					if (selExp != null) {
						if (frames.length == 0) {
							redrawFrames();
						}
						animationFocus = e.target;
						animExpression = expressionArray[selExp];
						lastNow = window.performance.now();
					}
					break;
			}
		}
		else {
			// fun fact: by popping up an alert we prevent the onmousemove event!
			window.alert("Upload a spritesheet to use this!");
		}
	}
}
onmousemove = (e) => {
	if (isMouseDown) {
		lastDragged = window.performance.now();
		if (e.target == sheetDivider) {
			frameX.value = Math.max(Math.min(Math.floor(e.layerX / sheetDividerZoom.value), sheetDivider.width), 1);
			frameY.value = Math.max(Math.min(Math.floor(e.layerY / sheetDividerZoom.value), sheetDivider.height), 1);
		}
		else if (e.target == rowPrevPreview) {
			// when the mouse moves, move the offset - this moves the character sprite with it
			let rect = e.target.getBoundingClientRect();
			// also the bounding rectangle is for some reason not an integer so you need to round it
			rowPrevOffsetX.value = (109) - (e.clientX - Math.round(rect.left));
			rowPrevOffsetY.value = e.clientY - Math.round(rect.top) - 49;
		}
	}
}
onmouseup = (e) => {
	isMouseDown = false;
	if ((sheetPreview.width / Number(frameX.value) % 1 != 0 || sheetPreview.height / Number(frameY.value) % 1 != 0) && fileUpload.value != "" && imgUploaded) {
		doc.querySelector(".t2.doc").querySelector(".warning").classList.remove("hidden");
	}
	else doc.querySelector(".t2.doc").querySelector(".warning").classList.add("hidden");
}

var helpMode = false;

const rowPreviewOverlay = new Image(); //ALWAYS KEEP THESE IMAGES LOADED
rowPreviewOverlay.src = "assets/rowPreview.png";
const imgDialogue = new Image();
imgDialogue.src = "assets/dialogue.png";
const imgDialogueBorder = new Image();
imgDialogueBorder.src = "assets/dialogueBorder.png";

dialoguePreview.style = "width: " + (dialoguePreview.width * 2) + "px; height: " + (dialoguePreview.height * 2) + "px";
imgDialogue.onload = () => dialoguePreview.getContext("2d").drawImage(imgDialogue, 0, 0);
