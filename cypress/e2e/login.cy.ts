describe('Login Page', () => {
  it('should allow a user to log in successfully and redirect to the dashboard', () => {
    // 1. Visit the login page
    cy.visit('/');

    // 2. Get credentials from Cypress environment variables
    const email = Cypress.env('CYPRESS_TEST_USER_EMAIL');
    const password = Cypress.env('CYPRESS_TEST_USER_PASSWORD');
    
    cy.get('#email').type(email);
    cy.get('#password').type(password);

    // 3. Find the submit button and click it
    cy.get('form').submit();

    // 4. Assert the expected result
    // The URL should change to include /dashboard
    cy.url().should('include', '/dashboard');

    // The page should show a welcome message for the logged-in user
    cy.contains('Welcome back, Test!').should('exist');
  });

  it('should show an error toast for invalid credentials', () => {
    cy.visit('/');
    cy.get('#email').type('wrong@email.com');
    cy.get('#password').type('wrongpassword');
    cy.get('form').submit();
    
    // Assert that a toast with the title 'Login Failed' is visible
    cy.contains('Login Failed').should('be.visible');
  });
});
