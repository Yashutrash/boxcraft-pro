const fs = require('fs');
const svg = fs.readFileSync('C:/Users/yashg/Downloads/Page 1.svg', 'utf8');

const regex = /<path d=\"([^\"]+)\" style=\"fill:none;fill-rule:nonzero;stroke:rgb\(237,50,47\);stroke-width:0\.5px;\"\/>/g;
let match;
console.log('Creases:');
while ((match = regex.exec(svg)) !== null) {
  console.log(match[1]);
}
