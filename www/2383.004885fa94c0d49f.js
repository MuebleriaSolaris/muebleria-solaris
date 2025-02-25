"use strict";(self.webpackChunkapp=self.webpackChunkapp||[]).push([[2383],{2383:(C,g,s)=>{s.r(g),s.d(g,{MarcasProductosPageModule:()=>x});var p=s(177),h=s(4341),t=s(4742),m=s(1671),l=s(467),r=s(4438),P=s(4934);function f(n,i){if(1&n){const a=r.RV6();r.j41(0,"ion-item-sliding")(1,"ion-item",3)(2,"ion-thumbnail",4),r.nrm(3,"img",5),r.k0s(),r.j41(4,"ion-label")(5,"p"),r.EFF(6,"Nombre"),r.k0s(),r.j41(7,"h2",6),r.EFF(8),r.k0s()()(),r.j41(9,"ion-item-options",7)(10,"ion-item-option",8),r.bIt("click",function(){const e=r.eBV(a).$implicit,c=r.XpG();return r.Njj(c.deleteBrand(e.id))}),r.EFF(11," Eliminar "),r.k0s()()()}if(2&n){const a=i.$implicit;r.R7$(3),r.FS9("alt",a.name),r.R7$(5),r.JRh(a.name)}}const M=[{path:"",component:(()=>{var n;class i{constructor(o,e,c){this.inventoryService=o,this.router=e,this.alertController=c,this.brands=[]}ngOnInit(){this.loadBrands()}loadBrands(){this.inventoryService.getBrands().subscribe({next:o=>{o.success?this.brands=o.data:console.warn("No se pudieron cargar las marcas.")},error:o=>{console.error("Error al cargar marcas:",o)}})}deleteBrand(o){var e=this;return(0,l.A)(function*(){yield(yield e.alertController.create({header:"Confirmar Eliminaci\xf3n",message:"\xbfEst\xe1s seguro de que deseas eliminar esta marca?",buttons:[{text:"Cancelar",role:"cancel"},{text:"Eliminar",handler:()=>{var u;e.inventoryService.deleteBrand(o).subscribe({next:(u=(0,l.A)(function*(d){d.success?(yield e.showAlert("\xc9xito","Marca eliminada correctamente."),e.loadBrands()):yield e.showAlert("Error","No se pudo eliminar la marca.")}),function(b){return u.apply(this,arguments)}),error:function(){var u=(0,l.A)(function*(d){console.error("Error al eliminar la marca:",d),yield e.showAlert("Error","Ocurri\xf3 un error al eliminar la marca.")});return function(b){return u.apply(this,arguments)}}()})}}]})).present()})()}showAlert(o,e){var c=this;return(0,l.A)(function*(){yield(yield c.alertController.create({header:o,message:e,buttons:["OK"]})).present()})()}}return(n=i).\u0275fac=function(o){return new(o||n)(r.rXU(P.c),r.rXU(m.Ix),r.rXU(t.hG))},n.\u0275cmp=r.VBU({type:n,selectors:[["app-marcas-productos"]],decls:7,vars:1,consts:[["color","primary"],[1,"provider-list"],[4,"ngFor","ngForOf"],[1,"provider-card"],["slot","start"],["src","assets/brand.png",3,"alt"],[1,"provider-name"],["side","end","color","Red"],["color","danger",3,"click"]],template:function(o,e){1&o&&(r.j41(0,"ion-header")(1,"ion-toolbar",0)(2,"ion-title"),r.EFF(3,"Marcas"),r.k0s()()(),r.j41(4,"ion-content")(5,"ion-list",1),r.DNE(6,f,12,2,"ion-item-sliding",2),r.k0s()()),2&o&&(r.R7$(6),r.Y8G("ngForOf",e.brands))},dependencies:[p.Sq,t.W9,t.eU,t.uz,t.LU,t.CE,t.A7,t.he,t.nf,t.Zx,t.BC,t.ai],styles:['@charset "UTF-8";.provider-list[_ngcontent-%COMP%]{margin:0 auto;padding:10px;width:100%;max-width:450px}.provider-card[_ngcontent-%COMP%]{border:1px solid #ddd;border-radius:10px;margin:8px 0;padding:10px;background-color:#fff;box-shadow:0 2px 4px #0000001a;transition:transform .2s ease,box-shadow .2s ease}.provider-card[_ngcontent-%COMP%]:hover{transform:scale(1.02);box-shadow:0 4px 8px #0003}ion-thumbnail[_ngcontent-%COMP%]{width:60px;height:60px;border-radius:50%;margin-right:10px;overflow:hidden}ion-thumbnail[_ngcontent-%COMP%]   img[_ngcontent-%COMP%]{object-fit:cover;width:100%;height:100%}.provider-name[_ngcontent-%COMP%]{font-size:1.2rem;font-weight:700;color:#333;margin:0}.provider-id[_ngcontent-%COMP%]{font-size:.9rem;color:#666;margin:2px 0}ion-item-sliding[_ngcontent-%COMP%]{margin:8px 0;border-radius:10px;overflow:hidden}ion-item-options[_ngcontent-%COMP%]{border-radius:10px;overflow:hidden}ion-item-option[_ngcontent-%COMP%]{text-align:center;padding:10px 0}.provider-card[_ngcontent-%COMP%]{--box-shadow: none}ion-item.provider-card[_ngcontent-%COMP%]{border:none!important;--ion-border-color: transparent}@media (max-width: 576px){.provider-card[_ngcontent-%COMP%]{flex-direction:column;align-items:center;text-align:center}ion-thumbnail[_ngcontent-%COMP%]{margin-bottom:10px}ion-item.provider-card[_ngcontent-%COMP%]{border:none!important;--ion-border-color: transparent}}']}),i})()}];let v=(()=>{var n;class i{}return(n=i).\u0275fac=function(o){return new(o||n)},n.\u0275mod=r.$C({type:n}),n.\u0275inj=r.G2t({imports:[m.iI.forChild(M),m.iI]}),i})(),x=(()=>{var n;class i{}return(n=i).\u0275fac=function(o){return new(o||n)},n.\u0275mod=r.$C({type:n}),n.\u0275inj=r.G2t({imports:[p.MD,h.YN,t.bv,v]}),i})()}}]);