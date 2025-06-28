describe('Landing page smoke', () => {
  it('renders nav, search bar, and at least one event card', () => {
    cy.visit('/');

    // 1. Navbar visible
    cy.get('nav').should('be.visible');

    // 2. Search bar input
    cy.get('input[placeholder*="Search"]').should('be.visible');

    // 3. At least one event card
    cy.get('[data-cy="event-card"]').should('have.length.at.least', 1);
  });
});
