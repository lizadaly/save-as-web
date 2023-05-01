# The case elider

Quick demo of a single page, dependency-free webapp to interface with the <a href="https://www.courtlistener.com/">CourtListener</a> search API,
select an opinion, then do a simple highlight-elide-unelide loop.

1. Search for a case (e.g. "brown v board")
2. Select it from the results list
3. Find some content to elide and highlight it
4. Once highlighted, click "Elide"
5. The content will now be elided. Click on the "..." you created to unelide.

Demo at [https://lizadaly.github.io/save-as-web/case-elider/](https://lizadaly.github.io/save-as-web/case-elider/)

([Vite](https://vitejs.dev) is present as an optional dependency for use during development, but is not required to run the app.)
