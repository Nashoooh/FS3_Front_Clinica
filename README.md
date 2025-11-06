# Clinimed - Sistema de Gestión de Clínicas y Exámenes

Frontend desarrollado en Angular 19 para el sistema de gestión de clínicas y exámenes médicos. Este proyecto consume APIs REST desde un backend Spring Boot.

## Características

- **Autenticación y Autorización**: Sistema de login con roles diferenciados (Paciente y Trabajador)
- **Gestión de Usuarios**: Registro de pacientes y trabajadores con validación completa
- **Recuperación de Contraseñas**: Sistema de recuperación mediante verificación de email
- **Dashboard por Roles**: 
  - Panel del paciente con gestión de citas y exámenes
  - Panel del trabajador con herramientas administrativas
- **Diseño Responsivo**: Optimizado para dispositivos móviles y desktop
- **Arquitectura MVC**: Separación clara entre modelos, vistas y servicios

## Tecnologías Utilizadas

- Angular 19.2.14
- TypeScript
- RxJS para programación reactiva
- Angular Router para navegación
- Angular Forms (Reactive Forms)
- CSS3 con Flexbox y Grid

## Estructura del Proyecto

```
src/
├── app/
│   ├── components/          # Componentes de la aplicación
│   │   ├── login/
│   │   ├── registro/
│   │   ├── recuperar-password/
│   │   ├── home-paciente/
│   │   └── home-trabajador/
│   ├── models/              # Modelos de datos
│   ├── services/            # Servicios para API calls
│   ├── guards/              # Guards de autenticación
│   └── ...
└── ...
```

## API Backend

El frontend se conecta a un backend Spring Boot en `http://localhost:9000` con los siguientes endpoints:

- `POST /usuarios/login` - Autenticación de usuarios
- `POST /usuarios` - Registro de nuevos usuarios
- `GET /usuarios` - Obtener lista de usuarios
- `GET /usuarios/{id}` - Obtener usuario por ID
- `PUT /usuarios/{id}` - Actualizar usuario
- `DELETE /usuarios/{id}` - Eliminar usuario

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.14.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
