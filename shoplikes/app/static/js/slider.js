
var segments = [];

function slider(seg) {
	var slider = document.getElementsByClassName("slider")[0];
	for (i in seg) {
		debugger;
		var text = seg[i];
		var node = document.createElement("div");
		node.className = "segment";
		node.style.width = (slider.clientWidth / seg.length) + "px"; 
		node.style.left = i * node.style.width;
		node.innerHTML = text;
		slider.appendChild(node);
	}
}