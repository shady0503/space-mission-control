# syntax=docker/dockerfile:1.7
###############################################################################
# 0. Global build args
###############################################################################
ARG JDK_VERSION=17
ARG OTEL_VERSION=2.4.0
ARG MVN_FLAGS="-q -B -Dmaven.test.skip"
# master list of all services — edit in ONE place
ARG MODULES="auth-service entreprise gateway mission-service spacecraft telemetry dashboard"

###############################################################################
# 1. Dependency pre-fetch  (writes to /root/.m2 cache)
###############################################################################
FROM maven:3.9.6-eclipse-temurin-${JDK_VERSION} AS maven-deps
ARG MODULES
ARG MVN_FLAGS
WORKDIR /workspace

# copy ONLY pom.xml files (cache-friendly)
COPY auth-service/pom.xml      auth-service/
COPY entreprise/pom.xml        entreprise/
COPY gateway/pom.xml           gateway/
COPY mission-service/pom.xml   mission-service/
COPY spacecraft/pom.xml        spacecraft/
COPY telemetry/pom.xml         telemetry/
COPY dashboard/pom.xml         dashboard/

# download deps for every module
RUN --mount=type=cache,id=maven-repo,target=/root/.m2 \
    for m in ${MODULES}; do \
      echo "🔹 go-offline for $m" && \
      mvn -f ${m}/pom.xml ${MVN_FLAGS} dependency:go-offline; \
    done

###############################################################################
# 2. Build stage  (re-uses the same cache)
###############################################################################
FROM maven:3.9.6-eclipse-temurin-${JDK_VERSION} AS build
ARG MODULES
ARG MVN_FLAGS
WORKDIR /workspace

# full source trees (pom.xml + src) for each module
COPY auth-service      auth-service
COPY entreprise        entreprise
COPY gateway           gateway
COPY mission-service   mission-service
COPY spacecraft        spacecraft
COPY telemetry         telemetry
COPY dashboard         dashboard

# compile JARs (unchanged modules are skipped)
RUN --mount=type=cache,id=maven-repo,target=/root/.m2 \
    for m in ${MODULES}; do \
      echo "🚀 packaging $m" && \
      mvn -f ${m}/pom.xml ${MVN_FLAGS} package; \
    done

###############################################################################
# 3. Base runtime (JRE + CA + OTEL agent)
###############################################################################
FROM eclipse-temurin:${JDK_VERSION}-jre-alpine AS base-runtime
RUN apk add --no-cache curl ca-certificates && mkdir -p /otel
ARG OTEL_VERSION
RUN curl -sSL \
  https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/download/v${OTEL_VERSION}/opentelemetry-javaagent.jar \
  -o /otel/opentelemetry-javaagent.jar

ENV JAVA_TOOL_OPTIONS="-javaagent:/otel/opentelemetry-javaagent.jar" \
    OTEL_TRACES_EXPORTER=otlp \
    OTEL_LOGS_EXPORTER=otlp \
    OTEL_METRICS_EXPORTER=none \
    OTEL_EXPORTER_OTLP_ENDPOINT=http://lgtm:4318

WORKDIR /app
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=2s --start-period=20s \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# run **whatever jar** is found in /app
ENTRYPOINT ["sh","-c","exec java -jar $(ls /app/*.jar | head -n 1)"]

###############################################################################
# 4. Final images — copy jar(s) into /app
###############################################################################
FROM base-runtime AS auth-runtime
ENV OTEL_SERVICE_NAME=auth-service
COPY --from=build /workspace/auth-service/target/*.jar /app/

FROM base-runtime AS entreprise-runtime
ENV OTEL_SERVICE_NAME=entreprise-service
COPY --from=build /workspace/entreprise/target/*.jar /app/

FROM base-runtime AS gateway-runtime
ENV OTEL_SERVICE_NAME=gateway-service
COPY --from=build /workspace/gateway/target/*.jar /app/

FROM base-runtime AS mission-runtime
ENV OTEL_SERVICE_NAME=mission-service
COPY --from=build /workspace/mission-service/target/*.jar /app/

FROM base-runtime AS spacecraft-runtime
ENV OTEL_SERVICE_NAME=spacecraft-service
COPY --from=build /workspace/spacecraft/target/*.jar /app/

FROM base-runtime AS telemetry-runtime
ENV OTEL_SERVICE_NAME=telemetry-service
COPY --from=build /workspace/telemetry/target/*.jar /app/

FROM base-runtime AS dashboard-runtime
ENV OTEL_SERVICE_NAME=dashboard-service
COPY --from=build /workspace/dashboard/target/*.jar /app/
