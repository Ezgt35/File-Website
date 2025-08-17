const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware untuk file statis (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// Buat folder upload jika belum ada
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
fs.ensureDirSync(uploadDir);

const categorizedDirs = {
    Music: path.join(uploadDir, 'music'),
    Video: path.join(uploadDir, 'video'),
    Document: path.join(uploadDir, 'documents'),
    Image: path.join(uploadDir, 'images'),
    Archive: path.join(uploadDir, 'archives'),
    Script: path.join(uploadDir, 'scripts'),
    Other: path.join(uploadDir, 'other')
};

for (const dir of Object.values(categorizedDirs)) {
    fs.ensureDirSync(dir);
}

// Konfigurasi multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let dest = categorizedDirs.Other;
        if (file.mimetype.startsWith('image/')) dest = categorizedDirs.Image;
        else if (file.mimetype.startsWith('video/')) dest = categorizedDirs.Video;
        else if (file.mimetype.startsWith('audio/')) dest = categorizedDirs.Music;
        else if (file.mimetype.includes('pdf') || file.mimetype.includes('msword')) dest = categorizedDirs.Document;
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// Route upload
app.post('/upload', upload.single('file'), (req, res) => {
    res.send('File berhasil diupload');
});

// Fallback ke index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Jalankan server (hanya lokal, Vercel tidak pakai listen)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}

module.exports = app;
