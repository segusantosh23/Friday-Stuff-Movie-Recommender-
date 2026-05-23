# Firestore Security Specification

## Data Invariants
1. A user can only access their own profile, liked movies, and watchlist.
2. Movie IDs must be numbers (stored as strings in path, but data represents a movie).
3. Timestamps like `createdAt` and `addedAt` must be valid server timestamps.

## The "Dirty Dozen" Payloads (Identity, Integrity, State)
1. **Identity Spoofing**: Attempt to write to `/users/anotherUserUid` as `authUser`.
2. **Identity Spoofing**: Attempt to write to `/users/authUserUid/likedMovies/movie1` with `userId` field set to `anotherUser`.
3. **Identity Spoofing**: Attempt to read `/users/anotherUserUid/watchlist`.
4. **State Transition Violation**: Attempt to update `createdAt` of a profile.
5. **Resource Poisoning**: Attempt to use a 2MB string as a movie ID in the path.
6. **Resource Poisoning**: Attempt to add a 1GB string as movie overview.
7. **Resource Poisoning**: Attempt to add 1 million characters to displayName.
8. **PII Leak**: Attempt to list all documents in `/users` without a specific ID.
9. **Bypass Validation**: Attempt to write a movie without the `id` field.
10. **Timestamp Fraud**: Send a client-side timestamp for `addedAt` instead of `request.time`.
11. **Path variable hardening**: Use a non-alphanumeric string as a path variable.
12. **Boundary Violation**: Send a movie with no details at all.

## The Test Runner (Plan)
We will verify that:
- `isValidId(userId)` is used.
- `isSignedIn()` is required.
- `isOwner(userId)` is strictly enforced for all sub-resources.
- `isValidUserProfile` and `isValidMovieItem` enforce strict schema and immutability.
