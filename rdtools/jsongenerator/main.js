
var changeevent = new Event('change');
list = document.getElementsByTagName("SELECT");
for (i = 0; i < list.length; i++) {
	list[i].setAttribute("onchange", "datareload(event)");
	list[i].dispatchEvent(changeevent);
}
list = document.getElementsByClassName("removebutton");
for (i = 0; i < list.length; i++) {
	list[i].setAttribute("onclick", "deleteExpression(event)");
}
list = null;
document.getElementsByName('autofill')[0].addEventListener('change', imageHandling, false);
var canvas = document.getElementById("initialCanvas");
var context = canvas.getContext("2d");

function imageHandling(e) {
	if (e.currentTarget.value.endsWith('.png')) {
		var filenameautofill = e.currentTarget.value.split("\\");
		filenameautofill = filenameautofill[filenameautofill.length-1].split(".")[0];
		document.getElementsByName('filename')[0].value = filenameautofill;
		var reader = new FileReader();
	    reader.onload = function(event){
	        var img = new Image();
	        img.onload = function(){
	        	if (img.width < 9 || img.height < 9) {
					alert('Your image is too small to be a valid spritesheet!\nSpritesheets need to have multiple frames, each frame having four rows/columns of blank pixels on each side.\nIf you need a sample, there are plenty in #custom-assets at https://discord.com/rhythmdr/');
					return;
				}
				//document.getElementsByName('sizeX')[0].value = img.width; (OBSOLETE AS OF JUNE 20th)
				canvas.width = img.width;
				canvas.height = img.height;
				context.drawImage(img,0,0);
				var imgData = context.getImageData(0, 0, canvas.width, canvas.height).data;
				var alphaData = [];
				for (i = 1; i*4-1 < imgData.length; i ++) {
					alphaData[i] = imgData[i*4-1];
				}
				chain = 0;
				//finding Y value
				outY: for (y = 4; y <= canvas.height-1; y++) {
					for (x = 4; x <= canvas.width-1; x++) {
						if (alphaData[x+canvas.width*y] != 0 && chain < 8) {
							console.log("BREAK ",x,y);
							chain = 0;
							break;
						}
						else if (chain >= 8 && alphaData[x+canvas.width*y] != 0) {
							console.log("CHAIN BROKEN!");
							while (chain >= 4) {
								console.log(chain,y,canvas.height%y)
								if (canvas.height % y == 0) {
									console.log("Y STATUS: FOUND, ",y);
									document.getElementsByName('sizeY')[0].value = y;
									var sizeY = y;
									break outY;
								}
								chain--;
								y--;
							}
							console.log("Y STATUS: FAILURE, FILLING IN IMAGE HEIGHT AS FALLBACK");
							document.getElementsByName('sizeY')[0].value = canvas.height;
							sizeY = canvas.height;
							break outY;
						}
						else if (x == canvas.width-1) {
							chain++;
							console.log("ROW ",y," GOOD, CHAIN: ",chain);
							continue;
						}
					}
				}
				chain = 0;
				//finding X value
				outX: for (x = 4; x <= canvas.width-1; x++) {
					for (y = 4; y <= sizeY; y++) {
						if (alphaData[x+canvas.width*y] != 0 && chain < 8) {
							console.log("BREAK ",x,y);
							chain = 0;
							break;
						}
						else if (chain >= 8 && alphaData[x+canvas.width*y] != 0) {
							console.log("CHAIN BROKEN!");
							while (chain >= 4) {
								console.log(chain,x,canvas.width%x)
								if (canvas.width % x == 0) {
									console.log("X STATUS: FOUND, ",x);
									document.getElementsByName('sizeX')[0].value = x;
									break outX;
								}
								chain--;
								x--;
							}
							console.log("X STATUS: FAILURE, FILLING IN IMAGE WIDTH AS FALLBACK");
							document.getElementsByName('sizeX')[0].value = canvas.width;
							break outX;
						}
						else if (y == sizeY-1) {
							chain++;
							console.log("COLUMN ",x," GOOD, CHAIN: ",chain);
							continue;
						}
					}
				}
			}
			img.src = event.target.result;
		}
		reader.readAsDataURL(e.target.files[0]);
	}
	else {
		alert('Invalid filetype! Spritesheets should be \'.png\'s only!')
		return;
	}
}
function datareload(event) {
	var focus = event.currentTarget
	if (focus.options[focus.selectedIndex].value == "no") {
		focus.parentNode.lastElementChild.setAttribute("readonly", "");
		focus.parentNode.lastElementChild.value = null;
	}
	else {
		focus.parentNode.lastElementChild.removeAttribute("readonly");
	}
}
function addExpression(event) {
	var newExpressionNumber = document.getElementsByClassName("expression").length - 3
	event.currentTarget.insertAdjacentHTML("beforebegin", "<div class=\"expression\"><img class=\"removebutton\" src=\"assets/remove button.png\" onclick=\"deleteExpression(event)\"> <b>Expression:</b> <input type=\"text\" name=\"expressionname\" value=\"newExpression" + newExpressionNumber + "\"> | <b>Frames:</b> <input type=\"text\" name=\"frames\" placeholder=\"0,1,2,3,4...4,3,2,1,0\"> | <b>Loop:</b>\n<select onchange=\"datareload(event)\">\n<option value=\"yes\" selected=\"selected\">Loop at end</option>\n<option value=\"onBeat\">Loop on beat</option>\n<option value=\"no\">Don't loop</option>\n</select> |\n<b>FPS:</b> <input type=\"number\" min=0 value=0 name=\"fps\" style=\"width: 50px;\"> | <b>Loop Start:</b>\n<input type=\"number\" name=\"loopStart\" placeholder=\"(optional)\">\n</div>");
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
	filename = document.getElementsByName("filename")[0].value;
	if (filename.length == 0 || filename == null) {
		window.alert("The filename is required!");
		return;
	}
	doc = document;
	selects = doc.getElementsByTagName("SELECT");
	docexp = doc.getElementsByClassName("expression").length;
	framedata = "";
	savedframedata = [];
	expressiondata = [];
	for (i = 0; i < docexp; i++) {
		framedata = doc.getElementsByName("frames")[i].value;
		savedframedata = framedata.split(",");
		for (j = 0; j < savedframedata.length; j++) {
			savedframedata[j] = Number(savedframedata[j]);
		}
		if (Number(doc.getElementsByName("loopStart")[i].value) == 0 || doc.getElementsByName("loopStart")[i].value.length == 0 || selects[i].options[selects[i].selectedIndex].value == "no") {
			expressiondata[i] = {"name": doc.getElementsByName("expressionname")[i].value, 
			"frames": savedframedata, "loop": selects[i].options[selects[i].selectedIndex].value,
			"fps": Number(doc.getElementsByName("fps")[i].value)};
		}
		else {
			expressiondata[i] = {"name": doc.getElementsByName("expressionname")[i].value, 
			"frames": savedframedata, "loop": selects[i].options[selects[i].selectedIndex].value,
			"fps": Number(doc.getElementsByName("fps")[i].value), "loopStart": Number(doc.getElementsByName("loopStart")[i].value)};
		}
	}
	console.log(expressiondata);
	
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

    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click(); 
}