"use strict";(self.webpackChunkapp=self.webpackChunkapp||[]).push([[7800],{7800:(f,v,i)=>{i.r(v),i.d(v,{AgregarProveedorPageModule:()=>M});var m=i(177),l=i(4341),n=i(7125),p=i(1671),c=i(467),e=i(4438),r=i(4934);const P=[{path:"",component:(()=>{var o;class g{constructor(t,a,d){this.inventoryService=t,this.router=a,this.alertController=d,this.newProvider={name:"",created_at:"",updated_at:""}}ngOnInit(){const t=(new Date).toISOString();this.newProvider.created_at=t,this.newProvider.updated_at=t}saveProvider(){var t=this;return(0,c.A)(function*(){t.newProvider.name&&""!==t.newProvider.name.trim()?yield(yield t.alertController.create({header:"Confirmar",message:"\xbfEst\xe1s seguro de que deseas guardar este proveedor?",buttons:[{text:"Cancelar",role:"cancel"},{text:"Guardar",handler:()=>{t.inventoryService.saveProvider(t.newProvider).subscribe({next:d=>{d.success?t.router.navigateByUrl("/proveedores",{replaceUrl:!0}).then(()=>{window.location.reload()}):(console.warn("Error al guardar el proveedor:",d.message),t.showAlert("Error","No se pudo guardar el proveedor."))},error:d=>{console.error("Error al guardar el proveedor:",d),t.showAlert("Error","Ocurri\xf3 un error al guardar el proveedor.")}})}}]})).present():yield t.showAlert("Error","El nombre del proveedor no puede estar vac\xedo.")})()}showAlert(t,a){var d=this;return(0,c.A)(function*(){yield(yield d.alertController.create({header:t,message:a,buttons:["OK"]})).present()})()}}return(o=g).\u0275fac=function(t){return new(t||o)(e.rXU(r.c),e.rXU(p.Ix),e.rXU(n.hG))},o.\u0275cmp=e.VBU({type:o,selectors:[["app-agregar-proveedor"]],decls:26,vars:3,consts:[["color","primary"],[1,"form-card"],[3,"submit"],["lines","none"],[1,"form-item"],["position","stacked",1,"title-item"],["name","name","required","",3,"ngModelChange","ngModel"],["name","created_at","readonly","",3,"ngModelChange","ngModel"],["name","updated_at","readonly","",3,"ngModelChange","ngModel"],[1,"footer","edit-footer"],["expand","block","color","primary","type","submit"],["slot","start","name","checkmark-outline"]],template:function(t,a){1&t&&(e.j41(0,"ion-header")(1,"ion-toolbar",0)(2,"ion-title"),e.EFF(3,"Agregar Proveedor"),e.k0s()()(),e.j41(4,"ion-content")(5,"div",1)(6,"h2"),e.EFF(7,"Introduce los detalles del proveedor"),e.k0s(),e.j41(8,"form",2),e.bIt("submit",function(){return a.saveProvider()}),e.j41(9,"ion-list",3)(10,"ion-item",4)(11,"ion-label",5),e.EFF(12,"Nombre del Proveedor"),e.k0s(),e.j41(13,"ion-input",6),e.mxI("ngModelChange",function(s){return e.DH7(a.newProvider.name,s)||(a.newProvider.name=s),s}),e.k0s()(),e.j41(14,"ion-item",4)(15,"ion-label",5),e.EFF(16,"Fecha de Creaci\xf3n"),e.k0s(),e.j41(17,"ion-input",7),e.mxI("ngModelChange",function(s){return e.DH7(a.newProvider.created_at,s)||(a.newProvider.created_at=s),s}),e.k0s()(),e.j41(18,"ion-item",4)(19,"ion-label",5),e.EFF(20,"\xdaltima Actualizaci\xf3n"),e.k0s(),e.j41(21,"ion-input",8),e.mxI("ngModelChange",function(s){return e.DH7(a.newProvider.updated_at,s)||(a.newProvider.updated_at=s),s}),e.k0s()()(),e.j41(22,"ion-footer",9)(23,"ion-button",10),e.nrm(24,"ion-icon",11),e.EFF(25," Guardar Proveedor "),e.k0s()()()()()),2&t&&(e.R7$(13),e.R50("ngModel",a.newProvider.name),e.R7$(4),e.R50("ngModel",a.newProvider.created_at),e.R7$(4),e.R50("ngModel",a.newProvider.updated_at))},dependencies:[l.qT,l.BC,l.cb,l.YS,l.vS,l.cV,n.Jm,n.W9,n.M0,n.eU,n.iq,n.$w,n.uz,n.he,n.nf,n.BC,n.ai,n.Gw],styles:['@charset "UTF-8";.form-card[_ngcontent-%COMP%]{max-width:600px;margin:40px auto;padding:25px;border-radius:10px;background-color:#fff;box-shadow:0 4px 6px #0000001a}h2[_ngcontent-%COMP%]{text-align:center;font-size:1.6rem;color:#333;margin-bottom:30px;font-weight:700}.form-item[_ngcontent-%COMP%]{margin-bottom:20px;padding-right:15px}ion-label[_ngcontent-%COMP%]{font-weight:700;color:#666;margin-bottom:5px}ion-input[_ngcontent-%COMP%], ion-textarea[_ngcontent-%COMP%], ion-select[_ngcontent-%COMP%]{--padding-start: 12px;border:1px solid #ddd;border-radius:3px;--background: #f9f9f9}ion-select[_ngcontent-%COMP%]{--placeholder-color: #999;margin-top:5px}ion-item[_ngcontent-%COMP%]{--inner-padding-end: 0;--inner-padding-start: 0}.footer[_ngcontent-%COMP%]   ion-button[_ngcontent-%COMP%]{border-radius:8px;font-size:1rem;font-weight:700}.title-item[_ngcontent-%COMP%]{margin-bottom:15px}.footer[_ngcontent-%COMP%]{padding:10px;display:flex;justify-content:center}.edit-footer[_ngcontent-%COMP%]{box-shadow:none;margin-top:20px}@media (max-width: 768px){.form-card[_ngcontent-%COMP%]{margin:0 auto}}']}),g})()}];let _=(()=>{var o;class g{}return(o=g).\u0275fac=function(t){return new(t||o)},o.\u0275mod=e.$C({type:o}),o.\u0275inj=e.G2t({imports:[p.iI.forChild(P),p.iI]}),g})(),M=(()=>{var o;class g{}return(o=g).\u0275fac=function(t){return new(t||o)},o.\u0275mod=e.$C({type:o}),o.\u0275inj=e.G2t({imports:[m.MD,l.YN,n.bv,_]}),g})()},4934:(f,v,i)=>{i.d(v,{c:()=>n});var m=i(4438),l=i(1626);let n=(()=>{var p;class c{constructor(r){this.http=r,this.apiUrl="https://muebleriasolaris.com/ionic-products"}getProducts(r=""){return encodeURIComponent(r),this.http.get(`${this.apiUrl}/inventory_info.php`)}getProductsByProvider(r){return this.http.get(`${this.apiUrl}/inventory_info_by_id.php?provider_id=${r}`)}getProviders(){return this.http.get(`${this.apiUrl}/providers.php`)}getProviderById(r){return this.http.get(`${this.apiUrl}/providers.php?id=${r}`)}saveProvider(r){return this.http.post(`${this.apiUrl}/save_provider.php`,r)}getCategories(){return this.http.get(`${this.apiUrl}/categories.php`)}getBrands(){return this.http.get(`${this.apiUrl}/brands.php`)}saveInventory(){return this.http.get(`${this.apiUrl}/save_inventory.php`)}saveBrand(r){return this.http.post(`${this.apiUrl}/save_brand.php`,r,{headers:{"Content-Type":"application/json"}})}deleteBrand(r){return this.http.post(`${this.apiUrl}/delete_brand.php`,{id:r})}getSubCategories(){return this.http.get(`${this.apiUrl}/sub_categories.php`)}saveProduct(r){return this.http.post(`${this.apiUrl}/save_product.php`,r)}addInventory(r){return this.http.post(`${this.apiUrl}/save_new_product.php`,r)}updateInventory(r,h){return this.http.post(`${this.apiUrl}/update_inventory.php`,{id_product:r,adjustment:h})}deleteProduct(r){return this.http.post(`${this.apiUrl}/delete_product.php`,{product_id:r})}deleteProvider(r){return this.http.post(`${this.apiUrl}/delete_provider.php`,{id:r})}updateProvider(r){return this.http.post(`${this.apiUrl}/update_provider.php`,r)}syncStock(r){return this.http.get(`${this.apiUrl}/inventory_info.php?product_id=${r}`)}}return(p=c).\u0275fac=function(r){return new(r||p)(m.KVO(l.Qq))},p.\u0275prov=m.jDH({token:p,factory:p.\u0275fac,providedIn:"root"}),c})()}}]);