const packager = require('electron-packager');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const RELEASE_DIR = path.join(ROOT, 'release');

async function packageApp() {
    console.log('Packaging Electron app...');

    const appPath = await packager({
        dir: ROOT,
        name: 'School Management',
        platform: 'win32',
        arch: 'x64',
        out: RELEASE_DIR,
        electronVersion: '33.4.11',
        overwrite: true,
        asar: true,
        prune: true,
        ignore: [
            /\/frontend\/(?!dist\/).*/,
            /\/backend\//,
            /\/scripts\//,
            /\/release\//,
            /\/\.git\//,
            /\/node_modules\/\.(bin|cache)\//,
            /\.gitignore$/,
            /\.md$/,
            /lesson\.txt$/,
            /eslint\.config\./,
        ],
        extraResource: [
            path.join(ROOT, 'backend'),
            path.join(ROOT, 'frontend', 'dist'),
        ],
        appVersion: '1.0.0',
        buildVersion: '1.0.0',
        win32metadata: {
            CompanyName: 'School Management',
            FileDescription: 'School Management',
            InternalName: 'School Management',
            OriginalFilename: 'School Management.exe',
            ProductName: 'School Management',
        },
    });

    const stats = fs.statSync(appPath[0]);
    console.log('App packaged successfully at:', appPath);

    const totalSize = getDirSize(appPath[0]);
    console.log(`Total app size: ${(totalSize / 1024 / 1024).toFixed(1)} MB`);
}

function getDirSize(dir) {
    let size = 0;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) size += getDirSize(fullPath);
        else if (entry.isFile()) size += fs.statSync(fullPath).size;
    }
    return size;
}

packageApp().catch(err => {
    console.error('Packaging failed:', err);
    process.exit(1);
});
