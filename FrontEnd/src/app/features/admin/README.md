# Panel de Administración

## Descripción
Dashboard administrativo para gestionar usuarios, profesionales y oficios de la plataforma.

## Características

### 📊 Estadísticas en Tiempo Real
- **Usuarios Registrados**: Total de usuarios en la plataforma
- **Profesionales Activos**: Cantidad de profesionales disponibles
- **Oficios Totales**: Número total de oficios registrados
- **Oficios Activos**: Cantidad de oficios actualmente activos

### 👥 Gestión de Usuarios
Tabla con información completa de usuarios:
- ID de usuario
- Nombre completo
- Email
- Fecha de registro
- Estado (activo/inactivo)

### 💼 Gestión de Profesionales
Tabla con información de profesionales:
- ID del profesional
- Nombre completo
- Oficio al que pertenece
- Calificación promedio
- Número de servicios completados

### 📈 Oficios Más Demandados
Visualización de los oficios con mayor demanda:
- Nombre del oficio
- Cantidad de solicitudes
- Barra de progreso visual comparativa

### 🛠️ Gestión de Oficios
Panel completo para administrar oficios:
- **Ver todos los oficios**: Lista con información detallada
- **Agregar nuevo oficio**: Modal para crear oficios
- **Editar oficio**: Modificar información existente
- **Activar/Desactivar**: Toggle de estado del oficio
- **Eliminar oficio**: Remover oficios (con confirmación)

## Estructura de Archivos

```
features/admin/
├── admin.routes.ts           # Rutas del módulo admin
└── dashboard/
    ├── dashboard.page.ts     # Componente principal
    ├── dashboard.page.html   # Template
    └── dashboard.page.scss   # Estilos
```

## Acceso

**Ruta**: `/admin`

**Requisitos**: 
- Usuario autenticado
- Rol: `ADMINISTRADOR`

## Datos Mock

Actualmente el dashboard utiliza datos de prueba (mock data). Para conectar con el backend real:

1. Crear servicios en `src/app/data/admin/`:
   - `usuarios.service.ts`
   - `profesionales.service.ts`
   - `oficios.service.ts`

2. Implementar los métodos:
   ```typescript
   // UsuariosService
   getUsuarios(): Observable<Usuario[]>
   
   // ProfesionalesService
   getProfesionales(): Observable<Profesional[]>
   
   // OficiosService
   getOficios(): Observable<Oficio[]>
   agregarOficio(oficio: Oficio): Observable<Oficio>
   actualizarOficio(id: number, oficio: Oficio): Observable<Oficio>
   toggleEstado(id: number): Observable<void>
   eliminarOficio(id: number): Observable<void>
   getOficiosMasDemandados(): Observable<EstadisticasOficio[]>
   ```

3. Reemplazar los métodos `cargarDatos()` en `dashboard.page.ts`

## Próximas Mejoras

- [ ] Conectar con servicios del backend
- [ ] Agregar paginación a las tablas
- [ ] Implementar filtros y búsqueda
- [ ] Agregar exportación de datos (CSV, PDF)
- [ ] Gráficos interactivos con Chart.js o D3.js
- [ ] Sistema de notificaciones en tiempo real
- [ ] Gestión de permisos por rol
- [ ] Logs de actividad del sistema
- [ ] Panel de reportes y métricas avanzadas

## Estilos y Diseño

El dashboard utiliza:
- **Diseño responsive**: Adaptable a móviles, tablets y desktop
- **Sistema de colores consistente**: Basado en la paleta de la aplicación
- **Iconos Lucide**: Para una interfaz moderna y clara
- **Animaciones sutiles**: Transiciones suaves para mejor UX
- **Modales accesibles**: Para agregar/editar oficios

## Notas de Desarrollo

- Todos los datos son reactivos usando **signals** de Angular
- Los componentes son **standalone** para mejor modularidad
- Se incluyen comentarios `TODO:` donde conectar con el backend
- Los modales se cierran al hacer clic fuera de ellos
- Confirmación antes de eliminar oficios
