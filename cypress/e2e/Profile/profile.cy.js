describe('Profile', () => {
  const username = 'dougcarlin@tut.by'
  const userpassword = 'j7878745g655756755'

  it('Main page, 2FA, dropdown selection', () => {
    cy.visit('https://walletallin.com/')
    cy.xpath('//a[normalize-space()="Login"]').click()
    cy.visit('https://wallet.walletallin.com/')
    cy.get('#email').type(username)
    cy.get('#password').type(userpassword)
    cy.xpath('//button[@id=":r2:"]').click()

    let element = 'appears'

    cy.xpath('//div[@role="dialog"]').should('be.visible').then(() => {
      if (element) {
        cy.xpath('//button[@class="swal2-cancel swal2-styled"]').click()
      }
    })
        cy.xpath('//span[normalize-space()="Transactions"]').click()
        cy.xpath('//div[@class="MuiBackdrop-root MuiModal-backdrop css-919eu4"]').click()
        cy.get('.MuiSelect-select.MuiSelect-outlined.MuiInputBase-input.MuiOutlinedInput-input.MuiInputBase-inputSizeSmall.css-1k74z00').click()
        cy.xpath('//li[normalize-space()="btc"]').click()
      
  })
      
    })

  