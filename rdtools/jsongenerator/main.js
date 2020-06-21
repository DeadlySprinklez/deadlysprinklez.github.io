var tempdisable = document.body.querySelectorAll("*");
for (i = 0; i < tempdisable.length; i++) {
	tempdisable[i].setAttribute("disabled", "");
}

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
				var imgData = context.getImageData(0, 0, canvas.width, canvas.height);
				var position = 0;
				var chain = 0;
				var skip = false;
				for (var i = 1; i <= canvas.height; i++) {
					for (var j = 1; j <= canvas.width; j++) {
						console.log(j + " " + i);
						if (i > 1) {
							position = ((i-1)*canvas.width)+j
							if (imgData.data[position*4-1] != 0) {
								skip = true;
								console.log("Script used Skip Alpha! " + imgData.data[position*4-1] + ", " + position)
								break;
							}
						}
						else {
							if (imgData.data[j*4-1] != 0) {
								skip = true;
								console.log("Script used Skip Beta! " + imgData.data[j*4-1])
								break;
							}	
						}
					}
					console.log("Script attempts Chain Omega!")
					if (skip == false) {
						chain++;
						console.log("Chain increased!")
					}
					else {
						chain = 0;
						skip = false;
						console.log("...but it failed! Chain reset!")
						continue;
					}
					if (chain == 4) {
						document.getElementsByName('sizeY')[0].value = i;
						break;
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