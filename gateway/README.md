# Gateway Service Tests

This project contains simple unit tests for the Spring Cloud Gateway service using H2 in-memory database for testing.

## Test Structure

### Unit Tests
- **GatewayApplicationTests**: Basic Spring Boot context loading test
- **GatewaySecurityConfigTest**: Tests for JWT decoder configuration and validation
- **CorsGlobalConfigurationTest**: Tests for CORS filter configuration

### Integration Tests
- **GatewayRoutesIntegrationTest**: Tests for gateway route configuration and validation

## Test Configuration

The tests use a separate configuration profile (`test`) with:
- H2 in-memory database
- Simplified JWT secret for testing
- Local service URLs for route testing
- Disabled management security

## Running Tests

```bash
mvn test
```

## Test Features

- **Fast execution**: Uses H2 in-memory database
- **No external dependencies**: All tests are self-contained
- **Simple assertions**: Basic validation of configuration and context loading
- **Reactive testing**: Uses Spring WebFlux reactive patterns

## Test Coverage

- Spring Boot application context loading
- Security configuration validation
- CORS configuration
- Gateway routes configuration
- JWT decoder setup and validation

All tests are designed to be fast, simple, and reliable without requiring external services. 