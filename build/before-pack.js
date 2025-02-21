import signAsync from '@electron/osx-sign';
import path from 'path';
import fs from 'fs';


exports.default = async function(context) {

// Helper function to determine file-specific signing options
function getSigningOptions(filePath) {
    const filename = path.basename(filePath);
    const deepSignFiles = [
        'mongocrypt',
        'MEDomicsLab',
        'MEDomicsLab.app'
    ];

    if (deepSignFiles.some(pattern => filename.includes(pattern))) {
        return {
            additionalArguments: ['--deep', '--options', 'runtime', '--timestamp']
        };
    }
    return null;
}

async function signFiles(directoryPath) {
    if (process.platform !== 'darwin') {
        console.log('Signing skipped: Not on macOS platform');
        return;
    }

    console.log('Signing files in directory:', directoryPath);
    console.log('Dirname:', __dirname);
    console.log('Entitlements:', path.resolve(__dirname, 'entitlements.mac.plist'));

    try {
        const baseSignOptions = {
            'platform': 'darwin',
            'hardenedRuntime': true,
            'entitlements': path.resolve(__dirname, 'entitlements.mac.plist'),
            'entitlements-inherit': path.resolve(__dirname, 'entitlements.mac.plist'),
            'gatekeeper-assess': false,
            'optionsForFile': (filePath) => getSigningOptions(filePath)
        };

        const stats = fs.statSync(directoryPath);
        if (stats.isFile()) {
            await signAsync({
                ...baseSignOptions,
                app: directoryPath
            });
            console.log(`Signed file: ${directoryPath}`);
        } else if (stats.isDirectory()) {
            await signAsync({
                ...baseSignOptions,
                app: directoryPath
            });
            console.log(`Signed directory: ${directoryPath}`);
        }
    } catch (error) {
        console.error('Error signing:', error);
        process.exit(1);
    }
}

// Only execute if on darwin platform
if (process.platform === 'darwin') {
    const projectDir = path.resolve(__dirname, '..');
    
    // Start the signing process
    Promise.all([
        signFiles(projectDir),
        ...fs.readdirSync(projectDir).map(file => 
            signFiles(path.resolve(projectDir, file))
        )
    ]).catch(error => {
        console.error('Signing process failed:', error);
        process.exit(1);
    });
} else {
    console.log('Signing process skipped: Not running on macOS');
}
};