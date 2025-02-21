// const { signAsync } = require('@electron/osx-sign')
// const opts = {
//   app: 'path/to/my.app',
//   // optional parameters for additional customization
//   platform: "pkg", // should be auto-detected if your app was packaged for MAS via Packager or Forge
//   type: "distribution", // defaults to "distribution" for submission to App Store Connect
//   provisioningProfile: 'path/to/my.provisionprofile', // defaults to the current working directory
//   keychain: 'my-keychain', // defaults to the system default login keychain
// };
// signAsync(opts)
//   .then(function () {
//     // Application signed
//   })
//   .catch(function (err) {
//     // Handle the error
//   })