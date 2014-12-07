# Git diff parser

## Install
```
npm install git-diff-parser
```

## Introduction
This is a very simple - and rough - parser for `git diff` and `git format-patch`.

I made this in an hours time as I needed it for another project of mine. No error handling or tests of any sorts implemented yet.

## Usage
Instead of describing the resulting objects I figured an example was self explanatory (right?):
```coffee
parser = require("git-diff-parser")
diff   = parser(require("fs").readFileSync("some.diff"))

# Better viewing of linenumbers
pad = (input = "-", toLeft = false) ->
  result = "#{input}"

  while result.length < 5
    result = if toLeft then "#{result} " else " #{result}"

  return result

# Loop all the commits
for commit in diff.commits
  console.log "Commit ##{commit.sha} by #{commit.author} <#{commit.email}>" if diff.detailed
  
  for file, i in commit.files
    console.log "" if i isnt 0
    
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
```

## Contribute
Feel free to optimize, improve and squish bugs. Simply fork it and make a pull request. Remember to add yourself to the list below.

**Contributors:**
* spookd ([Github](https://github.com/spookd))

## License (MIT)
```
Copyright (c) 2014 spookd and contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```