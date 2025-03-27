"use strict";(self.webpackChunkapp=self.webpackChunkapp||[]).push([[7800],{7800:(M,c,d)=>{d.r(c),d.d(c,{AgregarProveedorPageModule:()=>h});var p=d(177),l=d(4341),t=d(7125),u=d(5520),m=d(467),e=d(4438),P=d(4934);const v=[{path:"",component:(()=>{var o;class g{constructor(r,n,a){this.inventoryService=r,this.router=n,this.alertController=a,this.newProvider={name:"",created_at:"",updated_at:""}}ngOnInit(){const r=(new Date).toISOString();this.newProvider.created_at=r,this.newProvider.updated_at=r}saveProvider(){var r=this;return(0,m.A)(function*(){r.newProvider.name&&""!==r.newProvider.name.trim()?yield(yield r.alertController.create({header:"Confirmar",message:"\xbfEst\xe1s seguro de que deseas guardar este proveedor?",buttons:[{text:"Cancelar",role:"cancel"},{text:"Guardar",handler:()=>{r.inventoryService.saveProvider(r.newProvider).subscribe({next:a=>{a.success?r.router.navigateByUrl("/proveedores",{replaceUrl:!0}).then(()=>{window.location.reload()}):(console.warn("Error al guardar el proveedor:",a.message),r.showAlert("Error","No se pudo guardar el proveedor."))},error:a=>{console.error("Error al guardar el proveedor:",a),r.showAlert("Error","Ocurri\xf3 un error al guardar el proveedor.")}})}}]})).present():yield r.showAlert("Error","El nombre del proveedor no puede estar vac\xedo.")})()}showAlert(r,n){var a=this;return(0,m.A)(function*(){yield(yield a.alertController.create({header:r,message:n,buttons:["OK"]})).present()})()}}return(o=g).\u0275fac=function(r){return new(r||o)(e.rXU(P.c),e.rXU(u.Ix),e.rXU(t.hG))},o.\u0275cmp=e.VBU({type:o,selectors:[["app-agregar-proveedor"]],decls:26,vars:3,consts:[["color","primary"],[1,"form-card"],[3,"submit"],["lines","none"],[1,"form-item"],["position","stacked",1,"title-item"],["name","name","required","",3,"ngModelChange","ngModel"],["name","created_at","readonly","",3,"ngModelChange","ngModel"],["name","updated_at","readonly","",3,"ngModelChange","ngModel"],[1,"footer","edit-footer"],["expand","block","color","primary","type","submit"],["slot","start","name","checkmark-outline"]],template:function(r,n){1&r&&(e.j41(0,"ion-header")(1,"ion-toolbar",0)(2,"ion-title"),e.EFF(3,"Agregar Proveedor"),e.k0s()()(),e.j41(4,"ion-content")(5,"div",1)(6,"h2"),e.EFF(7,"Introduce los detalles del proveedor"),e.k0s(),e.j41(8,"form",2),e.bIt("submit",function(){return n.saveProvider()}),e.j41(9,"ion-list",3)(10,"ion-item",4)(11,"ion-label",5),e.EFF(12,"Nombre del Proveedor"),e.k0s(),e.j41(13,"ion-input",6),e.mxI("ngModelChange",function(i){return e.DH7(n.newProvider.name,i)||(n.newProvider.name=i),i}),e.k0s()(),e.j41(14,"ion-item",4)(15,"ion-label",5),e.EFF(16,"Fecha de Creaci\xf3n"),e.k0s(),e.j41(17,"ion-input",7),e.mxI("ngModelChange",function(i){return e.DH7(n.newProvider.created_at,i)||(n.newProvider.created_at=i),i}),e.k0s()(),e.j41(18,"ion-item",4)(19,"ion-label",5),e.EFF(20,"\xdaltima Actualizaci\xf3n"),e.k0s(),e.j41(21,"ion-input",8),e.mxI("ngModelChange",function(i){return e.DH7(n.newProvider.updated_at,i)||(n.newProvider.updated_at=i),i}),e.k0s()()(),e.j41(22,"ion-footer",9)(23,"ion-button",10),e.nrm(24,"ion-icon",11),e.EFF(25," Guardar Proveedor "),e.k0s()()()()()),2&r&&(e.R7$(13),e.R50("ngModel",n.newProvider.name),e.R7$(4),e.R50("ngModel",n.newProvider.created_at),e.R7$(4),e.R50("ngModel",n.newProvider.updated_at))},dependencies:[l.qT,l.BC,l.cb,l.YS,l.vS,l.cV,t.Jm,t.W9,t.M0,t.eU,t.iq,t.$w,t.uz,t.he,t.nf,t.BC,t.ai,t.Gw],styles:['@charset "UTF-8";.form-card[_ngcontent-%COMP%]{max-width:600px;margin:40px auto;padding:25px;border-radius:10px;background-color:#fff;box-shadow:0 4px 6px #0000001a}h2[_ngcontent-%COMP%]{text-align:center;font-size:1.6rem;color:#333;margin-bottom:30px;font-weight:700}.form-item[_ngcontent-%COMP%]{margin-bottom:20px;padding-right:15px}ion-label[_ngcontent-%COMP%]{font-weight:700;color:#666;margin-bottom:5px}ion-input[_ngcontent-%COMP%], ion-textarea[_ngcontent-%COMP%], ion-select[_ngcontent-%COMP%]{--padding-start: 12px;border:1px solid #ddd;border-radius:3px;--background: #f9f9f9}ion-select[_ngcontent-%COMP%]{--placeholder-color: #999;margin-top:5px}ion-item[_ngcontent-%COMP%]{--inner-padding-end: 0;--inner-padding-start: 0}.footer[_ngcontent-%COMP%]   ion-button[_ngcontent-%COMP%]{border-radius:8px;font-size:1rem;font-weight:700}.title-item[_ngcontent-%COMP%]{margin-bottom:15px}.footer[_ngcontent-%COMP%]{padding:10px;display:flex;justify-content:center}.edit-footer[_ngcontent-%COMP%]{box-shadow:none;margin-top:20px}@media (max-width: 768px){.form-card[_ngcontent-%COMP%]{margin:0 auto}}']}),g})()}];let f=(()=>{var o;class g{}return(o=g).\u0275fac=function(r){return new(r||o)},o.\u0275mod=e.$C({type:o}),o.\u0275inj=e.G2t({imports:[u.iI.forChild(v),u.iI]}),g})(),h=(()=>{var o;class g{}return(o=g).\u0275fac=function(r){return new(r||o)},o.\u0275mod=e.$C({type:o}),o.\u0275inj=e.G2t({imports:[p.MD,l.YN,t.bv,f]}),g})()}}]);