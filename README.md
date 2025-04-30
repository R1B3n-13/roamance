<div align="center">

<img src="roamance/public/images/roamance-logo.png" alt="Roamance Logo" width="200" height="auto">
<h3>Explore, Connect, Share Your Journey</h3>
<h4>Roamance helps travelers plan trips, record memories, and connect with fellow explorers worldwide.</h4>

### Tech Stack

<p align="center">
  <a href="https://spring.io/projects/spring-boot">
    <img src="https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring&logoColor=white" alt="Spring Boot" />
  </a>
  <a href="https://www.postgresql.org/">
    <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  </a>
  <a href="https://central.sonatype.com/artifact/dev.langchain4j/langchain4j">
    <img src="https://img.shields.io/maven-central/v/dev.langchain4j/langchain4j?label=langchain4j&color=blue&style=for-the-badge" alt="LangChain4j on Maven Central" />
  </a>
  <a href="https://www.docker.com/">
    <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  </a>
  <a href="https://spring.io/projects/spring-security">
    <img src="https://img.shields.io/badge/Spring_Security-6DB33F?style=for-the-badge&logo=spring&logoColor=white" alt="Spring Security" />
  </a>
  <a href="https://jwt.io/">
    <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white" alt="JWT" />
  </a>
  <a href="https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/gemini">
    <img src="https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI" />
  </a>
  </a>
  <a href="https://www.oracle.com/java/">
    <img src="https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java 21" />
  </a>
  <a href="https://gradle.org/">
    <img src="https://img.shields.io/badge/Gradle-02303A?style=for-the-badge&logo=gradle&logoColor=white" alt="Gradle" />
  </a>
  <a href="https://springdoc.org/">
    <img src="https://img.shields.io/badge/SpringDoc-6DB33F?style=for-the-badge&logo=swagger&logoColor=white" alt="SpringDoc" />
  </a>
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="MIT License" />
  </a>
</p>
</div>

---

<div align="center">

### Build Status

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/devs/roamance)
[![API Documentation](https://img.shields.io/badge/API%20Documentation-SwaggerUI-85EA2D.svg)](https://roamance.dev/swagger-ui.html)
[![Coverage](https://img.shields.io/badge/coverage-85%25-green.svg)](https://sonarcloud.io)

</div>

---
## 📚 Explore Project Resources

Stay updated and dive deeper into the project!

- 📖 [**API Documentation**](https://roamance.onrender.com/api/swagger-ui/index.html) – Explore and test our RESTful APIs.
- 🌐 [**Live Demo**](https://roamance.vercel.app) – Experience Roamance live.

<div align="center">
  <a href="https://roamance.onrender.com/api/swagger-ui/index.html">
    <img src="https://img.shields.io/badge/API-Documentation-007ACC?logo=swagger&logoColor=white&style=for-the-badge" alt="API Documentation" />
  </a>
  <a href="#-getting-started">
    <img src="https://img.shields.io/badge/Getting%20Started-Guide-4CAF50?logo=spring&logoColor=white&style=for-the-badge" alt="Getting Started Guide" />
  </a>
</div>

---
## 📋 Table of Contents
- [About Roamance](#-about-roamance)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
- [Data Security](#-data-security)
- [AI Integration](#-ai-integration)
- [Contributing](#-contributing)
- [License](#-license)

---
# 🔎 About Roamance

**Roamance** is a comprehensive travel management and social platform built with **Spring Boot**, designed to empower travelers to plan, record, and share their journeys with a global community.

Combining powerful itinerary management tools with social networking features, Roamance creates a seamless experience for travel enthusiasts to organize their adventures while connecting with like-minded explorers.

### 🚀 Key Features

- **Smart Travel Planning** — Create detailed itineraries with day plans and activities
- **Journal System** — Document travel experiences with rich media support
- **Social Interaction** — Share posts, like, comment, and save travel content
- **Real-time Messaging** — Connect with other travelers through private chats
- **AI-Powered Features** — Get itinerary suggestions, image analysis, and content recommendations
- **Secure Authentication** — JWT-based authentication and role-based access control

---

### 🔥 Why Roamance?

Traditional travel platforms often suffer from:
- ❌ Disconnected planning and social sharing features
- ❌ Limited personalization options
- ❌ Lack of real-time interaction capabilities

**Roamance solves these challenges** by offering:
- A unified platform that combines travel planning and social networking
- AI-powered personalization for trip suggestions
- Real-time communication tools for community engagement
- Comprehensive journal system for preserving travel memories

### 🌍 Market Opportunity

- The global travel and tourism market is projected to reach **$8.9 trillion** by 2026
- Increasing demand for **digital travel planning tools** and **social travel experiences**
- Growing interest in personalized itineraries and AI-assisted travel recommendations

---
## 🏗 System Architecture
### Architecture Diagram

Roamance follows a modular, microservices-inspired architecture with the following key components:

```
┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐
│   Client Apps     │     │  Spring Boot API  │     │   Data Services   │
│                   │     │                   │     │                   │
│  Mobile / Web     │◄───►│  REST Controllers │◄───►│  PostgreSQL DB    │
│  Applications     │     │  Service Layer    │     │  Object Storage   │
└───────────────────┘     │  Security Filters │     │                   │
                          └───────────────────┘     └───────────────────┘
                                    ▲
                                    │
                                    ▼
                          ┌───────────────────┐
                          │   AI Services     │
                          │                   │
                          │  Gemini Model     │
                          │  Vector DB        │
                          │  Image Analysis   │
                          └───────────────────┘
```

### 📌 Modules Overview

| Module               | Purpose                                             |
|----------------------|-----------------------------------------------------|
| User Management      | Authentication, profiles, preferences               |
| Travel Journal       | Journal creation, subsections, media management     |
| Itinerary Planning   | Trip planning, day plans, activities                |
| Social Interaction   | Posts, comments, likes, saves                       |
| Messaging            | Real-time and asynchronous messaging                |
| AI Services          | Content analysis, itinerary generation, search, proofread      |
| Security             | JWT authentication, role-based access control       |

### System Flow

1. **Authentication Flow** 🔑  
   - User registers or logs in via secure endpoints
   - JWT tokens (access/refresh) are issued for session management
   - Role-based permissions determine accessible features

2. **Travel Planning Flow** 🗺️  
   - Users create itineraries with destination details
   - Day plans are added to itineraries with specific dates
   - Activities are scheduled within day plans with time constraints

3. **Social Interaction Flow** 🌐  
   - Users create, view, like, and save travel-related posts
   - Comments enable discussion on travel content
   - Real-time messaging connects travelers directly

4. **AI-Enhanced Experience** 🤖  
   - AI analyzes travel content for insights and safety
   - Generate itinerary using AI
   - Vector database enables semantic search across travel content
   - Image analysis extracts meaningful information from travel photos
   - Proofread content

---

## 🧰 Tech Stack

Roamance is built with a modern, scalable technology stack:

### Backend
- **Spring Boot** - Core application framework
- **Spring Security** - Authentication and authorization
- **JWT** - Secure token-based authentication
- **JPA/Hibernate** - ORM for database interactions
- **PostgreSQL** - Primary relational database

### AI & Advanced Features
- **Gemini AI** - Text and image analysis
- **LangChain4j** - AI model integration
- **Vector Databases** - Semantic search capabilities

### DevOps & Tools
- **Docker** - Containerization for deployment
- **Gradle** - Build automation
- **SpringDoc** - API documentation with OpenAPI
- **JUnit & Mockito** - Testing frameworks
- **SonarCloud** - Code quality and coverage analysis
- **GitHub Actions** - CI/CD pipeline for automated testing and deployment
- **Swagger UI** - Interactive API documentation
- **Postman** - API testing and documentation
- **Azure DevOps** - Project management using scrum methodology

---

## 🚀 Getting Started

Follow these steps to set up Roamance locally:

### Prerequisites

- JDK 21+
- PostgreSQL
- Gradle
- Docker (optional)

### Local Development Setup

1. Clone the repository:
    ```sh
    git clone https://github.com/Learnathon-By-Geeky-Solutions/devs
    cd devs
    ```

2. Configure environment:
    ```sh
    # Copy example environment file
    cp .env.example .env
    
    # Edit with your database and API keys
    # Required: PostgreSQL connection, JWT secret, AI API keys
    ```

3. Build and run:
    ```sh
    ./gradlew bootRun
    ```

4. Access the application:
    - API: http://localhost:8080
    - API Documentation: http://localhost:8080/swagger-ui.html

---

## 📡 API Reference

Roamance provides a comprehensive RESTful API:

### Key API Endpoints

| Category | Endpoint Pattern | Description |
|----------|------------------|-------------|
| Authentication | `/auth/**` | Login, refresh tokens, etc. |
| Users | `/users/**` | User management and profiles |
| Journals | `/travel/journals/**` | Travel journal operations |
| Itineraries | `/travel/itineraries/**` | Trip planning features |
| Social | `/social/posts/**` | Social sharing functionalities |
| Chat | `/social/chats/**` | Messaging system |
| AI | `/ai/**` | AI-powered recommendations |

Full API documentation is available via Swagger UI at `/swagger-ui.html` when running the application.

---

## 🔒 Data Security

Roamance implements robust security measures:

- **JWT Authentication** - Secure, token-based authentication
- **Role-Based Access** - Granular permission system
- **Encryption** - Sensitive data encrypted at rest
- **Input Validation** - Protection against injection attacks
- **HTTPS** - Encrypted data transmission

---

## 🤖 AI Integration

Roamance leverages AI for enhanced user experiences:

- **Trip Recommendations** - AI-generated travel itineraries
- **Content Analysis** - Automatic tagging and categorization of travel posts
- **Image Understanding** - Extract information from travel photos
- **Smart Search** - Semantic search across travel content
- **Proofing Tools** - AI assistance for travel writing

---

## 📄 License

Roamance is open-source software licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Made with ❤️ by the Roamance Team</p>
</div>
