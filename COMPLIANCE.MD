# Compliance Document: GDPR and DPDP Integration in Tresta's Testimonial Moderation Flow

**Document Version:** 1.0  
**Date:** November 07, 2025  
**Author:** Grok (xAI Assistant)  
**Purpose:** This document provides a comprehensive overview of how Tresta's testimonial moderation flow complies with the European Union's General Data Protection Regulation (GDPR) and India's Digital Personal Data Protection Act, 2023 (DPDP Act). It focuses on the use of device fingerprinting for spam and forgery prevention, ensuring data minimization, consent, and other key principles. This is tailored for the MVP scope, emphasizing simplicity and low-risk implementation. References are based on the latest 2025 updates, including DPDP Draft Rules 2025 and GDPR guidance on fingerprinting. Note: This is not legal advice; consult a qualified attorney for your specific operations.

## 1. Introduction

Tresta is a SaaS platform for managing testimonials, with a moderation flow that includes submission, auto-moderation, manual review, and publishing. To enhance authenticity and prevent forgery (e.g., multiple submissions from the same user), the flow incorporates optional device fingerprinting via libraries like FingerprintJS. This collects minimal, hashed device attributes for spam detection.

**Key Compliance Goals:**

- Ensure explicit consent and data minimization to align with both laws.
- Use GDPR's legitimate interest basis where possible for fraud prevention, while mandating consent under DPDP.
- Handle potential EU/Indian users with extraterritorial applicability: GDPR applies if targeting EU residents; DPDP to digital data in/related to India.
- Risks: Fingerprints as "personal data" under both (if identifiable); non-compliance fines up to 4% global turnover (GDPR) or ₹250 crore (DPDP).

## 2. Overview of the Moderation Flow

The flow is designed for efficiency and user value, per the PRD:

1. **Submission (Public Form):** User submits testimonial; collect metadata with consent.
2. **API Handling:** Rate limit and forgery checks.
3. **Auto-Moderation:** Heuristic triage (e.g., profanity, sentiment).
4. **Manual Review:** Owner approves/rejects.
5. **Publishing:** Display approved testimonials.

Enhancements: Device fingerprinting for forgery detection, with fallbacks to avoid blocking.

## 3. Compliance Framework: GDPR vs. DPDP Overview

Both laws protect personal data but differ in scope and requirements. Below is a comparison relevant to your flow (e.g., consent for fingerprinting, minimization for digital processing).

| Aspect                      | GDPR                                                                                                                                                                                                           | DPDP                                                                                                                                                                 | Application to Tresta Flow                                                                             |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Scope**                   | All personal data (digital/non-digital); extraterritorial for EU-targeted services. Includes pseudonymous data like fingerprints if re-identifiable.                                                           | Digital personal data only; extraterritorial for India-related processing. No sensitive data distinction.                                                            | Fingerprints are digital/identifiable, so in scope. Apply GDPR if EU users; DPDP for Indian.           |
| **Lawful Basis/Consent**    | Multiple bases: Consent, legitimate interest (e.g., fraud prevention), contract. Consent must be freely given, informed, unambiguous. Legitimate interest for fingerprinting if balanced (e.g., LIA required). | Primarily consent (free, informed, in plain language/22 Indian languages). Limited "legitimate uses" (e.g., emergencies); consent managers for streamlined handling. | Use explicit consent checkbox for both. Fallback to legitimate interest under GDPR for low-risk cases. |
| **Data Minimization**       | Explicit: Collect only necessary data; privacy-by-design.                                                                                                                                                      | Implied via purpose limitation; specify in consent.                                                                                                                  | Use minimal FingerprintJS attributes; hash and delete after 30 days.                                   |
| **Individual Rights**       | Access, rectification, erasure, restriction, objection, portability, no solely automated decisions.                                                                                                            | Access, correction, erasure, grievance redressal; no portability/objection.                                                                                          | Provide support email for requests; log for audits.                                                    |
| **Assessments/Security**    | DPIA for high-risk (e.g., fingerprinting); breach notification in 72 hours if risky.                                                                                                                           | DPIA for Significant Data Fiduciaries (SDFs); all breaches notified to Board/users.                                                                                  | Conduct DPIA/LIA under GDPR; reasonable safeguards for both.                                           |
| **Transfers**               | Adequacy decisions, SCCs for non-EEA.                                                                                                                                                                          | Allowed unless restricted; no specific tools.                                                                                                                        | Use SCCs for GDPR if using non-EEA servers (e.g., Vercel).                                             |
| **Penalties**               | Up to €20M/4% turnover.                                                                                                                                                                                        | Up to ₹250 crore; audits for SDFs.                                                                                                                                   | Prioritize compliance to avoid.                                                                        |
| **Fingerprinting-Specific** | Allowed for fraud under legitimate interest/consent; ICO 2025 guidance emphasizes minimization post-Google U-turn.                                                                                             | Allowed with consent for legitimate purposes; Draft Rules 2025 stress consent managers and privacy.                                                                  | Use consent; fallback to heuristics.                                                                   |

## 4. Detailed Compliance by Moderation Flow Step

Each step includes specific measures for GDPR/DPDP alignment.

### Step 1: Submission (Public Form)

- **Description:** Collect testimonial; optional fingerprint via FingerprintJS (minimal mode).
- **Compliance Details:**
  - **Consent:** Explicit checkbox: "I consent to device info for spam prevention (in English/Hindi/other per DPDP)." Withdrawal option in policy. GDPR: Granular and informed; DPDP: Plain language, duress-free.
  - **Minimization:** Hash visitorId; no raw data stored. Fallback: Email/content checks if no consent.
  - **Rights/Transparency:** Privacy notice links to policy detailing purpose/retention.

### Step 2: API Handling

- **Description:** Rate limit/forgery checks via DB query on hashed visitorId/email.
- **Compliance Details:**
  - **Lawful Basis:** Consent (DPDP); legitimate interest for fraud (GDPR, with LIA: Necessary for trust, minimal impact).
  - **Security:** Clerk auth; anonymize IP if used secondarily.
  - **Breach/Assessments:** Log checks; DPIA notes low-risk (no profiling).

### Step 3: Auto-Moderation

- **Description:** Heuristics on content/metadata.
- **Compliance Details:**
  - **Automated Decisions:** Low-stakes (rejection appealable); no GDPR prohibition.
  - **Minimization:** Use only for triage; no reuse.
  - **Transparency:** Flags explain reasons (e.g., "forgery risk").

### Step 4: Manual Review

- **Description:** Dashboard for approval.
- **Compliance Details:**
  - **Rights:** Allow deletion on request (erasure under both).
  - **Accountability:** Log actions for audits (GDPR/DPDP).

### Step 5: Publishing

- **Description:** Display approved testimonials.
- **Compliance Details:**
  - **Purpose Limitation:** Public data is consented; no metadata published.

## 5. General Compliance Measures

- **Privacy Policy:** Comprehensive, covering data types, purposes, rights, transfers. Multi-language for DPDP.
- **Data Retention/Deletion:** 30 days for metadata; auto-cron in Prisma.
- **Training/Audits:** Internal docs on compliance; prepare for DPDP Board audits if SDF.
- **International Transfers:** SCCs for GDPR if data leaves EEA/India.
- **Children's Data:** Verify age if needed (DPDP parental consent).
- **Monitoring:** Aggregate metrics only; no individual tracking.

## 6. Risks and Mitigation

- **Risk:** Misclassification of fingerprints as non-personal (mitigate: Treat as personal; anonymize).
- **Risk:** Consent invalidity (mitigate: Clear, granular forms).
- **Risk:** Breaches (mitigate: Notify promptly; safeguards like encryption).
- **Risk:** Evolving Rules (mitigate: Monitor ICO/MeitY updates; 2025 DPDP rollout phased).

## 7. Conclusion

This flow ensures Tresta is compliant with GDPR and DPDP by embedding consent, minimization, and transparency at every step. For MVP launch, implement with fallbacks to reduce complexity. Regular reviews (e.g., annual) will address updates like DPDP's full enforcement in 2025. If expanding, consider consent managers under DPDP Draft Rules.
