function fileHandling(e) {
	var reader = new FileReader();
	var statusOutput = doc.getElementById('uploadStatus');
	statusOutput.style = "";
	// New spritesheet handler
	if (e.currentTarget.value.endsWith('.png')) {
	    reader.onload = function(event){
	        var img = new Image();
	        img.onload = function(){
	        	if (!advancedMode && (img.width < 9 || img.height < 9)) { //won't run if advanced mode is on, otherwise checks if image is too small
					alert('Your image is too small to be a valid spritesheet!\nSpritesheets need to have multiple frames, each frame having four rows/columns of blank pixels on each side.\nIf you need a sample, there are plenty in #custom-assets at https://discord.com/rhythmdr/');
					statusOutput.innerHTML = "<span class='highlight removal'>Failure:</span> Invalid spritesheet";
					return;
				}
				//doc.getElementsByName('sizeX')[0].value = img.width; (OBSOLETE AS OF JUNE 20th, R.I.P.)
				canvas.width = img.width;
				canvas.height = img.height;
				context.drawImage(img,0,0);
				// THESE NEXT IF/IFELSES SKIP ADVANCED MODE'S DISABLER
				if (lastUploadedFilename.endsWith(".json")) { //runs contingency if JSON was uploaded last
					if (window.confirm("Last file uploaded was a .json file.\n\nPress OK to keep data from the .json, or press Cancel to clear past data.")) {
						statusOutput.innerHTML = "<span class='highlight addition'>Success:</span> JSON substitution";
						redrawFrames();
						return;
					}
				}
				/* ========================================
						Autofill Options start here
				======================================== */
	        	if (doc.getElementById('AFOptFullRes').checked) { //if AutoFill Option "full resolution" is ticked, run this
	        		//literally just nab the full image resolution
	        		inputx.value = img.width;
	        		inputy.value = img.height;
	        		statusOutput.innerHTML = "<span class='highlight addition'>Success:</span> Upload successful, full res mod used";
	        		redrawFrames();
	        		return; 
	        	}
	        	else if (doc.getElementById('AFOptRowsColumns').checked) { //or if AutoFill Option "rows and columns" is ticked, run this
	        		var aforcCheck = [];
	        		//ask user for input (rows,columns)
	        		var rowcolumn = prompt("Please input how many rows and columns are in your spritesheet.\n(Separate them with a comma, starting with rows first. Ex. \"12, 4\")");
	        		if (rowcolumn == null) { //if user cancels the dialogue box, stop
	        			statusOutput.innerHTML = "<span class='highlight removal'>Failure:</span> Rows + columns mod failed or was cancelled.";
	        			return;
	        		}
	        		do //if any were stored as true, throw errors and try again
	        		{	
	        			if (rowcolumn == null) { //if the user cancels the dialogue box or prevents additional input, stop
	        				statusOutput.innerHTML = "<span class='highlight removal'>Failure:</span> Rows + columns mod failed, was cancelled, or was prevented.";
	        				return;
	        			}
	        			else if (aforcCheck[0]) //if there's not two strings, throw invalid format error
	        			{
	        				rowcolumn = prompt("Invalid format! Please try again.\n\nPlease input how many rows and columns are in your spritesheet.\n(Separate them with a comma, starting with rows first. Ex. \"12, 4\")");
	        			}
	        			else if (aforcCheck[1]) //if they can't be converted to numbers, throw invalid input error
	        			{
	        				rowcolumn = prompt("Invalid input! Only numbers are accepted. Please try again.\n\nPlease input how many rows and columns are in your spritesheet.\n(Separate them with a comma, starting with rows first. Ex. \"12, 4\")");
	        			}
	        			else if (aforcCheck[2] || aforcCheck[3]) //if they aren't positive or integers, throw different invalid input error
	        			{
	        				rowcolumn = prompt("Invalid input! Only non-zero, positive integers are accepted. Please try again.\n\nPlease input how many rows and columns are in your spritesheet.\n(Separate them with a comma, starting with rows first. Ex. \"12, 4\")");
	        			}
	        			rowcolumn = rowcolumn.split(",");
	        			aforcCheck[0] = (rowcolumn.length != 2); //store True if rowcolumn does not have two entries exactly
	        			aforcCheck[1] = rowcolumn.some(x => isNaN(x)); //store True if one of the two entries does not convert to a number
	        			aforcCheck[2] = rowcolumn.some(x => Number(x) <= 0); //store True if one of the two entries is less than or equal to zero
	        			aforcCheck[3] = rowcolumn.some(x => !Number.isInteger(Number(x))); //store True if one of the two entries isn't an integer
	        		} while (aforcCheck.some(x => x == true));
	        		inputx.value = Math.round(img.width/rowcolumn[1]);
	        		inputy.value = Math.round(img.height/rowcolumn[0]);
	        		statusOutput.innerHTML = "<span class='highlight addition'>Success:</span> Upload successful, rows + columns mod used";
	        		redrawFrames();
	        		return;
	        	}
	        	/* ======================================
	        			Autofill Options end here
	        	====================================== */
				if (advancedMode) { //if advanced mode is on, skip analysis
	        		statusOutput.innerHTML = "<span class='highlight addition'>Success:</span> Advanced mode on with no additional options. Upload successful.";
					redrawFrames();
					return;
				}
				var imgData = context.getImageData(0, 0, canvas.width, canvas.height).data;
				var alphaData = [];
				for (i = 1; i*4-1 < imgData.length; i ++) {
					alphaData[i] = imgData[i*4-1];
				}
				chain = 0;
				ready = false;
				//warning: you are entering some heavily undercommented territory and I flat out did NOT want to comment the analyzer I'm sorry, good luck
				//finding Y value
				outY:
				for (y = 4; y <= canvas.height-1; y++) {
					for (x = 4; x <= canvas.width-1; x++) {
						if (alphaData[x+canvas.width*y] != 0 && chain < 8 && y != canvas.height - 4) {
							logDebug("BREAK ",x,y);
							ready = true;
							chain = 0;
							break;
						}
						else if ((chain >= 8 && alphaData[x+canvas.width*y] != 0) || y == canvas.height - 4) {
							logDebug("CHAIN BROKEN @ ",x,y,", ROLLING BACK");
							y--;
							var possibleSizeY = [];
							while (chain >= 4) {
								logDebug(chain,y,canvas.height%y)
								if (canvas.height % y == 0) {
									/*
									logDebug("Y STATUS: FOUND, ",y);
									inputy.value = y;
									var sizeY = y;
									break outY;
									 !! DEPRECATED CODE !!
									*/
									//log each valid Y value and check each one later
									possibleSizeY[possibleSizeY.length] = y;
								}
								chain--;
								y--;
							}
							var validator = [];
							var invalid = false;
							while (possibleSizeY.length > 0) { 							//if Y values WERE logged, run through them until there aren't any or until broken
								logDebug("possible heights: ",possibleSizeY); 			//log it in debug mode, just in case
								let focus = possibleSizeY.pop(); 						//pop/remove the last saved Y value, save to temp variable
								for (i = 1; i < (canvas.height/focus); i++) { 			//run as long as there are slices to be made
									invalid = false;
									let z = context.getImageData(0, (i*focus)-4,
															canvas.width-1, 8).data; 	//nab image data from each slice w/ temp variable
									for (j = 1; j*4-1 < z.length; j++) {
										validator[j] = z[j*4-1];						//take alpha data from each slice, put it in validator variable
									}
									logDebug(validator);								//log validator, again just in case
									if (validator.some(x => x != 0)) {					//if there are ANY non-zero transparency pixels,
										logDebug("Invalidated! ",focus)
										invalid = true;									//mark this run as invalid,
										break;											//and break out of the "slices" loop
									}
								}
								if (!invalid) {											//if the run was not invalid,
									logDebug("Y STATUS: FOUND, ",focus);				//celebrate,
									inputy.value = focus;								//mark it down not once, (once for input box)
									var sizeY = focus;									//but twice,			 (twice for future algorithm)
									break outY;											//and break out of this entire shi-bang
								}
							}
							logDebug("Y STATUS: FAILURE, ASKING TO FILL IN IMAGE HEIGHT AS FALLBACK");
							if (window.confirm("Couldn't find frame Y! Press OK to fill in image height as a fallback, or press Cancel to leave your Y value as it is.")) {
								inputy.value = canvas.height;
							}
							sizeY = canvas.height;
							break outY;
						}
						else if (x == canvas.width-1 && ready) {
							chain++;
							logDebug("ROW ",y," GOOD, CHAIN: ",chain);
							continue;
						}
					}
				}
				chain = 0;
				ready = false;
				//finding X value
				outX: for (x = 4; x <= canvas.width-1; x++) {
					for (y = 4; y <= sizeY; y++) {
						if (alphaData[x+canvas.width*y] != 0 && chain < 8 && x != canvas.width - 4) {
							logDebug("BREAK ",x,y);
							ready = true;
							chain = 0;
							break;
						}
						else if ((chain >= 8 && alphaData[x+canvas.width*y] != 0) || x == canvas.width - 4) {
							logDebug("CHAIN BROKEN @ ",x,y,", ROLLING BACK");
							x--;
							var possibleSizeX = [];
							while (chain >= 4) {
								logDebug(chain,x,canvas.width%x)
								if (canvas.width % x == 0) {
									/*
									logDebug("X STATUS: FOUND, ",x);
									inputx.value = x;
									break outX;
									 !! DEPRECATED CODE !!
									*/
									//log each valid Y value and check each one later
									possibleSizeX[possibleSizeX.length] = x;
								}
								chain--;
								x--;
							}
							while (possibleSizeX.length > 0) { 							//if X values WERE logged, run through them until there aren't any or until broken
								logDebug("possible widths: ",possibleSizeX); 			//log it in debug mode, just in case
								let focus = possibleSizeX.pop(); 						//pop/remove the last saved X value, save to temp variable
								for (i = 1; i < (canvas.width/focus); i++) { 			//run as long as there are slices to be made
									invalid = false;
									let z = context.getImageData((i*focus)-4, 0,
															8, sizeY-1).data; 			//nab image data from each slice w/ temp variable
									for (j = 1; j*4-1 < z.length; j++) {
										validator[j] = z[j*4-1];						//take alpha data from each slice, put it in validator variable
									}
									logDebug(validator);								//log validator, again just in case
									if (validator.some(x => x != 0)) {					//if there are ANY non-zero transparency pixels,
										logDebug("Invalidated! ",focus)
										invalid = true;									//mark this run as invalid,
										break;											//and break out of the "slices" loop
									}
								}
								if (!invalid) {											//if the run was not invalid,
									logDebug("X STATUS: FOUND, ",focus);				//celebrate,
									inputx.value = focus;								//mark it down only once this time, for input box
									break outX;											//and break out of this entire shi-bang
								}
							}
							logDebug("X STATUS: FAILURE, ASKING TO FILL IN IMAGE WIDTH AS FALLBACK");
							if (window.confirm("Couldn't find frame X! Press OK to fill in image width as a fallback, or press Cancel to leave your X value as it is.")) {
								inputx.value = canvas.width;
							}
							break outX;
						}
						else if (y == sizeY-1 && ready) {
							chain++;
							logDebug("COLUMN ",x," GOOD, CHAIN: ",chain);
							continue;
						}
					}
				}
				redrawFrames();
				cropping();
			}
			img.src = event.target.result;
		}
		statusOutput.innerHTML = "<span class='highlight addition'>Success:</span> Analyzing complete, autofilled";
		reader.readAsDataURL(e.target.files[0]);
	}
	// Pre-existing JSON handler 
	else if (e.currentTarget.value.endsWith('.json')) {
		reader.onload = function(event) {
			var jsonObj = JSON.parse(event.target.result);
			inputx.value = jsonObj.size[0];
			inputy.value = jsonObj.size[1];
			list = doc.getElementsByClassName("expression");
			for (i = list.length; i > 4; i--) {
				list[i].getElementsByClassName("removebutton")[0].dispatchEvent(clickevent);
			}
			customexpressions = 0;
			listnumber = 0;
			for (i = 0; i < jsonObj.clips.length; i++) {
				switch (jsonObj.clips[i].name) {
					case "neutral":
						listnumber = 0;
						break;
					case "happy":
						listnumber = 1;
						break;
					case "barely":
						listnumber = 2;
						break;
					case "missed":
						listnumber = 3;
						break;
					default:
						customexpressions++;
						listnumber = 3 + customexpressions;
						doc.getElementsByClassName("addbutton")[0].dispatchEvent(clickevent);
						list[listnumber].querySelector('[name=expressionname]').value = jsonObj.clips[i].name;
						break;
				}
				list[listnumber].querySelector('*[name=frames]').value = jsonObj.clips[i].frames.toString();
				list[listnumber].querySelector('*[name=fps]').value = jsonObj.clips[i].fps;
				list[listnumber].getElementsByTagName("select")[0].value = jsonObj.clips[i].loop;
				if (typeof jsonObj.clips[i].loopStart != undefined) {
					list[listnumber].querySelector('*[name=loopStart]').value = jsonObj.clips[i].loopStart;
				}	
			}
		}
		statusOutput.innerHTML = "<span class='highlight addition'>Success:</span> JSON uploaded";
		reader.readAsText(event.target.files[0]);
	}
	// fallback, skips filename autofill
	else {
		alert('Invalid filetype! Accepted filetypes are \'.json\'s and \'.png\'s!');
		if (e.currentTarget.value.split(".").length == 1) {
			statusOutput.innerHTML = "<span class='highlight removal'>Failure:</span> No filetype (make sure it's .json or .png)";
			return;
		}
		statusOutput.innerHTML = "<span class='highlight removal'>Failure:</span> Invalid filetype \"." + e.currentTarget.value.split(".")[e.currentTarget.value.split(".").length - 1] + "\" (make sure it's .json or .png)";
		return;
	}
	lastUploadedFilename = e.currentTarget.value;
	// filename autofill, only runs if the file type was valid
	var filenameautofill = e.currentTarget.value.split("\\");
	filenameautofill = filenameautofill[filenameautofill.length-1].split(".")[0];
	doc.getElementsByName('filename')[0].value = filenameautofill;
}
function redrawFrames() {
	framedata = [];
	canvasX = Number(inputx.value);
	framecountx = Math.ceil(canvas.width/canvasX);
	canvasY = Number(inputy.value);
	framecounty = Math.ceil(canvas.height/canvasY);
	for (y = 1; y <= framecounty; y++) {
		for (x = 1; x <= framecountx; x++) {
			framedata[x+y*framecountx-framecountx-1] = context.getImageData(x*canvasX-canvasX,y*canvasY-canvasY,canvasX,canvasY);
		}
	}
}
function previewAnim(event) {
	stopAnim = true;
	redrawFrames();
	var focus = event.currentTarget;
	if (doc.getElementsByName("autofill")[0].value.endsWith('.png') != true) {
		alert("Previewing animations won't work unless you have a .png uploaded! Press the \"Browse\" button at the top of the page to upload a spritesheet.")
		return;
	}
	else if (focus.parentNode.querySelector("*[name=frames]").value == "") {
		alert("You can't preview an animation with no frames!");
		return;
	}
	let x = inputx.value;
	let y = inputy.value;
	framework = [];
	framework = focus.parentNode.querySelector("*[name=frames]").value;
	framework = framework.split(",");
	for (i = 0; i < framework.length; i++) {
		framework[i] = Number(framework[i]);
		if (framedata[framework[i]] == undefined) {
			alert("Spritesheet does not have frame " + framework[i] + "! Wrong framesize maybe?");
			return;
		}
	}
	if (focus.parentNode.querySelector("*[name=loopStart]").value && Number(focus.parentNode.querySelector("*[name=loopStart]").value) <= framework.length) {
		loopStart = Number(focus.parentNode.querySelector("*[name=loopStart]").value);
	}
	else if (Number(focus.parentNode.querySelector("*[name=loopStart]").value) > framework.length) {
		alert("Loop start works by the \"Frames\" field, not the actual frames in the spritesheet! Example: if you wanted the first frame, frame " + framework[0] + ", you would put Loop Start as 0!\n\nDefaulting to no loop start.");
		loopStart = 0;
	}
	else {
		loopStart = 0;
	}

	let loopSelect = focus.parentNode.querySelector("select");
	loopingCheck = loopSelect.options[loopSelect.selectedIndex].value;
	if (loopSelect.options[loopSelect.selectedIndex].value == "no" || loopStart != 0) {
		//make play button appear
	}
	startAnim(focus.parentNode.querySelector("*[name=fps]").value);
	//this line goes at the end of the function
	animCanvas.parentNode.setAttribute("style", "display: inline-block;");
	toggleCroppingMenu();
	setTimeout(toggleCroppingMenu(), 10);
}
function startAnim(fpsArg) {
	stopAnim = false;
	fpsArg = Number(fpsArg);
	if (fpsArg == 0) {
		fpsArg = 12;
	}
	animBaseWidth = Number(inputx.value);
	animBaseHeight = Number(inputy.value);
	animCanvas.width = animBaseWidth;
	animCanvas.height = animBaseHeight;
	currentframe = 0;
	fpsInt = 1000/fpsArg;
	then = window.performance.now();
	animate();
}
function animate(frametime) {
	if (stopAnim) {
		animContext.clearRect(0,0,animCanvas.width,animCanvas.height);
		animCanvas.parentNode.setAttribute("style", "display: none;");
		toggleCroppingMenu();
		setTimeout(toggleCroppingMenu(), 10);
		return;
	}
	requestAnimationFrame(animate);
	let smallcheck = false;
	if (animScale != Number(doc.getElementById('animationScaleInput').value)) {smallcheck = true;}
	animScale = Number((doc.getElementById('animationScaleInput').value ? doc.getElementById('animationScaleInput').value : animScale));
	if (smallcheck && croppingMenu) {toggleCroppingMenu(); setTimeout(toggleCroppingMenu(),10)}
	now = frametime;
	elapsed = now - then;
	if (elapsed > fpsInt) {
		then = now - (elapsed % fpsInt);
		if (currentframe == framework.length && loopingCheck != "no") {
			currentframe = loopStart;
		}
		animCanvas.setAttribute("style", "width: " + String(animBaseWidth*animScale) + "px; height: " + String(animBaseHeight*animScale) + "px");
		if (framedata[framework[currentframe]]) {
			animContext.clearRect(0,0,animCanvas.width,animCanvas.height);
			animContext.putImageData(framedata[framework[currentframe]],0,0);
		}
		if (currentframe < framework.length) {
			currentframe++;
		}
	}
}
function addExpression(event) {
	newExpressionNumber += 1;
	event.currentTarget.insertAdjacentHTML("beforebegin", "<div class=\"expression\"><img class=\"removebutton\" src=\"assets/remove button.png\" onclick=\"deleteExpression(event)\"> <b>Expression:</b> <input type=\"text\" name=\"expressionname\" value=\"newExpression" + newExpressionNumber + "\"> | <span class=\"animationData\"><b>Frames:</b> <input type=\"text\" name=\"frames\" placeholder=\"0,1,2,3,4...4,3,2,1,0\"> | <b>Loop:</b>\n<select name=\"loopSelect\">\n<option value=\"yes\" selected=\"selected\">Loop at end</option>\n<option value=\"onBeat\">Loop on beat</option>\n<option value=\"no\">Don't loop</option>\n</select> |\n<b>FPS:</b> <input type=\"number\" min=0 value=0 name=\"fps\" style=\"width: 50px;\"> | <b>Loop Start:</b>\n<input type=\"number\" name=\"loopStart\" placeholder=\"(optional)\"> | \n<img src=\"assets/play button.png\" class=\"preview\" onclick=\"previewAnim(event)\"></span><span class=\"portraitData\"><b>Portrait Size:</b> <input type=\"number\" value=\"25\" min=\"0\" name=\"portraitSizeX\" style=\"width: 60px\">x<input type=\"number\" value=\"25\" min=\"0\" name=\"portraitSizeY\" style=\"width: 60px\"> | <b>Portrait Offset:</b> <input type=\"number\" value=\"0\" name=\"portraitOffsetX\" style=\"width: 60px\">x<input type=\"number\" value=\"0\" name=\"portraitOffsetY\" style=\"width: 60px\"> | <b>Portrait Scale:</b> <input type=\"number\" value=\"2.0\" step=\"0.1\" name=\"portraitScale\" style=\"width: 60px\">x</span></div>");
	doc.getElementById('datadisplay').dispatchEvent(changeevent);
	doc.getElementById('main').scrollBy(0,1e6);
}
function deleteExpression(event) {
	if (event.currentTarget.parentNode.className.includes("expressionNoDelete")) {
		alert("The first four expressions cannot be deleted; they are required!")
	}
	else {
		newExpressionNumber -= 1;
		event.currentTarget.parentNode.remove();
	}
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
function drawSwitch(ctx, x, y, sizeX, sizeY, isOn) {
	//aw yea first modular function baby -DS
	ctx.beginPath();
	ctx.arc(x+(sizeX/4), y+(sizeY/2), sizeX/4, 1.5*Math.PI, 0.5*Math.PI, true);
	ctx.arc(x+(3*sizeX/4), y+(sizeY/2), sizeX/4, 0.5*Math.PI, 1.5*Math.PI, true);
	if (isOn) {
		ctx.fillStyle = "#00ff00";
		positionX = x+(3*sizeX/4);
	}
	else {
		ctx.fillStyle = "#666666";
		positionX = x+(sizeX/4);
	}
	ctx.fill();
	ctx.beginPath();
	ctx.arc(positionX, y+(sizeY/2), 7*sizeX/32, 0, 2*Math.PI);
	if (isOn) {
		ctx.fillStyle = "#00b300"
	}
	else {
		ctx.fillStyle = "#999999"
	}
	ctx.fill();
}
function toggleAdvanced(event) {
	if (event.shiftKey) {
		if (!advancedMode) {
			if (confirm("This will allow you to delete the first four expressions and make the sprite size as big or as small as you want! Be sure you know what you're doing! Some effects may be irreversible until a reload is performed!\n\nPress OK to turn on advanced mode, or press cancel to return to normal editing.")) {
				advancedMode = !advancedMode;
			}
			else {return;}
		}
		else {
			if (confirm("Disabling advanced mode will only limit your sprite sizes back to 9 pixel minimums. This will not recover the first four expressions. Hold Ctrl and press R or F5 to reload if necessary (you will lose most or all of your expression data!)\n\nPress OK to disable advanced mode, or press cancel to keep editing in advanced mode.")) {
				advancedMode = !advancedMode;
			}
			else {return;}
		}
		if (advancedMode) {
			while (doc.getElementsByClassName("expressionNoDelete").length > 0) {
				doc.getElementsByClassName("expressionNoDelete")[0].setAttribute("class", "expression");
				newExpressionNumber += 1;
			}
			while (doc.querySelectorAll("[readonly]").length > 0) {
				doc.querySelectorAll("[readonly]")[0].removeAttribute("readonly");
			}
			inputx.removeAttribute("min");
			inputy.removeAttribute("min");
			doc.getElementsByClassName("advancedNotif")[0].setAttribute("class", "hint advancedNotif enabled");
		}
		else {
			if (inputx.value < 9) {
				inputx.value = 9;
			}
			if (inputy.value < 9) {
				inputy.value = 9;
			}
			inputx.setAttribute("min","9");
			inputy.setAttribute("min","9");
			doc.getElementsByClassName("advancedNotif")[0].setAttribute("class", "hint advancedNotif disabled");
		}
		advancedContext.clearRect(0,0,advancedCanvas.width,advancedCanvas.height);
		drawSwitch(advancedContext,0,0,50,25,advancedMode);
	}
	else {
		warningFlash.style.webkitAnimation = "";
		warningFlash.style.animation = "";
	}
}
function restartWarningFlash() {
	warningFlash.style.webkitAnimation = "none";
	warningFlash.style.animation = "none";
	setTimeout(function() {
		warningFlash.style.webkitAnimation = "";
		warningFlash.style.animation = "";
		warningFlash.style.animationPlayState = "paused";
	}, 10);
}
function scrollToTop() {
	if (helpMode) {
		var toTopElement = doc.getElementById('helpMenu'); 
	}
	else {
		var toTopElement = doc.getElementById('main');
	}
	toTopElement.scrollTo(0,0);
}
function toggleCroppingMenu() {
	let menuStyle = "";
	if (doc.getElementsByName("autofill")[0].value.endsWith('.png') != true) {
		return;
	}
	croppingMenu = !croppingMenu;
	if (croppingMenu) {
		if (animCanvas.parentNode.getAttribute("style") != "display: none;") {
			menuStyle += "left: calc(" + String(animCanvas.parentNode.offsetWidth) + "px + 2vw); ";
		}
		menuStyle += "display: inline-block;";
		doc.getElementById("croppingDiv").setAttribute("style",menuStyle);
	}
	else {
		doc.getElementById("croppingDiv").setAttribute("style", "display: none;");
	}
}
function cropping() {
	let layout = doc.getElementById("cropLayout").options[doc.getElementById("cropLayout").selectedIndex].value;
	let guide = doc.getElementById("cropGuide").options[doc.getElementById("cropGuide").selectedIndex].value;
	let color = doc.getElementById("cropGuideColor").options[doc.getElementById("cropGuideColor").selectedIndex].value;
	let x = inputx.value;
	let y = inputy.value;
	switch (layout) {
		case "0": // single frame (default)
		cropBaseWidth = x;
		cropBaseHeight = y;
		break;
		case "1": // double frame vertical
		cropBaseWidth = x;
		cropBaseHeight = y * 2;
		break;
		case "2": // double frame horizontal
		cropBaseWidth = x * 2;
		cropBaseHeight = y;
		break;
		case "3": // quadruple frame 2x2
		cropBaseWidth = x * 2;
		cropBaseHeight = y * 2;
		break;
	}
	cropCanvas.width = cropBaseWidth;
	cropCanvas.height = cropBaseHeight;
	cropContext.clearRect(0,0,cropBaseWidth,cropBaseHeight);
	cropContext.putImageData(context.getImageData(0,0,cropBaseWidth,cropBaseHeight),0,0);
	
	cropContext.beginPath();
	switch (layout) {
		case "0": // single frame (default)
		break;
		case "1": // double frame vertical
		cropContext.moveTo(0,cropBaseHeight/2);
		cropContext.lineTo(cropBaseWidth,cropBaseHeight/2);
		break;
		case "2": // double frame horizontal
		cropContext.moveTo(cropBaseWidth/2,0);
		cropContext.lineTo(cropBaseWidth/2,cropBaseHeight);
		break;
		case "3": // quadruple frame 2x2
		cropContext.moveTo(cropBaseWidth/2,0);
		cropContext.lineTo(cropBaseWidth/2,cropBaseHeight);
		cropContext.moveTo(0,cropBaseHeight/2);
		cropContext.lineTo(cropBaseWidth,cropBaseHeight/2);
		break;
	}
	cropContext.strokeStyle = "rgba(0,0,0,0.5)";
	cropContext.stroke();

	switch (color) {
		case "black":
		cropContext.strokeStyle = "black";
		break;
		case "white":
		cropContext.strokeStyle = "white";
		break;
		case "r":
		cropContext.strokeStyle = "red";
		break;
		case "o":
		cropContext.strokeStyle = "orange";
		break;
		case "y":
		cropContext.strokeStyle = "yellow";
		break;
		case "g":
		cropContext.strokeStyle = "green";
		break;
		case "b":
		cropContext.strokeStyle = "blue";
		break;
		case "i":
		cropContext.strokeStyle = "indigo";
		break;
		case "v":
		cropContext.strokeStyle = "purple";
		break;
	}
	cropContext.globalAlpha = 0.25;
	cropContext.lineWidth = 4;
	switch (guide) {
		case "true": //guide on
		switch (layout) {
			case "0": // single frame (default)
			cropContext.strokeRect(2,2,cropBaseWidth - 4,cropBaseHeight - 4);
			break;
			case "1": // double frame vertical
			cropContext.strokeRect(2,2,cropBaseWidth - 4,cropBaseHeight/2 - 4);
			cropContext.strokeRect(2,cropBaseHeight/2 + 2,cropBaseWidth - 4,cropBaseHeight/2 - 4);
			break;
			case "2": // double frame horizontal
			cropContext.strokeRect(2,2,cropBaseWidth/2 - 4,cropBaseHeight - 4);
			cropContext.strokeRect(cropBaseWidth/2 + 2,2,cropBaseWidth/2 - 4,cropBaseHeight - 4);
			break;
			case "3": // quadruple frame 2x2
			cropContext.strokeRect(2,2,cropBaseWidth/2 - 4,cropBaseHeight/2 - 4);
			cropContext.strokeRect(2,cropBaseHeight/2 + 2,cropBaseWidth/2 - 4,cropBaseHeight/2 - 4);
			cropContext.strokeRect(cropBaseWidth/2 + 2,2,cropBaseWidth/2 - 4,cropBaseHeight/2 - 4);
			cropContext.strokeRect(cropBaseWidth/2 + 2,cropBaseHeight/2 + 2,cropBaseWidth/2 - 4,cropBaseHeight/2 - 4);
			break;
		}
		break;
		case "false": //guide off
		break;
	}
	scaleCropping();
}
function scaleCropping() {
	if (cropScale != Number(doc.getElementById('croppingScaleInput').value)) {
		cropScale = Number(doc.getElementById('croppingScaleInput').value);
	}
	cropCanvas.setAttribute("style", "width: " + String(cropBaseWidth*cropScale) + "px; height: " + String(cropBaseHeight*cropScale) + "px");
}
function changeDisplay(event) {
	var displayFocus = [];
	var toDisplay = Number(event.currentTarget.options[event.currentTarget.selectedIndex].value);
	switch (toDisplay) {
		case 0:
		displayFocus = doc.getElementsByClassName("animationData");
		break;
		case 1:
		displayFocus = doc.getElementsByClassName("portraitData");
		break;
	}
	for (i = 0; i < displayFocus.length; i++) {
		displayFocus[i].removeAttribute("style");
	}
	switch (toDisplay) {
		case 0:
		displayFocus = doc.getElementsByClassName("portraitData");
		break;
		case 1:
		displayFocus = doc.getElementsByClassName("animationData");
		break;
	}
	for (i = 0; i < displayFocus.length; i++) {
		displayFocus[i].setAttribute("style", "display: none;")
	}
}
function exportJSON() {
	filename = doc.getElementsByName("filename")[0].value;
	if (filename.length == 0 || filename == null) {
		window.alert("The filename is required!");
		return;
	}
	selects = doc.getElementsByName("loopSelect");
	docexp = doc.getElementsByClassName("expression").length;
	frames = "";
	savedframes = [];
	expressiondata = [];
	for (i = 0; i < docexp; i++) {
		frames = doc.getElementsByName("frames")[i].value;
		savedframes = frames.split(",");
		for (j = 0; j < savedframes.length; j++) {
			savedframes[j] = Number(savedframes[j]);
		}
		if (Number(doc.getElementsByName("loopStart")[i].value) == 0 || doc.getElementsByName("loopStart")[i].value.length == 0 || selects[i].options[selects[i].selectedIndex].value == "no") {
			var iLoop = 0;
		}
		else {
			var iLoop = Number(doc.getElementsByName("loopStart")[i].value);
		}
		expressiondata[i] = {"name": doc.getElementsByName("expressionname")[i].value, 
		"frames": savedframes, "loop": selects[i].options[selects[i].selectedIndex].value,
		"fps": Number(doc.getElementsByName("fps")[i].value), "loopStart": iLoop, 
		"portraitOffset": [Number(doc.getElementsByName("portraitOffsetX")[i].value),Number(doc.getElementsByName("portraitOffsetY")[i].value)],
		"portraitSize": [Number(doc.getElementsByName("portraitSizeX")[i].value),Number(doc.getElementsByName("portraitSizeY")[i].value)],
		"portraitScale": Number(doc.getElementsByName("portraitScale")[i].value)};
	}
	
	var JSONStorage = 
	{"size": 
		[Number(doc.getElementsByName("sizeX")[0].value), 
		Number(doc.getElementsByName("sizeY")[0].value)],
	"clips":
		expressiondata,
	};

	// code snippet from codevoila.com
	let dataStr = JSON.stringify(JSONStorage, null, 4);
    let dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    let exportFileDefaultName = filename + '.json';

    let linkElement = doc.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click(); 
}
function logDebug() {
	if (debug == true) {
		console.log((Array.prototype.slice.call(arguments)).join(' '));
	}
}

const doc = document; //document shorthand - convenience
const inputx = doc.getElementsByName('sizeX')[0];
const inputy = doc.getElementsByName('sizeY')[0];
const changeevent = new Event('change'); //used to activate the onchange events specified in the HTML
const clickevent = new Event('click'); //used to activate the onclick events specified in the HTML
var debug = (window.location.href.startsWith("file://") ? true : false);
var debugActivator = '';
if (!debug) {
	window.addEventListener('keyup', function checkDebug(e) {
		if (e.key.length == 1 && isNaN(e.key)) {
			debugActivator = debugActivator + e.key.toLowerCase();
			if (debugActivator.length > 13) {
				debugActivator = debugActivator.substring(1);
			}
			console.log(debugActivator);
			if (debugActivator == 'posttoconsole') {
				console.log('printing to console')
				debug = true;
				window.removeEventListener('keyup', checkDebug);
			}
		}
	});
}
var stopAnim = false; //determines when to stop animation
var framedata = []; //stores image data for each frame
var framework = []; //stores sequence of frames to play matching above
var now = 0; //used for animation FPS
var then = 0;
var elapsed = 0;
var fpsInt = 0;
var currentframe = 0; //used for animation
var loopStart = 0;
var animScale = Number(doc.getElementById('animationScaleInput').value); //used for animation scaling
var cropScale = Number(doc.getElementById('croppingScaleInput').value);
var animBaseWidth = 0;
var animBaseHeight = 0;
var cropBaseWidth = 0;
var cropBaseHeight = 0;
var newExpressionNumber = 0; //determines what to put in the name box for each new expression
var helpMode = false; //determines if the help menu should be open or not
var advancedMode = false; //determines if advanced mode is on or not
var croppingMenu = false;
var loopingCheck = "x"; //determines if images will loop
var lastUploadedFilename = "";
var list = doc.getElementsByClassName("removebutton"); //applies onclick to each pre-existing delete expression button
for (i = 0; i < list.length; i++) {
	list[i].setAttribute("onclick", "deleteExpression(event)");
}
list = null; //clears list for later use
doc.getElementsByName('autofill')[0].addEventListener('change', fileHandling, false); 
if (doc.getElementsByName('autofill')[0].value) {
	doc.getElementsByName('autofill')[0].dispatchEvent(changeevent);
}
const canvas = doc.getElementById("initialCanvas");
var context = canvas.getContext("2d");
const animCanvas = doc.getElementById('animation');
var animContext = animCanvas.getContext("2d");
const cropCanvas = doc.getElementById("cropping");
var cropContext = cropCanvas.getContext("2d");
inputx.addEventListener('change', cropping, false);
inputy.addEventListener('change', cropping, false);
doc.getElementById('croppingScaleInput').addEventListener('change', scaleCropping, false);
doc.getElementById("cropLayout").addEventListener('change', cropping, false);
doc.getElementById("cropGuide").addEventListener('change', cropping, false);
doc.getElementById("cropGuideColor").addEventListener('change', cropping, false);
const advancedCanvas = doc.getElementById('advancedSwitch');
var advancedContext = advancedCanvas.getContext('2d');
drawSwitch(advancedContext,0,0,50,25,advancedMode);
const warningFlash = doc.getElementById("warning");
warningFlash.style.animationPlayState = "paused";
warningFlash.addEventListener("webkitAnimationEnd", restartWarningFlash, false);
warningFlash.addEventListener("animationend", restartWarningFlash, false);
doc.getElementById('datadisplay').dispatchEvent(changeevent);
cropping();