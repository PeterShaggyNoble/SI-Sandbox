{
	const 	nodes={
			svg:document.querySelector(`section#image>svg`),
			canvas:document.querySelector(`canvas`),
			download:document.querySelector(`button`)
		},
		opengraph={
			async init(){
				opengraph.blacklist=await opengraph.getmodule(`blacklist`);
				opengraph.forced=await opengraph.getmodule(`forced`);
				opengraph.whitelist=await opengraph.getmodule(`whitelist`);
				opengraph.settings=await opengraph.getmodule(`settings`);
				opengraph.limits=await opengraph.getmodule(`limits`);
				opengraph.filters=await opengraph.getmodule(`filters`);
				opengraph.getsettings();
				opengraph.load();
			},
			addsi(){
				let 	path=document.createElementNS(`http://www.w3.org/2000/svg`,`path`),
					x=opengraph.settings.left+(opengraph.settings.columns-opengraph.settings.centre)/2*opengraph.settings.step,
					y=opengraph.settings.top+(opengraph.settings.rows-opengraph.settings.centre)/2*opengraph.settings.step,
					scale=(opengraph.settings.native*opengraph.settings.scale*opengraph.settings.centre+opengraph.settings.gap*opengraph.settings.centre-opengraph.settings.gap)/opengraph.settings.native;
				path.setAttribute(`fill`,`#`+opengraph.settings.color);
				path.setAttribute(`transform`,`translate(${x},${y}) scale(${scale},${scale})`);
				if(!opengraph.settings.layout)
					path.setAttribute(`d`,icons.get(`Simple Icons`).path);
				else path.setAttribute(`d`,`M0,0H${opengraph.settings.native}V${opengraph.settings.native}H0Z`);
				nodes.svg.append(path);
			},
			async download(){
				nodes.canvas.toBlob(opengraph.save);
			},
			async save(blob){
				let link=document.createElement(`a`);
				link.href=URL.createObjectURL(blob);
				link.download=`og.png`;
				document.body.append(link);
				link.click();
				link.remove();
				URL.revokeObjectURL(link.href);
			},
			draw(event){
				let target=event.target;
				opengraph.context.clearRect(0,0,opengraph.settings.width,opengraph.settings.height);
				opengraph.context.drawImage(target,0,0);
				URL.revokeObjectURL(target.src);
			},
			filter(obj){
				let slug=obj.slug;
				if(opengraph.blacklist.includes(slug))
					return false;
				let data=icons.get(slug).path;
				if(opengraph.forced.includes(slug)||opengraph.whitelist.includes(slug)){
					obj.data=data;
					return true;
				}
				if(opengraph.filters.length(data,opengraph.limits.length))
					return false;
				if(opengraph.filters.luminance(obj.hex,opengraph.limits.luminance))
					return false;
				if(opengraph.filters.hsl(obj.hex,opengraph.limits.hsl))
					return false;
				if(opengraph.filters.ratio(data,opengraph.limits.ratio,nodes.svg))
					return false;
				obj.data=data;
				return true;
			},
			force(obj){
				return opengraph.forced.includes(obj.slug)?-1:1;
			},
			async getmodule(name){
				let module=await import(`./modules/${name}.js`);
				return module[name];
			},
			getsettings(){
				opengraph.settings.width=nodes.canvas.width;
				opengraph.settings.height=nodes.canvas.height;
				opengraph.settings.size=opengraph.settings.native*opengraph.settings.scale;
				opengraph.settings.step=opengraph.settings.size+opengraph.settings.gap;
				opengraph.settings.left=(opengraph.settings.width-opengraph.settings.columns*opengraph.settings.step+opengraph.settings.gap)/2;
				opengraph.settings.top=(opengraph.settings.height-opengraph.settings.rows*opengraph.settings.step+opengraph.settings.gap)/2;
			},
			load(){
				opengraph.context=nodes.canvas.getContext(`2d`);
				let rect=document.createElementNS(`http://www.w3.org/2000/svg`,`rect`);
				rect.setAttribute(`fill`,`#`+opengraph.settings.background);
				rect.setAttribute(`height`,`100%`);
				rect.setAttribute(`width`,`100%`);
				rect.setAttribute(`x`,`0`);
				rect.setAttribute(`y`,`0`);
				nodes.svg.append(rect);
				opengraph.icons=Object.values(icons)
					.filter(opengraph.filter)
					.sort(opengraph.random)
					.sort(opengraph.force)
					.slice(0,opengraph.settings.icons);
				opengraph.addsi();
				opengraph.populate();
				let 	image=new Image(),
					xml=new XMLSerializer();
				image.addEventListener(`load`,opengraph.draw);
				image.src=URL.createObjectURL(
					new Blob([xml.serializeToString(nodes.svg)],{
						type:`image/svg+xml;charset=utf-8`
					})
				);
				nodes.download.addEventListener(`click`,opengraph.download,false);
			},
			populate(){
				let 	count=0,
					x=opengraph.settings.left,
					y=opengraph.settings.top,
					icon,src,path;
				for(icon of opengraph.icons){
					if(path)
						path=path.cloneNode(false);
					else path=document.createElementNS(`http://www.w3.org/2000/svg`,`path`);
					if(
						count>0&&
						count%opengraph.settings.columns===0
					){
						x=opengraph.settings.left;
						y+=opengraph.settings.step;
					}else if(
						y>opengraph.settings.top+(opengraph.settings.size+opengraph.settings.centre)*(opengraph.settings.rows-opengraph.settings.centre)/2&&
						y<opengraph.settings.top+(opengraph.settings.size+opengraph.settings.centre)*(opengraph.settings.rows+opengraph.settings.centre/2)&&
						(count-(opengraph.settings.columns-opengraph.settings.centre)/2)%opengraph.settings.columns===0
					){
						count+=opengraph.settings.centre;
						x+=opengraph.settings.step*opengraph.settings.centre;
					}
					path.setAttribute(`fill`,`#`+icon.hex);
					path.setAttribute(`transform`,`translate(${x},${y}) scale(${opengraph.settings.scale},${opengraph.settings.scale})`);
					if(!opengraph.settings.layout)
						path.setAttribute(`d`,icon.data);
					else path.setAttribute(`d`,`M0,0H${opengraph.settings.native}V${opengraph.settings.native}H0Z`);
					nodes.svg.append(path);
					x+=opengraph.settings.step;
					count+=1;
				}
			},
			random(){
				return .5-Math.random();
			}
		};
	opengraph.init();
}