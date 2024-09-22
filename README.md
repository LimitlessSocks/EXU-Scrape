# Workflow

 1. Run `scrape-in-browser.js` on the EXU DuelingBook account, download `totalComposite.json` and move to this directory
 2. Run `browser-scrape-to-db.rb`, generating `unifiedComposite.json`
 3. Run `normalize-composite.rb`, generating `db-tmp.json`
 4. Run `note-differences.rb`, generating scrape info. If just changing normalization process, run `cp db-tmp.json db.json`.
 5. Run `finalize-scrape-v2.rb latest` (do NOT use `db` as a last parameter), generating `db.json`

# Updating banlist
 1. Run `normalize-composite.rb`, generating `db-tmp.json`
 2. Run `cp db-tmp.json db.json`.
 3. Run `finalize-scrape-v2.rb latest db` to incorporate the verdict.

# Updating to mirror DuelingBook's database

`scrape-book.rb && browser-scrape-to-db.rb && normalize-composite.rb && cp db-tmp.json db.json && finalize-scrape-v2.rb latest db`