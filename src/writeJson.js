const fs = require('fs');
const path = require('path');

module.exports = (filename, data) => {
  fs.writeFile(path.join(__dirname, '..', filename), JSON.stringify(data), (err) => {
    if (err) throw err;
    console.log('file saved!');
  });
}
