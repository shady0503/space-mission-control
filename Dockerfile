# syntax=docker/dockerfile:1.4

########################################
# 1) Build Stage - Dependency Caching
########################################
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /workspace

# Shared Maven cache
RUN --mount=type=cache,target=/root/.m2 mkdir -p /root/.m2

# Copy all pom.xml files for each service
COPY auth-service/pom.xml      auth-service/
COPY entreprise/pom.xml        entreprise/
COPY gateway/pom.xml           gateway/
COPY mission-service/pom.xml   mission-service/
COPY spacecraft/pom.xml        spacecraft/
COPY telemetry/pom.xml         telemetry/
COPY dashboard/pom.xml         dashboard/

# Pre-fetch dependencies for all services
RUN --mount=type=cache,target=/root/.m2 \
    mvn -f auth-service/pom.xml dependency:go-offline -B && \
    mvn -f entreprise/pom.xml dependency:go-offline -B && \
    mvn -f gateway/pom.xml dependency:go-offline -B && \
    mvn -f mission-service/pom.xml dependency:go-offline -B && \
    mvn -f spacecraft/pom.xml dependency:go-offline -B && \
    mvn -f telemetry/pom.xml dependency:go-offline -B && \
    mvn -f dashboard/pom.xml dependency:go-offline -B

########################################
# 2) Build stages for each service
########################################

# Auth Service Build
FROM builder AS auth-build
WORKDIR /workspace/auth-service
COPY auth-service/src ./src
RUN mvn clean package -Dmaven.test.skip -B

# Entreprise Service Build
FROM builder AS entreprise-build
WORKDIR /workspace/entreprise
COPY entreprise/src ./src
RUN mvn clean package -Dmaven.test.skip -B

# Gateway Service Build
FROM builder AS gateway-build
WORKDIR /workspace/gateway
COPY gateway/src ./src
RUN mvn clean package -Dmaven.test.skip -B

# Mission Service Build
FROM builder AS mission-build
WORKDIR /workspace/mission-service
COPY mission-service/src ./src
RUN mvn clean package -Dmaven.test.skip -B

# Spacecraft Service Build
FROM builder AS spacecraft-build
WORKDIR /workspace/spacecraft
COPY spacecraft/src ./src
RUN mvn clean package -Dmaven.test.skip -B

# Telemetry Service Build
FROM builder AS telemetry-build
WORKDIR /workspace/telemetry
COPY telemetry/src ./src
RUN mvn clean package -Dmaven.test.skip -B

# Dashboard Service Build
FROM builder AS dashboard-build
WORKDIR /workspace/dashboard
COPY dashboard/src ./src
RUN mvn clean package -Dmaven.test.skip -B

########################################
# 3) Runtime stages for each service
########################################

# Auth Service Runtime
FROM eclipse-temurin:17-jre-alpine AS auth-runtime
WORKDIR /app
COPY --from=auth-build /workspace/auth-service/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]

# Entreprise Service Runtime
FROM eclipse-temurin:17-jre-alpine AS entreprise-runtime
WORKDIR /app
COPY --from=entreprise-build /workspace/entreprise/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]

# Gateway Service Runtime
FROM eclipse-temurin:17-jre-alpine AS gateway-runtime
WORKDIR /app
COPY --from=gateway-build /workspace/gateway/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]

# Mission Service Runtime
FROM eclipse-temurin:17-jre-alpine AS mission-runtime
WORKDIR /app
COPY --from=mission-build /workspace/mission-service/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]

# Spacecraft Service Runtime
FROM eclipse-temurin:17-jre-alpine AS spacecraft-runtime
WORKDIR /app
COPY --from=spacecraft-build /workspace/spacecraft/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]

# Telemetry Service Runtime
FROM eclipse-temurin:17-jre-alpine AS telemetry-runtime
WORKDIR /app
COPY --from=telemetry-build /workspace/telemetry/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]

# Dashboard Service Runtime
FROM eclipse-temurin:17-jre-alpine AS dashboard-runtime
WORKDIR /app
COPY --from=dashboard-build /workspace/dashboard/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
