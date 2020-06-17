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

function datareload(event) {
	var focus = event.currentTarget
	if (focus.options[event.currentTarget.selectedIndex].value == "no") {
		focus.parentNode.lastElementChild.setAttribute("readonly", "");
		focus.parentNode.lastElementChild.value = null;
	}
	else {
		focus.parentNode.lastElementChild.removeAttribute("readonly");
	}
}
function addExpression(event) {
	var newExpressionNumber = document.getElementsByClassName("expression").length - 3
	event.currentTarget.insertAdjacentHTML("beforebegin", "<div class=\"expression\"><img class=\"removebutton\" src=\"remove button.png\" onclick=\"deleteExpression(event)\"> <b>Expression:</b> <input type=\"text\" name=\"expressionname\" value=\"newExpression" + newExpressionNumber + "\"> | <b>Frames:</b> <input type=\"text\" name=\"frames\" placeholder=\"0,1,2,3,4...4,3,2,1,0\"> | <b>Loop:</b>\n<select onchange=\"datareload(event)\">\n<option value=\"yes\" selected=\"selected\">Loop at end</option>\n<option value=\"onBeat\">Loop on beat</option>\n<option value=\"no\">Don't loop</option>\n</select> |\n<b>FPS:</b> <input type=\"number\" min=0 value=0 name=\"fps\" style=\"width: 50px;\"> | <b>Loop Start:</b>\n<input type=\"number\" name=\"loopStart\" placeholder=\"(optional)\">\n</div>");
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