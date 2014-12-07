class Parser
  constructor: (@lines) ->
    @ln = 0

    @result =
      detailed: false
      commits: []

    while @ln < @lines.length
      line = @lines[@ln]
      # Metadata?
      if line.indexOf("From ") is 0
        @parseMetadata()
      else if line.indexOf("diff ") is 0
        @parseDiff()
      else
        @ln++

    @result.commits.push(@currentCommit) if @currentCommit

  parseMetadata: ->
    @result.detailed = true
    @result.commits.push(@currentCommit) if @currentCommit

    @currentCommit =
      files: []

    isGettingMessage = false

    while @ln < @lines.length
      line = @lines[@ln]

      break if line.indexOf("diff ") is 0

      if isGettingMessage
        if line.indexOf("---") is 0
          isGettingMessage = false

          # Strip "[PATCH X/X] if any"
          matches = @currentCommit.message.match(/^\[PATCH\s(\d*)\/(\d*)\](.*)/)
          if matches.length is 4
            @currentCommit.message = matches[3].trim()

        else
          @currentCommit.message += if line.indexOf(" ") is 0 then line else "\n#{line}"

      else if line.indexOf("From ") is 0
        matches = line.match(/^From\s([a-z|0-9]*)\s(\w.*)$/)

        if matches.length is 3
          @currentCommit.sha  = matches[1]
          @currentCommit.date = new Date(matches[2])

      else if line.indexOf("From: ") is 0
        matches = line.match(/^From:\s(.*)\s\<(\w.*)\>$/)

        if matches.length is 3
          @currentCommit.author  = matches[1]
          @currentCommit.email = matches[2]
        else
          console.log line
          exit()

      else if line.indexOf("Date: ") is 0
        matches = line.match(/^Date:\s(\w.*)$/)

        if matches.length is 2
          @currentCommit.date  = new Date(matches[1])

      else if line.indexOf("Subject: ") is 0
        @currentCommit.message = line.substr(9)
        isGettingMessage = true

      @ln++

  parseDiff: ->
    if not @currentCommit then @currentCommit =
      files: []

    parseFile = (s) ->
      s = s.trim()
      # ignore possible time stamp
      t = (/\d{4}-\d\d-\d\d\s\d\d:\d\d:\d\d(.\d+)?\s(\+|-)\d\d\d\d/).exec(s)
      s = s.substring(0, t.index).trim() if t
      # ignore git prefixes a/ or b/
      return if s.match (/^(a|b)\//) then s.substr(2) else s

    file =
      deleted: false
      added: false
      renamed: false
      binary: false
      lines: []

    firstRun = true
    lineBreak = false

    lnDel = 0
    lnAdd = 0
    noeol = "\\ No newline at end of file"

    while @ln < @lines.length
      line = @lines[@ln]
      
      if (line.indexOf("diff ") is 0 and not firstRun) or (@result.detailed and line is "-- ")
        break

      if line.indexOf("diff ") is 0
        # Git diff?
        matches = line.match(/^diff\s\-\-git\s(a\/.*)\s(b\/.*)$/)

        if matches.length is 3
          file.from = parseFile(matches[1])
          file.to   = parseFile(matches[2])

      else if line.indexOf("+++ ") is 0
        file.to = parseFile(line.substr(4)) unless file.to

      else if line.indexOf("--- ") is 0
        file.from = parseFile(line.substr(4)) unless file.from

      else if line is "GIT binary patch"
        file.binary = true
        break

      else if /^deleted file mode \d+$/.test(line)
        file.deleted = true

      else if /^new file mode \d+$/.test(line)
        file.added = true

      else if /^new file mode \d+$/.test(line)
        file.added = true

      else if /^index\s[\da-zA-Z]+\.\.[\da-zA-Z]+(\s(\d+))?$/.test(line)
        file.index = line.split(' ').slice(1)

      else if /^Binary\sfiles\s(.*)differ$/.test(line)
        file.binary = true
        break

      else if /^@@\s+\-(\d+),(\d+)\s+\+(\d+),(\d+)\s@@/.test(line)
        matches = line.match(/^@@\s+\-(\d+),(\d+)\s+\+(\d+),(\d+)\s@@/)
        lineBreak = file.lines.length isnt 0
        lnDel   = +matches[1]
        lnAdd   = +matches[3]

      else
        if /^-/.test(line)
          file.lines.push
            type: "deleted"
            break: lineBreak and not file.added
            text: line.substr(1)
            ln1:  lnDel++ unless line is noeol
        else if /^\+/.test(line)
          file.lines.push
            type: "added"
            break: lineBreak and not file.added
            text: line.substr(1)
            ln1:  lnAdd++ unless line is noeol
        else
          if line isnt noeol then file.lines.push
            type: "normal"
            break: lineBreak and not file.added
            text: line.substr(1)
            ln1:  lnDel++ unless line is noeol
            ln2:  lnAdd++ unless line is noeol

        lineBreak = false


      firstRun = false
      @ln++

    if file.from is "/dev/null"
      file.added = true
    else
      file.renamed = not file.added and not file.deleted and file.to isnt file.from
      file.oldName = file.from if file.renamed

    file.name = file.to

    # Let's just assume it's binary if this is the case
    if file.lines.length is 0 and not @result.detailed
      file.binary = true
    
    delete file.from
    delete file.to

    @currentCommit.files.push(file)


module.exports = exports = (input) ->
  result = {}
  input  = input.toString() if input instanceof Buffer
  lines  = input.split("\n")

  return (new Parser(lines)).result
  