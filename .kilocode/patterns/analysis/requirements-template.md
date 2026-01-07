# Business Requirements Document (BRD) Template

> Template for capturing detailed business requirements using the Dual Analysis approach.

## 1. Executive Summary
*   **Objective:** What are we building and why?
*   **Target Audience:** Who is this for?
*   **Key Value:** What problem does it solve?

## 2. Functional Requirements
*List specific behaviors and functions of the system.*

| ID | Requirement | Priority | Description |
|----|-------------|----------|-------------|
| FR-01 | User Login | High | Users must be able to log in using email/password. |
| FR-02 | ... | ... | ... |

## 3. Use Cases / User Stories
*Describe how users interact with the system.*

### UC-01: [Title]
*   **Actor:** [User Role]
*   **Preconditions:** [State before interaction]
*   **Happy Path:**
    1.  User does X.
    2.  System responds Y.
*   **Alternative Paths:**
    *   1a. User cancels action -> System resets.
*   **Error Paths:**
    *   2a. Network failure -> System shows retry option.

## 4. Non-Functional Requirements (NFRs)
*Quality attributes, performance, security, etc.*

*   **Performance:** (e.g., Response time < 200ms)
*   **Scalability:** (e.g., Support 10k concurrent users)
*   **Security:** (e.g., Encryption at rest, OWASP compliance)
*   **Reliability:** (e.g., 99.9% uptime)

## 5. Constraints & Assumptions
*   **Technical Constraints:** (e.g., Must use PostgreSQL)
*   **Business Constraints:** (e.g., Budget, Deadline)
*   **Assumptions:** (e.g., External API is available)

## 6. Testing & Acceptance Criteria
*How do we know it works?*

*   [ ] Verify FR-01 with valid credentials.
*   [ ] Verify FR-01 with invalid credentials (lockout after 5 attempts).
*   [ ] Performance test under load.

## 7. Dual Analysis Notes (Critique & Refinement)
*Record of the critique phase.*

*   **Risks Identified:** [List potential risks found by the Critic]
*   **Edge Cases:** [List edge cases to handle]
*   **Mitigation Strategy:** [How the design was improved to address these]