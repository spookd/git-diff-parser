/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const parser = require("../index");
let diff   =
  {commits: []};

process.stdout.write("Parse detailed diff? [Y] ");

process.stdin.resume();
process.stdin.setEncoding("utf8");
process.stdin.on("data", function(text) {
  if (text.toLowerCase().indexOf("n") === 0) {
    diff = parser(require("fs").readFileSync("short.diff"));
  } else {
    diff = parser(require("fs").readFileSync("long.diff"));
  }

  return run();
});

// Better viewing
const pad = function(input, toLeft) {
  if (input == null) { input = "-"; }
  if (toLeft == null) { toLeft = false; }
  let result = `${input}`;

  while (result.length < 5) {
    result = toLeft ? `${result} ` : ` ${result}`;
  }

  return result;
};

var run = function() {
  for (let i = 0; i < diff.commits.length; i++) {
    const commit = diff.commits[i];
    if (i !== 0) { console.log("\n\n\n"); }
    
    if (diff.detailed) { console.log(`Commit #${commit.sha} by ${commit.author} <${commit.email}> at ${commit.date}`); }
    console.log(commit.message);
    console.log("");
    
    for (let j = 0; j < commit.files.length; j++) {
      const file = commit.files[j];
      if (j !== 0) { console.log(""); }
      
      if (file.deleted) { console.log(`[deleted] ${file.name}`); }
      if (file.added) { console.log(`[added] ${file.name}`); }
      if (file.renamed) { console.log(`[renamed] ${file.oldName} -> ${file.name}`); }
      if (!file.added && !file.deleted && !file.renamed) { console.log(`[file] ${file.name}`); }
      
      if (file.binary) {
        console.log("<<< binary >>>");
      } else {
        for (let line of Array.from(file.lines)) {
          if (line.break) { console.log(""); }
          if (line.type === "added") { console.log(`${pad()}/${pad(line.ln1, true)} + ${line.text}`); }
          if (line.type === "deleted") { console.log(`${pad(line.ln1)}/${pad("-", true)} - ${line.text}`); }
          if (line.type === "normal") { console.log(`${pad(line.ln1)}/${pad(line.ln2, true)}   ${line.text}`); }
        }
      }
    }
  }

  return process.exit();
};