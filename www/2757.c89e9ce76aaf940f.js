"use strict";(self.webpackChunkapp=self.webpackChunkapp||[]).push([[2757],{2757:(f,l,d)=>{d.r(l),d.d(l,{PedidosPageModule:()=>h});var p=d(177),g=d(4341),r=d(7125),a=d(5520),o=d(4438),m=d(4934);function P(e,n){if(1&e){const t=o.RV6();o.j41(0,"ion-item-sliding")(1,"ion-item",3)(2,"ion-thumbnail",4),o.nrm(3,"img",5),o.k0s(),o.j41(4,"ion-label")(5,"h3"),o.EFF(6),o.k0s()(),o.j41(7,"ion-button",6),o.bIt("click",function(){const s=o.eBV(t).$implicit,c=o.XpG();return o.Njj(c.viewOrderList(s.id))}),o.EFF(8," Ver Pedido "),o.k0s()()()}if(2&e){const t=n.$implicit;o.R7$(6),o.JRh(t.name)}}const u=[{path:"",component:(()=>{var e;class n{constructor(i,s,c){this.route=i,this.inventoryService=s,this.router=c,this.providerId=null,this.providerProducts=[],this.providerName="",this.providers=[]}ngOnInit(){this.loadProviders(),this.providerId=Number(this.route.snapshot.paramMap.get("id"))}loadProviders(){this.inventoryService.getProviders().subscribe({next:i=>{i.success?this.providers=i.data:console.warn("No se pudieron cargar los proveedores.")},error:i=>{console.error("Error al cargar proveedores:",i)}})}viewOrderList(i){this.router.navigate(["/lista-pedido",i])}}return(e=n).\u0275fac=function(i){return new(i||e)(o.rXU(a.nX),o.rXU(m.c),o.rXU(a.Ix))},e.\u0275cmp=o.VBU({type:e,selectors:[["app-pedidos-info"]],decls:7,vars:1,consts:[["color","primary"],[1,"provider-list"],[4,"ngFor","ngForOf"],[1,"provider-card"],["slot","start"],["src","assets/user_src.png","alt","Proveedor"],["slot","end","color","primary",3,"click"]],template:function(i,s){1&i&&(o.j41(0,"ion-header")(1,"ion-toolbar",0)(2,"ion-title"),o.EFF(3,"Proveedores"),o.k0s()()(),o.j41(4,"ion-content")(5,"ion-list",1),o.DNE(6,P,9,1,"ion-item-sliding",2),o.k0s()()),2&i&&(o.R7$(6),o.Y8G("ngForOf",s.providers))},dependencies:[p.Sq,r.Jm,r.W9,r.eU,r.uz,r.A7,r.he,r.nf,r.Zx,r.BC,r.ai],styles:['@charset "UTF-8";.provider-list[_ngcontent-%COMP%]{margin:0 auto;padding:10px;width:100%;max-width:450px}.provider-card[_ngcontent-%COMP%]{border:1px solid #ddd;border-radius:10px;margin:8px 0;padding:10px;background-color:#fff;box-shadow:0 2px 4px #0000001a;transition:transform .2s ease,box-shadow .2s ease}.provider-card[_ngcontent-%COMP%]:hover{transform:scale(1.02);box-shadow:0 4px 8px #0003}ion-thumbnail[_ngcontent-%COMP%]{width:60px;height:60px;border-radius:50%;margin-right:10px;overflow:hidden}ion-thumbnail[_ngcontent-%COMP%]   img[_ngcontent-%COMP%]{object-fit:cover;width:100%;height:100%}.provider-name[_ngcontent-%COMP%]{font-size:1.2rem;font-weight:700;color:#333;margin:0}.provider-id[_ngcontent-%COMP%]{font-size:.9rem;color:#666;margin:2px 0}ion-item-sliding[_ngcontent-%COMP%]{margin:8px 0;border-radius:10px;overflow:hidden}ion-item-options[_ngcontent-%COMP%]{border-radius:10px;overflow:hidden}ion-item-option[_ngcontent-%COMP%]{text-align:center;padding:10px 0}.provider-card[_ngcontent-%COMP%]{--box-shadow: none}ion-item.provider-card[_ngcontent-%COMP%]{border:none!important;--ion-border-color: transparent}@media (max-width: 576px){.provider-card[_ngcontent-%COMP%]{flex-direction:column;align-items:center;text-align:center}ion-thumbnail[_ngcontent-%COMP%]{margin-bottom:10px}ion-item.provider-card[_ngcontent-%COMP%]{border:none!important;--ion-border-color: transparent}}']}),n})()}];let v=(()=>{var e;class n{}return(e=n).\u0275fac=function(i){return new(i||e)},e.\u0275mod=o.$C({type:e}),e.\u0275inj=o.G2t({imports:[a.iI.forChild(u),a.iI]}),n})(),h=(()=>{var e;class n{}return(e=n).\u0275fac=function(i){return new(i||e)},e.\u0275mod=o.$C({type:e}),e.\u0275inj=o.G2t({imports:[p.MD,g.YN,r.bv,v]}),n})()}}]);