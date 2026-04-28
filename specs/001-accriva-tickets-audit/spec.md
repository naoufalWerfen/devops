# Feature Specification: Accriva Tickets Test — Full Application Audit & Documentation

**Feature Branch**: `001-accriva-tickets-audit`  
**Created**: 2026-04-27  
**Status**: Draft  
**Input**: User description: "Audit and document the Accriva Tickets application on server ACCRIVATICKETSTEST (10.120.204.45), covering infrastructure, application stack, integrations, security posture, and operational status — analogous to the existing Distributors Portal documentation."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — DevOps Engineer Reviews Application Infrastructure (Priority: P1)

A DevOps engineer needs a single source of truth describing the full technology stack of the Accriva Tickets test environment so they can plan maintenance, upgrades, and incident response without having to SSH into the server every time.

**Why this priority**: Infrastructure knowledge is the foundation for all other operations — without knowing what runs where, no other task (security fixes, deployments, troubleshooting) can be done safely.

**Independent Test**: A DevOps engineer who has never accessed this server can read the documentation and accurately describe the full architecture (web servers, application layer, ports, services) without SSH access.

**Acceptance Scenarios**:

1. **Given** the documentation is published, **When** a DevOps engineer reads the server info section, **Then** they can identify the OS, hardware resources, disk usage, uptime, and virtualization platform.
2. **Given** the documentation is published, **When** a DevOps engineer reads the web stack section, **Then** they can describe the full request flow from client browser → Nginx → Node.js API → SAP, and the parallel Apache path.
3. **Given** the documentation is published, **When** a DevOps engineer reads the services section, **Then** they can list all running services and their respective ports.

---

### User Story 2 — Security Analyst Assesses Risk Posture (Priority: P1)

A security analyst needs to evaluate the current security state of the Accriva Tickets test environment, including expired certificates, outdated software, misconfigured services, and exposed credentials.

**Why this priority**: The server has critical security issues (expired SSL, NODE_ENV=development in production, no firewall rules, service running as root) that need immediate visibility.

**Independent Test**: A security analyst can read the security section and produce a prioritized list of vulnerabilities with remediation steps, without accessing the server.

**Acceptance Scenarios**:

1. **Given** the documentation is published, **When** a security analyst reads the SSL/TLS section, **Then** they learn the wildcard certificate expired in December 2020 and identify the issuer and renewal path.
2. **Given** the documentation is published, **When** a security analyst reads the security findings, **Then** they find all critical/high/medium issues categorized with remediation recommendations.
3. **Given** the documentation is published, **When** a security analyst reviews the network section, **Then** they see that no firewall rules are active and all chains have ACCEPT policy.

---

### User Story 3 — Developer Understands Application Architecture for Maintenance (Priority: P2)

A developer assigned to maintain or upgrade the Accriva Tickets application needs to understand the codebase structure, API routes, SAP integration patterns, deployment process, and known issues.

**Why this priority**: Active development is infrequent (last code commit Feb 2025, last user activity Jan 2022 in logs), but when changes are needed, understanding the architecture is critical to avoid breaking the SAP integration.

**Independent Test**: A developer can read the application section and set up a local development environment using Docker, understand all API endpoints, and know which SAP services are called.

**Acceptance Scenarios**:

1. **Given** the documentation is published, **When** a developer reads the API section, **Then** they can list all Express routes (login, logon, instrument, material, status, mdr, ticket/*) and their SAP backend calls.
2. **Given** the documentation is published, **When** a developer reads the deployment section, **Then** they understand the git-based deployment flow (GitHub → deploy user → server).
3. **Given** the documentation is published, **When** a developer reads the known issues section, **Then** they are aware of the SAP material definition errors and stale error logs.

---

### User Story 4 — Operations Team Monitors Application Health (Priority: P2)

An operations team member needs to know where logs are located, what normal activity looks like, and how to diagnose common issues with the Accriva Tickets application.

**Why this priority**: Without log location knowledge and baseline activity patterns, troubleshooting takes significantly longer.

**Independent Test**: An operations engineer can locate all relevant log files and interpret their content without prior knowledge of the application.

**Acceptance Scenarios**:

1. **Given** the documentation is published, **When** an ops engineer reads the logs section, **Then** they can find nginx access/error logs, Node.js application logs (info.log, error.log, create_rga_error.log), and systemd journal logs.
2. **Given** the documentation is published, **When** an ops engineer checks the activity baseline, **Then** they know the last real user activity was April 20, 2026 (SSO access) and that the application sees very low traffic.

---

### Edge Cases

- What happens when the Node.js API crashes? (systemd auto-restarts after 10 seconds)
- How does the system behave when SAP is unreachable? (API returns errors to client, logged to error.log)
- What if the SSL certificate needs renewal? (Currently expired — must be replaced in both nginx and Apache paths)
- What about the backup directories (accriva-tickets-bk, accriva-tickets-bk2, accriva-tickets-12-07-2021)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Documentation MUST cover complete server infrastructure (OS, hardware, disk, memory, network)
- **FR-002**: Documentation MUST describe the full web stack architecture (Nginx reverse proxy → Node.js API, Apache fallback, port mapping)
- **FR-003**: Documentation MUST catalog all running services with their ports, systemd unit names, and descriptions
- **FR-004**: Documentation MUST detail the Node.js Express API (routes, SAP integration, environment configuration, logging)
- **FR-005**: Documentation MUST detail the React frontend (framework version, build process, SPA routing, SSO flow)
- **FR-006**: Documentation MUST enumerate all security findings with severity classification and remediation guidance
- **FR-007**: Documentation MUST map all log file locations with their format, rotation policy, and diagnostic commands
- **FR-008**: Documentation MUST describe the deployment process (git repository, deploy user, build artifacts)
- **FR-009**: Documentation MUST record the SSL/TLS certificate status and expiration
- **FR-010**: Documentation MUST be integrated into the existing MkDocs documentation site under the projects hierarchy

### Key Entities

- **Server**: ACCRIVATICKETSTEST (10.120.204.45) — the physical/virtual machine hosting everything
- **Nginx Reverse Proxy**: Entry point for all HTTP/HTTPS traffic, serves React SPA and proxies API calls
- **Node.js API**: Express backend (`accrivanodeapi.service`) — middleware between React client and SAP
- **React SPA**: Single-page application (`Accriva_client`) — ticket management UI for distributors
- **SAP Backend**: External system providing ticket data, user authentication, and RGA (Return Goods Authorization) processing
- **Apache httpd**: Secondary web server on port 8080, serving the same SPA (legacy or load-balancer target)
- **SSL Certificate**: Wildcard `*.werfen.com` (GoDaddy) — currently expired

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Documentation covers 100% of running services identified on the server (32 services)
- **SC-002**: A new team member can understand the complete request flow (browser → nginx → Node.js → SAP) within 10 minutes of reading
- **SC-003**: All security findings are documented with severity level, and the most critical (expired SSL, NODE_ENV=development) are flagged prominently
- **SC-004**: All log file locations are documented with example diagnostic commands that can be copy-pasted
- **SC-005**: Documentation is accessible via the MkDocs site with proper navigation, consistent with the existing Distributors Portal documentation structure
- **SC-006**: The documentation accurately reflects the server state as of April 27, 2026

## Assumptions

- The server is read-only for audit purposes — no changes will be made to the server configuration
- The existing MkDocs Material documentation site at `http://localhost:8000` will host this documentation
- The documentation structure will mirror the pattern established for the Distributors Portal (server-info, web-stack, database, devops, cybersecurity sections)
- SAP integration details will be documented at the interface level only (env var names, endpoint patterns) — SAP credentials will NOT be stored in documentation
- The application appears to have very low usage in the test environment (last real user activity: April 20, 2026; last info.log entry: January 2022)
- The backup directories (accriva-tickets-bk, accriva-tickets-bk2) are historical snapshots and will be noted but not analyzed in detail
- The server has no database running locally — all data is managed by SAP
- Docker Compose configuration exists for local development but is NOT used in the server deployment
