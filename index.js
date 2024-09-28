const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const countFilePath = path.join(__dirname, 'downloadCount.json');
const ipFilePath = path.join(__dirname, 'ipAddresses.json');

function getDownloadCount() {
    if (fs.existsSync(countFilePath)) {
        const data = fs.readFileSync(countFilePath);
        return JSON.parse(data).count;
    } else {
        const initialCount = { count: 0 };
        fs.writeFileSync(countFilePath, JSON.stringify(initialCount));
        return initialCount.count;
    }
}

function updateDownloadCount(count) {
    fs.writeFileSync(countFilePath, JSON.stringify({ count }));
}

function getIpAddresses() {
    if (fs.existsSync(ipFilePath)) {
        const data = fs.readFileSync(ipFilePath);
        return new Set(JSON.parse(data).ipAddresses);
    } else {
        const initialData = { ipAddresses: [] };
        fs.writeFileSync(ipFilePath, JSON.stringify(initialData));
        return new Set();
    }
}

function updateIpAddresses(ipSet) {
    fs.writeFileSync(ipFilePath, JSON.stringify({ ipAddresses: Array.from(ipSet) }));
}

let downloadCount = getDownloadCount();
let ipAddresses = getIpAddresses();

app.use('/static', express.static(path.join(__dirname, 'static')));

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>RPLIKER - Get FB reactions</title>
            <meta name="description" content="Increase reactions of your Facebook posts easily using RPLIKER app. Download it now.">
            <link rel="icon" type="image/png" href="/static/rpliker_icon.png">
            <style>
                body { font-family: Arial, Helvetica, sans-serif; }
                .modal { display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); }
                .modal-content { background-color: white; margin: 15% auto; padding: 20px; border: 1px solid #888; width: 80%; text-align: center; }
                .modal-header { font-size: 24px; margin-bottom: 20px; }
                .modal-footer { margin-top: 20px; }
                .btn { padding: 10px 20px; margin: 5px; cursor: pointer; }
                .btn-confirm { background-color: #28a745; color: white; border: none; }
                .btn-cancel { background-color: #dc3545; color: white; border: none; }
                .proof-images { display: flex; justify-content: center; margin-top: 20px; flex-wrap: wrap; }
                .proof-images .proof-image { position: relative; margin: 10px; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
                .proof-images img { width: 90px; height: 160px; object-fit: cover; transition: transform 0.2s; cursor: pointer; }
                .proof-images img:hover { transform: scale(1.05); }
            </style>
            <script>
                function showModal() {
                    document.getElementById('downloadModal').style.display = 'block';
                }

                function confirmDownload() {
                    document.getElementById('downloadForm').submit();
                }

                function cancelDownload() {
                    document.getElementById('downloadModal').style.display = 'none';
                }

                function enlargeImage(src) {
                    const enlargedModal = document.getElementById('enlargedModal');
                    const enlargedImage = document.getElementById('enlargedImage');
                    enlargedImage.src = src;
                    enlargedModal.style.display = 'block';
                }

                function closeEnlargedImage() {
                    document.getElementById('enlargedModal').style.display = 'none';
                }
            </script>
        </head>
        <body>
            <div style="text-align: center;">
                <br>
                <br>
                <img src="static/nashbot.jpg" style="height: 110px; width: 110px; border-radius: 16px;">
                <h1 style="font-size: 25px;">NASHBOT FACEBOOK AUTOBOT</h1>
                <form id="downloadForm" action="/download" method="get" style="display: inline;">
                    <button type="button" onclick="showModal()">
                        <img alt="Direct Download" src="https://fbpython.click/static/android_direct_download_icon.png" style="width: 300px;" />
                    </button>
                </form>
                <h2>Downloads: ${downloadCount}</h2>
                
                <div class="proof-images">
                    <div class="proof-image" onclick="enlargeImage('static/proof.jpg')">
                        <img src="/static/proof.jpg" alt="Proof Image 1">
                    </div>
                    <div class="proof-image" onclick="enlargeImage('static/proof2.jpg')">
                        <img src="/static/proof2.jpg" alt="Proof Image 2">
                    </div>
                    <div class="proof-image" onclick="enlargeImage('static/proof3.jpg')">
                        <img src="static/proof3.jpg" alt="Proof">
                    </div>
                </div>
            </div>

            <div id="downloadModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">Confirm Download</div>
                    <p>Do you really want to download the APK?</p>
                    <div class="modal-footer">
                        <button class="btn btn-confirm" onclick="confirmDownload()">Yes</button>
                        <button class="btn btn-cancel" onclick="cancelDownload()">No</button>
                    </div>
                </div>
            </div>

            <div id="enlargedModal" class="modal" onclick="closeEnlargedImage()">
                <img id="enlargedImage" style="width: 80%; margin: auto; display: block; max-height: 80%; border-radius: 8px;">
            </div>
        </body>
        </html>
    `);
});

app.get('/download', (req, res) => {
    const userIp = req.ip;

    if (!ipAddresses.has(userIp)) {
        downloadCount++;
        ipAddresses.add(userIp);
        updateDownloadCount(downloadCount);
        updateIpAddresses(ipAddresses);
    }

    res.download(path.join(__dirname, 'static/RPLIKERv5.apk'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
