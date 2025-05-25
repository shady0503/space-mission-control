# Enterprise Service - Unit Tests

This project includes comprehensive unit tests using H2 in-memory database for fast and reliable testing.

## Test Structure

### 1. Repository Tests (`EnterpriseRepositoryTest`)
- **Location**: `src/test/java/com/entreprise/repository/`
- **Purpose**: Tests JPA repository methods using `@DataJpaTest`
- **Database**: H2 in-memory database
- **Coverage**: CRUD operations, custom queries

### 2. Service Tests (`EnterpriseServiceTest`)
- **Location**: `src/test/java/com/entreprise/service/`
- **Purpose**: Tests business logic using mocks
- **Framework**: Mockito for mocking dependencies
- **Coverage**: All service methods, error handling

### 3. Controller Tests (`EnterpriseControllerTest`)
- **Location**: `src/test/java/com/entreprise/controller/`
- **Purpose**: Tests REST endpoints using `@WebMvcTest`
- **Framework**: MockMvc for HTTP testing
- **Coverage**: All REST endpoints, request/response validation

### 4. Integration Tests (`EnterpriseIntegrationTest`)
- **Location**: `src/test/java/com/entreprise/integration/`
- **Purpose**: End-to-end testing with real database
- **Database**: H2 in-memory database
- **Coverage**: Full request-to-database flow

### 5. Application Context Test (`EntrepriseApplicationTests`)
- **Location**: `src/test/java/com/entreprise/`
- **Purpose**: Ensures Spring Boot application context loads successfully
- **Coverage**: Application startup and configuration

## Test Configuration

### H2 Database Setup
- **Configuration**: `src/test/resources/application-test.properties`
- **Database**: In-memory H2 database (`jdbc:h2:mem:testdb`)
- **Schema**: Auto-created and dropped for each test
- **Profile**: `test` profile activated for all tests

### Dependencies
- **H2 Database**: In-memory database for testing
- **Spring Boot Test**: Testing framework and annotations
- **Mockito**: Mocking framework for unit tests
- **AssertJ**: Fluent assertions for better test readability

## Running Tests

### Run All Tests
```bash
mvn test
```

### Run Specific Test Class
```bash
mvn test -Dtest=EnterpriseRepositoryTest
mvn test -Dtest=EnterpriseServiceTest
mvn test -Dtest=EnterpriseControllerTest
mvn test -Dtest=EnterpriseIntegrationTest
```

### Run Tests with Coverage
```bash
mvn test jacoco:report
```

## Test Features

### ✅ Fast Execution
- Uses H2 in-memory database for speed
- Minimal external dependencies
- Mocked external services (Feign clients)

### ✅ Isolated Tests
- Each test is independent
- Database is reset between tests
- No shared state between test methods

### ✅ Comprehensive Coverage
- Repository layer (data access)
- Service layer (business logic)
- Controller layer (REST API)
- Integration testing (end-to-end)

### ✅ Simple Setup
- No external database required
- No Docker or additional services needed
- Works out of the box with Maven

## Test Results Summary

- **Total Tests**: 25
- **Repository Tests**: 5
- **Service Tests**: 8
- **Controller Tests**: 6
- **Integration Tests**: 5
- **Application Tests**: 1

All tests pass successfully and provide good coverage of the Enterprise service functionality. 