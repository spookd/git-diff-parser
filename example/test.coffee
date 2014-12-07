parser = require("../index")
diff   =
  commits: []

process.stdout.write "Parse detailed diff? [Y] "

process.stdin.resume()
process.stdin.setEncoding("utf8")
process.stdin.on "data", (text) ->
  if text.toLowerCase().indexOf("n") is 0
    diff = parser(require("fs").readFileSync("short.diff"))
  else
    diff = parser(require("fs").readFileSync("long.diff"))

  run()

# Better viewing
pad = (input = "-", toLeft = false) ->
  result = "#{input}"

  while result.length < 5
    result = if toLeft then "#{result} " else " #{result}"

  return result

run = ->
  for commit, i in diff.commits
    console.log "\n\n\n" if i isnt 0
    
    console.log "Commit ##{commit.sha} by #{commit.author} <#{commit.email}> at #{commit.date}" if diff.detailed
    console.log commit.message
    console.log ""
    
    for file, j in commit.files
      console.log "" if j isnt 0
      
      console.log "[deleted] #{file.name}" if file.deleted
      console.log "[added] #{file.name}" if file.added
      console.log "[renamed] #{file.oldName} -> #{file.name}" if file.renamed
      console.log "[file] #{file.name}" if not file.added and not file.deleted and not file.renamed
      
      if file.binary
        console.log "<<< binary >>>"
      else
        for line in file.lines
          console.log "" if line.break
          console.log "#{pad()}/#{pad(line.ln1, true)} + #{line.text}" if line.type is "added"
          console.log "#{pad(line.ln1)}/#{pad("-", true)} - #{line.text}" if line.type is "deleted"
          console.log "#{pad(line.ln1)}/#{pad(line.ln2, true)}   #{line.text}" if line.type is "normal"

  process.exit()