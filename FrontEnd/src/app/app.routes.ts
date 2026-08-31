import { Routes } from '@angular/router';

export const routes: Routes = [
	{ path: '', pathMatch: 'full', redirectTo: 'home' },
	{
		path: 'home',
		loadChildren: () => import('./features/home/home.routes').then((m) => m.HOME_ROUTES),
	},
	{
		path: 'auth',
		loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
	},
	{
		path: 'oficios',
		loadChildren: () => import('./features/oficios/oficios.routes').then((m) => m.OFICIOS_ROUTES),
	},
	{
		path: 'usuarios',
		loadChildren: () =>
			import('./features/usuarios/usuarios.routes').then((m) => m.USUARIOS_ROUTES),
	},
	{
		path: 'profesionales',
		loadChildren: () =>
			import('./features/profesionales/profesionales.routes').then(
				(m) => m.PROFESIONALES_ROUTES,
			),
	},
	{
		path: 'chat',
		loadChildren: () => import('./features/chat/chat.routes').then((m) => m.CHAT_ROUTES),
	},
	{
		path: 'pagos',
		loadChildren: () => import('./features/pagos/pagos.routes').then((m) => m.PAGOS_ROUTES),
	},
	{
		path: 'trabajos',
		loadChildren: () =>
			import('./features/trabajos/trabajos.routes').then((m) => m.TRABAJOS_ROUTES),
	},
	{
		path: 'pago-exitoso',
		loadComponent: () => import('./features/pago/pago-exitoso.page').then((m) => m.PagoExitosoPage),
	},
	{
		path: 'pago-fallido',
		loadComponent: () => import('./features/pago/pago-fallido.page').then((m) => m.PagoFallidoPage),
	},
	{
		path: 'pago-pendiente',
		loadComponent: () => import('./features/pago/pago-pendiente.page').then((m) => m.PagoPendientePage),
	},
	{
		path: 'admin',
		loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
	},
	{ path: '**', redirectTo: 'auth' },
];
