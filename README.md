# Workflow

 1. Run `scrape-in-browser.js` on the EXU DuelingBook account, download `totalComposite.json` and move to this directory
 2. Run `browser-scrape-to-db.rb`, generating `unifiedComposite.json`
 3. Run `normalize-composite.rb`, generating `db-tmp.json`
 4. Run `note-differences.rb`, generating scrape info. If just changing normalization process, run `cp db-tmp.json db.json`.
 5. Run `finalize-scrape.rb`, generating `db.json`
