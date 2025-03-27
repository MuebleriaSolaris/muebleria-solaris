import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'folder/:id',
    loadChildren: () => import('./folder/folder.module').then(m => m.FolderPageModule)
  },
  {
    path: 'loader',
    loadChildren: () => import('./pages/loader/loader.module').then(m => m.LoaderPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardPageModule)
  },
  {
    path: 'clientes',
    loadChildren: () => import('./pages/clientes/clientes.module').then(m => m.ClientesPageModule)
  },
  {
    path: 'agregar-clientes',
    loadChildren: () => import('./pages/agregar-clientes/agregar-clientes.module').then(m => m.AgregarClientesPageModule)
  },
  {
    path: 'inventario',
    loadChildren: () => import('./pages/inventario/inventario.module').then(m => m.InventarioPageModule)
  },
  {
    path: 'proveedores',
    loadChildren: () => import('./pages/proveedores/proveedores.module').then(m => m.ProveedoresPageModule)
  },
  {
    path: 'perfil',
    loadChildren: () => import('./pages/perfil/perfil.module').then(m => m.PerfilPageModule)
  },
  {
    path: 'crear-usuario',
    loadChildren: () => import('./pages/crear-usuario/crear-usuario.module').then(m => m.CrearUsuarioPageModule)
  },
  {
    path: 'agregar-inventario',
    loadChildren: () => import('./pages/agregar-inventario/agregar-inventario.module').then(m => m.AgregarInventarioPageModule)
  },
  {
    path: 'agregar-proveedor',
    loadChildren: () => import('./pages/agregar-proveedor/agregar-proveedor.module').then(m => m.AgregarProveedorPageModule)
  },
  {
    path: 'cliente-info/:id',  // Updated route with :id parameter
    loadChildren: () => import('./pages/cliente-info/cliente-info.module').then(m => m.ClienteInfoPageModule)
  },
  {
    path: 'producto/:id',
    loadChildren: () => import('./pages/producto/producto.module').then(m => m.ProductoPageModule)
  },
  {
    path: 'historial-cliente/:id',
    loadChildren: () => import('./pages/historial-cliente/historial-cliente.module').then( m => m.HistorialClientePageModule)
  },
  {
    path: 'pedidos',
    loadChildren: () => import('./pages/pedidos/pedidos.module').then( m => m.PedidosPageModule)
  },
  {
    path: 'proveedores-info/:id',
    loadChildren: () => import('./pages/proveedores-info/proveedores-info.module').then( m => m.ProveedoresInfoPageModule)
  },
  {
    path: 'lista-pedido/:id',
    loadChildren: () => import('./pages/lista-pedido/lista-pedido.module').then( m => m.ListaPedidoPageModule)
  },
  {
    path: 'agregar-marca-producto',
    loadChildren: () => import('./pages/agregar-marca-producto/agregar-marca-producto.module').then( m => m.AgregarMarcaProductoPageModule)
  },
  {
    path: 'marcas-productos',
    loadChildren: () => import('./pages/marcas-productos/marcas-productos.module').then( m => m.MarcasProductosPageModule)
  },
  {
    path: 'usuarios-sistema',
    loadChildren: () => import('./pages/usuarios-sistema/usuarios-sistema.module').then( m => m.UsuariosSistemaPageModule)
  },
  {
    path: 'usuarios-info/:id',
    loadChildren: () => import('./pages/usuarios-info/usuarios-info.module').then( m => m.UsuariosInfoPageModule)
  },
  {
    path: 'agregar-subcategoria',
    loadChildren: () => import('./pages/agregar-subcategoria/agregar-subcategoria.module').then( m => m.AgregarSubcategoriaPageModule)
  },
  {
    path: 'categorias',
    loadChildren: () => import('./pages/categorias/categorias.module').then( m => m.CategoriasPageModule)
  },
  {
    path: 'sub-categorias-info/:id',
    loadChildren: () => import('./pages/sub-categorias-info/sub-categorias-info.module').then( m => m.SubCategoriasInfoPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
