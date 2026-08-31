# Funcionalidad de Perfil de Usuario

## Descripción
Esta funcionalidad permite a los usuarios autenticados acceder y editar su información personal desde la aplicación.

## Características Implementadas

### 1. Componente de Perfil
- **Ubicación**: `src/app/features/usuarios/perfil/`
- **Ruta**: `/usuarios/perfil`
- **Protección**: Requiere autenticación (AuthGuard)

### 2. Funcionalidades del Perfil
- ✅ Visualización de datos del usuario
- ✅ Edición de información personal
- ✅ Campo email no editable (según requerimiento)
- ✅ Validaciones de formulario
- ✅ Estados de carga y error
- ✅ Navegación desde el botón "Perfil" en el header

### 3. API Integration
- **Endpoint GET**: `/api/v1/perfil/cliente/{idUsuario}`
- **Endpoint PUT**: `/api/v1/perfil/cliente/{idUsuario}`

### 4. Estructura de Datos

#### Respuesta del API (GET):
```json
{
  "name": "Francisco",
  "lastName": "Torres Roiger", 
  "email": "ftroiger@gmail.com",
  "telefono": "111111111",
  "documento": "1111111111",
  "tipoDocumento": "DNI",
  "nacimiento": "1999-05-20",
  "domicilio": {
    "calle": "San Rafael",
    "numero": "123",
    "piso": "2",
    "depto": "1",
    "barrio": "Nueva Córdoba",
    "ciudad": "Córdoba",
    "departamento": "CAPITAL"
  }
}
```

#### Request para actualización (PUT):
```json
{
  "name": "Francisco",
  "lastName": "Torres Roiger",
  "telefono": "111111111", 
  "documento": "1111111111",
  "tipoDocumento": "DNI",
  "nacimiento": "1999-05-20",
  "domicilio": {
    "calle": "San Rafael",
    "numero": "123",
    "piso": "2", 
    "depto": "1",
    "barrio": "Nueva Córdoba",
    "ciudad": "Córdoba",
    "departamento": "CAPITAL"
  }
}
```

## Navegación

### Desde el Header
1. El usuario debe estar autenticado
2. Hacer clic en el dropdown de usuario (icono de usuario + nombre)
3. Seleccionar "Perfil" del menú desplegable
4. Redirige a `/usuarios/perfil`

### Desde URL Directa
- Acceso directo: `http://localhost:4200/usuarios/perfil`
- Si no está autenticado, redirige a `/auth/login`

## Arquitectura

### Modelos
- `PerfilUsuario`: Interface para los datos del perfil
- `PerfilUsuarioRequest`: Interface para las actualizaciones (sin email)
- `Domicilio`: Interface para datos de domicilio

### Servicios
- `PerfilService`: Casos de uso para obtener y actualizar perfil
- `UsuarioHttpRepository`: Implementación HTTP de las llamadas al API

### Guards
- `authGuard`: Protege las rutas que requieren autenticación

## Validaciones Implementadas

### Campos Requeridos
- Nombre (mínimo 2 caracteres)
- Apellido (mínimo 2 caracteres) 
- Teléfono (formato numérico 8-15 dígitos)
- Documento (mínimo 7 caracteres)
- Tipo de Documento
- Fecha de Nacimiento
- Domicilio: Calle, Número, Barrio, Ciudad, Departamento

### Campos Opcionales
- Domicilio: Piso, Departamento

### Campo No Editable
- Email (solo lectura, estilo especial)

## Estados de UI

### Visualización (Modo Lectura)
- Todos los campos en modo solo lectura
- Botón "Editar" visible
- Información organizada en secciones

### Edición (Modo Edición)  
- Campos habilitados para edición (excepto email)
- Botones "Guardar" y "Cancelar"
- Validaciones en tiempo real
- Estados de error por campo

### Estados de Carga
- Spinner durante carga inicial
- Estado "Guardando..." en botón
- Deshabilitación de controles durante operaciones

### Mensajes
- Mensajes de éxito en verde
- Mensajes de error en rojo
- Validaciones específicas por campo

## Archivos Modificados/Creados

### Nuevos Archivos
```
src/app/domain/usuario/models/perfil.model.ts
src/app/domain/usuario/use-cases/perfil.service.ts
src/app/features/usuarios/perfil/perfil.component.ts
src/app/features/usuarios/perfil/perfil.component.html
src/app/features/usuarios/perfil/perfil.component.scss
src/app/core/guards/auth.guard.ts
```

### Archivos Modificados
```
src/app/domain/usuario/usuario.repository.ts
src/app/data/usuario/usuario.http.repository.ts
src/app/domain/usuario/index.ts
src/app/features/usuarios/usuarios.routes.ts
src/app/app.routes.ts
src/app/features/home/home.page.ts
```

## Notas Técnicas

### Configuración del Environment
El endpoint base se configura automáticamente desde `environment.apiUrl`:
```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8081'
};
```

### ID de Usuario
El ID del usuario se obtiene automáticamente del token de autenticación mediante `AuthService.getCurrentUser()`.

### Responsive Design
La interfaz es completamente responsive y se adapta a:
- Desktop (1024px+)
- Tablet (768px - 1023px)  
- Mobile (< 768px)

### Mocks Removidos
Se removieron todos los mocks relacionados con el perfil para usar los endpoints reales del backend.
