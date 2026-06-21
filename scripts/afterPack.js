const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

exports.default = async function (context) {
    const { appOutDir } = context;
    const backendDir = path.join(appOutDir, 'resources', 'backend');
    const nmPath = path.join(backendDir, 'node_modules');

    if (fs.existsSync(nmPath)) {
        console.log('node_modules already exists in build, skipping');
        return;
    }

    console.log('Installing backend dependencies in packaged app...');
    execSync('npm install --production', {
        cwd: backendDir,
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'production' },
    });
    console.log('Backend dependencies installed successfully');
};
