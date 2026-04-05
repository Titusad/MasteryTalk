import{c as t}from"./index-B2CBXIDh.js";/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const a=[["path",{d:"M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16",key:"jecpp"}],["rect",{width:"20",height:"14",x:"2",y:"6",rx:"2",key:"i6l2r4"}]],k=t("briefcase",a);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const l=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]],m=t("info",l);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const s=[["path",{d:"M7.9 20A9 9 0 1 0 4 16.1L2 22Z",key:"vv11sd"}],["path",{d:"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3",key:"1u773s"}],["path",{d:"M12 17h.01",key:"p32p05"}]],y=t("message-circle-question",s);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const r=[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}]],g=t("rotate-ccw",r);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const c=[["path",{d:"M6 9H4.5a2.5 2.5 0 0 1 0-5H6",key:"17hqa7"}],["path",{d:"M18 9h1.5a2.5 2.5 0 0 0 0-5H18",key:"lmptdp"}],["path",{d:"M4 22h16",key:"57wxv0"}],["path",{d:"M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22",key:"1nw9bq"}],["path",{d:"M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22",key:"1np0yb"}],["path",{d:"M18 2H6v7a6 6 0 0 0 12 0V2Z",key:"u46fv3"}]],f=t("trophy",c);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const d=[["path",{d:"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",key:"uqj9uw"}],["path",{d:"M16 9a5 5 0 0 1 0 6",key:"1q6k2b"}],["path",{d:"M19.364 18.364a9 9 0 0 0 0-12.728",key:"ijwkga"}]],w=t("volume-2",d),u=[{id:"int-1",level:1,title:"Phone Screen",scenario:"Initial recruiter phone screen — introduce yourself and answer standard questions",interlocutorBehavior:"Friendly, standard questions",interlocutor:"recruiter",unlockRequirement:"Always open"},{id:"int-2",level:2,title:"Behavioral Round",scenario:"Behavioral interview — 'Tell me about a time…' questions with STAR method",interlocutorBehavior:"Probes follow-ups, expects STAR format",interlocutor:"hiring_manager",unlockRequirement:"Complete Level 1 remedial"},{id:"int-3",level:3,title:"Technical Discussion",scenario:"Technical deep-dive — system design and problem-solving discussion",interlocutorBehavior:"Challenges vagueness, probes deeply",interlocutor:"sme",unlockRequirement:"Complete Level 2 remedial"},{id:"int-4",level:4,title:"Salary Negotiation",scenario:"Compensation and benefits negotiation with HR",interlocutorBehavior:"Pushback, counter-offers, objections",interlocutor:"hr",unlockRequirement:"Complete Level 3 remedial"}],h=[{id:"sal-1",level:1,title:"Discovery Call",scenario:"Discovery call — understanding client needs and pain points",interlocutorBehavior:"Busy, gives short answers",interlocutor:"gatekeeper",unlockRequirement:"Always open"},{id:"sal-2",level:2,title:"Product Demo",scenario:"B2B SaaS product demo — presenting value proposition",interlocutorBehavior:"Questions value prop, asks 'so what?'",interlocutor:"technical_buyer",unlockRequirement:"Complete Level 1 remedial"},{id:"sal-3",level:3,title:"Objection Handling",scenario:"Handling price and timing objections mid-deal",interlocutorBehavior:"Aggressive pushback, budget concerns",interlocutor:"champion",unlockRequirement:"Complete Level 2 remedial"},{id:"sal-4",level:4,title:"Close the Deal",scenario:"Final negotiation — closing a six-figure B2B deal",interlocutorBehavior:"Tests conviction, plays hardball",interlocutor:"decision_maker",unlockRequirement:"Complete Level 3 remedial"}],p=[{id:"interview",title:"Interview Mastery",icon:"🎯",levels:u},{id:"sales",title:"Sales Champion",icon:"💼",levels:h}];function M(){return{activeGoal:"interview",interview:{"int-1":{status:"unlocked"},"int-2":{status:"locked"},"int-3":{status:"locked"},"int-4":{status:"locked"}},sales:{"sal-1":{status:"unlocked"},"sal-2":{status:"locked"},"sal-3":{status:"locked"},"sal-4":{status:"locked"}}}}function b(o,n,i){const e=o[n];return(e==null?void 0:e[i])??{status:"locked"}}function _(o,n){const i=p.find(e=>e.id===o);return i?i.levels.find(e=>e.id===n)??null:null}export{k as B,m as I,y as M,p as P,g as R,f as T,w as V,M as a,b,_ as g};
