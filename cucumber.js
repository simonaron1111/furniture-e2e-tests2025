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
      format: ['progress'],
      paths: ['features/**/*.feature']
    },
    e2e: {
      requireModule: [
        'ts-node/register',
        'tsconfig-paths/register'
      ],
      require: [
        'features/step-definitions/**/*.ts'
      ],
      publishQuiet: true,
      format: ['progress'],
      paths: ['features/**/*.feature'],
      tags: '@e2e'
    }
  };