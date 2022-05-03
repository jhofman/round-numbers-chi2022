This directory contains the back-end code for the Number Rounding service. It is a simple wrapper for the [spaCy library](https://spacy.io/)'s named entity recognition functionality, deployed as an [Azure Function](https://azure.microsoft.com/en-us/services/functions/).

To set up the back-end, perform the following steps:
1. Follow the steps [here](https://www.youtube.com/watch?v=Fb5pO3-62Nc) to set up a basic Azure Function.
1. Overwrite your `__init__.py` with the file `RoundNumberFunction/__init__.py` in this directory. Do the same for `requirements.txt`.
1. Deploy the new Azure Functions.
1. Open the [Azure portal](https://portal.azure.com/) on a web browser. Type `Function App` on the search bar and select your deployed Function.
1. In the resulting pop-up window, select the CORS tab under the API section on the left navigation bar. Add `*` as a new allowed origin and click Save.
1. Select the Functions tab under the Functions section on the left navigation bar and click on the name of your Function. Doing this will direct you to another page with detailed information about the Function. Click on the "Get Function Url" button at the top, select `default (function key)` from the dropdown, and record the displayed URL.
1. Navigate to the sibling directory `chrome-extension` in this repository and open `js/content.js`. Replace the value of the `uri` variable with your Function URL.