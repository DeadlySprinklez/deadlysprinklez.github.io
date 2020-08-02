function fileHandling(e) {
	var reader = new FileReader();
	// New spritesheet handler
	if (e.currentTarget.value.endsWith('.png')) {
	    reader.onload = function(event){
	        var img = new Image();
	        img.onload = function(){
	        	if (img.width < 9 || img.height < 9) {
					alert('Your image is too small to be a valid spritesheet!\nSpritesheets need to have multiple frames, each frame having four rows/columns of blank pixels on each side.\nIf you need a sample, there are plenty in #custom-assets at https://discord.com/rhythmdr/');
					return;
				}
				//doc.getElementsByName('sizeX')[0].value = img.width; (OBSOLETE AS OF JUNE 20th, R.I.P.)
				canvas.width = img.width;
				canvas.height = img.height;
				context.drawImage(img,0,0);
				if (doc.getElementsByName('sizeY')[0].value != 9 && doc.getElementsByName('sizeX')[0].value != 9) {
					if (!window.confirm("Size data was already filled in - press OK to overwrite, or press Cancel to upload the spritesheet without changing the frame size.")) {
						redrawFrames();
						return;
					}
				}
				var imgData = context.getImageData(0, 0, canvas.width, canvas.height).data;
				var alphaData = [];
				for (i = 1; i*4-1 < imgData.length; i ++) {
					alphaData[i] = imgData[i*4-1];
				}
				chain = 0;
				ready = false;
				//finding Y value
				outY: for (y = 4; y <= canvas.height-1; y++) {
					for (x = 4; x <= canvas.width-1; x++) {
						if (alphaData[x+canvas.width*y] != 0 && chain < 8 && y != canvas.height - 4) {
							console.log("BREAK ",x,y);
							ready = true;
							chain = 0;
							break;
						}
						else if ((chain >= 8 && alphaData[x+canvas.width*y] != 0) || y == canvas.height - 4) {
							console.log("CHAIN BROKEN @ ",x,y,", ROLLING BACK");
							y--;
							while (chain >= 4) {
								console.log(chain,y,canvas.height%y)
								if (canvas.height % y == 0) {
									console.log("Y STATUS: FOUND, ",y);
									doc.getElementsByName('sizeY')[0].value = y;
									var sizeY = y;
									break outY;
								}
								chain--;
								y--;
							}
							console.log("Y STATUS: FAILURE, FILLING IN IMAGE HEIGHT AS FALLBACK");
							if (window.confirm("Couldn't find frame Y! Press OK to fill in image height as a fallback, or press Cancel to leave your Y value as it is.")) {
								doc.getElementsByName('sizeY')[0].value = canvas.height;
							}
							sizeY = canvas.height;
							break outY;
						}
						else if (x == canvas.width-1 && ready) {
							chain++;
							console.log("ROW ",y," GOOD, CHAIN: ",chain);
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
							console.log("BREAK ",x,y);
							ready = true;
							chain = 0;
							break;
						}
						else if ((chain >= 8 && alphaData[x+canvas.width*y] != 0) || x == canvas.width - 4) {
							console.log("CHAIN BROKEN @ ",x,y,", ROLLING BACK");
							x--;
							while (chain >= 4) {
								console.log(chain,x,canvas.width%x)
								if (canvas.width % x == 0) {
									console.log("X STATUS: FOUND, ",x);
									doc.getElementsByName('sizeX')[0].value = x;
									break outX;
								}
								chain--;
								x--;
							}
							console.log("X STATUS: FAILURE, FILLING IN IMAGE WIDTH AS FALLBACK");
							if (window.confirm("Couldn't find frame X! Press OK to fill in image width as a fallback, or press Cancel to leave your X value as it is.")) {
								doc.getElementsByName('sizeX')[0].value = canvas.width;
							}
							break outX;
						}
						else if (y == sizeY-1 && ready) {
							chain++;
							console.log("COLUMN ",x," GOOD, CHAIN: ",chain);
							continue;
						}
					}
				}
				redrawFrames();
			}
			img.src = event.target.result;
		}
		reader.readAsDataURL(e.target.files[0]);
	}
	// Pre-existing JSON handler 
	else if (e.currentTarget.value.endsWith('.json')) {
		reader.onload = function(event) {
			var jsonObj = JSON.parse(event.target.result);
			doc.getElementsByName('sizeX')[0].value = jsonObj.size[0];
			doc.getElementsByName('sizeY')[0].value = jsonObj.size[1];
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
		reader.readAsText(event.target.files[0]);
	}
	// fallback, skips filename autofill
	else {
		alert('Invalid filetype! Accepted filetypes are \'.json\'s and \'.png\'s!')
		return;
	}
	// filename autofill, only runs if the file type was valid
	var filenameautofill = e.currentTarget.value.split("\\");
	filenameautofill = filenameautofill[filenameautofill.length-1].split(".")[0];
	doc.getElementsByName('filename')[0].value = filenameautofill;
}
function redrawFrames() {
	framedata = [];
	canvasX = Number(doc.getElementsByName('sizeX')[0].value);
	framecountx = (canvas.width)/canvasX;
	canvasY = Number(doc.getElementsByName('sizeY')[0].value);
	framecounty = (canvas.height)/canvasY;
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
	let x = doc.getElementsByName('sizeX')[0].value;
	let y = doc.getElementsByName('sizeY')[0].value;
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
}
function startAnim(fpsArg) {
	stopAnim = false;
	fpsArg = Number(fpsArg);
	if (fpsArg == 0) {
		fpsArg = 12;
	}
	baseWidth = Number(doc.getElementsByName('sizeX')[0].value);
	baseHeight = Number(doc.getElementsByName('sizeY')[0].value);
	animCanvas.width = baseWidth;
	animCanvas.height = baseHeight;
	currentframe = 0;
	fpsInt = 1000/fpsArg;
	then = window.performance.now();
	animate();
}
function animate(frametime) {
	if (stopAnim) {
		animContext.clearRect(0,0,animCanvas.width,animCanvas.height);
		animCanvas.parentNode.setAttribute("style", "display: none;");
		//make play button disappear
		return;
	}
	requestAnimationFrame(animate);
	scale = Number((doc.getElementById('scaleInput').value ? doc.getElementById('scaleInput').value : scale));
	now = frametime;
	elapsed = now - then;
	if (elapsed > fpsInt) {
		then = now - (elapsed % fpsInt);
		if (currentframe == framework.length && loopingCheck != "no") {
			currentframe = loopStart;
		}
		animCanvas.setAttribute("style", "width: " + String(baseWidth*scale) + "px; height: " + String(baseHeight*scale) + "px");
		if (framedata[framework[currentframe]]) {
			animContext.clearRect(0,0,animCanvas.width,animCanvas.height);
			animContext.putImageData(framedata[framework[currentframe]],0,0);
		}
		if (currentframe < framework.length) {
			currentframe++;
		}
	}
}
function loopStartCheck(event) {
	var focus = event.currentTarget;
	if (focus.options[focus.selectedIndex].value == "no") {
		focus.parentNode.lastElementChild.setAttribute("readonly", "");
		focus.parentNode.lastElementChild.value = null;
	}
	else {
		focus.parentNode.lastElementChild.removeAttribute("readonly");
	}
}
function addExpression(event) {
	var newExpressionNumber = doc.getElementsByClassName("expression").length - 3
	event.currentTarget.insertAdjacentHTML("beforebegin", "<div class=\"expression\"><img class=\"removebutton\" src=\"assets/remove button.png\" onclick=\"deleteExpression(event)\"> <b>Expression:</b> <input type=\"text\" name=\"expressionname\" value=\"newExpression" + newExpressionNumber + "\"> | <b>Frames:</b> <input type=\"text\" name=\"frames\" placeholder=\"0,1,2,3,4...4,3,2,1,0\"> | <b>Loop:</b>\n<select onchange=\"datareload(event)\">\n<option value=\"yes\" selected=\"selected\">Loop at end</option>\n<option value=\"onBeat\">Loop on beat</option>\n<option value=\"no\">Don't loop</option>\n</select> |\n<b>FPS:</b> <input type=\"number\" min=0 value=0 name=\"fps\" style=\"width: 50px;\"> | <b>Loop Start:</b>\n<input type=\"number\" name=\"loopStart\" placeholder=\"(optional)\"> | \n<img src=\"assets/play button.png\" class=\"preview\" onclick=\"previewAnim(event)\"></div>");
	doc.getElementById('main').scrollBy(0,1e6);
}
function deleteExpression(event) {
	if (event.currentTarget.parentNode.className.includes("expressionNoDelete")) {
		alert("The first four expressions cannot be deleted; they are required!")
	}
	else {
		event.currentTarget.parentNode.remove();
	}
}
function exportJSON() {
	filename = doc.getElementsByName("filename")[0].value;
	if (filename.length == 0 || filename == null) {
		window.alert("The filename is required!");
		return;
	}
	selects = doc.getElementsByTagName("SELECT");
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
			expressiondata[i] = {"name": doc.getElementsByName("expressionname")[i].value, 
			"frames": savedframes, "loop": selects[i].options[selects[i].selectedIndex].value,
			"fps": Number(doc.getElementsByName("fps")[i].value)};
		}
		else {
			expressiondata[i] = {"name": doc.getElementsByName("expressionname")[i].value, 
			"frames": savedframes, "loop": selects[i].options[selects[i].selectedIndex].value,
			"fps": Number(doc.getElementsByName("fps")[i].value), "loopStart": Number(doc.getElementsByName("loopStart")[i].value)};
		}
	}
	
	var JSONStorage = 
	{"size": 
		[Number(doc.getElementsByName("sizeX")[0].value), 
		Number(doc.getElementsByName("sizeY")[0].value)],
	"clips":
		expressiondata,
	};

	// code snippet from codevoila.com
	let dataStr = JSON.stringify(JSONStorage);
    let dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    let exportFileDefaultName = filename + '.json';

    let linkElement = doc.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click(); 
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
function toggleAdvanced(event) {
	if (event.shiftKey) {
		advancedMode = !advancedMode;
		console.log("Advanced Mode: " + String(advancedMode));
		//TODO: actually implement the damn thing
	}
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

const doc = document;
const changeevent = new Event('change');
const clickevent = new Event('click');
var stopAnim = false;
var framedata = [];
var framework = [];
var now = 0;
var then = 0;
var elapsed = 0;
var fpsInt = 0;
var currentframe = 0;
var loopStart = 0;
var scale = Number(doc.getElementById('scaleInput').value);
var baseWidth = 0;
var baseHeight = 0;
var helpMode = false;
var advancedMode = false;
var loopingCheck = "yes";
var list = doc.getElementsByTagName("SELECT");
for (i = 0; i < list.length; i++) {
	list[i].setAttribute("onchange", "loopStartCheck(event)");
	list[i].dispatchEvent(changeevent);
}

list = doc.getElementsByClassName("removebutton");
for (i = 0; i < list.length; i++) {
	list[i].setAttribute("onclick", "deleteExpression(event)");
}
list = null;
doc.getElementsByName('autofill')[0].addEventListener('change', fileHandling, false);
const canvas = doc.getElementById("initialCanvas");
var context = canvas.getContext("2d");
const animCanvas = doc.getElementById('animation');
var animContext = animCanvas.getContext("2d");
if (doc.getElementsByName('autofill')[0].value) {
	doc.getElementsByName('autofill')[0].dispatchEvent(changeevent);
}