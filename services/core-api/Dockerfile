FROM maven:3.9.11-eclipse-temurin-21 AS builder

WORKDIR /workspace

COPY pom.xml ./
RUN mvn -B -ntp dependency:go-offline

COPY src ./src
RUN mvn -B -ntp -DskipTests package

FROM eclipse-temurin:21-jre-jammy AS runner

RUN apt-get update \
  && apt-get install --yes --no-install-recommends curl ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system --gid 10001 spring \
  && useradd --system --uid 10001 --gid spring --no-create-home spring

WORKDIR /app

COPY --from=builder --chown=spring:spring /workspace/target/*.jar /app/app.jar

USER spring

EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=5s --start-period=35s --retries=5 \
  CMD curl --fail --silent http://127.0.0.1:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "/app/app.jar"]

