const http = require('https'); // or 'https' for https:// URLs
const fs = require('fs');
const path = require('path');

const load = async (zoom)=>{
    const maxIndex = Math.pow(2,zoom)
    for(let i = 0; i< zoom; i++){
        for (let j = 0; j< zoom; j++){

            let dest = path.join(__dirname, 'cached');

            // Create directory if it does not exist
            const dir = path.dirname(dest);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            let destf = path.join(__dirname, 'cached', `${zoom}_${i}_${j}.png`);
            const file = fs.createWriteStream(destf);

            const request = http.get("https://b.tile.openstreetmap.org/1/0/0.png",
            //`https://b.tile.openstreetmap.org/${zoom}/${i}/${j}.png`,
             (response) => {
                // check if response is success
                console.log(`https://b.tile.openstreetmap.org/${zoom}/${i}/${j}.png`)
                if (response.statusCode !== 200) {
                    return cb('Response status was ' + JSON.stringify(Object.keys(response.statusMessage)));
                }
        
                response.pipe(file);
            });
            // fetch("https://b.tile.openstreetmap.org/10/1023/15.png", {
            //     "headers": {
            //       "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            //       "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
            //       "cache-control": "max-age=0",
            //       "if-none-match": "\"87fc8ea1962e8d562f90c3893be24bda\"",
            //       "sec-ch-ua": "\"Not?A_Brand\";v=\"99\", \"Opera\";v=\"97\", \"Chromium\";v=\"111\"",
            //       "sec-ch-ua-mobile": "?0",
            //       "sec-ch-ua-platform": "\"Windows\"",
            //       "sec-fetch-dest": "document",
            //       "sec-fetch-mode": "navigate",
            //       "sec-fetch-site": "none",
            //       "sec-fetch-user": "?1",
            //       "upgrade-insecure-requests": "1",
            //       "cookie": "_osm_totp_token=362605"
            //     },
            //     "referrerPolicy": "strict-origin-when-cross-origin",
            //     "body": null,
            //     "method": "GET"
            //   });

        
            let cb = console.log;

            // close() is async, call cb after close completes
            file.on('finish', () => {
                console.log('file write finished');
                file.close(cb)
            });
        
            // check for request error too
            request.on('error', (err) => {
                console.log('http request error');
                fs.unlink(dest, () => cb(err.message)); // delete the (partial) file and then return the error
            });
        
            file.on('error', (err) => { // Handle errors
                console.log('file write error');
                fs.unlink(dest, () => cb(err.message)); // delete the (partial) file and then return the error
            });

            // const request = http.get(`http://b.tile.openstreetmap.org/${zoom}/${i}/${j}.png`, function(response) {
            //     console.log(`http://b.tile.openstreetmap.org/${zoom}/${i}/${j}.png`)
            //     let dest = path.join(__dirname, 'cached', `${zoom}_${i}_${j}.png`);
            //     const file = fs.createWriteStream(dest);
            //     response.pipe(file);

            //     // after download completed close filestream
            //     file.on("finish", () => {
            //         file.close();
            //         console.log("Download Completed");
            //     });     
            // });
        }
    }

}

load(1)