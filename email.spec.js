/// <reference types="cypress" />
describe('Email tests', () => {
    beforeEach(() => {
        cy.visit('/')
        cy.get('.cmp-intro_acceptAll').as('confirm')
        cy.get('@confirm').then(() => {
            cy.get('.cmp-intro_acceptAll').click()
        })
    })

    it('Navigate to page', () => {
        cy.url().should('include', 'poczta.onet.pl')
    })

    it('Successfull login', () => {
        cy.get('#loginForm').should('be.visible')
        cy.get('#mailFormLogin').type(Cypress.env('test_email_address'))
        cy.get('#mailFormPassword').type(Cypress.env('test_pwd_correct'))
        cy.get('.mailFormPermCheck').click()
        cy.get('.mailFormOpt > .loginButton').click()
        cy.get('div > aside').contains('Napisz wiadomość')
        cy.get('div > button > span > span').eq(0).should('have.text', Cypress.env('test_email_address'))
    })

    it('Create and send new mail', () => {
        cy.intercept('POST', 'https://api.poczta.onet.pl/api/mail/send').as('postSend')
        cy.get('[title="Napisz wiadomość"]').click()

        cy.get('section').as('section')
        cy.get('@section').then((section) => {
            cy.get('input').eq(2).type(Cypress.env('test_email_address')).type('{enter}')
            cy.get('input').eq(3).type(Cypress.env('test_email_title'))
            cy.get('.evlwod').click().then(() => {
                cy.get('button').contains('Tak').click()
            })
            cy.wait('@postSend').its('response.statusCode').should('eq', 201)
        })
    })

    it('Check mail inbox for new email', { retries: 3 }, () => {
        cy.get('section').should('contain', Cypress.env('test_email_title'))
    })

    it('Clear inbox', () => {
        cy.intercept('OPTIONS', 'https://api.poczta.onet.pl/api/mail/').as('clearInbox')
        cy.get('[title="Zaznacz wszystkie"]').click().then(() => {
            cy.get('[title="Usuń zaznaczone"]').click()
            cy.get('h3').contains('Ten folder jest pusty')
        })
    })

    it('Successfull logout', () => {
        cy.get('[title="Wyloguj"]').click()
        cy.get('.mailFormContainer').should('be.visible')
    })
})
