const { assert } = require("console")

describe ('Authorization', () => {
  const username = 'dougcarlin@tut.by'
  const userpassword = 'j7878745g655756755'

  it ('Authorization positive', ()=>{
    cy.visit('https://walletallin.com/')
    cy.xpath('//a[normalize-space()="Login"]').click()
    cy.visit('https://wallet.walletallin.com/')
    cy.get('#email').type(username)
    cy.get('#password').type(userpassword)
    cy.xpath('//button[@id=":r2:"]').click()
    cy.xpath('//button[@class="swal2-cancel swal2-styled"]').click()
    cy.xpath('//div[@class="MuiBackdrop-root MuiModal-backdrop css-919eu4"]').click()

    let expName ="Konstantin Ushak"

    cy.get('div[class="MuiStack-root css-9dqxp2"] h6[class="MuiTypography-root MuiTypography-subtitle1 css-1av83r2"]')
    .then(   (ko)=>{

      let actName=ko.text()

      //BDD
      expect(actName).to.equal(expName)
      expect(actName).not.to.equal(expName)
      //TDD
      assert.equal(actName, expName)
      assert.notEqual(actName, expName)

    })  
  })  
})