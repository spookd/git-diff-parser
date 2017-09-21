/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class Parser {
  constructor(lines) {
    this.lines = lines;
    this.ln = 0;

    this.result = {
      detailed: false,
      commits: []
    };

    while (this.ln < this.lines.length) {
      const line = this.lines[this.ln];
      // Metadata?
      if (line.indexOf("From ") === 0) {
        this.parseMetadata();
      } else if (line.indexOf("diff ") === 0) {
        this.parseDiff();
      } else {
        this.ln++;
      }
    }

    if (this.currentCommit) { this.result.commits.push(this.currentCommit); }
  }

  parseMetadata() {
    this.result.detailed = true;
    if (this.currentCommit) { this.result.commits.push(this.currentCommit); }

    this.currentCommit =
      {files: []};

    let isGettingMessage = false;

    return (() => {
      const result = [];
      while (this.ln < this.lines.length) {
        var matches;
        const line = this.lines[this.ln];

        if (line.indexOf("diff ") === 0) { break; }

        if (isGettingMessage) {
          if (line.indexOf("---") === 0) {
            isGettingMessage = false;
          } else {
            this.currentCommit.message += line.indexOf(" ") === 0 ? line : `\n${line}`;
          }

        } else if (line.indexOf("From ") === 0) {
          matches = line.match(/^From\s([a-z|0-9]*)\s(\w.*)$/);

          if (matches.length === 3) {
            this.currentCommit.sha  = matches[1];
            this.currentCommit.date = new Date(matches[2]);
          }

        } else if (line.indexOf("From: ") === 0) {
          matches = line.match(/^From:\s(.*)\s\<(\w.*)\>$/);

          if (matches.length === 3) {
            this.currentCommit.author  = matches[1];
            this.currentCommit.email = matches[2];
          } else {
            console.log(line);
            exit();
          }

        } else if (line.indexOf("Date: ") === 0) {
          matches = line.match(/^Date:\s(\w.*)$/);

          if (matches.length === 2) {
            this.currentCommit.date  = new Date(matches[1]);
          }

        } else if (line.indexOf("Subject: ") === 0) {
          this.currentCommit.message = line.substr(9);
          isGettingMessage = true;
        }

        result.push(this.ln++);
      }
      return result;
    })();
  }

  parseDiff() {
    if (!this.currentCommit) { this.currentCommit =
      {files: []}; }

    const parseFile = function(s) {
      s = s.trim();
      if (s[0] === '"') { s = s.slice(1, -1); }
      // ignore possible time stamp
      const t = (/\d{4}-\d\d-\d\d\s\d\d:\d\d:\d\d(.\d+)?\s(\+|-)\d\d\d\d/).exec(s);
      if (t) { s = s.substring(0, t.index).trim(); }
      // ignore git prefixes a/ or b/
      if (s.match((/^(a|b)\//))) { return s.substr(2); } else { return s; }
    };

    const file = {
      deleted: false,
      added: false,
      renamed: false,
      binary: false,
      lines: []
    };

    let firstRun = true;
    let lineBreak = false;

    let lnDel = 0;
    let lnAdd = 0;
    const noeol = "\\ No newline at end of file";

    while (this.ln < this.lines.length) {
      var matches;
      const line = this.lines[this.ln];
      
      if (((line.indexOf("diff ") === 0) && !firstRun) || (this.result.detailed && (line === "-- "))) {
        break;
      }

      if (line.indexOf("diff ") === 0) {
        // Git diff?
        matches = line.match(/^diff\s\-\-git\s("a\/.*"|a\/.*)\s("b\/.*"|b\/.*)$/);

        if (matches.length === 3) {
          file.from = parseFile(matches[1]);
          file.to   = parseFile(matches[2]);
        }

      } else if (line.indexOf("+++ ") === 0) {
        if (!file.to) { file.to = parseFile(line.substr(4)); }

      } else if (line.indexOf("--- ") === 0) {
        if (!file.from) { file.from = parseFile(line.substr(4)); }

      } else if (line === "GIT binary patch") {
        file.binary = true;
        break;

      } else if (/^deleted file mode \d+$/.test(line)) {
        file.deleted = true;

      } else if (/^new file mode \d+$/.test(line)) {
        file.added = true;

      } else if (/^new file mode \d+$/.test(line)) {
        file.added = true;

      } else if (/^index\s[\da-zA-Z]+\.\.[\da-zA-Z]+(\s(\d+))?$/.test(line)) {
        file.index = line.split(' ').slice(1);

      } else if (/^Binary\sfiles\s(.*)differ$/.test(line)) {
        file.binary = true;
        break;

      } else if (/^@@\s+\-(\d+),(\d+)\s+\+(\d+),(\d+)\s@@/.test(line)) {
        matches = line.match(/^@@\s+\-(\d+),(\d+)\s+\+(\d+),(\d+)\s@@/);
        lineBreak = file.lines.length !== 0;
        lnDel   = +matches[1];
        lnAdd   = +matches[3];

      } else {
        if (/^-/.test(line)) {
          file.lines.push({
            type: "deleted",
            break: lineBreak && !file.added,
            text: line.substr(1),
            ln1:  line !== noeol ? lnDel++ : undefined
          });
        } else if (/^\+/.test(line)) {
          file.lines.push({
            type: "added",
            break: lineBreak && !file.added,
            text: line.substr(1),
            ln1:  line !== noeol ? lnAdd++ : undefined
          });
        } else {
          if (line !== noeol) { file.lines.push({
            type: "normal",
            break: lineBreak && !file.added,
            text: line.substr(1),
            ln1:  line !== noeol ? lnDel++ : undefined,
            ln2:  line !== noeol ? lnAdd++ : undefined
          }); }
        }

        lineBreak = false;
      }


      firstRun = false;
      this.ln++;
    }

    if (file.from === "/dev/null") {
      file.added = true;
    } else {
      file.renamed = !file.added && !file.deleted && (file.to !== file.from);
      if (file.renamed) { file.oldName = file.from; }
    }

    file.name = file.to;

    // Let's just assume it's binary if this is the case
    if ((file.lines.length === 0) && !this.result.detailed) {
      file.binary = true;
    }
    
    delete file.from;
    delete file.to;

    return this.currentCommit.files.push(file);
  }
}


module.exports = (exports = function(input) {
  const result = {};
  if (input instanceof Buffer) { input  = input.toString(); }
  const lines  = input.split("\n");

  return (new Parser(lines)).result;
});
  