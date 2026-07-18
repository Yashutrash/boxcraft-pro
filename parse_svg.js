const fs = require('fs');
const svg = fs.readFileSync('C:/Users/yashg/Downloads/Page 1.svg', 'utf8');
const match = svg.match(/<path d=\"([^\"]+)\" style=\"fill:none;fill-rule:nonzero;stroke:rgb\(46,38,113\);stroke-width:0\.5px;\"\/>/);
if(match) {
  const d = match[1];
  const cmds = d.match(/[a-zA-Z][^a-zA-Z]*/g);
  console.log('Total commands:', cmds.length);
  cmds.forEach((cmd, i) => {
    console.log(i, cmd.trim());
  });
}
