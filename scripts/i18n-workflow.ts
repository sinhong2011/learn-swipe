#!/usr/bin/env bun

/**
 * Comprehensive i18n workflow script
 * 
 * This script automates the complete i18n workflow:
 * 1. Extract translatable strings from source code
 * 2. Compile translations
 * 3. Run translation tests
 * 4. Generate coverage report
 */

import { spawn } from 'bun';
import { existsSync } from 'fs';
import path from 'path';

// Colors for console output
const colors = {
	reset: '\x1b[0m',
	bright: '\x1b[1m',
	red: '\x1b[31m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	magenta: '\x1b[35m',
	cyan: '\x1b[36m'
};

function log(message: string, color = colors.reset) {
	console.log(`${color}${message}${colors.reset}`);
}

function logStep(step: string) {
	log(`\n🔄 ${step}`, colors.cyan);
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

async function runCommand(command: string, args: string[] = []): Promise<boolean> {
	try {
		const proc = spawn([command, ...args], {
			stdio: ['inherit', 'inherit', 'inherit'],
		});
		
		const exitCode = await proc.exited;
		return exitCode === 0;
	} catch (error) {
		logError(`Failed to run command: ${command} ${args.join(' ')}`);
		console.error(error);
		return false;
	}
}

async function checkPrerequisites(): Promise<boolean> {
	logStep('Checking prerequisites');
	
	// Check if lingui.config.js exists
	if (!existsSync('lingui.config.js')) {
		logError('lingui.config.js not found');
		return false;
	}
	
	// Check if src directory exists
	if (!existsSync('src')) {
		logError('src directory not found');
		return false;
	}
	
	// Check if locales directory exists
	if (!existsSync('src/locales')) {
		logWarning('src/locales directory not found - will be created during extraction');
	}
	
	logSuccess('Prerequisites check passed');
	return true;
}

async function extractTranslations(): Promise<boolean> {
	logStep('Extracting translatable strings');
	
	const success = await runCommand('bun', ['run', 'extract']);
	
	if (success) {
		logSuccess('Translation extraction completed');
		return true;
	} else {
		logError('Translation extraction failed');
		return false;
	}
}

async function compileTranslations(): Promise<boolean> {
	logStep('Compiling translations');
	
	const success = await runCommand('bun', ['run', 'compile']);
	
	if (success) {
		logSuccess('Translation compilation completed');
		return true;
	} else {
		logError('Translation compilation failed');
		return false;
	}
}

async function runTranslationTests(): Promise<boolean> {
	logStep('Running translation tests');
	
	// Check if test file exists
	const testFile = 'src/tests/i18n/settings-translations.test.ts';
	if (!existsSync(testFile)) {
		logWarning(`Test file ${testFile} not found - skipping tests`);
		return true;
	}
	
	const success = await runCommand('bun', ['test', testFile]);
	
	if (success) {
		logSuccess('Translation tests passed');
		return true;
	} else {
		logError('Translation tests failed');
		return false;
	}
}

async function generateCoverageReport(): Promise<void> {
	logStep('Generating translation coverage report');
	
	try {
		// Import and run coverage analysis
		const { testTranslations, generateTranslationReport, printTranslationReport } = await import('../src/utils/i18n-test-utils');
		const { settingsTranslationTests } = await import('../src/tests/i18n/settings-translations.test');
		
		const testResults = testTranslations(settingsTranslationTests);
		const report = generateTranslationReport(testResults);
		
		printTranslationReport(report);
		
		if (report.summary.failedKeys === 0) {
			logSuccess('All translations are properly covered');
		} else {
			logWarning(`${report.summary.failedKeys} translation keys need attention`);
		}
	} catch (error) {
		logWarning('Could not generate coverage report');
		console.error(error);
	}
}

async function main() {
	log(`${colors.bright}🌐 i18n Workflow Script${colors.reset}`);
	log('=======================\n');
	
	const args = process.argv.slice(2);
	const skipTests = args.includes('--skip-tests');
	const extractOnly = args.includes('--extract-only');
	const compileOnly = args.includes('--compile-only');
	const testOnly = args.includes('--test-only');
	
	let success = true;
	
	// Check prerequisites
	if (!await checkPrerequisites()) {
		process.exit(1);
	}
	
	// Extract translations
	if (!compileOnly && !testOnly) {
		if (!await extractTranslations()) {
			success = false;
		}
	}
	
	// Compile translations
	if (!extractOnly && !testOnly) {
		if (success && !await compileTranslations()) {
			success = false;
		}
	}
	
	// Run tests
	if (!extractOnly && !compileOnly && !skipTests) {
		if (success && !await runTranslationTests()) {
			success = false;
		}
	}
	
	// Generate coverage report
	if (!extractOnly && !compileOnly) {
		await generateCoverageReport();
	}
	
	// Final status
	log('\n' + '='.repeat(50));
	if (success) {
		logSuccess('i18n workflow completed successfully!');
		log('\n💡 Next steps:');
		log('  1. Review extracted translations in src/locales/');
		log('  2. Add missing translations for new keys');
		log('  3. Test the app in different languages');
		log('  4. Commit the updated translation files');
	} else {
		logError('i18n workflow completed with errors');
		log('\n🔧 Troubleshooting:');
		log('  1. Check the error messages above');
		log('  2. Ensure all translatable strings use t`...` syntax');
		log('  3. Verify lingui.config.js is properly configured');
		log('  4. Run individual commands manually for debugging');
	}
	
	process.exit(success ? 0 : 1);
}

// Handle script arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
	log(`${colors.bright}i18n Workflow Script${colors.reset}`);
	log('Usage: bun run scripts/i18n-workflow.ts [options]');
	log('\nOptions:');
	log('  --extract-only    Only extract translatable strings');
	log('  --compile-only    Only compile translations');
	log('  --test-only       Only run translation tests');
	log('  --skip-tests      Skip running translation tests');
	log('  --help, -h        Show this help message');
	process.exit(0);
}

// Run the main workflow
main().catch(error => {
	logError('Unexpected error occurred');
	console.error(error);
	process.exit(1);
});
