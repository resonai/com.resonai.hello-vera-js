import{j as o}from"./jseApiHelper-dd9c2ac4.js";let p,s,r,u=!1;async function v(){o.callArmeActivity(({activityId:c})=>{console.log("hello-vera-js callArmeActivity",c)}),o.closeArmeActivity(({activityId:c,isExitButtonClicked:a})=>{console.log("hello-vera-js closeArmeActivity",c,"isExitButtonClicked: ",a),y()}),o.loaded(),s=await o.getAppConfig(),p=new URL(document.location).searchParams.has("controlview"),p?(console.log("Control View App"),C(),document.getElementById("close-modal").addEventListener("click",y)):(document.getElementById("tools").remove(),document.getElementById("close-modal").remove());const e="helloWorldScene",n=s.Place,t=new Array(3).fill(s.Scale??1),l=s["Model URL"],i=await o.getSOCenter({key:n.key}),d=[{type:"ambient",intensity:.4,color:16777215},{type:"directional",intensity:.2,color:16772863,pos:[-8,8,-5]}];r={sceneID:e,id:n._id,position:i,scale:t,gltf:l,onEvent:({id:c,event:a})=>{a=="mouseUp"&&A()}},await o.initScene({sceneID:e,lightConfigs:d}),o.mesh(r)}v();function A(){console.log("openModal"),!u&&(o.tryOpen({activityId:"SOME ACTIVITY ID"}),document.getElementById("modal").style.display="block",u=!0)}function y(){console.log("closeModal"),u&&(o.tryClose(),document.getElementById("modal").style.display="none",u=!1)}async function C(){const e=document.getElementById("tools"),n=await m("Model URL","text",E),t=await m("Scale","number",h),l=await m("Place","text",void 0,b,!0);g(l,"Place","Show",w),e.append(n,t,l),g(e,void 0,"abort",S)}async function m(e,n,t,l,i){const d=document.createElement("div");d.append(`${e}:`);const c=document.createElement("input");n&&c.setAttribute("type",n),i&&c.setAttribute("readonly","");let a=s[e];return typeof a=="object"&&a!==null&&(a=await I(a.key)),c.setAttribute("value",a),l&&c.addEventListener("click",f=>l({parent:s,property:e,value:f.target.value})),t&&c.addEventListener("change",f=>t({parent:s,property:e,value:f.target.value})),d.appendChild(c),d}function g(e,n,t,l){const i=document.createElement("input");i.setAttribute("type","button"),i.setAttribute("value",t),i.addEventListener("click",d=>l({parent:s,property:n,value:d.target.value})),e.appendChild(i)}async function E({parent:e,property:n,value:t}){if(console.log("onModelUrlChange",t),!await o.setPropertyInAppConfig({parent:e,property:n,value:t})){console.error("onModelUrlChange setPropertyInAppConfig failed");return}r.gltf=t,o.mesh(r)}async function h({parent:e,property:n,value:t}){if(console.log("onScaleChange",t),!await o.setPropertyInAppConfig({parent:e,property:n,value:t})){console.error("onScaleChange setPropertyInAppConfig failed");return}r.scale=new Array(3).fill(t??1),o.mesh(r)}function b({parent:e,property:n,value:t}){var l,i;console.log("editPlace",t),o.editSO({key:(l=e[n])==null?void 0:l.key,parent:e,property:n,id:(i=e[n])==null?void 0:i.id})}function w({parent:e,property:n,value:t}){var i;const l=(i=e[n])==null?void 0:i.key;console.log("goToPlace",l,t),l&&(o.activeSO({}),o.activeSO({key:l}))}function S(){r&&o.destroyMesh(r),o.activeSO({}),o.abort()}async function I(e){return(await o.querySemanticObjects({confKey:s._id,fields:["id,type,name,key,argeometry{center_x,center_y,center_z}"]}))[e].name}
