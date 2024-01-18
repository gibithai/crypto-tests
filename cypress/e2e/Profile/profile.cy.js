describe('Profile', () => {
  const username = 'dougcarlin@tut.by'
  const userpassword = 'j7878745g655756755'

  it('2FA window decline', () => {
    cy.visit('https://walletallin.com/')
    cy.xpath('//a[normalize-space()="Login"]').click()
    cy.visit('https://wallet.walletallin.com/')
    cy.get('#email').type(username)
    cy.get('#password').type(userpassword)
    cy.xpath('//button[@id=":r2:"]').click()

    let element = 'appears'

    cy.xpath('//div[@role="dialog"]').should('be.visible').then(() => {
      if (element) {
        cy.xpath('//button[@class="swal2-cancel swal2-styled"]').click();
      } else {
        cy.xpath('//div[@role="dialog"]').should('not.be.visible').then(() => {
          // Additional logic or assertions can be added here if needed
        })
      }
    })

  })
})