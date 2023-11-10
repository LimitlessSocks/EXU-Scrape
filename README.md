# Workflow

 1. Run `scrape-in-browser.js` on the EXU DuelingBook account, download `totalComposite.json` and move to this directory
 2. Run `normalize-composite.rb`, generating `db-tmp.json`
 3. Run `note-differences.rb`, generating scrape info
 4. Run `finalize-scrape.rb`, generating `db.json`
