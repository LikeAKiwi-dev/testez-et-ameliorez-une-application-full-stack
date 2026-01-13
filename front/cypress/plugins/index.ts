import codeCoverageTask from '@cypress/code-coverage/task';

export default (on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions) => {
  codeCoverageTask(on, config);
  return config;
};
