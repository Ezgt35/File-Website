const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

const app = express();

// ✅ di Vercel ga perlu PORT & HOST
// const PORT = process.env.PORT || process.env.NODE_PORT || 3000;
// const HOST = process.env.HOST || '0.0.0.0';

// ✅ serve static file (html, css, js)
app.use(express.static(path.join(__dirname)));

// Create necessary directories
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
const categorizedDirs = {
    'Music': path.join(uploadDir, 'music'),
    'Video': path.join(uploadDir, 'video'),
    'Document': path.join(uploadDir, 'documents'),
    'Image': path.join(uploadDir, 'images'),
    'Archive': path.join(uploadDir, 'archives'),
    'Script': path.join(uploadDir, 'scripts'),
    'Other': path.join(uploadDir, 'other')
};


// Ensure directories exist
fs.ensureDirSync(uploadDir);
Object.values(categorizedDirs).forEach(dir => {
    fs.ensureDirSync(dir);
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Session configuration
app.use(session({
    secret: 'download-manager-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// File category mapping
function getFileCategory(filename) {
    const ext = path.extname(filename).toLowerCase();
    const categoryMap = {
        // Music
        '.mp3': 'Music',
        '.wav': 'Music',
        '.flac': 'Music',
        '.m4a': 'Music',
        '.aac': 'Music',
        
        // Video
        '.mp4': 'Video',
        '.avi': 'Video',
        '.mov': 'Video',
        '.wmv': 'Video',
        '.mkv': 'Video',
        
        // Documents
        '.pdf': 'Document',
        '.doc': 'Document',
        '.docx': 'Document',
        '.txt': 'Document',
        '.rtf': 'Document',
        
        // Images
        '.jpg': 'Image',
        '.jpeg': 'Image',
        '.png': 'Image',
        '.gif': 'Image',
        '.bmp': 'Image',
        
        // Archives
        '.zip': 'Archive',
        '.rar': 'Archive',
        '.7z': 'Archive',
        '.tar': 'Archive',
        '.gz': 'Archive',
        
        // Scripts
        '.js': 'Script',
        '.html': 'Script',
        '.css': 'Script',
        '.php': 'Script',
        '.py': 'Script'
    };
    
    return categoryMap[ext] || 'Other';
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const category = getFileCategory(file.originalname);
        const destPath = categorizedDirs[category];
        cb(null, destPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    }
});

// Load files database
function loadFilesDatabase() {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'files.json'), 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// Save files database
function saveFilesDatabase(files) {
    fs.writeFileSync(path.join(__dirname, 'files.json'), JSON.stringify(files, null, 2));
}

// Authentication middleware
function requireAuth(req, res, next) {
    if (req.session && req.session.authenticated) {
        next();
    } else {
        res.status(401).json({ success: false, message: 'Tidak diizinkan' });
    }
}

// Routes

// Check authentication status
app.get('/auth-status', (req, res) => {
    res.json({ 
        isAuthenticated: !!(req.session && req.session.authenticated) 
    });
});

// Login endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === 'Ezgt' && password === 'Ezgt123') {
        req.session.authenticated = true;
        req.session.user = username;
        res.json({ success: true, message: 'Login berhasil' });
    } else {
        res.json({ success: false, message: 'Username atau password salah' });
    }
});

// Logout endpoint
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            res.json({ success: false, message: 'Gagal logout' });
        } else {
            res.json({ success: true, message: 'Logout berhasil' });
        }
    });
});

// Get all files
app.get('/files', (req, res) => {
    const files = loadFilesDatabase();
    res.json(files);
});

// Upload file endpoint
app.post('/upload', requireAuth, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.json({ success: false, message: 'Tidak ada file yang diupload' });
    }
    
    const { filename, description } = req.body;
    const category = getFileCategory(req.file.originalname);
    
    // Load current files
    const files = loadFilesDatabase();
    
    // Generate new file ID
    const newId = files.length > 0 ? Math.max(...files.map(f => f.id)) + 1 : 1;
    
    // Create new file record
    const newFile = {
        id: newId,
        name: filename || req.file.originalname,
        description: description || '',
        category: category,
        originalName: req.file.originalname,
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size,
        uploadDate: new Date().toISOString()
    };
    
    // Add to database
    files.push(newFile);
    saveFilesDatabase(files);
    
    res.json({ 
        success: true, 
        message: 'File berhasil diupload',
        file: newFile 
    });
});

// Download file endpoint
app.get('/download/:id', (req, res) => {
    const fileId = parseInt(req.params.id);
    const files = loadFilesDatabase();
    const file = files.find(f => f.id === fileId);
    
    if (!file) {
        return res.status(404).json({ success: false, message: 'File tidak ditemukan' });
    }
    
    const filePath = file.path;
    
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, message: 'File tidak ditemukan di server' });
    }
    
    // Set appropriate headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
});

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.json({ success: false, message: 'File terlalu besar (maksimal 100MB)' });
        }
    }
    
    console.error('Server error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
});

// ✅ Tambahin ini
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

app.get("/upload", (req, res) => {
  res.sendFile(path.join(__dirname, "upload.html"));
});

// ✅ Export app untuk Vercel
module.exports = app;
