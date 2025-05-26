# Dashboard Service

A Spring Boot dashboard service for managing spacecraft missions, operators, and telemetry data.

## Testing

This project includes simple unit tests that use H2 in-memory database for fast execution.

### Test Structure

- **Unit Tests**: Located in `src/test/java/`
  - `DashboardServiceTest`: Tests the business logic in the service layer
  - `DashboardControllerTest`: Tests the REST controller with mocked dependencies
  - `DashboardApplicationTests`: Basic application test
  - `DashboardApplicationIntegrationTest`: Simple integration test

### Test Configuration

- **H2 Database**: Configured in `src/test/resources/application-test.yml`
- **Mock Dependencies**: External service clients are mocked using Mockito
- **Fast Execution**: Tests run quickly without requiring external services

### Running Tests

```bash
# Run all tests
mvn test

# Run specific test classes
mvn test -Dtest="DashboardServiceTest,DashboardControllerTest"

# Run tests with verbose output
mvn test -X
```

### Test Features

- ✅ No external dependencies required
- ✅ H2 in-memory database for data operations
- ✅ Mocked external service clients
- ✅ Fast execution (< 5 seconds)
- ✅ Comprehensive coverage of business logic
- ✅ Simple and maintainable test structure

### Dependencies

The tests use the following key dependencies:
- JUnit 5 for test framework
- Mockito for mocking
- H2 Database for in-memory data storage
- Spring Boot Test for testing utilities

All tests are designed to be simple, fast, and reliable without requiring complex setup or external services. 