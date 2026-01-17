# EcoShare System - Backend

## 📋 Project Overview
**EcoShare System** là một ứng dụng quản lý chia sẻ chi phí sở hữu chung xe điện (EV Co-ownership Cost-sharing System). Hệ thống cho phép quản lý các nhóm sở hữu chung xe, theo dõi chi phí, lịch sử sử dụng, hợp đồng, và quyết định bỏ phiếu.

### Project: SWP391 - FPT University

---

## 🛠️ Tech Stack

### Backend
- **Framework**: Spring Boot 3.5.5
- **Language**: Java 17
- **Database**: SQL Server
- **ORM**: Hibernate/JPA
- **API Documentation**: OpenAPI/Swagger 3.0
- **Build Tool**: Maven
- **Authentication**: JWT Bearer Token

### Key Dependencies
- Spring Boot Web (REST API)
- Spring Security
- Spring Data JPA
- Thymeleaf (Template Engine)
- OpenHtmlToPdf (PDF Generation)
- Spring Mail (Email Service)
- Lombok (Code Generation)
- MapStruct (Object Mapping)
- SqlServer JDBC Driver

---

## 📁 Project Structure

```
App/
├── src/main/java/khoindn/swp391/be/app/
│   ├── config/              # Configuration classes
│   ├── controller/          # REST API Controllers
│   ├── service/             # Business Logic
│   ├── repository/          # Data Access Layer
│   ├── pojo/                # Entity Models
│   ├── exception/           # Exception Handling
│   └── AppApplication.java  # Main Application Entry
├── src/main/resources/
│   ├── application.properties   # Configuration
│   └── templates/               # Email Templates (HTML)
├── pom.xml                      # Maven Configuration
├── Dockerfile                   # Docker Configuration
└── script.sql                   # Database Scripts
```

### Core Controllers
- **AdminController** - Admin Management
- **AuthenticationController** - Authentication & Authorization
- **UserController** - User Management
- **GroupController** - Group Management
- **VehicleController** - Vehicle Management
- **ContractController** - Contract Management
- **CheckInOutController** - Vehicle Check-in/Check-out
- **ScheduleController** - Schedule Management
- **FundDetailController** - Fund Management
- **EmailController** - Email Service
- **SupabaseController** - External Storage Integration

---

## 🚀 Getting Started

### Prerequisites
- Java 17+
- Maven 3.6+
- SQL Server (Local or Remote)
- Git

### Installation

1. **Clone the Repository**
   ```bash
   git clone --branch BE --single-branch https://github.com/Khoi4Work/SWP391_Project_EV-Co-ownership_Cost-sharing_System.git
   cd SWP391_Project_EV-Co-ownership_Cost-sharing_System/App
   ```

2. **Setup Environment Variables**
   Create `.env` file in `App/` folder:
   ```properties
   SPRING_DATASOURCE_URL=jdbc:sqlserver://localhost:1433;databaseName=EcoShareManagement
   SPRING_DATASOURCE_USERNAME=sa
   SPRING_DATASOURCE_PASSWORD=your_password
   ```

3. **Build Project**
   ```bash
   mvn clean install
   ```

4. **Run Application**
   ```bash
   mvn spring-boot:run
   ```
   Or:
   ```bash
   java -jar target/App-0.0.1-SNAPSHOT.jar
   ```

### Application URL
- **API Base URL**: `http://localhost:8080`
- **Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **API Docs**: `http://localhost:8080/v3/api-docs`

---

## 📦 Running with Docker

```bash
# Build Docker Image
docker build -t ecoshare-backend:latest .

# Run Docker Container
docker run -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:sqlserver://host:1433;databaseName=EcoShareManagement \
  -e SPRING_DATASOURCE_USERNAME=sa \
  -e SPRING_DATASOURCE_PASSWORD=password \
  ecoshare-backend:latest
```

---

## 🗄️ Database Setup

1. Create SQL Server database:
   ```sql
   CREATE DATABASE EcoShareManagement;
   ```

2. Run migration script:
   ```bash
   # Execute script.sql in SQL Server
   sqlcmd -S localhost -U sa -P password -i App/script.sql
   ```

3. Hibernate will auto-update schema on startup (ddl-auto=update)

---

## 🔐 Authentication

- **Type**: JWT Bearer Token
- **Header**: `Authorization: Bearer {token}`
- **Endpoints**: Protected with Spring Security

---

## 📧 Email Configuration

The system uses Gmail SMTP:
- **Host**: smtp.gmail.com
- **Port**: 587
- **Auth**: TLS Enabled
- **Templates**: HTML templates in `resources/templates/`

Update credentials in `application.properties` for production use.

---

## 🧪 Testing

Run tests:
```bash
mvn test
```

---

## 📝 API Documentation

Complete API documentation is available via Swagger UI:
```
http://localhost:8080/swagger-ui.html
```

### Main API Endpoints
- `POST /api/auth/login` - User Login
- `POST /api/users/register` - User Registration
- `GET /api/groups` - List Groups
- `POST /api/groups` - Create Group
- `GET /api/vehicles` - List Vehicles
- `POST /api/contracts` - Create Contract
- `GET /api/schedules` - List Schedules

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m 'Add your feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Create Pull Request

---

## 📄 License

This project is part of SWP391 - FPT University

---

## 👥 Team

- **Lead Developer**: Khoi Nguyen

---

## 📞 Support

For issues or questions, please create an issue in the repository.

---

## 🔄 Version History

- **v0.0.1-SNAPSHOT** (Current) - Initial Development

---

**Last Updated**: January 17, 2026
