"use strict";(self.webpackChunkapp=self.webpackChunkapp||[]).push([[1412],{1412:(x,s,d)=>{d.r(s),d.d(s,{AgregarMarcaProductoPageModule:()=>C});var p=d(177),g=d(4341),o=d(7125),m=d(5520),u=d(467),e=d(4438),M=d(4934),f=d(3656);const P=[{path:"",component:(()=>{var n;class c{constructor(r,t,i){this.inventoryService=r,this.navCtrl=t,this.alertController=i,this.newBrand={name:"",created_at:(new Date).toISOString(),updated_at:(new Date).toISOString()}}ngOnInit(){}saveBrand(){var r=this;return(0,u.A)(function*(){r.newBrand.name&&""!==r.newBrand.name.trim()?yield(yield r.alertController.create({header:"Confirmar",message:"\xbfEst\xe1s seguro de que deseas guardar esta marca?",buttons:[{text:"Cancelar",role:"cancel"},{text:"Guardar",handler:()=>{var i;r.inventoryService.saveBrand(r.newBrand).subscribe({next:(i=(0,u.A)(function*(a){console.log("API Response:",a),yield r.showAlert("\xc9xito","Marca guardada correctamente."),r.navCtrl.navigateBack("/marcas-productos")}),function(A){return i.apply(this,arguments)}),error:function(){var i=(0,u.A)(function*(a){console.error("API Error:",a),yield r.showAlert("Error","Ocurri\xf3 un error al guardar la marca.")});return function(A){return i.apply(this,arguments)}}()})}}]})).present():yield r.showAlert("Error","El nombre de la Marca no puede estar vac\xedo.")})()}showAlert(r,t){var i=this;return(0,u.A)(function*(){yield(yield i.alertController.create({header:r,message:t,buttons:["OK"]})).present()})()}}return(n=c).\u0275fac=function(r){return new(r||n)(e.rXU(M.c),e.rXU(f.q9),e.rXU(o.hG))},n.\u0275cmp=e.VBU({type:n,selectors:[["app-agregar-marca-producto"]],decls:26,vars:3,consts:[["color","primary"],[1,"form-card"],[3,"submit"],["lines","none"],[1,"form-item"],["position","stacked",1,"title-item"],["name","name","required","",3,"ngModelChange","ngModel"],["name","created_at","readonly","",3,"ngModelChange","ngModel"],["name","updated_at","readonly","",3,"ngModelChange","ngModel"],[1,"footer","edit-footer"],["expand","block","color","primary","type","submit"],["slot","start","name","checkmark-outline"]],template:function(r,t){1&r&&(e.j41(0,"ion-header")(1,"ion-toolbar",0)(2,"ion-title"),e.EFF(3,"Agregar Marca de Producto"),e.k0s()()(),e.j41(4,"ion-content")(5,"div",1)(6,"h2"),e.EFF(7,"Introduce los detalles de la marca de producto"),e.k0s(),e.j41(8,"form",2),e.bIt("submit",function(){return t.saveBrand()}),e.j41(9,"ion-list",3)(10,"ion-item",4)(11,"ion-label",5),e.EFF(12,"Nombre de la Marca"),e.k0s(),e.j41(13,"ion-input",6),e.mxI("ngModelChange",function(a){return e.DH7(t.newBrand.name,a)||(t.newBrand.name=a),a}),e.k0s()(),e.j41(14,"ion-item",4)(15,"ion-label",5),e.EFF(16,"Fecha de Creaci\xf3n"),e.k0s(),e.j41(17,"ion-input",7),e.mxI("ngModelChange",function(a){return e.DH7(t.newBrand.created_at,a)||(t.newBrand.created_at=a),a}),e.k0s()(),e.j41(18,"ion-item",4)(19,"ion-label",5),e.EFF(20,"\xdaltima Actualizaci\xf3n"),e.k0s(),e.j41(21,"ion-input",8),e.mxI("ngModelChange",function(a){return e.DH7(t.newBrand.updated_at,a)||(t.newBrand.updated_at=a),a}),e.k0s()()(),e.j41(22,"ion-footer",9)(23,"ion-button",10),e.nrm(24,"ion-icon",11),e.EFF(25," Guardar Marca "),e.k0s()()()()()),2&r&&(e.R7$(13),e.R50("ngModel",t.newBrand.name),e.R7$(4),e.R50("ngModel",t.newBrand.created_at),e.R7$(4),e.R50("ngModel",t.newBrand.updated_at))},dependencies:[g.qT,g.BC,g.cb,g.YS,g.vS,g.cV,o.Jm,o.W9,o.M0,o.eU,o.iq,o.$w,o.uz,o.he,o.nf,o.BC,o.ai,o.Gw],styles:['@charset "UTF-8";.form-card[_ngcontent-%COMP%]{max-width:600px;margin:40px auto;padding:25px;border-radius:10px;background-color:#fff;box-shadow:0 4px 6px #0000001a}h2[_ngcontent-%COMP%]{text-align:center;font-size:1.6rem;color:#333;margin-bottom:30px;font-weight:700}.form-item[_ngcontent-%COMP%]{margin-bottom:20px;padding-right:15px}ion-label[_ngcontent-%COMP%]{font-weight:700;color:#666;margin-bottom:5px}ion-input[_ngcontent-%COMP%], ion-textarea[_ngcontent-%COMP%], ion-select[_ngcontent-%COMP%]{--padding-start: 12px;border:1px solid #ddd;border-radius:3px;--background: #f9f9f9}ion-select[_ngcontent-%COMP%]{--placeholder-color: #999;margin-top:5px}ion-item[_ngcontent-%COMP%]{--inner-padding-end: 0;--inner-padding-start: 0}.footer[_ngcontent-%COMP%]   ion-button[_ngcontent-%COMP%]{border-radius:8px;font-size:1rem;font-weight:700}.title-item[_ngcontent-%COMP%]{margin-bottom:15px}.footer[_ngcontent-%COMP%]{padding:10px;display:flex;justify-content:center}.edit-footer[_ngcontent-%COMP%]{box-shadow:none;margin-top:20px}@media (max-width: 768px){.form-card[_ngcontent-%COMP%]{margin:0 auto}}']}),c})()}];let h=(()=>{var n;class c{}return(n=c).\u0275fac=function(r){return new(r||n)},n.\u0275mod=e.$C({type:n}),n.\u0275inj=e.G2t({imports:[m.iI.forChild(P),m.iI]}),c})(),C=(()=>{var n;class c{}return(n=c).\u0275fac=function(r){return new(r||n)},n.\u0275mod=e.$C({type:n}),n.\u0275inj=e.G2t({imports:[p.MD,g.YN,o.bv,h]}),c})()}}]);