// Define proper types for navigator.userAgentData
interface NavigatorUAData {
	brands: Array<{ brand: string; version: string }>;
	mobile: boolean;
	platform: string;
	getHighEntropyValues(hints: string[]): Promise<{
		platform?: string;
		platformVersion?: string;
		model?: string;
		// Add other properties you might need
	}>;
}

function getDeviceName(): string {
	// Use safer APIs instead of deprecated navigator.platform
	const userAgent = navigator.userAgent;

	// Get browser name
	let browserName = 'Unknown Browser';
	if (userAgent.indexOf('Chrome') !== -1) browserName = 'Chrome';
	else if (userAgent.indexOf('Safari') !== -1) browserName = 'Safari';
	else if (userAgent.indexOf('Firefox') !== -1) browserName = 'Firefox';
	else if (userAgent.indexOf('Edge') !== -1) browserName = 'Edge';

	// Get OS name - replace navigator.platform with userAgent detection
	let osName = 'Unknown OS';
	if (userAgent.indexOf('Win') !== -1) osName = 'Windows';
	else if (userAgent.indexOf('Mac') !== -1) osName = 'MacOS';
	else if (userAgent.indexOf('Linux') !== -1) osName = 'Linux';
	else if (userAgent.indexOf('iPhone') !== -1) osName = 'iOS';
	else if (userAgent.indexOf('Android') !== -1) osName = 'Android';

	// Create a timestamp to ensure uniqueness
	const timestamp = new Date().toISOString().slice(0, 10);

	return `${osName} ${browserName} (${timestamp})`;
}

async function getModernDeviceName(): Promise<string> {
	// Check if User Agent Client Hints API is available
	if ('userAgentData' in navigator) {
		try {
			// Type assertion to use our interface
			const uaData = navigator.userAgentData as NavigatorUAData;
			const highEntropyValues = await uaData.getHighEntropyValues(['platform', 'platformVersion', 'model']);

			const browser = uaData.brands[0]?.brand || 'Unknown';
			const platform = highEntropyValues.platform || 'Unknown';
			const model = highEntropyValues.model || '';

			return `${platform} ${model} ${browser}`.trim();
		} catch (error) {
			console.error('Error getting detailed device info:', error);
		}
	}

	// Fallback to basic information
	return getDeviceName();
}

// Export the function to ensure it's used
export { getDeviceName, getModernDeviceName };
