require('dotenv').config();
const { notarize } = require('@electron/notarize');
exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;  
  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  console.log('Notarizing... with process.env.APPLE_TEAM_ID:', process.env.APPLE_TEAM_ID);
  console.log('Notarizing... with process.env.APPLE_NOTARY_USER:', process.env.APPLE_NOTARY_USER);
  console.log('Notarizing... with process.env.APPLE_NOTARY_PASSWORD:', process.env.APPLE_NOTARY_PASSWORD);
  process.env.FILE_NAME
  return await notarize({
    tool: 'notarytool',
    teamId: process.env.APPLE_TEAM_ID,
    appBundleId: 'com.medomicslab.medapp',
    // /Users/nicolas/Documents/GitHub/MEDomicsLab_Automation/build/dist/MEDomicsLab-1.0.0-mac.pkg
    appPath: process.env.FILE_NAME,
    appleId: process.env.APPLE_NOTARY_USER,
    appleIdPassword: process.env.APPLE_NOTARY_PASSWORD,
  });
};