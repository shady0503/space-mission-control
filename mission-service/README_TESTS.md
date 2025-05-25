# Mission Service - Unit Tests

This project includes simple, fast unit tests that use H2 in-memory database for testing without requiring external services.

## Test Setup

### Dependencies
- **H2 Database**: In-memory database for fast testing
- **Spring Boot Test**: Testing framework with auto-configuration
- **Mockito**: For mocking external dependencies
- **AssertJ**: For fluent assertions

### Test Configuration
- Tests use the `test` profile which configures H2 database
- Kafka is mocked to avoid external dependencies
- Database schema is created/dropped automatically for each test

## Test Structure

### 1. Repository Tests (`MissionRepositoryTest`)
- Tests JPA repository methods
- Uses `@DataJpaTest` for focused repository testing
- Tests CRUD operations, queries, and counting

### 2. Service Tests (`MissionServiceTest`)
- Tests business logic with mocked dependencies
- Uses `@ExtendWith(MockitoExtension.class)` for mocking
- Verifies service interactions and data transformations

### 3. Integration Tests (`MissionServiceIntegrationTest`)
- Tests complete flow from service to database
- Uses `@SpringBootTest` with H2 database
- Kafka is mocked but database operations are real

### 4. Model Tests (`MissionTest`)
- Simple unit tests for entity classes
- Tests constructors, getters/setters, and default values

### 5. Application Tests (`MissionServiceApplicationTests`)
- Context loading test to ensure Spring configuration is valid

## Running Tests

```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=MissionRepositoryTest

# Run tests with verbose output
mvn test -X
```

## Test Features

- **Fast execution**: Uses H2 in-memory database
- **No external dependencies**: Kafka and other services are mocked
- **Isolated**: Each test runs in its own transaction that's rolled back
- **Comprehensive**: Covers repository, service, integration, and model layers

## Test Configuration Files

- `src/test/resources/application-test.yaml`: H2 database configuration
- Tests use `@ActiveProfiles("test")` to load test configuration

## Key Testing Patterns

1. **Repository Tests**: Focus on data access layer
2. **Service Tests**: Mock dependencies, test business logic
3. **Integration Tests**: Test complete flows with real database
4. **Model Tests**: Test entity behavior and validation

All tests are designed to be simple, fast, and reliable without requiring external infrastructure. 