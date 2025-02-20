# Cloud-Based Mission Control System

## Project Overview
The **Cloud-Based Mission Control System** is a modular, microservices-driven platform designed to track and manage space missions, satellites, and rovers. It provides real-time telemetry monitoring, command execution, and advanced analytics while ensuring high scalability through cloud-based deployment.

This system is built with **Spring Boot (Java) for backend services** and deployed using **Kubernetes**. It maximizes the use of modern technologies, including **DevOps, Cloud, Data, AI and 3D visualization**, while remaining modular—allowing components to be included or skipped as needed.

## Key Features
###  **Core Features**
- **Real-Time Telemetry Processing:** Ingests and visualizes live satellite data.
- **Command & Control:** Allows operators to send commands to satellites and track execution.
- **Mission Database:** Stores telemetry logs, mission history, and operator activity.
- **API Gateway & Authentication:** Manages secure access and routes requests.
- **DevOps & Monitoring:** CI/CD pipelines, cloud-based infrastructure, and observability tools.

###  **Optional Features**
- **AI-Based Fault Detection:** Detects anomalies and predicts failures.
- **3D Satellite Visualization:** Uses WebGL-based visualization for orbit tracking.

---

## Tech Stack
### **Backend (Spring Boot + Microservices)**
| Component                   | Technology Stack |
|-----------------------------|-----------------|
| **Backend Framework**       | Spring Boot (Java) |
| **API Communication**       | REST APIs + WebSockets |
| **Event-Driven Messaging**  | Apache Kafka (for telemetry & commands) |
| **Database** (SQL)          | PostgreSQL (structured data storage) |
| **Database** (NoSQL)        | MongoDB or Redis (caching, telemetry logs) |

### **Frontend (Mission Control Dashboard - Next.js)**
| Component                   | Technology Stack |
|-----------------------------|-----------------|
| **Frontend Framework**      | Next.js (React-based) |
| **Real-time Data Updates**  | WebSockets + Socket.IO |
| **Charts & Data Visualization** | Recharts, D3.js |
| **3D Satellite Visualization** | CesiumJS (for 3D space views) |

### **DevOps & Cloud Infrastructure**
| Component                   | Technology Stack |
|-----------------------------|-----------------|
| **Containerization**        | Docker |
| **Orchestration**           | Kubernetes (K8s) |
| **CI/CD Pipelines**         | Jenkins |
| **Monitoring & Logging**    | Prometheus + Grafana + Loki |
| **Cloud Services**          | AWS |

### **Security & Authentication**
| Component                   | Technology Stack |
|-----------------------------|-----------------|
| **User Authentication**     | Keycloak (OAuth2) |
| **API Security**            | Spring Security (JWT-based authentication) |

### **AI & Machine Learning**
| Component                   | Technology Stack |
|-----------------------------|-----------------|
| **AI Model Development**    | TensorFlow |
| **Data Processing**         | Apache Spark / Apache Flink |
| **Anomaly Detection**       | MLFlow (for training & deploying AI models) |

### **Testing Technologies**
| Component                   | Technology Stack |
|-----------------------------|-----------------|
| **Unit Testing**            | JUnit, Mockito (Java) |
| **Integration Testing**     | TestContainers, REST Assured |
| **Performance Testing**     | JMeter, K6 |
| **Security Testing**        | OWASP ZAP, SonarQube |
| **Frontend Testing**        | Jest, Cypress |
| **API Testing**             | Postman, Newman |


This document will evolve as the project progresses.



