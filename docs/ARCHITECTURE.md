# Architecture

DailySpend is a Spring Boot–based backend application designed for tracking financial transactions.
The system follows a layered architecture with strict separation of concerns.

## Technology Stack

- Java 17
- Spring Boot 3.x
- Spring Data JPA (Hibernate)
- PostgreSQL 16
- Flyway for database migrations
- Spring Security

## Project Structure

com.example.dailyspend
├── controller   # REST endpoints
├── service      # Business logic
├── repository   # Database access (JPA)
├── entity       # JPA entities mapped to DB
├── dto          # Request/response models
├── exception    # Global error handling
├── config       # App & security configuration
├── util         # Shared helpers

This structure enforces separation of concerns and improves testability and maintainability.

## Database Design

- PostgreSQL is used as the primary datastore
- Schema is managed exclusively via Flyway
- Hibernate is configured in `validate` mode
- No automatic schema creation is allowed

## Schema Migration Strategy

- All schema changes are applied via Flyway
- Migrations are immutable and versioned
- Direct database changes are forbidden
- Version history is tracked in flyway_schema_history

## Concurrency Control

Optimistic locking is used for financial transactions.
The `transactions` table includes a `version` column, mapped using `@Version` in JPA entities.

## Security

- Spring Security is enabled
- Authentication and authorization are configured explicitly
- No unsecured endpoints in production
