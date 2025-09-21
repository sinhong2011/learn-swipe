import { i18n } from "@/i18n";

/**
 * Test utility to verify translations exist for all supported locales
 */
export interface TranslationTestCase {
	key: string;
	context?: string;
	expectedTranslations: Record<string, string>;
}

/**
 * Test if a translation key exists in all supported locales
 * @param key - Translation key to test
 * @param expectedTranslations - Expected translations for each locale
 * @returns Test results for each locale
 */
export function testTranslationKey(
	key: string,
	expectedTranslations: Record<string, string>
): Record<string, { exists: boolean; translation: string; expected: string }> {
	const results: Record<string, { exists: boolean; translation: string; expected: string }> = {};
	
	// Test each supported locale
	Object.keys(expectedTranslations).forEach(locale => {
		const originalLocale = i18n.locale;
		
		try {
			// Switch to test locale
			i18n.activate(locale);
			
			// Get translation
			const translation = i18n._(key);
			const expected = expectedTranslations[locale];
			
			results[locale] = {
				exists: translation !== key && translation.length > 0,
				translation,
				expected
			};
		} catch (error) {
			results[locale] = {
				exists: false,
				translation: '',
				expected: expectedTranslations[locale]
			};
		} finally {
			// Restore original locale
			i18n.activate(originalLocale);
		}
	});
	
	return results;
}

/**
 * Test multiple translation keys at once
 * @param testCases - Array of translation test cases
 * @returns Comprehensive test results
 */
export function testTranslations(testCases: TranslationTestCase[]) {
	const results = testCases.map(testCase => ({
		key: testCase.key,
		context: testCase.context,
		results: testTranslationKey(testCase.key, testCase.expectedTranslations)
	}));
	
	return results;
}

/**
 * Generate a test report for translation coverage
 * @param testResults - Results from testTranslations
 * @returns Formatted test report
 */
export function generateTranslationReport(testResults: ReturnType<typeof testTranslations>) {
	const report = {
		summary: {
			totalKeys: testResults.length,
			passedKeys: 0,
			failedKeys: 0,
			locales: [] as string[]
		},
		details: testResults,
		failures: [] as Array<{
			key: string;
			context?: string;
			locale: string;
			issue: string;
		}>
	};
	
	// Get all locales from first test case
	if (testResults.length > 0) {
		report.summary.locales = Object.keys(testResults[0].results);
	}
	
	// Analyze results
	testResults.forEach(testResult => {
		let keyPassed = true;
		
		Object.entries(testResult.results).forEach(([locale, result]) => {
			if (!result.exists) {
				keyPassed = false;
				report.failures.push({
					key: testResult.key,
					context: testResult.context,
					locale,
					issue: 'Translation missing or same as key'
				});
			} else if (result.expected && result.translation !== result.expected) {
				report.failures.push({
					key: testResult.key,
					context: testResult.context,
					locale,
					issue: `Expected "${result.expected}" but got "${result.translation}"`
				});
			}
		});
		
		if (keyPassed) {
			report.summary.passedKeys++;
		} else {
			report.summary.failedKeys++;
		}
	});
	
	return report;
}

/**
 * Print a formatted translation test report to console
 * @param report - Report from generateTranslationReport
 */
export function printTranslationReport(report: ReturnType<typeof generateTranslationReport>) {
	console.log('\n🌐 Translation Test Report');
	console.log('========================');
	console.log(`Total Keys: ${report.summary.totalKeys}`);
	console.log(`Passed: ${report.summary.passedKeys}`);
	console.log(`Failed: ${report.summary.failedKeys}`);
	console.log(`Locales: ${report.summary.locales.join(', ')}`);
	
	if (report.failures.length > 0) {
		console.log('\n❌ Failures:');
		report.failures.forEach(failure => {
			console.log(`  • ${failure.key} (${failure.locale}): ${failure.issue}`);
			if (failure.context) {
				console.log(`    Context: ${failure.context}`);
			}
		});
	} else {
		console.log('\n✅ All translations passed!');
	}
	
	console.log('\n');
}

/**
 * Quick test for a single key across all locales
 * @param key - Translation key to test
 * @param logResults - Whether to log results to console
 * @returns Whether all locales have the translation
 */
export function quickTranslationTest(key: string, logResults = true): boolean {
	const supportedLocales = ['en', 'zh-HK'];
	const results: Record<string, string> = {};
	
	supportedLocales.forEach(locale => {
		const originalLocale = i18n.locale;
		i18n.activate(locale);
		results[locale] = i18n._(key);
		i18n.activate(originalLocale);
	});
	
	const allExist = Object.values(results).every(translation => 
		translation !== key && translation.length > 0
	);
	
	if (logResults) {
		console.log(`\n🔍 Quick test for "${key}":`);
		Object.entries(results).forEach(([locale, translation]) => {
			const status = translation !== key ? '✅' : '❌';
			console.log(`  ${status} ${locale}: "${translation}"`);
		});
		console.log(`Overall: ${allExist ? '✅ PASS' : '❌ FAIL'}\n`);
	}
	
	return allExist;
}
