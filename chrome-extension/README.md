This directory contains the code for the front-end interface of the Number Rounding Service. It is deployed as a Chrome extension and works on any Chromium-based browser (e.g., Google Chrome, Microsoft Edge, Opera).

## Description

The extension interface allows the user to specify the following options:

1. The minimum magnitude (number of integer digits) of numbers that should be rounded.
1. The number of leading digits to round to.
1. Whether rounded numbers should have comma separator (e.g., 1,000,000 or 1000000).
1. One of three rounding modes.
	* *Digits only*: express the rounded numbers with only digits (e.g., 2,500,000).
	* *With modifier*: use modifier terms "million," "billion," "trillion" for large numbers (e.g., "2.5 million").
	* *Default*: follow the *With modifier* mode when the rounded number is at least a million and has at most two decimal digits; follow the *With modifier* mode otherwise.

Once the user clicks on the "Round numbers" button, the numbers that satisfy the rounding conditions will be replaced with their rounded versions. The rounded versions are highlighted and each shows a tooltip that displays the original number on hovering. The tooltip also has an Undo button to revert to the original number. To undo all roundings on the page, the user can also click on the "Undo all roundings" button in the extension interface.

Note that rounding also takes place as soon as a webpage finishes loading, using the original parameters shown in the extension interface. To change this behavior, see the **Customization** section below.


## Installation

To set up the extension, perform the following steps:

1. Open a new browser tab and enter the URL as `chrome://extensions`.
1. Click on the "Developer mode" toggle to enable it.
1. Click on "Load unpacked" and select this directory on the file selection menu.
1. The Number Rounding extension will show up on the list of installed extensions. Click on the toggle to enable it.
1. Open any webpage to see the extension ([example page](https://www.nytimes.com/2019/07/23/us/uc-admissions-2019.html)).

## Customization

By default the extension performs rounding on any new webpage that is opened. This behavior may interfere with the loading of certain webpages, such as Google Search. There are two ways to address this issue:

1. Change the value for the key `matches` in `manifest.json` from `<all_urls>` to a more specific URL match pattern. For example, if you only want to round numbers in New York Times articles, use the pattern `https://nytimes.com/*`. See more information about match patterns [here](https://developer.chrome.com/docs/extensions/mv2/match_patterns/).
1. Go to `js/content.js` and remove the call to `roundDocument()` right after the comment `// round document when page finishes loading`. In this way, rounding only begins when the user opens the extension menu and clicks on the "Round numbers" button.

## Disclaimer

This service is built as a proof of concept for the [corresponding paper](https://doi.org/10.1145/3491102.3501852). It may not work for all webpages and may not accurately detect all numbers that need rounding.



