const axios = require('axios');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function checkForFCAUpdate() {
    try {
        console.log('\x1b[33m%s\x1b[0m', 'Checking for FCA updates...');
        
        const { data: npmData } = await axios.get(
            'https://registry.npmjs.org/arshi-fca/latest'
        );
        
        const latestVersion = npmData.version;
        
        let currentVersion = '1.0.8';
        const nodeModulesPackagePath = path.join(process.cwd(), 'node_modules', 'arshi-fca', 'package.json');
        if (fs.existsSync(nodeModulesPackagePath)) {
            const installedPackage = JSON.parse(fs.readFileSync(nodeModulesPackagePath, 'utf-8'));
            currentVersion = installedPackage.version;
        }
        
        if (latestVersion !== currentVersion) {
            console.log('\x1b[32m%s\x1b[0m', `New arshi-fca version available: ${latestVersion} (current: ${currentVersion})`);
            console.log('\x1b[33m%s\x1b[0m', 'Updating Rasin Fca package...');
            
            try {
                const { data: changesData } = await axios.get(
                    'https://raw.githubusercontent.com/'
                );
                console.log('\x1b[36m%s\x1b[0m', 'Recent Changes:');
                const latestChanges = changesData.split('##')[1]?.split('\n').slice(0, 5).join('\n');
                if (latestChanges) {
                    console.log(latestChanges);
                }
            } catch (err) {
            }
            
            await updateNpmPackage(latestVersion);
            
            await updateUserPackageJson(latestVersion);
            
            console.log('\x1b[32m%s\x1b[0m', 'Rasin FCA updated successfully!');
            console.log('\x1b[33m%s\x1b[0m', 'Restarting to apply changes...');
            
            setTimeout(() => {
                process.exit(2);
            }, 1000);
            
            return true;
        } else {
            console.log('\x1b[32m%s\x1b[0m', `Rasin FCA is up to date (v${currentVersion})`);
            return false;
        }
    } catch (error) {
        console.log('\x1b[31m%s\x1b[0m', 'Failed to check for Fca updates:', error.message);
        return false;
    }
}

async function updateNpmPackage(version) {
    try {
        console.log('\x1b[36m%s\x1b[0m', `Running npm install arshi-fca@${version}...`);
        
        // Execute npm install command
        execSync(`npm install arshi-fca@${version} --save`, {
            cwd: process.cwd(),
            stdio: 'inherit'
        });
        
        console.log('\x1b[32m%s\x1b[0m', '✅ Package installed successfully!');
        return true;
    } catch (error) {
        console.log('\x1b[31m%s\x1b[0m', '❌ Failed to install package:', error.message);
        throw error;
    }
}

async function updateUserPackageJson(version) {
    try {
        const userPackageJsonPath = path.join(process.cwd(), 'package.json');

        if (!fs.existsSync(userPackageJsonPath)) {
            console.log('\x1b[33m%s\x1b[0m', '⚠️  No package.json found in user project');
            return;
        }

        const packageJson = JSON.parse(fs.readFileSync(userPackageJsonPath, 'utf-8'));

        // Update arshi-fca version in dependencies
        if (packageJson.dependencies && packageJson.dependencies.arshi-fca) {
            packageJson.dependencies.arshifca = `^${version}`;
            fs.writeFileSync(userPackageJsonPath, JSON.stringify(packageJson, null, 2));
            console.log('\x1b[32m%s\x1b[0m', `✅ Updated package.json to arshi-fca@${version}`);
        }

        return true;
    } catch (error) {
        console.log('\x1b[31m%s\x1b[0m', '⚠️  Failed to update user package.json:', error.message);
        // Don't throw - this is not critical
        return false;
    }
}

module.exports = { checkForFCAUpdate, updateNpmPackage, updateUserPackageJson };