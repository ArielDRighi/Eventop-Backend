
# 🌟 **Eventop Backend**  

<p align="center">
  <a href="http://nestjs.com/" target="blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
  </a>
</p>

<p align="center">
  Un framework progresivo para construir aplicaciones del lado del servidor de manera eficiente y escalable usando <a href="http://nodejs.org" target="_blank">Node.js</a>. 🚀
</p>

<p align="center">
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
  <a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
  <a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master" alt="Coverage" /></a>
  <a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
</p>

---

## 📖 **Descripción**  

Este proyecto utiliza el framework [NestJS](https://github.com/nestjs/nest) junto con **TypeScript** para construir aplicaciones robustas, eficientes y escalables. 🌐  

---

## ⚙️ **Configuración del Proyecto**  

### 1️⃣ Clonar el Repositorio  

```bash
git clone https://github.com/ArielDRighi/Eventop-Backend.git
cd Eventop-Backend/back/eventop
```  

### 2️⃣ Instalar Dependencias  

```bash
npm install
```  

### 3️⃣ Configuración de la Base de Datos  

Este proyecto utiliza **PostgreSQL** como base de datos.  

#### Variables de Entorno  

Asegúrate de crear un archivo `.env` con las siguientes configuraciones:  

```properties
POSTGRES_PASSWORD=U6oDu5pi3drvoCIlWvKJpTdxiWkfdyHF
POSTGRES_DB=dbproduction_79ad
POSTGRES_USER=dbproduction_79ad_user
POSTGRES_HOST=dpg-cspd26pu0jms73bj09q0-a.oregon-postgres.render.com
POSTGRES_PORT=5432
```  

### 4️⃣ Docker Compose 🐳  

El proyecto incluye un archivo `docker-compose.yml` para facilitar la configuración de los contenedores de Docker.  

#### Pasos para iniciar:  

```bash
docker-compose up
```  

Servicios incluidos:  

- 📦 **eventop**: Contenedor de la API.  
- 🗄️ **postgres**: Base de datos PostgreSQL.  
- 🔧 **pgadmin**: Herramienta para administrar PostgreSQL.  

#### Conexión a PgAdmin  

- URL: [http://localhost:8080](http://localhost:8080)  
- **Email**: `tymoszukdamiandejesus@gmail.com`  
- **Password**: `admin`  

#### Agregar servidor en PgAdmin:  

```plaintext
Host: dpg-cspd26pu0jms73bj09q0-a.oregon-postgres.render.com
Port: 5432
Username: dbproduction_79ad_user
Password: U6oDu5pi3drvoCIlWvKJpTdxiWkfdyHF
Database: dbproduction_79ad
```  

---

## 🚀 **Ejecución del Proyecto**  

### 🌱 Modo Desarrollo  

```bash
npm run start:dev
```  

### 🌟 Modo Producción  

```bash
npm run start:prod
```  

---

## 🌐 **Despliegue**  

## Despliegue en Render 🌐

Render es una plataforma fácil de usar para desplegar aplicaciones en la nube. Aquí te explicamos cómo desplegar tu aplicación **NestJS** con una base de datos **PostgreSQL** utilizando Render.

### Paso 1: Crear una cuenta en Render

1. Dirígete a [Render](https://render.com/).
2. Haz clic en **Sign Up** en la esquina superior derecha para crear una cuenta. Si ya tienes cuenta, simplemente haz clic en **Log In**.
3. Inicia sesión en tu cuenta de Render.

### Paso 2: Crear un nuevo servicio para tu aplicación

1. En el panel principal de Render, haz clic en **New** (en la esquina superior derecha) y selecciona **Web Service**.
2. Conecta tu cuenta de **GitHub** o **GitLab** para poder seleccionar tu repositorio.
3. Selecciona el repositorio de tu aplicación **NestJS**.
4. Configura los detalles del servicio:
    - **Name**: Asigna un nombre a tu servicio (ej. `eventop-backend`).
    - **Region**: Selecciona la región que prefieras.
    - **Branch**: Elige la rama que deseas desplegar, usualmente `main` o `master`.
    - **Build Command**: Deja esto como `npm install`.
    - **Start Command**: Configura el comando para iniciar el servidor de producción: `npm run start:prod`.

5. Haz clic en **Create Web Service**.

### Paso 3: Crear una base de datos PostgreSQL en Render

1. En el panel de Render, haz clic en **New** nuevamente y selecciona **PostgreSQL**.
2. Configura tu base de datos:
    - **Name**: Asigna un nombre a tu base de datos (ej. `eventop-db`).
    - **Region**: Asegúrate de seleccionar la misma región que elegiste para el servicio web.
    - **Size**: Selecciona el tamaño según tus necesidades (puedes empezar con el tamaño gratuito si es solo para desarrollo).
   
3. Haz clic en **Create PostgreSQL Database**.

### Paso 4: Conectar la aplicación con la base de datos

1. Una vez creada la base de datos, Render te proporcionará una URL de conexión.
2. Ve a la página de tu servicio web en Render y haz clic en **Environment** para agregar las variables de entorno necesarias.
3. Agrega las siguientes variables de entorno:

    ```bash
    POSTGRES_PASSWORD=tu_password_aqui
    POSTGRES_DB=nombre_de_tu_base_de_datos
    POSTGRES_USER=usuario_de_tu_base_de_datos
    POSTGRES_HOST=host_de_tu_base_de_datos
    POSTGRES_PORT=5432
    ```

   - **POSTGRES_PASSWORD**: Usa la contraseña proporcionada por Render.
   - **POSTGRES_DB**: El nombre de la base de datos que creaste en Render.
   - **POSTGRES_USER**: El usuario de la base de datos proporcionado por Render.
   - **POSTGRES_HOST**: El host de la base de datos proporcionado por Render.
   - **POSTGRES_PORT**: El puerto estándar de PostgreSQL (`5432`).

### Paso 5: Desplegar la aplicación

1. Render comenzará a construir y desplegar tu aplicación automáticamente una vez que hayas configurado el servicio y la base de datos.
2. Una vez completado el despliegue, Render proporcionará una URL para acceder a tu aplicación, que se puede encontrar en la sección **Service URL**.
   
   Visita esta URL para verificar que tu aplicación esté funcionando correctamente.

### Paso 6: Monitorear la aplicación

- Para monitorear el estado de tu aplicación, ve a la página de tu servicio en Render.
- En la sección **Logs**, podrás ver todos los registros de tu aplicación, que son útiles para solucionar problemas si algo no funciona como esperabas.

### Paso 7: Desplegar cambios automáticamente

- Cada vez que realices cambios en tu repositorio, simplemente realiza un `git push` y Render actualizará automáticamente la aplicación desplegada con los últimos cambios.
- No es necesario volver a ejecutar el despliegue manualmente, Render lo hará de forma automática cada vez que se realicen cambios en la rama seleccionada.

---

¡Con estos pasos habrás desplegado tu aplicación **NestJS** en **Render** con éxito! 🎉

Si tienes dudas o problemas, consulta la [documentación de Render](https://render.com/docs) o ponte en contacto con el soporte.


---

## 📚 **Recursos Útiles**  

- 📖 [Documentación Oficial](https://docs.nestjs.com)  
- 🛠️ [NestJS DevTools](https://devtools.nestjs.com)

## Soporte 💬

Si tienes alguna pregunta o necesitas ayuda, no dudes en abrir un issue o contactar al equipo de desarrollo.

---

¡Gracias por usar nuestro Software! 🎉