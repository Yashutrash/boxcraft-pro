const fs = require('fs');
const lines = fs.readFileSync('C:/Users/yashg/boxcraft-pro/recover_clean.txt', 'utf8').split('\n');

let fileContent = [];
let capturing = false;

for (let line of lines) {
    if (line.includes('1: import React, { useMemo } from "react";')) {
        capturing = true;
    }
    if (capturing) {
        if (line.includes('The above content shows the entire, complete file contents')) {
            break;
        }
        // Remove the "line_number: " prefix
        const match = line.match(/^\d+:\s?(.*)$/);
        if (match) {
            fileContent.push(match[1]);
        } else {
            // handle multiline or end of block? The view_file prefixes EVERY line with <num>: 
        }
    }
}

fs.writeFileSync('C:/Users/yashg/boxcraft-pro/src/components/Box3DViewer.jsx', fileContent.join('\n'));
console.log("Restored Box3DViewer.jsx, length:", fileContent.join('\n').length);
