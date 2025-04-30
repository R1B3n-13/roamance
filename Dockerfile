# ---------- Build Stage ----------
FROM gradle:8.5.0-jdk21 AS build
WORKDIR /app

# Copy build files
COPY build.gradle settings.gradle gradle.properties ./
COPY gradle gradle
COPY src src

# Build the application and skip tests
RUN gradle bootJar -x test --no-daemon

# ---------- Runtime Stage ----------
FROM eclipse-temurin:21-jre
WORKDIR /app

# Copy the fat JAR from the build stage
COPY --from=build /app/build/libs/*.jar app.jar

# Expose port (optional for Render, but helpful for local)
EXPOSE 8080

# Run the app
ENTRYPOINT ["java", "-jar", "app.jar"]
