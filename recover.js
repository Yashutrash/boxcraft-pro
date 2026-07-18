const fs = require('fs');

const fileContent = fs.readFileSync('C:/Users/yashg/boxcraft-pro/recover_view.txt', 'utf8');
const lines = fileContent.split('\n');
let out = '';

for (const line of lines) {
    if (!line) continue;
    try {
        const obj = JSON.parse(line);
        if (obj.content) {
             out += "CONTENT:\n" + obj.content + "\n\n";
        }
        if (obj.output) {
             out += "OUTPUT:\n" + obj.output + "\n\n";
        }
        if (obj.tool_calls) {
             for (const call of obj.tool_calls) {
                  if (call.name === 'write_to_file') out += "WRITE:\n" + call.args.CodeContent + "\n\n";
                  if (call.name === 'replace_file_content') out += "REPLACE:\n" + call.args.ReplacementContent + "\n\n";
             }
        }
    } catch (e) {
        // ignore
    }
}

fs.writeFileSync('C:/Users/yashg/boxcraft-pro/recover_clean.txt', out);
