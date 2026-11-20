@echo off
echo Starting QueueLess Spring Boot 3 Java Backend on http://localhost:8080...
cd /d "%~dp0backend"
mvn spring-boot:run
pause
