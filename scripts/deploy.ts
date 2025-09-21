#!/usr/bin/env bun

/**
 * Local deployment script for LearnSwipe
 *
 * This script helps with local deployment to Cloudflare Pages using Wrangler.
 * It builds the application and deploys it to either production or preview.
 */

import { spawn } from "node:child_process";
import { existsSync } from "fs";

// Colors for console output
const colors = {
	reset: "\x1b[0m",
	bright: "\x1b[1m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	cyan: "\x1b[36m",
};

function log(message: string, color = colors.reset) {
	console.log(`${color}${message}${colors.reset}`);
}

function logInfo(message: string) {
	log(`ℹ️  ${message}`, colors.blue);
}

function logSuccess(message: string) {
	log(`✅ ${message}`, colors.green);
}

function logError(message: string) {
	log(`❌ ${message}`, colors.red);
}

// function logWarning(message: string) {
// 	log(`⚠️  ${message}`, colors.yellow);
// }

async function runCommand(
	command: string,
	args: string[] = [],
): Promise<boolean> {
	return new Promise((resolve) => {
		const process = spawn(command, args, {
			stdio: "inherit",
			shell: true,
		});

		process.on("close", (code) => {
			resolve(code === 0);
		});

		process.on("error", (error) => {
			logError(`Failed to run command: ${error.message}`);
			resolve(false);
		});
	});
}

async function checkPrerequisites(): Promise<boolean> {
	logInfo("Checking prerequisites...");

	// Check if wrangler is installed
	const wranglerInstalled = await runCommand("wrangler", ["--version"]);
	if (!wranglerInstalled) {
		logError("Wrangler is not installed. Install it with: bun add -g wrangler");
		return false;
	}

	// Check if wrangler.toml exists
	if (!existsSync("wrangler.toml")) {
		logError("wrangler.toml not found in project root");
		return false;
	}

	// Check if dist directory exists (will be created by build)
	logSuccess("Prerequisites check passed");
	return true;
}

async function buildApplication(): Promise<boolean> {
	logInfo("Building application...");

	// Extract and compile translations
	logInfo("Extracting and compiling translations...");
	if (!(await runCommand("bun", ["run", "translate"]))) {
		logError("Failed to extract/compile translations");
		return false;
	}

	// Build the application
	logInfo("Building application...");
	if (!(await runCommand("bun", ["run", "build"]))) {
		logError("Failed to build application");
		return false;
	}

	// Check if dist directory was created
	if (!existsSync("dist")) {
		logError("Build completed but dist directory not found");
		return false;
	}

	logSuccess("Application built successfully");
	return true;
}

async function deployToCloudflare(
	environment: "production" | "preview",
): Promise<boolean> {
	const projectName =
		environment === "production" ? "learn-swipe" : "learn-swipe-preview";

	logInfo(`Deploying to ${environment} (${projectName})...`);

	const success = await runCommand("wrangler", [
		"pages",
		"deploy",
		"dist",
		`--project-name=${projectName}`,
		"--compatibility-date=2024-12-21",
	]);

	if (success) {
		logSuccess(`Successfully deployed to ${environment}!`);
		logInfo(`Visit: https://${projectName}.pages.dev`);
	} else {
		logError(`Failed to deploy to ${environment}`);
	}

	return success;
}

async function main() {
	const args = process.argv.slice(2);
	const environment = args[0] as "production" | "preview" | undefined;

	if (!environment || !["production", "preview"].includes(environment)) {
		log(`${colors.bright}LearnSwipe Deployment Script${colors.reset}`);
		log("");
		log("Usage: bun run scripts/deploy.ts <environment>");
		log("");
		log("Environments:");
		log("  production  Deploy to production (learn-swipe.pages.dev)");
		log("  preview     Deploy to preview (learn-swipe-preview.pages.dev)");
		log("");
		log("Examples:");
		log("  bun run scripts/deploy.ts production");
		log("  bun run scripts/deploy.ts preview");
		process.exit(1);
	}

	log(
		`${colors.bright}🚀 Deploying LearnSwipe to ${environment}${colors.reset}`,
	);
	log("");

	// Check prerequisites
	if (!(await checkPrerequisites())) {
		process.exit(1);
	}

	// Build application
	if (!(await buildApplication())) {
		process.exit(1);
	}

	// Deploy to Cloudflare
	if (!(await deployToCloudflare(environment))) {
		process.exit(1);
	}

	log("");
	logSuccess(`🎉 Deployment to ${environment} completed successfully!`);
}

// Run the script
main().catch((error) => {
	logError(`Deployment failed: ${error.message}`);
	process.exit(1);
});
