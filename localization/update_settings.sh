#!/bin/bash
for file in de.json fr.json es.json it.json pt.json nl.json pl.json sv.json no.json da.json fi.json cs.json ro.json el.json hu.json tr.json et.json ru.json uk.json; do
  # Use perl for better multiline support
  perl -i -pe 's/"deleteChatRoomConfirm": "([^"]*)"/"deleteChatRoomConfirm": "$1",\n    "settings": "Room Settings"/g' "$file"
done
