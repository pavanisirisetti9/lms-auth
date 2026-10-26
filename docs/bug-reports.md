# Bug Reports

## 1. Project Details
- **Project:** Learning Management System (LMS)
- **Testing Type:** Manual API and Real-Time Notification Testing

## 2. Observations

### Observation 1: Student Dashboard Accessible with Admin Token
- **Area:** Student Dashboard API
- **Endpoint:** GET `/api/student/dashboard`
- **Expected Result:** If the dashboard is restricted to students, an admin token should be denied access.
- **Actual Result:** The API returned `200 OK` when tested with an admin token.
- **Status:** Requires verification against the intended access-control requirements.
- **Severity:** Medium, if the endpoint is intended to be student-only.

### Observation 2: Invalid Token Handling
- **Area:** Student Dashboard API
- **Endpoint:** GET `/api/student/dashboard`
- **Expected Result:** An invalid token should be rejected with `401 Unauthorized`.
- **Actual Result:** The test was planned, but the final response has not been confirmed.
- **Status:** Pending verification.

## 3. Conclusion
The admin-token dashboard behavior requires review against the intended role-based access policy. Invalid-token handling should also be tested and documented after confirming the actual response.