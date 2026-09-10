# Release evidence

Public website: local release checks pass (31 routes, 59 behavior tests); browser checks show no mobile overflow or script errors. Scene navigation, reduced motion, first-look editing and example viewer navigation pass. Public homepage rendered and inspected at desktop and phone widths.

Service: audited live runtime cd2faf265340, Railway deployment 810fd703-d5af-414d-92a4-b607e6ae4391. No paid work started by this release.

Unresolved service launch gates found in source:
- website_intake.payment_problem currently uses recurring Operations Employee subscription entitlement, not one-time website package entitlement.
- a new public email without an existing customer is blocked before website checkout can establish that relationship.
- website_project.status does not provide a working website checkout URL for these blocked requests.
- website_progress explicitly permits internal-test orders only; paid progression is not ready to enable by flipping a flag.
- one real complete journey from authorized payment to approved deliverable is not yet proven.

Keep paid launch gated while implementing and verifying these seams. Do not describe the marketing deployment as full-product completion.
