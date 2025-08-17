# Download Manager Pro

Professional download manager with file categorization and admin panel.

## Features

- 📁 Automatic file categorization by extension
- 🔐 Admin authentication system
- 📤 Drag & drop file upload
- 💾 JSON-based file database
- 📱 Responsive design
- 🎨 Modern UI with Poppins font

## Quick Start

### Local Development

```bash
npm install
npm start
```

Visit `http://localhost:3000`

### Admin Login
- Username: `Ezgt`
- Password: `Ezgt123`

## Deployment Options

### Heroku
1. Create new Heroku app
2. Connect your repository
3. Deploy from main branch

### Vercel
1. Import project to Vercel
2. Deploy automatically

### Railway
1. Connect GitHub repository
2. Deploy with one click

### Render
1. Create new Web Service
2. Connect repository
3. Use `render.yaml` configuration

### Docker
```bash
docker-compose up -d
```

### Manual VPS/Shared Hosting
1. Upload files to server
2. Run `npm install`
3. Start with `npm start`
4. Configure reverse proxy (nginx/apache)

## Environment Variables

- `PORT` - Server port (default: 3000)
- `HOST` - Server host (default: 0.0.0.0)
- `NODE_ENV` - Environment (development/production)
- `UPLOAD_DIR` - Upload directory path
- `SESSION_SECRET` - Session secret key

## File Categories

- 🎵 Music: .mp3, .wav, .flac, .m4a, .aac
- 🎬 Video: .mp4, .avi, .mov, .wmv, .mkv
- 📄 Document: .pdf, .doc, .docx, .txt, .rtf
- 🖼️ Image: .jpg, .jpeg, .png, .gif, .bmp
- 📦 Archive: .zip, .rar, .7z, .tar, .gz
- 💻 Script: .js, .html, .css, .php, .py
- 📁 Other: All other file types

## License

MIT License