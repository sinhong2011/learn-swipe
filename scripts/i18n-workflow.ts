#!/usr/bin/env bun

/**
 * Comprehensive i18n workflow script
 *
 * This script automates the complete i18n workflow:
 * 1. Extract translatable strings from source code
 * 2. Compile translations
 * 3. Run translation tests
 * 4. Generate coverage report
 * 5. Validate translation integrity
 */

import { spawn } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import path from "path";

// Colors for console output
const colors = {
	reset: "\x1b[0m",
	bright: "\x1b[1m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	magenta: "\x1b[35m",
	cyan: "\x1b[36m",
	dim: "\x1b[2m",
};

// Configuration
interface Config {
	linguiConfigPath: string;
	srcDir: string;
	localesDir: string;
	testDir: string;
	supportedLocales: string[];
}

const defaultConfig: Config = {
	linguiConfigPath: "lingui.config.js",
	srcDir: "src",
	localesDir: "src/locales",
	testDir: "src/tests/i18n",
	supportedLocales: ["en", "zh-HK"],
};

// Timing utilities
const timers = new Map<string, number>();

function startTimer(name: string) {
	timers.set(name, Date.now());
}

function endTimer(name: string): string {
	const start = timers.get(name);
	if (!start) return "0ms";
	const duration = Date.now() - start;
	timers.delete(name);
	return duration > 1000 ? `${(duration / 1000).toFixed(1)}s` : `${duration}ms`;
}

function log(message: string, color = colors.reset) {
	console.log(`${color}${message}${colors.reset}`);
}

function logStep(step: string) {
	log(`\n🔄 ${step}`, colors.cyan);
	startTimer(step);
}

function logStepComplete(step: string) {
	const duration = endTimer(step);
	log(`✅ ${step} ${colors.dim}(${duration})${colors.reset}`, colors.green);
}

function logSuccess(message: string) {
	log(`✅ ${message}`, colors.green);
}

function logError(message: string) {
	log(`❌ ${message}`, colors.red);
}

function logWarning(message: string) {
	log(`⚠️  ${message}`, colors.yellow);
}

function logInfo(message: string) {
	log(`ℹ️  ${message}`, colors.blue);
}

async function runCommand(
	command: string,
	args: string[] = [],
	options: { silent?: boolean; cwd?: string } = {},
): Promise<{ success: boolean; output?: string }> {
	try {
		const fullCommand = `${command} ${args.join(" ")}`;
		if (!options.silent) {
			logInfo(`Running: ${fullCommand}`);
		}

		const proc = spawn(command, args, {
			stdio: options.silent
				? ["pipe", "pipe", "pipe"]
				: ["inherit", "inherit", "inherit"],
			cwd: options.cwd,
		});

		const exitCode = await new Promise<number>((resolve) => {
			proc.on("close", (code) => resolve(code ?? 1));
		});
		const success = exitCode === 0;

		if (!success && !options.silent) {
			logError(`Command failed with exit code ${exitCode}: ${fullCommand}`);
		}

		return { success };
	} catch (error) {
		logError(`Failed to run command: ${command} ${args.join(" ")}`);
		if (!options.silent) {
			console.error(error);
		}
		return { success: false };
	}
}

// Utility function to discover test files
function discoverTestFiles(testDir: string, pattern = "*.test.ts"): string[] {
	if (!existsSync(testDir)) {
		return [];
	}

	const testFiles: string[] = [];
	const files = readdirSync(testDir);

	for (const file of files) {
		const filePath = path.join(testDir, file);
		const stat = statSync(filePath);

		if (stat.isFile() && file.endsWith(".test.ts")) {
			testFiles.push(filePath);
		} else if (stat.isDirectory()) {
			// Recursively search subdirectories
			const subFiles = discoverTestFiles(filePath, pattern);
			testFiles.push(...subFiles);
		}
	}

	return testFiles;
}

// Utility function to validate translation files
function validateTranslationFiles(config: Config): {
	valid: boolean;
	issues: string[];
} {
	const issues: string[] = [];

	for (const locale of config.supportedLocales) {
		const localeDir = path.join(config.localesDir, locale);
		const poFile = path.join(localeDir, "messages.po");
		const mjsFile = path.join(localeDir, "messages.mjs");

		if (!existsSync(poFile)) {
			issues.push(`Missing PO file for locale ${locale}: ${poFile}`);
		} else {
			try {
				const content = readFileSync(poFile, "utf-8");
				if (content.length < 50) {
					issues.push(
						`PO file for locale ${locale} appears to be empty or too small`,
					);
				}
			} catch (error) {
				issues.push(`Cannot read PO file for locale ${locale}: ${error}`);
			}
		}

		if (!existsSync(mjsFile)) {
			issues.push(`Missing compiled MJS file for locale ${locale}: ${mjsFile}`);
		} else {
			try {
				const content = readFileSync(mjsFile, "utf-8");
				if (
					!content.includes("export const messages") ||
					!content.includes("JSON.parse")
				) {
					issues.push(
						`Compiled MJS file for locale ${locale} appears to be invalid`,
					);
				}
			} catch (error) {
				issues.push(`Cannot read MJS file for locale ${locale}: ${error}`);
			}
		}
	}

	return { valid: issues.length === 0, issues };
}

async function checkPrerequisites(config: Config): Promise<boolean> {
	const stepName = "Checking prerequisites";
	logStep(stepName);

	let allGood = true;

	// Check if lingui.config.js exists
	if (!existsSync(config.linguiConfigPath)) {
		logError(`Lingui config file not found: ${config.linguiConfigPath}`);
		allGood = false;
	} else {
		logInfo(`✓ Found Lingui config: ${config.linguiConfigPath}`);
	}

	// Check if src directory exists
	if (!existsSync(config.srcDir)) {
		logError(`Source directory not found: ${config.srcDir}`);
		allGood = false;
	} else {
		logInfo(`✓ Found source directory: ${config.srcDir}`);
	}

	// Check if locales directory exists
	if (!existsSync(config.localesDir)) {
		logWarning(
			`Locales directory not found: ${config.localesDir} - will be created during extraction`,
		);
	} else {
		logInfo(`✓ Found locales directory: ${config.localesDir}`);

		// Validate existing translation files
		const validation = validateTranslationFiles(config);
		if (!validation.valid) {
			logWarning("Translation file validation issues found:");

			for (const issue of validation.issues) {
				logWarning(`  • ${issue}`);
			}
		} else {
			logInfo(
				`✓ Translation files validated for ${config.supportedLocales.length} locales`,
			);
		}
	}

	// Check if test directory exists
	if (!existsSync(config.testDir)) {
		logWarning(
			`Test directory not found: ${config.testDir} - tests will be skipped`,
		);
	} else {
		const testFiles = discoverTestFiles(config.testDir);
		logInfo(`✓ Found ${testFiles.length} test file(s) in ${config.testDir}`);
	}

	if (allGood) {
		logStepComplete(stepName);
	} else {
		logError("Prerequisites check failed");
	}

	return allGood;
}

async function extractTranslations(config: Config): Promise<boolean> {
	const stepName = "Extracting translatable strings";
	logStep(stepName);

	const result = await runCommand("bun", ["run", "extract"]);

	if (result.success) {
		// Validate that extraction actually found strings
		const validation = validateTranslationFiles(config);
		if (validation.valid) {
			logStepComplete(stepName);
			logInfo(
				`✓ Extracted translations for ${config.supportedLocales.length} locales`,
			);
			return true;
		} else {
			logWarning("Extraction completed but validation found issues:");

			for (const issue of validation.issues) {
				logWarning(`  • ${issue}`);
			}
			return false;
		}
	} else {
		logError("Translation extraction failed");
		return false;
	}
}

async function compileTranslations(config: Config): Promise<boolean> {
	const stepName = "Compiling translations";
	logStep(stepName);

	const result = await runCommand("bun", ["run", "compile"]);

	if (result.success) {
		// Validate that compilation produced valid files
		const validation = validateTranslationFiles(config);
		if (validation.valid) {
			logStepComplete(stepName);
			logInfo(
				`✓ Compiled translations for ${config.supportedLocales.length} locales`,
			);
			return true;
		} else {
			logWarning("Compilation completed but validation found issues:");
			for (const issue of validation.issues) {
				logWarning(`  • ${issue}`);
			}
			return false;
		}
	} else {
		logError("Translation compilation failed");
		return false;
	}
}

async function runTranslationTests(config: Config): Promise<boolean> {
	const stepName = "Running translation tests";
	logStep(stepName);

	// Discover test files
	const testFiles = discoverTestFiles(config.testDir);

	if (testFiles.length === 0) {
		logWarning(`No test files found in ${config.testDir} - skipping tests`);
		return true;
	}

	logInfo(`Found ${testFiles.length} test file(s) to run`);

	let allTestsPassed = true;

	for (const testFile of testFiles) {
		logInfo(`Running tests in: ${testFile}`);
		const result = await runCommand("bun", ["test", testFile]);

		if (!result.success) {
			logError(`Tests failed in: ${testFile}`);
			allTestsPassed = false;
		}
	}

	if (allTestsPassed) {
		logStepComplete(stepName);
		logInfo(`✓ All ${testFiles.length} test file(s) passed`);
		return true;
	} else {
		logError("Some translation tests failed");
		return false;
	}
}

async function generateCoverageReport(config: Config): Promise<void> {
	const stepName = "Generating translation coverage report";
	logStep(stepName);

	try {
		// Try to find test files for coverage analysis
		const testFiles = discoverTestFiles(config.testDir);

		if (testFiles.length === 0) {
			logWarning("No test files found for coverage analysis");
			return;
		}

		logInfo(`Found ${testFiles.length} test file(s) for coverage analysis`);

		// Basic coverage report - count translation files and locales
		const validation = validateTranslationFiles(config);
		const totalLocales = config.supportedLocales.length;
		const validLocales = totalLocales - validation.issues.length;

		logInfo(`Translation Coverage Summary:`);
		logInfo(`  • Supported locales: ${totalLocales}`);
		logInfo(`  • Valid translation files: ${validLocales}/${totalLocales}`);
		logInfo(`  • Test files available: ${testFiles.length}`);

		if (validation.valid) {
			logSuccess("All translation files are valid");
		} else {
			logWarning(`${validation.issues.length} translation file issues found`);
		}

		logStepComplete(stepName);
	} catch (error) {
		logWarning("Could not generate coverage report");
		console.error(error);
	}
}

async function main() {
	log(`${colors.bright}🌐 i18n Workflow Script${colors.reset}`);
	log("=======================\n");

	const args = process.argv.slice(2);
	const skipTests = args.includes("--skip-tests");
	const extractOnly = args.includes("--extract-only");
	const compileOnly = args.includes("--compile-only");
	const testOnly = args.includes("--test-only");

	// Initialize configuration
	const config = { ...defaultConfig };

	// Allow config overrides via environment variables
	if (process.env.LINGUI_CONFIG) {
		config.linguiConfigPath = process.env.LINGUI_CONFIG;
	}
	if (process.env.I18N_SRC_DIR) {
		config.srcDir = process.env.I18N_SRC_DIR;
	}
	if (process.env.I18N_LOCALES_DIR) {
		config.localesDir = process.env.I18N_LOCALES_DIR;
	}
	if (process.env.I18N_TEST_DIR) {
		config.testDir = process.env.I18N_TEST_DIR;
	}

	logInfo(`Using configuration:`);
	logInfo(`  • Lingui config: ${config.linguiConfigPath}`);
	logInfo(`  • Source directory: ${config.srcDir}`);
	logInfo(`  • Locales directory: ${config.localesDir}`);
	logInfo(`  • Test directory: ${config.testDir}`);
	logInfo(`  • Supported locales: ${config.supportedLocales.join(", ")}`);

	let success = true;

	// Check prerequisites
	if (!(await checkPrerequisites(config))) {
		process.exit(1);
	}

	// Extract translations
	if (!compileOnly && !testOnly) {
		if (!(await extractTranslations(config))) {
			success = false;
		}
	}

	// Compile translations
	if (!extractOnly && !testOnly) {
		if (success && !(await compileTranslations(config))) {
			success = false;
		}
	}

	// Run tests
	if (!extractOnly && !compileOnly && !skipTests) {
		if (success && !(await runTranslationTests(config))) {
			success = false;
		}
	}

	// Generate coverage report
	if (!extractOnly && !compileOnly) {
		await generateCoverageReport(config);
	}

	// Final status
	log("\n" + "=".repeat(50));
	if (success) {
		logSuccess("i18n workflow completed successfully!");
		log("\n💡 Next steps:");
		log("  1. Review extracted translations in src/locales/");
		log("  2. Add missing translations for new keys");
		log("  3. Test the app in different languages");
		log("  4. Commit the updated translation files");
	} else {
		logError("i18n workflow completed with errors");
		log("\n🔧 Troubleshooting:");
		log("  1. Check the error messages above");
		log("  2. Ensure all translatable strings use t`...` syntax");
		log("  3. Verify lingui.config.js is properly configured");
		log("  4. Run individual commands manually for debugging");
	}

	process.exit(success ? 0 : 1);
}

// Handle script arguments
if (process.argv.includes("--help") || process.argv.includes("-h")) {
	log(`${colors.bright}i18n Workflow Script${colors.reset}`);
	log("Usage: bun run scripts/i18n-workflow.ts [options]");
	log("\nOptions:");
	log("  --extract-only    Only extract translatable strings");
	log("  --compile-only    Only compile translations");
	log("  --test-only       Only run translation tests");
	log("  --skip-tests      Skip running translation tests");
	log("  --help, -h        Show this help message");
	process.exit(0);
}

// Run the main workflow
main().catch((error) => {
	logError("Unexpected error occurred");
	console.error(error);
	process.exit(1);
});
