const fs = require('fs');
const path = '/media/veracrypt7/1-MLZ/5i9o1e4a0io/css/index_err.css';
let content = fs.readFileSync(path, 'utf8');
content = content.replace(/\.loginCardContainer/g, '.lognCardContainer');
content = content.replace(/\.cardlogin/g, '.cardlogn');
fs.writeFileSync(path, content, 'utf8');
console.log('Done');
