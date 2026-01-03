import{c as _,s as g,v as f,m as p}from"./ssr.js";import{a as y}from"./ssr2.js";import"./environment.js";let x={},z=e=>e?.stack;function U(e){}function j(e){x=e}let b=null;function C(e){b=e}function L(e){}const k=_((e,t,n,h)=>{let{stores:o}=t,{page:a}=t,{constructors:s}=t,{components:r=[]}=t,{form:d}=t,{data_0:c=null}=t,{data_1:m=null}=t;g("__svelte__",o),y(o.page.notify),t.stores===void 0&&n.stores&&o!==void 0&&n.stores(o),t.page===void 0&&n.page&&a!==void 0&&n.page(a),t.constructors===void 0&&n.constructors&&s!==void 0&&n.constructors(s),t.components===void 0&&n.components&&r!==void 0&&n.components(r),t.form===void 0&&n.form&&d!==void 0&&n.form(d),t.data_0===void 0&&n.data_0&&c!==void 0&&n.data_0(c),t.data_1===void 0&&n.data_1&&m!==void 0&&n.data_1(m);let i,v,u=e.head;do i=!0,e.head=u,o.page.set(a),v=`  ${s[1]?`${f(s[0]||p,"svelte:component").$$render(e,{data:c,params:a.params,this:r[0]},{this:l=>{r[0]=l,i=!1}},{default:()=>`${f(s[1]||p,"svelte:component").$$render(e,{data:m,form:d,params:a.params,this:r[1]},{this:l=>{r[1]=l,i=!1}},{})}`})}`:`${f(s[0]||p,"svelte:component").$$render(e,{data:c,form:d,params:a.params,this:r[0]},{this:l=>{r[0]=l,i=!1}},{})}`} `;while(!i);return v}),M={app_template_contains_nonce:!1,async:!1,csp:{mode:"auto",directives:{"upgrade-insecure-requests":!1,"block-all-mixed-content":!1},reportOnly:{"upgrade-insecure-requests":!1,"block-all-mixed-content":!1}},csrf_check_origin:!0,csrf_trusted_origins:[],embedded:!1,env_public_prefix:"PUBLIC_",env_private_prefix:"",hash_routing:!1,hooks:null,preload_strategy:"modulepreload",root:k,service_worker:!1,service_worker_options:void 0,templates:{app:({head:e,body:t,assets:n,nonce:h,env:o})=>`<!doctype html>
<html lang="ru" class="dark">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		`+e+`
	</head>
	<body data-sveltekit-preload-data="hover">
		<script>
			// Error boundary - ловим и отображаем ошибки загрузки
			window.onerror = function(msg, url, line, col, error) {
				console.error('Global error:', msg, error);
				const errorDiv = document.createElement('div');
				errorDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#ff4444;color:white;padding:20px;z-index:99999;font-family:monospace;font-size:14px;box-shadow:0 4px 6px rgba(0,0,0,0.3);';
				errorDiv.innerHTML = \`
					<strong>❌ Application Error:</strong><br/>
					Message: \${msg}<br/>
					Location: \${url}:\${line}:\${col}<br/>
					\${error ? 'Stack: ' + error.stack : ''}
				\`;
				document.body.appendChild(errorDiv);
				return false;
			};
			
			// Ловим unhandled promise rejections
			window.addEventListener('unhandledrejection', function(event) {
				console.error('Unhandled promise rejection:', event.reason);
				const errorDiv = document.createElement('div');
				errorDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#ff8800;color:white;padding:20px;z-index:99999;font-family:monospace;font-size:14px;box-shadow:0 4px 6px rgba(0,0,0,0.3);';
				errorDiv.innerHTML = \`
					<strong>⚠️ Unhandled Promise Rejection:</strong><br/>
					\${event.reason}
				\`;
				document.body.appendChild(errorDiv);
			});
		<\/script>
		<div style="display: contents">`+t+`</div>
	</body>
</html>
`,error:({status:e,message:t})=>`<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<title>`+t+`</title>

		<style>
			body {
				--bg: white;
				--fg: #222;
				--divider: #ccc;
				background: var(--bg);
				color: var(--fg);
				font-family:
					system-ui,
					-apple-system,
					BlinkMacSystemFont,
					'Segoe UI',
					Roboto,
					Oxygen,
					Ubuntu,
					Cantarell,
					'Open Sans',
					'Helvetica Neue',
					sans-serif;
				display: flex;
				align-items: center;
				justify-content: center;
				height: 100vh;
				margin: 0;
			}

			.error {
				display: flex;
				align-items: center;
				max-width: 32rem;
				margin: 0 1rem;
			}

			.status {
				font-weight: 200;
				font-size: 3rem;
				line-height: 1;
				position: relative;
				top: -0.05rem;
			}

			.message {
				border-left: 1px solid var(--divider);
				padding: 0 0 0 1rem;
				margin: 0 0 0 1rem;
				min-height: 2.5rem;
				display: flex;
				align-items: center;
			}

			.message h1 {
				font-weight: 400;
				font-size: 1em;
				margin: 0;
			}

			@media (prefers-color-scheme: dark) {
				body {
					--bg: #222;
					--fg: #ddd;
					--divider: #666;
				}
			}
		</style>
	</head>
	<body>
		<div class="error">
			<span class="status">`+e+`</span>
			<div class="message">
				<h1>`+t+`</h1>
			</div>
		</div>
	</body>
</html>
`},version_hash:"tmozfi"};async function S(){return{handle:void 0,handleFetch:void 0,handleError:void 0,handleValidationError:void 0,init:void 0,reroute:void 0,transport:void 0}}export{j as a,C as b,L as c,z as f,S as g,M as o,x as p,b as r,U as s};
