# --- ETAPA 1: CONSTRUCCIÓN (BUILD) ---
# Usamos una imagen que tiene Maven y Java 21 para compilar
FROM maven:3.9.9-eclipse-temurin-21 AS build

# Copiamos los archivos de tu proyecto al contenedor
WORKDIR /app
COPY . .

# Compilamos el proyecto (saltando los tests para ir más rápido)
RUN mvn clean package -DskipTests

# --- ETAPA 2: EJECUCIÓN (RUN) ---
# Usamos una imagen ligera de Java para ejecutarlo
FROM eclipse-temurin:21-jre-alpine

# Creamos una carpeta para la app
WORKDIR /app

# Copiamos solo el archivo .jar creado en la etapa anterior
# Esto hace que el servidor ocupe mucho menos espacio
COPY --from=build /app/target/*.jar app.jar

# Abrimos el puerto 8080 (el que usa Spring Boot por defecto)
EXPOSE 8080

# Comando para iniciar la aplicación
ENTRYPOINT ["java", "-jar", "app.jar"]