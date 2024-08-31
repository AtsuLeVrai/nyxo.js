import process from "node:process";
import { ApiVersions } from "@nyxjs/core";
import { Rest, UserRoutes } from "@nyxjs/rest";
import { config } from "dotenv";

config();

const TOKEN = process.env.DISCORD_TOKEN;
if (!TOKEN) {
	throw new Error("DISCORD_TOKEN is not set in the environment variables.");
}

const rest = new Rest(TOKEN, { version: ApiVersions.V10 });

// Helper function to measure execution time
const measureTime = async <T>(fn: () => Promise<T>): Promise<[Error | T, number]> => {
	const start = Date.now();
	try {
		const result = await fn();
		const end = Date.now();
		return [result, end - start];
	} catch (error) {
		const end = Date.now();
		return [error as Error, end - start];
	}
};

// Helper function to get alternating user routes
const getAlternatingUserRoute = (index: number) => index % 2 === 0 ? UserRoutes.getUser("@me") : UserRoutes.getUser("730029344193249310");

// Test 1: Multiple sequential requests
async function testSequentialRequests(count: number) {
	console.log(`[TEST] Running ${count} sequential requests...`);
	const times: number[] = [];
	const errors: Error[] = [];

	for (let i = 0; i < count; i++) {
		const route = getAlternatingUserRoute(i);
		const [result, time] = await measureTime(async () => rest.request(route));
		times.push(time);
		if (result instanceof Error) {
			errors.push(result);
			console.log(`Request ${i + 1} (${route.path}): Error - ${result.message} (${time}ms)`);
		} else {
			console.log(`Request ${i + 1} (${route.path}): Success (${time}ms)`);
		}
	}

	console.log(`Average response time: ${times.reduce((a, b) => a + b, 0) / times.length}ms`);
	console.log(`Errors: ${errors.length}/${count}`);
}

// Test 2: Multiple parallel requests
async function testParallelRequests(count: number) {
	console.log(`[TEST] Running ${count} parallel requests...`);
	const start = Date.now();

	const requests = Array.from({ length: count }).fill(null).map(async (_, index) => {
		const route = getAlternatingUserRoute(index);
		return measureTime(async () => rest.request(route))
			.then(([result, time]) => {
				if (result instanceof Error) {
					console.log(`Parallel request ${index + 1} (${route.path}): Error - ${result.message} (${time}ms)`);
				} else {
					console.log(`Parallel request ${index + 1} (${route.path}): Success (${time}ms)`);
				}
			});
	});
	await Promise.all(requests);

	const end = Date.now();
	console.log(`Total time for ${count} parallel requests: ${end - start}ms`);
}

// Test 3: Error handling (invalid endpoint)
async function testErrorHandling() {
	console.log("[TEST] Testing error handling...");
	try {
		await rest.request({
			method: "GET",
			path: "/invalid/endpoint",
		});
	} catch (error) {
		console.log("Error handled successfully:", error);
	}
}

// Test 4: Rate limiting test
async function testRateLimiting(count: number) {
	console.log(`[TEST] Testing rate limiting with ${count} rapid requests...`);
	const start = Date.now();

	const requests = Array.from({ length: count }).fill(null).map(async (_, index) => {
		const route = getAlternatingUserRoute(index);
		return rest.request(route)
			.then(() => console.log(`Rate limit request ${index + 1} (${route.path}): Success`))
			.catch((error) => console.log(`Rate limit request ${index + 1} (${route.path}): Error - ${error.message}`));
	});
	await Promise.all(requests);

	const end = Date.now();
	console.log(`Total time for ${count} rate-limited requests: ${end - start}ms`);
}

// Run all tests
async function runAllTests() {
	try {
		await testSequentialRequests(10);
		await testParallelRequests(50);
		await testErrorHandling();
		await testRateLimiting(100);
	} catch (error) {
		console.error("An error occurred during testing:", error);
	} finally {
		rest.destroy();
	}
}

void runAllTests();
