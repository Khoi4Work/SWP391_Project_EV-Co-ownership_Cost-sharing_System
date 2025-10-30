# Sử dụng OpenJDK 17 làm base image
FROM eclipse-temurin:17-jdk-jammy

# Tạo thư mục /app trong container
WORKDIR /app

# Copy file jar vào container
COPY target/App-0.0.1-SNAPSHOT.jar app.jar

# Mở cổng 8080 để Spring Boot lắng nghe
EXPOSE 8080

# Chạy ứng dụng Spring Boot
ENTRYPOINT ["java", "-jar", "app.jar"]
