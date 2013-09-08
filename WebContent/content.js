var port = chrome.extension.connect(), collapsers, options, jsonObject;

function displayError(error, loc, offset) {
	var link = document.createElement("link"), pre = document.body.firstChild.firstChild, text = pre.textContent.substring(offset), start = 0, ranges = [], idx = 0, end, range = document
			.createRange(), imgError = document.createElement("img"), content = document.createElement("div"), errorPosition = document.createElement("span"), container = document
			.createElement("div"), closeButton = document.createElement("div");
	link.rel = "stylesheet";
	link.type = "text/css";
	link.href = chrome.extension.getURL("content_error.css");
	document.head.appendChild(link);
	while (idx != -1) {
		idx = text.indexOf("\n", start);
		ranges.push(start);
		start = idx + 1;
	}
	start = ranges[loc.first_line - 1] + loc.first_column + offset;
	end = ranges[loc.last_line - 1] + loc.last_column + offset;
	range.setStart(pre, start);
	if (start == end - 1)
		range.setEnd(pre, start);
	else
		range.setEnd(pre, end);
	errorPosition.className = "error-position";
	errorPosition.id = "error-position";
	range.surroundContents(errorPosition);
	imgError.src = chrome.extension.getURL("error.gif");
	errorPosition.insertBefore(imgError, errorPosition.firstChild);
	content.className = "content";
	closeButton.className = "close-error";
	closeButton.onclick = function() {
		content.parentElement.removeChild(content);
	};
	content.textContent = error;
	content.appendChild(closeButton);
	container.className = "container";
	container.appendChild(content);
	errorPosition.parentNode.insertBefore(container, errorPosition.nextSibling);
	location.hash = "error-position";
	history.replaceState({}, "", "#");
}

function displayUI(theme, html) {
	var statusElement, toolboxElement, expandElement, reduceElement, viewSourceElement, optionsElement, content = "";
	content += '<link rel="stylesheet" type="text/css" href="' + chrome.extension.getURL("jsonview-core.css") + '">';
	content += "<style>" + theme + "</style>";
	content += html;
	document.body.innerHTML = content;
	collapsers = document.querySelectorAll("#json .collapsible .collapsible");
	statusElement = document.createElement("div");
	statusElement.className = "status";
	copyPathElement = document.createElement("div");
	copyPathElement.className = "copy-path";
	statusElement.appendChild(copyPathElement);
	document.body.appendChild(statusElement);
	toolboxElement = document.createElement("div");
	toolboxElement.className = "toolbox";
	expandElement = document.createElement("span");
	expandElement.title = "expand all";
	expandElement.innerText = "+";
	reduceElement = document.createElement("span");
	reduceElement.title = "reduce all";
	reduceElement.innerText = "-";
	viewSourceElement = document.createElement("a");
	viewSourceElement.innerText = "View source";
	viewSourceElement.target = "_blank";
	viewSourceElement.href = "view-source:" + location.href;
	optionsElement = document.createElement("img");
	optionsElement.title = "options";
	optionsElement.src = chrome.extension.getURL("options.png");
	toolboxElement.appendChild(expandElement);
	toolboxElement.appendChild(reduceElement);
	toolboxElement.appendChild(viewSourceElement);
	toolboxElement.appendChild(optionsElement);
	document.body.appendChild(toolboxElement);
	document.body.addEventListener('click', ontoggle, false);
	document.body.addEventListener('mouseover', onmouseMove, false);
	document.body.addEventListener('click', onmouseClick, false);
	document.body.addEventListener('contextmenu', onContextMenu, false);
	expandElement.addEventListener('click', onexpand, false);
	reduceElement.addEventListener('click', onreduce, false);
	optionsElement.addEventListener("click", function() {
		window.open(chrome.extension.getURL("options.html"));
	}, false);
	copyPathElement.addEventListener("click", function() {
		port.postMessage({
			copyPropertyPath : true,
			path : statusElement.innerText
		});
	}, false);

	document.body.addEventListener('keypress', function(e) {
	    if ( e.ctrlKey && e.which === 31 ) {
	        var e = new Event('click');
	        document.querySelectorAll('[title="reduce all"]')[0].dispatchEvent(e);
	    }

	    if ( e.ctrlKey && e.which === 43 ) {
	        var e = new Event('click');
	        document.querySelectorAll('[title="expand all"]')[0].dispatchEvent(e);
	    }
	}, false);

	document.body.addEventListener('keydown', function(e) {
		
		if ( e.which === 40 && document.querySelectorAll('.selected').length === 0) {
			document.querySelectorAll('.obj')[0].children[0].classList.add('selected')
			return;
		}

		if ( document.querySelectorAll('.selected').length !== 0 ) {
			
			//Down
			if ( e.which === 40 ) {
				var selected = document.querySelectorAll('.selected')[0];
				var isCollapsed = document.querySelectorAll('.selected > .hoverable')[0].classList.contains('collapsed'); 
				var firstChild = document.querySelectorAll('.selected > .hoverable > ul.collapsible > li')[0];
				
				if ( !isCollapsed && typeof firstChild !== 'undefined' ) {
					selected.classList.remove('selected');
					firstChild.classList.add('selected');
					return;
				}

				var siblings = selected.parentNode.children; 
				var current = Array.prototype.indexOf.call( siblings, selected );
				var next = siblings[ current + 1 ];

				if ( typeof next !== 'undefined' ) {
					selected.classList.remove('selected');
					next.classList.add('selected');
					return;
				}

				var parent = selected.parentNode.parentNode.parentNode;
				var siblings = parent.parentNode.children;
				var ix = Array.prototype.indexOf.call( siblings, parent );

				if ( ix > -1 && siblings.length > 1 ) {
					selected.classList.remove('selected');
					siblings[ ix + 1 ].classList.add('selected');
				}
			}

			//Up
			if ( e.which === 38 ) {
				var selected = document.querySelectorAll('.selected')[0];
				var siblings = selected.parentNode.children; 
				var current = Array.prototype.indexOf.call( siblings, selected );
				var prev = siblings[ current - 1 ];

				if ( typeof prev !== 'undefined' ) {
					selected.classList.remove('selected');
					prev.classList.add('selected');
					return;
				}

				selected.classList.remove('selected');
				selected.parentNode.parentNode.parentNode.classList.add('selected');
			}

			//Enter
			if ( e.which === 13 ) {
				var collapsed = document.querySelectorAll('.selected > .collapsed')[0];
				
				if ( typeof collapsed === 'undefined' ) {					
					var collapsible = document.querySelectorAll('.selected > .hoverable > .collapsible')[0]
					if ( typeof collapsible !== 'undefined' ) {
						collapsible.parentNode.classList.add('collapsed');
					}
					var prop = document.querySelectorAll('.selected > .hoverable > .property')[0];

					if ( prop && prop.innerHTML === 'href' ) {
						var anchor = document.querySelectorAll('.selected > .hoverable > a')[0];
						var linkFiller = document.querySelectorAll('.link-filler')[0]

						if ( typeof linkFiller !== 'undefined' ) {
							var editedHref = linkFiller.value;
							anchor.href = editedHref;
							anchor.innerText = editedHref;
							return;
						}
						
						var href = anchor.href;

						href = decodeURIComponent( href );

						if ( href.indexOf('{?') > -1 || href.indexOf('{&') > -1 ) {
							var parts = href.match( /{([?,&])(.+)}/ );
							if ( parts.length <= 1 ) {
								return;
							}

							var qsType = parts[ 1 ];
							var qsName = parts[ 2 ];

							var newHref = href.replace( /{[?,&].+}/, qsType + qsName + '=' );
							anchor.innerHTML = '<input class="link-filler" type="text" value="' + newHref + '" />';
							document.querySelectorAll('.link-filler')[0].addEventListener('click', function(e) {
								e.stopPropagation();
								e.preventDefault();
							});
							document.querySelectorAll('.link-filler')[0].focus();
							
							return;
						}
						window.location = href;
					}
					return;
				}

				collapsed.classList.remove('collapsed');
			}
		}
	});
}

function extractData(rawText) {
	var tokens, text = rawText.trim();

	function test(text) {
		return ((text.charAt(0) == "[" && text.charAt(text.length - 1) == "]") || (text.charAt(0) == "{" && text.charAt(text.length - 1) == "}"));
	}

	if (test(text))
		return {
			text : rawText,
			offset : 0
		};
	tokens = text.match(/^([^\s\(]*)\s*\(([\s\S]*)\)\s*;?$/);
	if (tokens && tokens[1] && tokens[2]) {
		if (test(tokens[2].trim()))
			return {
				fnName : tokens[1],
				text : tokens[2],
				offset : rawText.indexOf(tokens[2])
			};
	}
}

function processData(data) {
	var xhr, jsonText;
	
	function formatToHTML(fnName, offset) {
		if (!jsonText)
			return;	
		port.postMessage({
			jsonToHTML : true,
			json : jsonText,
			fnName : fnName,
			offset : offset
		});
		try {
			jsonObject = JSON.parse(jsonText);
		} catch (e) {
		}
	}

	if (window == top || options.injectInFrame)
		if (options.safeMethod) {
			xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function() {
				if (this.readyState == 4) {
					data = extractData(this.responseText);
					if (data) {
						jsonText = data.text;
						formatToHTML(data.fnName, data.offset);
					}
				}
			};
			xhr.open("GET", document.location.href, true);
			xhr.send(null);
		} else if (data) {
			jsonText = data.text;
			formatToHTML(data.fnName, data.offset);
		}
}

function ontoggle(event) {
	var collapsed, target = event.target;
	if (event.target.className == 'collapser') {
		collapsed = target.parentNode.getElementsByClassName('collapsible')[0];
		if (collapsed.parentNode.classList.contains("collapsed"))
			collapsed.parentNode.classList.remove("collapsed");
		else
			collapsed.parentNode.classList.add("collapsed");
	}
}

function onexpand() {
	Array.prototype.forEach.call(collapsers, function(collapsed) {
		if (collapsed.parentNode.classList.contains("collapsed"))
			collapsed.parentNode.classList.remove("collapsed");
	});
}

function onreduce() {
	Array.prototype.forEach.call(collapsers, function(collapsed) {
		if (!collapsed.parentNode.classList.contains("collapsed"))
			collapsed.parentNode.classList.add("collapsed");
	});
}

function getParentLI(element) {
	if (element.tagName != "LI")
		while (element && element.tagName != "LI")
			element = element.parentNode;
	if (element && element.tagName == "LI")
		return element;
}

var onmouseMove = (function() {
	var hoveredLI;

	function onmouseOut() {
		var statusElement = document.querySelector(".status");
		if (hoveredLI) {
			hoveredLI.firstChild.classList.remove("hovered");
			hoveredLI = null;
			statusElement.innerText = "";
		}
	}

	return function(event) {
		var str = "", statusElement = document.querySelector(".status");
		element = getParentLI(event.target);
		if (element) {
			if (hoveredLI)
				hoveredLI.firstChild.classList.remove("hovered");
			hoveredLI = element;
			element.firstChild.classList.add("hovered");
			do {
				if (element.parentNode.classList.contains("array")) {
					var index = [].indexOf.call(element.parentNode.children, element);
					str = "[" + index + "]" + str;
				}
				if (element.parentNode.classList.contains("obj")) {
					str = "." + element.firstChild.firstChild.innerText + str;
				}
				element = element.parentNode.parentNode.parentNode;
			} while (element.tagName == "LI");
			if (str.charAt(0) == '.')
				str = str.substring(1);
			statusElement.innerText = str;
			return;
		}
		onmouseOut();
	};
})();

var selectedLI;

function onmouseClick() {
	if (selectedLI)
		selectedLI.firstChild.classList.remove("selected");
	selectedLI = getParentLI(event.target);
	if (selectedLI) {
		selectedLI.firstChild.classList.add("selected");
	}
}

function onContextMenu() {
	var currentLI, statusElement, selection = "", i, value;
	currentLI = getParentLI(event.target);
	statusElement = document.querySelector(".status");
	if (currentLI) {
		if (Array.isArray(jsonObject))
			value = eval("(jsonObject" + statusElement.innerText + ")");
		else
			value = eval("(jsonObject." + statusElement.innerText + ")");
		port.postMessage({
			copyPropertyPath : true,
			path : statusElement.innerText,
			value : typeof value == "object" ? JSON.stringify(value) : value
		});
	}
}

function init(data) {
	port.onMessage.addListener(function(msg) {
		if (msg.oninit) {
			options = msg.options;
			processData(data);
		}
		if (msg.onjsonToHTML)
			if (msg.html) {
				displayUI(msg.theme, msg.html);
			} else if (msg.json)
				port.postMessage({
					getError : true,
					json : json,
					fnName : fnName
				});
		if (msg.ongetError) {
			displayError(msg.error, msg.loc, msg.offset);
		}
	});
	port.postMessage({
		init : true
	});
}

function load() {
	var child, data;
	if (document.body && (document.body.childNodes[0] && document.body.childNodes[0].tagName == "PRE" || document.body.children.length == 0)) {
		child = document.body.children.length ? document.body.childNodes[0] : document.body;
		data = extractData(child.innerText);
		if (data)
			init(data);
	}
}

load();
