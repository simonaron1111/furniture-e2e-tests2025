module.exports = {
    default: {
      requireModule: [
        'ts-node/register',
        'tsconfig-paths/register'
      ],
      require: [
        'features/step-definitions/**/*.ts'
      ],
      publishQuiet: true,
      format: [
        'progress',
        'html:./reports/cucumber/index.html',
        'json:./reports/cucumber/cucumber.json'
      ],
      paths: ['features/**/*.feature']
    },
    e2e: {
      requireModule: [
        'ts-node/register',
        'tsconfig-paths/register'
      ],
      require: [
        'features/step-definitions/**/*.ts',
        'support/driver.ts'
      ],
      publishQuiet: true,
      format: [
        'progress',
        'html:./reports/cucumber/index.html',
        'json:./reports/cucumber/cucumber.json'
      ],
      paths: ['features/**/*.feature'],
      tags: '@e2e'
    }
  };