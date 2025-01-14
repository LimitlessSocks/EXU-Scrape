require 'date'

$BASE = "log-out"
$INDEX_PRE_PATH = File.join $BASE, "index-pre.html"
$INDEX_OUT_PATH = File.join $BASE, "index.html"

content = File.read($INDEX_PRE_PATH)
listing = Dir[File.join $BASE, "*.html"]
listing.reject! { |path| /index/ =~ path }

listing.sort_by! { |path|
    base = File.basename path, ".html"
    date = base[base.index("-")+1..-1]
    # p date
    DateTime.strptime date, "%m-%d-%Y.%H.%M.%S" rescue -1
}

html = ""
html += "<body>\n"
html += "  <h1>List of update logs</h1>\n"
html += "  <ul>"
listing.reverse_each { |path|
    link = File.basename path, ".html"
    html += "    <li><code><a href=\"./#{link}\">#{link}</a></code></li>"
}
html += "  </ul>"
html += "</body>"

content.sub!(/<body><\/body>/, html)

File.write $INDEX_OUT_PATH, content