
var segments = [];

function slider(seg) {
	debugger;
	segments = seg;
	var slider = document.getElementsByClassName("slider")[0];
	for (i in segments) {
		debugger;
		var text = segments[i];
		var node = document.createElement("div");
		node.className = "segment";
		node.style.width = (slider.clientWidth / segments.length) + "px"; 
		node.style.left = i * node.style.width;
		node.innerHTML = "<div onclick=\"segment_clicked("+i+")\">"+text+"</div>";
		slider.appendChild(node);
	}

	var selected = document.createElement("div");
	selected.className = "selected-segment";
	selected.style.width = (slider.clientWidth / segments.length) + "px"; 
	slider.appendChild(selected);
}


function segment_clicked(index) {
	debugger;
	var slider = document.getElementsByClassName("slider")[0];
	var selected = document.getElementsByClassName("selected-segment")[0];
	selected.style.left = index * (slider.clientWidth / segments.length) + "px";
}