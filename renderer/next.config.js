
module.exports = {
	webpack: (config, { isServer }) => {
		if (!isServer) {
			config.target = "electron-renderer";
		}

		return config;
	},
	images: {unoptimized : true} , 
	staticPageGenerationTimeout: 120, // Increase the timeout to 120 seconds


};
