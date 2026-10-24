# CampusAccess Firestore Security Specification (Phase 0 TDD)

## 1. Data Invariants
1. **Strict Ownership (`userId == request.auth.uid`)**: A `UserPreference` document at `/userPreferences/{userId}` can only be read, created, or updated by the authenticated user whose `request.auth.uid == userId` and `request.auth.token.email_verified == true`.
2. **Relational Master Gate for Subcollection (`readingProgress`)**: A `ReadingProgress` document at `/userPreferences/{userId}/readingProgress/{documentId}` can only be created or updated if the parent `/userPreferences/{userId}` document exists (`exists()`), belongs to `request.auth.uid`, and `incoming().userId == userId` and `incoming().documentId == documentId`.
3. **Strict Schema & Volumetric Boundaries**: Every field must match exact allowed keys (`hasAll` + `hasOnly`), exact primitive types, enum constraints, numeric bounds (`fontSize` 14..28, `lineSpacing` 1.2..2.6, `speechRate` 0.5..2.0), and string length limits (`size() <= 128`).
4. **Temporal & Immutable Integrity**: `createdAt` must equal `request.time` on creation and remain immutable on update (`incoming().createdAt == existing().createdAt`). `updatedAt` must always equal `request.time`.

## 2. The "Dirty Dozen" Payloads (Adversarial Test Vectors)
1. **Identity Spoofing on Create**: `POST /userPreferences/victim_uid` with `userId: "attacker_uid"` -> `PERMISSION_DENIED`.
2. **Unverified Email Write**: Authenticated user with `email_verified: false` writing to `/userPreferences/{uid}` -> `PERMISSION_DENIED`.
3. **Shadow Field Injection (Create)**: Adding `"isAdmin": true` to `/userPreferences/{uid}` -> `PERMISSION_DENIED` via `keys().hasOnly()`.
4. **Shadow Field Injection (Update)**: Updating `/userPreferences/{uid}` with `"role": "superuser"` -> `PERMISSION_DENIED` via `affectedKeys().hasOnly()`.
5. **Value Poisoning (Out-of-range FontSize)**: Setting `fontSize: 99999` or `"24px"` (string instead of number) -> `PERMISSION_DENIED`.
6. **Enum Bypass (`persona`)**: Setting `persona: "hacker-mode"` -> `PERMISSION_DENIED`.
7. **Timestamp Forgery (Create)**: Sending client-forged `createdAt` != `request.time` -> `PERMISSION_DENIED`.
8. **Immortal Field Mutation (Update)**: Modifying `createdAt` or `userId` during an update -> `PERMISSION_DENIED`.
9. **ID Poisoning**: Creating `/userPreferences/{userId}/readingProgress/{bad$id!}` or 1.5KB ID string -> `PERMISSION_DENIED` via `isValidId()`.
10. **Orphaned Subcollection Write**: Creating `/userPreferences/{uid}/readingProgress/doc1` when `/userPreferences/{uid}` does not exist -> `PERMISSION_DENIED` via Master Gate `exists()`.
11. **Array Exhaustion Attack**: Passing 500 items in `completedCheckpoints` (exceeds max 50) or non-string first element -> `PERMISSION_DENIED`.
12. **Blanket Cross-User Read**: Authenticated user A attempting `get` or `list` on `/userPreferences/userB` -> `PERMISSION_DENIED`.

## 3. Red Team Audit Matrix
- **Shadow Update Test**: Passed (`hasOnly` enforced on both `create` and `update`).
- **Email Spoofing Test**: Passed (`isVerifiedUser()` checks `request.auth.token.email_verified == true`).
- **PII Blanket Test**: Passed (No PII stored; strict owner-only access on all paths).
- **Query Trust Test**: Passed (`allow list` on `readingProgress` checks `resource.data.userId == request.auth.uid` and `userId == request.auth.uid` without `get()` inside `list`).
