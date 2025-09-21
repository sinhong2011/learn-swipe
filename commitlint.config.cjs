module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Ensure the subject case is sentence-case (first letter capitalized)
    'subject-case': [2, 'always', 'sentence-case'],
    // Ensure the subject is not empty
    'subject-empty': [2, 'never'],
    // Limit subject length to 50 characters for better readability
    'subject-max-length': [2, 'always', 50],
    // Ensure the type is not empty
    'type-empty': [2, 'never'],
    // Define allowed types
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation changes
        'style', // Code style changes (formatting, etc.)
        'refactor', // Code refactoring
        'perf', // Performance improvements
        'test', // Adding or updating tests
        'chore', // Maintenance tasks
        'ci', // CI/CD changes
        'build', // Build system changes
        'revert', // Reverting changes
      ],
    ],
    // Ensure the header (first line) is not too long
    'header-max-length': [2, 'always', 72],
    // Ensure the body has a blank line before it
    'body-leading-blank': [2, 'always'],
    // Ensure the footer has a blank line before it
    'footer-leading-blank': [2, 'always'],
  },
}
