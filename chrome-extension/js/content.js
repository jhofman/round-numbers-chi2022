console.log("Chrome Extension running");
const approximators = ['approximately', 'roughly', 'about', 'around', 'approaching'];
var uri = "https://round-numbers.azurewebsites.net/api/RoundNumberFunction";
var minDigitNum = 5;
var numberMatcher = new RegExp(`\\d{${minDigitNum}}\\d*`, "g");
var addCommaSeparator = true;
var leadingDigitCount = 1;
var roundingMode = "default";
var originalHTML;

main();

function main() {
	createPopupDiv();
	originalHTML = document.body.innerHTML;

	// round document when page finishes loading
	roundDocument();

	chrome.runtime.onMessage.addListener((message) => {
		if (message['undo-all-roundings']) {
			document.body.innerHTML = originalHTML;
		} 
		// round document again when receiving user input
		else {
			minDigitNum = message['min-digit-num'];
			// only match numbers with at least minDigitNum digits
			numberMatcher = new RegExp(`\\d{${minDigitNum}}\\d*`, "g");
			addCommaSeparator = message['add-comma'];
			leadingDigitCount = message['leading-digit'];
			roundingMode = message['rounding-mode'];
			roundDocument();
		}
	});
}

function roundDocument() {
	let newDocumentBody = document.createElement("body");
	newDocumentBody.innerHTML = originalHTML;

	// identify all the text nodes that need rounding
	let textNodes = [];
	findTextNodes(newDocumentBody, textNodes);
	textNodes = textNodes.filter(node => nodeShouldBeRounded(node));

	// if there are more than 5 nodes to round, round each of them asynchronously
	if (textNodes.length > 5) {
		console.log("async node rounding");
		textNodes.forEach(
			node => sendRoundingRequestToSpaCy([node.textContent], [node])
		);
	}
	// otherwise, round all of them together
	else {
		console.log("rounding all nodes");
		let paragraphs = textNodes.map(node => node.textContent);
		sendRoundingRequestToSpaCy(paragraphs, textNodes);
	}
	document.body.replaceWith(newDocumentBody);
}

function sendRoundingRequestToSpaCy(paragraphs, textNodes) {
	let opts = {
		method: 'POST',
		headers: {
			'Content-Type' : 'application/json',
		},
		body: JSON.stringify({"paragraphs" : paragraphs})
	};
	fetch(uri, opts)
		.then(response => response.json())
		.then(data => processEntityMaps(data, textNodes));
}

function processEntityMaps(responseData, textNodes) {
	// use the enity maps to detect numbers in each node and round them
	responseData.forEach((entityMap, index) => {
		let newTextAtNode = [];
		entityMap.forEach((token_entity, index) => {
			let [token, entity] = token_entity;
			let prevToken = index >= 1 ? entityMap[index - 1][0] : "";
			// if token is not a number to be rounded, preserve it
			if (['CARDINAL', 'MONEY'].indexOf(entity) == -1) {
				newTextAtNode.push(token);
			} else {
				roundToLeadingDigits(token, newTextAtNode, prevToken);
			}
		});
		if (newTextAtNode.length > 0) {
			const newNode = document.createElement('span');
			newNode.innerHTML = newTextAtNode.join("");
			configurePopup(newNode);
			textNodes[index].replaceWith(newNode);
		}
	});
}

/** HELPER FUNCTIONS **/

function createPopupDiv() {
	let popupDiv = document.createElement("div");
	popupDiv.classList.add("popup");
	popupDiv.id = "roundedfrom";
	document.body.appendChild(popupDiv);

	let popupContent = document.createElement("div");
	popupContent.append(document.createElement("span"));
	popupDiv.appendChild(popupContent);

	let undoButton = document.createElement("span");
	undoButton.setAttribute("data-icon", "ci:undo");
	undoButton.setAttribute("data-width", 14);
	undoButton.setAttribute("data-height", 14);
	undoButton.id = "undo-button";
	undoButton.classList.add("iconify");
	popupContent.appendChild(undoButton);
}

function findTextNodes(element, textNodes) {
	// recursively find all text nodes on a page
	if (element.hasChildNodes()) {
		element.childNodes.forEach(function(child) {
			findTextNodes(child, textNodes);
		});
	} else if (element.nodeType === Text.TEXT_NODE) {
		textNodes.push(element);
	}
}

function roundToLeadingDigits(token, newTextAtNode, prevToken) {
	let endInSpace = token.endsWith(' ');
	let original = parseInt(token.replaceAll(",", ""));
	if (isNaN(original)) {
		newTextAtNode.push(token);
		return;
	}

	let roundedWithDigitsOnly = Number(original.toPrecision(leadingDigitCount));
	if (original == roundedWithDigitsOnly) {
		newTextAtNode.push(token);
		return;
	}

	let roundedHTML = formatByRoundingMode(original, roundedWithDigitsOnly);
	// source: https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
	roundedHTML = addCommaSeparator ? roundedHTML.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : roundedHTML;
	// roundedHTML = approximators.indexOf(prevToken) == -1 ? "about " + roundedHTML : roundedHTML;
	roundedHTML = `<span data="${token.trim()}" class="rounding-output">${roundedHTML}</span>`
	roundedHTML = endInSpace ? roundedHTML + ' ' : roundedHTML;
	newTextAtNode.push(roundedHTML);
	
}

function nodeShouldBeRounded(node) {
	// only round paragraphs that contain a number meeting the min digit requirement
	return node.textContent.replaceAll(",", "").match(numberMatcher);
}

function formatByRoundingMode(original, roundedWithDigitsOnly) {
	let [roundedOutput, modifier] = 
		roundedWithDigitsOnly >= 1e12 ? [String(roundedWithDigitsOnly / 10**12), "trillion"] :
		roundedWithDigitsOnly >= 1e9 ? [String(roundedWithDigitsOnly / 10**9), "billion"] :
		roundedWithDigitsOnly >= 1e6 ? [String(roundedWithDigitsOnly / 10**6), "million"] : 
		[String(roundedWithDigitsOnly), ""];
	let decimalDigitCount = 
		roundedOutput.indexOf(".") >= 0 ? roundedOutput.split(".")[1].length : 0;
	let shouldRoundToDigitsOnly = 
		(roundingMode == "digits-only") ||
		(roundingMode == "default" && decimalDigitCount > 2) ||
		(modifier == "");
	return shouldRoundToDigitsOnly ? String(roundedWithDigitsOnly) : roundedOutput + " " + modifier;
}

function configurePopup(newNode) {
	let popupDiv = document.getElementById("roundedfrom");
	let undoButton = document.getElementById("undo-button");

	newNode.querySelectorAll(".rounding-output").forEach((span) => {
		span.addEventListener("mouseover", (event) => {
			let _this = event.currentTarget;
			let popupContent = popupDiv.querySelectorAll("div")[0];
			let originalNum = _this.getAttribute("data");
			// set the tooltip text to mention original value
			popupContent.querySelectorAll("span")[0].innerHTML = `Rounded from ${originalNum}`;

			// set the undo button to revert to original value and hide the pop-up
			undoButton.onclick = () => {
				_this.classList.remove("rounding-output");
				_this.innerHTML = originalNum;
				popupDiv.style.display = "none";
			};

			// show the pop-up
			popupDiv.style.display = "block";
			_this.appendChild(popupDiv);
		});

		span.addEventListener("mouseout", () => {
			popupDiv.style.display = "none";
		});
	});
}

