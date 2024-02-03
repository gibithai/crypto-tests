describe ('Explore Landing Page', () => {

  it ('Check the title', ()=>{
    cy.visit('https://walletallin.com/')
    cy.title().should('eq', 'Compliance and AML software')
  })
  it ('Logo check', ()=>{
    cy.visit('https://walletallin.com/')
    cy.get('#top-bar__logo')
    .and('be.visible')
    .and('exist')
  })  

    it ('Assertions', ()=>{
      cy.visit('https://walletallin.com/')
      cy.url('https://walletallin.com/')
      .should('eq', 'https://walletallin.com/')
      .and('include', 'walletallin')
      .and('contain', 'walletallin')

      cy.xpath('//a').should('have.length', '46')

  })  
})