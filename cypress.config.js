module.exports = {
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: 'https://coinmarketcap.com/',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',  // Путь по умолчанию
    supportFile: 'cypress/support/e2e.js', // Убедитесь, что указанный файл существует, или используйте false
  },
};