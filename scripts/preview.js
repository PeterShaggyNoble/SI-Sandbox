const simpleicons={
	normalised:false,
	async init(){
		simpleicons.copy=await simpleicons.getmodule(`copy`);
		simpleicons.download=await simpleicons.getmodule(`download`);
		simpleicons.mode=await simpleicons.getmodule(`mode`);
		simpleicons.mode.init();
		simpleicons.normalise=await simpleicons.getmodule(`normalise`);
		simpleicons.preview.init();
		document.querySelector(`main`).addEventListener(`click`,simpleicons.handler,false);
		document.getElementById(`filter`).disabled=false;
		document.body.classList.remove(`loading`);
	},
	async getmodule(name){
		let module=await import(`../scripts/modules/${name}.js`);
		return module[name];
	},
	getluminance(hex){
		return parseInt(hex.substr(0,2),16)*.299+parseInt(hex.substr(2,2),16)*.587+parseInt(hex.substr(4,2),16)*.114;
	},
	getslug(title){
		return	title.toLowerCase()
			.replace(/\+/g,`plus`)
			.replace(/^\./,`dot-`)
			.replace(/\.$/,`-dot`)
			.replace(/\./g,`-dot-`)
			.replace(/^&/,`and-`)
			.replace(/&$/,`-and`)
			.replace(/&/g,`-and-`)
			.replace(/đ/g,`d`)
			.replace(/ħ/g,`h`)
			.replace(/ı/g,`i`)
			.replace(/ĸ/g,`k`)
			.replace(/ŀ/g,`l`)
			.replace(/ł/g,`l`)
			.replace(/ß/g,`ss`)
			.replace(/ŧ/g,`t`)
			.normalize(`NFD`)
			.replace(/[\u0300-\u036f]/g,``)
			.replace(/[^a-z0-9\-]/g,``);
	},
	handler(event){
		let target=event.target.closest(`button`);
		if(target){
			let data=target.dataset;
			switch(true){
				case data.action===`download`:
					simpleicons.download(`data:image/svg+xml;utf8,<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>${(simpleicons.preview.text.title.textContent||`Unknown`)} icon</title><path d="${simpleicons.preview.shapes.path.getAttribute(`d`)}"/></svg>`,simpleicons.preview.text.slug.textContent);
					break;
				case data.action===`save`:
					simpleicons.preview.canvas.toBlob(simpleicons.preview.save);
					break;
				case data.action===`upload`:
					simpleicons.preview.upload();
					break;
				case data.copy===`npm`:
					simpleicons.copy(target,target.firstChild.firstChild.nodeValue);
					break;
			}
		}
	},
	preview:{
		image:new Image(),
		canvas:document.getElementById(`canvas`),
		holder:document.getElementById(`holder`),
		list:document.getElementById(`list`),
		svg:document.getElementById(`svg`),
		colors:{
			dark:getComputedStyle(document.documentElement).getPropertyValue(`--color-dark`).slice(1),
			light:getComputedStyle(document.documentElement).getPropertyValue(`--color-light`).slice(1)
		},
		inputs:{
			color:document.getElementById(`color`),
			data:document.getElementById(`data`),
			name:document.getElementById(`name`)
		},
		shapes:{
			background:document.getElementById(`background`),
			path:document.querySelector(`#path>path`)
		},
		shields:{
			white:document.querySelector(`#shieldwhite>path`),
			color:document.querySelector(`#shieldcolor>path`),
			rects:document.querySelectorAll(`#shields rect.rect`),
			highlights:document.querySelectorAll(`#shields text.highlight`),
			text:document.querySelectorAll(`#shields text.text`),
			colors:{}
		},
		text:{
			hex:document.getElementById(`hex`),
			slug:document.getElementById(`slug`),
			title:document.getElementById(`title`)
		},
		init(){
			simpleicons.preview.items=simpleicons.preview.list.querySelectorAll(`li`);
			simpleicons.preview.context=simpleicons.preview.canvas.getContext(`2d`);
			simpleicons.preview.height=simpleicons.preview.canvas.height;
			simpleicons.preview.width=simpleicons.preview.canvas.width;
			simpleicons.preview.image.addEventListener(`load`,simpleicons.preview.update,false);
			simpleicons.preview.draw();
			document.getElementById(`generator`).addEventListener(`input`,simpleicons.preview.debounce,false);
			simpleicons.preview.list.addEventListener(`click`,simpleicons.preview.autocomplete,false);
			simpleicons.preview.inputs.name.addEventListener(`blur`,simpleicons.preview.hidelist,false);
			for(let input in simpleicons.preview.inputs)
				if(simpleicons.preview.inputs.hasOwnProperty(input))
					simpleicons.preview.inputs[input].disabled=false;
		},
		autocomplete(event){
			let target=event.target.closest(`li`);
			if(target){
				let data=target.firstChild.firstChild.getAttribute(`d`);
				simpleicons.preview.inputs.data.value=data;
				simpleicons.preview.setpath(data);
				simpleicons.preview.populate(null,target);
				simpleicons.preview.inputs.name.focus();
				simpleicons.preview.hidelist();
				simpleicons.preview.list.scrollTo(0,0);
			}
		},
		debounce(event){
			if(simpleicons.preview.timer)
				clearTimeout(simpleicons.preview.timer);
			simpleicons.preview.timer=setTimeout(simpleicons.preview.render,10,event);
		},
		draw(){
			let xml=new XMLSerializer();
			simpleicons.preview.image.src=URL.createObjectURL(new Blob([xml.serializeToString(simpleicons.preview.svg)],{
				type:`image/svg+xml;charset=utf-8`
			}));
		},
		getcolor(hex){
			if(simpleicons.getluminance(hex)<160){
				simpleicons.preview.shields.colors.highlight=`010101`;
				simpleicons.preview.shields.colors.text=`ffffff`;
				return simpleicons.preview.colors.light;
			}else{
				simpleicons.preview.shields.colors.highlight=`cccccc`;
				simpleicons.preview.shields.colors.text=`333333`;
				return simpleicons.preview.colors.dark;
			}
		},
		hidelist(event){
			if(!event||event.relatedTarget!==simpleicons.preview.list)
				simpleicons.preview.list.classList.add(`hide`);
		},
		load(event){
			let 	parser=new DOMParser(),
				svg=parser.parseFromString(event.target.result,`image/svg+xml`),
				paths=svg.querySelectorAll(`path`),
				data=``;
			if(paths.length){
				for(let path of paths)
					data+=path.getAttribute(`d`);
				if(data){
					simpleicons.preview.inputs.data.value=data;
					let	icon=simpleicons.preview.populate(data),
						title=svg.querySelector(`title`);
					if(!icon&&title){
						title=title.firstChild.nodeValue.replace(/ icon$/,``);
						simpleicons.preview.inputs.name.value=title;
					}
					simpleicons.preview.render();
				}else alert(`No path data detcted`);
			}else alert(`No path tag detcted`);
		},
		populate(data,icon){
			if(!icon)
				for(let item of simpleicons.preview.items)
					if(item.firstChild.firstChild.getAttribute(`d`)===data){
						icon=item;
						break;
					}
			if(icon){
				let	hex=icon.dataset.hex,
					title=icon.dataset.title;
				simpleicons.preview.inputs.color.value=hex;
				simpleicons.preview.setcolor(hex);
				simpleicons.preview.inputs.name.value=title;
				simpleicons.preview.settitle(title,icon.dataset.slug);
				return true;
			}
			return false;
		},
		read(event){
			let	input=event.target,
				file=input.files[0];
			if(file)
				if(file.type===`image/svg+xml`){
					let reader=new FileReader();
					reader.addEventListener(`load`,simpleicons.preview.load,false);
					reader.name=file.name.replace(/\..+?$/,``);
					reader.readAsText(file);
				}else alert(`Invalid file type`);
			input.remove();
		},
		render(event){
			let	trusted=event&&event.isTrusted,
				target=event&&event.target;
			if(!trusted||target===simpleicons.preview.inputs.color){
				if(trusted&&!target.validity.valid)
					return;
				simpleicons.preview.setcolor(simpleicons.preview.inputs.color.value.trim());
			}
			if(!trusted||target===simpleicons.preview.inputs.data){
				if(trusted&&!target.validity.valid)
					return;
				let value=simpleicons.preview.inputs.data.value.trim();
				simpleicons.preview.setpath(value);
				if(trusted)
					simpleicons.preview.populate(value);
			}
			if(!trusted||target===simpleicons.preview.inputs.name){
				let value=simpleicons.preview.inputs.name.value.trim();
				if(simpleicons.preview.inputs.name.validity.valid)
					simpleicons.preview.settitle(value);
				if(trusted){
					simpleicons.preview.holder.innerText=value;
					simpleicons.preview.search(simpleicons.normalise(value));
				}
			}
			simpleicons.preview.draw();
		},
		save(blob){
			simpleicons.download(URL.createObjectURL(blob),simpleicons.preview.text.slug.textContent.replace(/svg$/,`png`))
			URL.revokeObjectURL(blob);
		},
		search(value){
			let	count=0,
				show;
			if(value){
				for(let item of simpleicons.preview.items){
					if(!simpleicons.normalised)
						item.dataset.name=simpleicons.normalise(item.dataset.title);
					show=item.dataset.name.startsWith(value);
					item.classList.toggle(`hide`,!show);
					count+=show;
				}
				simpleicons.preview.list.style.transform=`translatex(${simpleicons.preview.holder.scrollWidth}px)`;
				simpleicons.normalised=true;
			}
			simpleicons.preview.list.classList.toggle(`hide`,!count);
			if(!count)
				simpleicons.preview.list.scrollTo(0,0);
		},
		setcolor(hex){
			hex=	hex.toUpperCase()
				.replace(/^#/,``)
				.replace(/^(.)(.)(.)$/,`$1$1$2$2$3$3`);
			simpleicons.preview.svg.setAttribute(`fill`,`#`+simpleicons.preview.getcolor(hex));
			simpleicons.preview.shapes.background.setAttribute(`fill`,`#`+hex);
			simpleicons.preview.text.hex.textContent=hex;
			simpleicons.preview.shields.color.setAttribute(`fill`,`#`+hex);
			for(let rect of simpleicons.preview.shields.rects)
				rect.setAttribute(`fill`,`#`+hex);
			for(let highlight of simpleicons.preview.shields.highlights)
				highlight.setAttribute(`fill`,`#`+simpleicons.preview.shields.colors.highlight);
			for(let text of simpleicons.preview.shields.text)
				text.setAttribute(`fill`,`#`+simpleicons.preview.shields.colors.text);
		},
		setpath(data){
			simpleicons.preview.shapes.path.setAttribute(`d`,data);
			simpleicons.preview.shields.white.setAttribute(`d`,data);
			simpleicons.preview.shields.color.setAttribute(`d`,data);
		},
		settitle(name,slug){
			simpleicons.preview.text.title.textContent=name;
			simpleicons.preview.text.slug.textContent=(slug||simpleicons.getslug(name))+`.svg`;
		},
		update(){
			simpleicons.preview.context.clearRect(0,0,simpleicons.preview.width,simpleicons.preview.height);
			simpleicons.preview.context.drawImage(simpleicons.preview.image,0,0);
			URL.revokeObjectURL(simpleicons.preview.image);
		},
		upload(){
			let input=document.querySelector(`input[type=file]`);
			if(!input){
				input=document.createElement(`input`);
				input.accept=`.svg,image/svg+xml`;
				input.type=`file`;
				input.addEventListener(`change`,simpleicons.preview.read,false);
				document.body.append(input);
			}
			input.click();
		}
	}
};
simpleicons.init();