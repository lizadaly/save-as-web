# The case elider

Quick demo of a single page, dependency-free webapp to interface with the <a href="https://www.courtlistener.com/">CourtListener</a> search API, 
select an opinion, then do a simple highlight-elide-unelide loop.

1. Search for a case (e.g. "brown v board")
2. Select it from the results list
3. Find some content to elide and highlight it (*)
4. Once highlighted, click "Elide"
5. The content will now be elided. Click on the "..." you created to unelide.

* For now, only select within a single paragraph (or block-level element).

Demo at [https://lizadaly.github.io/save-as-web/case-elider/](https://lizadaly.github.io/save-as-web/case-elider/)

## TODO 

1. "Add all to clipboard" button (would only select the case content)
1. "Download as HTML" (ditto)
1. Auto-save in browser local storage
1. Allow retrieving previous cases from local storage