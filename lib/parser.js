    this.ln = 0;
    this.lines = lines;
    this.result = {
        detailed: false,
        commits: []
    };
    while(this.ln < this.lines.length){
        let line = this.lines[this.ln];
        if(line.indexOf("From ") === 0)
            this.parseMetadata();
        else if(line.indexOf('diff ') === 0)
            this.parseDiff();
        else this.ln++;
    }
    if(this.currentCommit)
        this.result.commits.push(this.currentCommit);
    if(this.currentCommit)      
        this.result.commits.push(this.currentCommit);
        files: []
        let line = this.lines[this.ln];
        if(line.indexOf('diff ') === 0)
            break;
        if(isGettingMessage){
            if(line.indexOf('---') === 0)
                isGettingMessage = false;
            else{
                let message = (line.indexOf(' ') === 0) ? line : "\n#{line}";
                this.currentCommit.message += message
            }
        } else if(line.indexOf('From ') === 0){
            let matches = line.match(/^From\s([a-z|0-9]*)\s(\w.*)$/);
            if(matches.length === 3) {
                this.currentCommit.sha = matches[1];
                this.currentCommit.date = new Date(matches[2]);
            }
        } else if(line.indexOf('From: ') === 0){
            let matches = line.match(/^From:\s(.*)\s\<(\w.*)\>$/);
            if(matches.length === 3){
                this.currentCommit.author = matches[1];
                this.currentCommit.email = matches[2];
            } else {
                console.log(line);
                exit();
            }
        } else if(line.indexOf('Date: ') === 0){
            let matches = line.match(/^Date:\s(\w.*)$/);
            if(matches.length === 2)
                this.currentCommit.date = new Date(matches[1]);
        } else if(line.indexOf('Subject: ') === 0){
            this.currentCommit.message = line.substr(9);
            isGettingMessage = true;
        }
        this.ln++;
        this.currentCommit = {
            files: []
        }
    let parseFile = (s) => {
        s = s.trim();
        // ignore possible time stamp
        let t = (/\d{4}-\d\d-\d\d\s\d\d:\d\d:\d\d(.\d+)?\s(\+|-)\d\d\d\d/).exec(s);
        if(t)
            s = s.substring(0, t.index).trim();
        // ignore git prefixes a/ or b/
        if(s.match(/^(a|b)\//))
            return s.substr(2);
        else 
            return s;
    };
        deleted: false,
        added: false,
        renamed: false,
        binary: false,
        lines: []   
        if(((line.indexOf('diff ') === 0) && (!firstRun)) || (this.result.detailed && (line === '-- '))){
        if(line.indexOf('diff ') === 0) {
            // Git diff?
            let matches = line.match(/^diff\s\-\-git\s(a\/.*)\s(b\/.*)$/);
                file.from = parseFile(matches[1]);
                file.to = parseFile(matches[2]);
            }
        } else if(line.indexOf('+++ ') === 0){         //dest
                file.to = parseFile(line.substr(4));
        } else if(line.indexOf("--- ") === 0){
                file.from = parseFile(line.substr(4));
        else if(line === 'GIT binary patch'){
            file.binary = true;
            break;
        } else if (/^deleted file mode \d+$/.test(line)){
        else if (/^new file mode \d+$/.test(line)){
        else if (/^index\s[\da-zA-Z]+\.\.[\da-zA-Z]+(\s(\d+))?$/.test(line)){
        else if (/^Binary\sfiles\s(.*)differ$/.test(line)){
            file.binary = true
            break;
        } else if (/^@@\s+\-(\d+),(\d+)\s+\+(\d+),(\d+)\s@@/.test(line)){
            let matches = line.match(/^@@\s+\-(\d+),(\d+)\s+\+(\d+),(\d+)\s@@/)
            lineBreak = file.lines.length !== 0
            lnDel =+ matches[1]
            lnAdd =+ matches[3]
        } else {
            if(/^-/.test(line)){
                file.lines.push({
                    type: "deleted",
                    break: lineBreak && !file.added,
                    text: line.substr(1), 
                    ln1: (line !== noeol) ? lnDel++ : undefined
                });
            }else if(/^\+/.test(line)){
                file.lines.push({
                    type: "added",
                    break: lineBreak && (!file.added), 
                    text: line.substr(1), 
                    ln1: (line !== noeol) ? lnDel++ : undefined
                });
            } else 
                if(line!== noeol)
                    file.lines.push({
                        type: "normal",
                        break: lineBreak && (!file.added),
                        text: line.substr(1),
                        ln1:  (line !== noeol) ? lnDel++ : undefined,
                        ln2:  (line !== noeol) ? lnAdd++ : undefined
                    });
            lineBreak = false
        }
        firstRun = false;
        this.ln++;
    if (file.from === "/dev/null")
    let result = {};
    if(input instanceof Buffer)
        input = input.toString();
    let lines  = input.split('\n');
    return (new Parser(lines)).result