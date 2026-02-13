const https = require('https');
const fs = require('fs');

const url = "https://upload.wikimedia.org/wikipedia/commons/e/ed/Rajalakshmi_Engineering_College_%28REC%29_Chennai_Logo.jpg";
const file = fs.createWriteStream("public/rec_logo.jpg");

https.get(url, function (response) {
    response.pipe(file);
    file.on('finish', function () {
        file.close(() => {
            console.log("Download completed.");
        });
    });
}).on('error', function (err) {
    fs.unlink("public/rec_logo.jpg");
    console.error("Error downloading image: " + err.message);
});
