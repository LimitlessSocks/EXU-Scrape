# for use on the command line, [32]|implode is necessary because windows quotes.
# call like jq -f script\find-dateless.jq db.json -r > script\missing.txt

[.[] | select(.date == null and .custom and .custom > 0)] | sort_by(.name) | .[] | (.id | tostring) + " " + .name
