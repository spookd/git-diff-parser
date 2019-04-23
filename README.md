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
```js
const parser = require("git-diff-parser");
const diff   = parser(require("fs").readFileSync("some.diff"));

// Better viewing of linenumbers
const pad = function(input, toLeft) {
  if (input === null) { input = "-"; }
  if (toLeft === null) { toLeft = false; }
  let result = `${input}`;

  while (result.length < 5) {
    result = toLeft ? `${result} ` : ` ${result}`;
  }

  return result;
};

// Loop all the commits
diff.commits.forEach(function(commit, idx) {
  if (idx !== 0) {
    console.log("\n\n\n");
  }

  if (diff.detailed) {
    console.log(`Commit #${commit.sha} by ${commit.author} <${commit.email}> at ${commit.date}`);
  }

  console.log(commit.message);
  console.log("");
  
  commit.files.forEach(function(file, idx) {
    if (idx !== 0) {
      console.log("");
      
      if (file.deleted) { console.log(`[deleted] ${file.name}`); }
      if (file.added) { console.log(`[added] ${file.name}`); }
      if (file.renamed) { console.log(`[renamed] ${file.oldName} -> ${file.name}`); }
      if (!file.added && !file.deleted && !file.renamed) { console.log(`[file] ${file.name}`); }
      
      if (file.binary) {
        console.log("<<< binary >>>");
      } else {
        file.lines.forEach(function(line) {
          if (line.break) { console.log(""); }
          if (line.type === "added") {console.log(`${pad()}/${pad(line.ln1, true)} + ${line.text}`); }
          if (line.type === "deleted") { console.log(`${pad(line.ln1)}/${pad("-", true)} - ${line.text}`); }
          if (line.type === "normal") { console.log(`${pad(line.ln1)}/${pad(line.ln2, true)}   ${line.text}`); }
        });
      }
    }
  });
});
```

## Contribute
Feel free to optimize, improve and squish bugs. Simply fork it and make a pull request. Remember to add yourself to the list below.

**Contributors:**
* spookd ([Github](https://github.com/spookd))
* ebutleratlassian ([Github](https://github.com/ebutleratlassian))

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