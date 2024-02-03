describe ('Conditions testing', () => {
  const username = 'dougcarlin@tut.by'
  const userpassword = 'j7878745g655756755'

  it ('2FA window check', ()=>{
    cy.visit('https://walletallin.com/')
    cy.xpath('//a[normalize-space()="Login"]').click()
    cy.visit('https://wallet.walletallin.com/')
    cy.get('#email').type(username)
    cy.get('#password').type(userpassword)
    cy.xpath('//button[@id=":r2:"]').click()
    
    cy.xpath('//div[@role="dialog"]').should('be.visible').then(() => {
  // Этот блок кода выполнится, если элемент виден (то есть окно появилось)
  cy.wait(2000)
  // Проверка существования элемента
  cy.xpath('//div[@role="dialog"]').then((twoFAelement) => {
    // Если элемент существует (первое условие)
    if (twoFAelement.length > 0) {
      // Нажимаем "Нет"
      cy.xpath('//button[@class="swal2-cancel swal2-styled"]').click()
      // Если окно не появилось, то просто перезагружаем страницу
    } else if (twoFAelement.length < 0) {
      cy.reload()
      cy.wait(1000)
    } 
  })
})
})
})
