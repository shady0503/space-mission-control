# Simple Unit Tests for Spacecraft Service

This project includes simple, fast unit tests that use H2 in-memory database for testing. The tests are designed to be lightweight and don't require any external services.

## Test Structure

### 1. SpacecraftServiceTest
- **Location**: `src/test/java/com/spacecraft/spacecraft/service/SpacecraftServiceTest.java`
- **Purpose**: Tests the business logic in the SpacecraftService
- **Tests**:
  - Save and retrieve spacecraft by ID
  - Find spacecraft by external ID and enterprise ID
  - Find spacecraft by mission ID, type, and enterprise ID
  - Delete spacecraft operations
  - Count operations
  - Get all spacecraft

### 2. SpacecraftRepositoryTest
- **Location**: `src/test/java/com/spacecraft/spacecraft/repository/SpacecraftRepositoryTest.java`
- **Purpose**: Tests the JPA repository methods
- **Tests**:
  - Basic CRUD operations
  - Custom query methods
  - Counting and aggregation queries
  - Complex finder methods

### 3. SpacecraftCommandTest
- **Location**: `src/test/java/com/spacecraft/spacecraft/model/SpacecraftCommandTest.java`
- **Purpose**: Tests the JPA entity relationships and persistence
- **Tests**:
  - Entity persistence
  - Command-Spacecraft relationship
  - All command types (LAUNCH, ADJUST_TRAJECTORY, SHUTDOWN, EMERGENCY_STOP)
  - All spacecraft types (SATELLITE, ROVER)

## Test Configuration

### H2 Database Configuration
- **File**: `src/test/resources/application-test.properties`
- **Database**: H2 in-memory database
- **Features**:
  - Automatic schema creation/drop
  - No external dependencies
  - Fast execution
  - Isolated test environment

### Key Configuration Properties
```properties
spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
spring.datasource.driver-class-name=org.h2.Driver
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
```

## Running the Tests

### Run All Unit Tests
```bash
mvn test -Dtest="SpacecraftServiceTest,SpacecraftRepositoryTest,SpacecraftCommandTest"
```

### Run Individual Test Classes
```bash
# Service tests only
mvn test -Dtest="SpacecraftServiceTest"

# Repository tests only
mvn test -Dtest="SpacecraftRepositoryTest"

# Entity/Model tests only
mvn test -Dtest="SpacecraftCommandTest"
```

## Test Features

### ✅ What's Included
- **Fast execution**: All tests run in under 10 seconds
- **No external dependencies**: Uses H2 in-memory database
- **Comprehensive coverage**: Tests service, repository, and entity layers
- **Simple setup**: No complex configuration required
- **Isolated**: Each test runs in its own transaction and database instance

### ✅ Test Annotations Used
- `@DataJpaTest`: For repository and entity tests
- `@ActiveProfiles("test")`: Uses test-specific configuration
- `@Import(SpacecraftService.class)`: Imports service for testing
- `@BeforeEach`: Sets up test data before each test

### ✅ Database Compatibility
- **H2**: Used for testing (TEXT column for payload)
- **PostgreSQL**: Used in production (JSONB column for payload)
- The Command entity uses TEXT for H2 compatibility while maintaining PostgreSQL support

## Test Results
```
Tests run: 24, Failures: 0, Errors: 0, Skipped: 0
```

All tests pass successfully and provide good coverage of the core functionality without requiring external services or complex setup. 