describe('Create Topic', () => {
  beforeEach(() => {
    // Log in as a student before each test
    cy.visit('/');

    const email = Cypress.env('CYPRESS_TEST_USER_EMAIL');
    const password = Cypress.env('CYPRESS_TEST_USER_PASSWORD');

    cy.get('#email').type(email);
    cy.get('#password').type(password);
    cy.get('form').submit();
    cy.url().should('include', '/dashboard');
  });

  it('should allow a student to create a new help topic', () => {
    // 1. Navigate to the topics page
    cy.visit('/topics');
    
    // 2. Click the button to open the create topic dialog
    cy.contains('button', 'Create New Topic').click();

    // 3. Fill out the form
    const topicTitle = `Cypress Test Topic - ${new Date().getTime()}`;
    const topicDescription = 'This is a test description for a topic created via a Cypress test.';

    // Wait for the dialog to be fully open before proceeding
    cy.contains('h2', 'Create a New Help Topic').should('be.visible');

    cy.get('#title').type(topicTitle);
    cy.get('#description').type(topicDescription);
    
    // Click the course dropdown that is inside the dialog and select the first option
    cy.contains('div', 'Create a New Help Topic').parent().find('button[role="combobox"]').click();
    cy.get('[role="option"]').first().click();

    // 4. Submit the form
    cy.contains('button', 'Create Topic').click();

    // 5. Assert the results
    // A success toast should appear
    cy.contains('Topic Created!').should('be.visible');

    // The topic card should now be visible on the topics page
    cy.contains(topicTitle).should('be.visible');
    cy.contains(topicDescription.substring(0, 50)).should('be.visible'); // Check for truncated description
  });
});
