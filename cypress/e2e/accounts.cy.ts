/// <reference types="cypress" />
// @ts-nocheck

let date = Date.now();

describe('accounts', () => {
  it('creates a user', () => {
    cy.request('POST', 'http://localhost:3000/api/accounts/create', {
      username: `${date}`,
      password: `${date}`,
      email: `${date}`
    }).then(res => {
      expect(res.body).to.have.property('user');
    })
  })

  it('user login', () => {
    cy.request('POST', 'http://localhost:3000/api/accounts/login', {
      username: `${date}`,
      password: `${date}`
    }).then(res => {
      console.log(res)
      expect(res.body).to.have.property('token');
      Object.assign(window, { userToken: res.body.token });
    })
  })

  it('create a tell', () => {
    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/api/tells/create',
      headers: {
        "Authorization": window.userToken
      },
      body: {
        text: `${date}`,
        title: `${date}`
      }
    }).then(res => {
      expect(res.body).to.have.property('tell');
      Object.assign(window, { tellId: res.body.tell._id });
    })
  })

  it('like a tell', () => {
    cy.request({
      method: 'POST',
      url: `http://localhost:3000/api/tells/like/${window.tellId}`,
      headers: {
        "Authorization": window.userToken
      }
    }).then(res => {
      expect(res.body).to.have.property('tell');
      Object.assign(window, { tellId: res.body.tell._id });
    })
  })

  it('dislike a tell', () => {
    cy.request({
      method: 'POST',
      url: `http://localhost:3000/api/tells/removeLikeOrDislike/${window.tellId}`,
      headers: {
        "Authorization": window.userToken
      }
    }).then(res => {
      expect(res.body).to.have.property('tell');
    })
  })

  it('delete a tell', () => {
    cy.request({
      method: 'POST',
      url: `http://localhost:3000/api/tells/delete`,
      body: {
        tellId: window.tellId
      },
      headers: {
        "Authorization": window.userToken
      }
    }).then(res => {
      expect(res.body).to.have.property('tells');
    })
  })
})