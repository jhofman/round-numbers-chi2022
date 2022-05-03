console.log("background running");

// send the input parameters to content script
document.getElementById("submit").onclick = () => {
	let minDigitNum = document.querySelector("#min-digit-num option:checked").value;
	let addComma = document.querySelector("input[name=comma]:checked").value == "add-comma";
	let leadingDigit = document.querySelector("#leading-digit option:checked").value;
	let roundingMode = document.querySelector("input[name=rouding-mode]:checked").value;
	let message = {
		"min-digit-num" : minDigitNum,
		"add-comma" : addComma,
		"leading-digit" : leadingDigit,
		"rounding-mode" : roundingMode
	};
	chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
		chrome.tabs.sendMessage(tabs[0].id, message);
	});
}

document.getElementById("undo-all-roundings").onclick = () => {
	chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
		chrome.tabs.sendMessage(tabs[0].id, {"undo-all-roundings" : true});
	});
}