## Database Rules

- Never modify the database manually
- All schema changes must go through Flyway
- Never edit an existing migration

## JPA Rules

- `ddl-auto` must remain `validate`
- Entity fields must match DB columns exactly
- No lazy schema changes

## Error Handling Rules

- All exceptions must be handled via GlobalExceptionHandler
- Controllers must never return raw exceptions

## Security Rules

- No endpoint is public by default
- Security configuration must be explicit
- Temporary dev rules must not reach production

## Coding Discipline

- No business logic in controllers
- Services must be unit-testable
- DTOs must not expose entities directly

## Repository Rules

- No force pushes to main
- Database migrations must be reviewed
- README must be updated when architecture changes
