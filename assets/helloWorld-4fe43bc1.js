import{j as l,a as m}from"./jseApiHelper-dc463ecb.js";{let E=function(){console.log("openModal"),!u&&(l.tryOpen({activityId:f}),document.getElementById("modal").style.display="block",u=!0)},v=function(){console.log("closeModal"),u&&(l.tryClose(),document.getElementById("modal").style.display="none",u=!1)},b=function(e,t,n,o){const c=document.createElement("input");c.setAttribute("type","button"),c.setAttribute("value",n),c.addEventListener("click",d=>o({parent:a,property:t,value:d.target.value})),e.appendChild(c)},j=function({parent:e,property:t,value:n}){console.log("onModelUrlChange",n),A({parent:e,property:t,value:n}),r.gltf=n,l.mesh(r)},O=function({parent:e,property:t,value:n}){console.log("onScaleChange",n),A({parent:e,property:t,value:n}),r.scale=new Array(3).fill(n??1),l.mesh(r)},w=function({parent:e,property:t,value:n}){var o,c;console.log("editPlace",n),m.send("editSO",{key:(o=e[t])==null?void 0:o.key,parent:e,property:t,id:(c=e[t])==null?void 0:c.id})},S=function({parent:e,property:t,value:n}){var c;const o=(c=e[t])==null?void 0:c.key;console.log("goToPlace",o,n),o&&(m.send("activeSO",{}),m.send("activeSO",{key:o}))},k=function(){r&&l.destroyMesh(r),m.send("activeSO",{}),m.dispatch({funcName:"abort",params:{}})};const f="hello-vera-js.hello-world";let y,a,r,u=!1;async function h(){l.callArmeActivity(({activityId:i})=>{i===f&&console.log("hello-vera-js callArmeActivity",i)}),l.closeArmeActivity(({activityId:i,isExitButtonClicked:s})=>{i===f&&(console.log("hello-vera-js closeArmeActivity",i,"isExitButtonClicked: ",s),v())}),l.loaded(),a=await l.getAppConfig(),y=new URL(document.location).searchParams.has("vacapp"),y?(console.log("VAC App"),C(),document.getElementById("close-modal").addEventListener("click",v)):(document.getElementById("tools").remove(),document.getElementById("close-modal").remove());const e="helloWorldScene",t=a.Place,n=new Array(3).fill(a.Scale??1),o=a["Model URL"],c=await M(t),d=[{type:"ambient",intensity:.4,color:16777215},{type:"directional",intensity:.2,color:16772863,pos:[-8,8,-5]}];r={sceneID:e,id:t._id,position:c,scale:n,gltf:o,onEvent:({id:i,event:s})=>{s=="mouseUp"&&E()}},await l.initScene({sceneID:e,lightConfigs:d}),l.mesh(r)}h();async function C(){const e=document.getElementById("tools"),t=await p("Model URL","text",j),n=await p("Scale","number",O),o=await p("Place","text",void 0,w,!0);b(o,"Place","Show",S),e.append(t,n,o),b(e,void 0,"abort",k)}async function p(e,t,n,o,c){const d=document.createElement("div");d.append(`${e}:`);const i=document.createElement("input");t&&i.setAttribute("type",t),c&&i.setAttribute("readonly","");let s=a[e];return typeof s=="object"&&s!==null&&(s=await _(s.key)),i.setAttribute("value",s),o&&i.addEventListener("click",g=>o({parent:a,property:e,value:g.target.value})),n&&i.addEventListener("change",g=>n({parent:a,property:e,value:g.target.value})),d.appendChild(i),d}async function A({parent:e,property:t,value:n}){await m.call("setPropertyInAppConfig",{parent:e,property:t,value:n})}async function _(e){return(await l.querySemanticObjects({confKey:a._id,fields:["id,type,name,key,argeometry{center_x,center_y,center_z}"]}))[e].name}async function M(e){let t;if(y)t=await m.call("getSOCenter",{key:e.key});else{const c=(await l.querySemanticObjects({confKey:a._id,fields:["id,type,name,key,argeometry{center_x,center_y,center_z}"]}))[e.key]["ar:geometry"];t=[c.center_x,c.center_y,c.center_z]}return t}}
