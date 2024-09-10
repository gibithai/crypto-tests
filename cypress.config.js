<<<<<<< HEAD
module.exports = {
=======
const { defineConfig } = require("cypress");

module.exports = defineConfig({
>>>>>>> 8a087d21c67b059978ca2e2ec5c31312d114733d
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
<<<<<<< HEAD
    baseUrl: 'https://coinmarketcap.com/',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',  // Путь по умолчанию
    supportFile: 'cypress/support/e2e.js', // Убедитесь, что указанный файл существует, или используйте false
  },
};
=======
  },
});
>>>>>>> 8a087d21c67b059978ca2e2ec5c31312d114733d
