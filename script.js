const si={
	order:localStorage.getItem(`order`),
	theme:localStorage.getItem(`theme`),
	url:new URL(location),
	normalised:false,
	request:document.getElementById(`request`),
	init(){
		si.items=document.querySelectorAll(`#grid>li.icon`);
		si.mode.init();
		si.sort.init();
		si.search.init();
		document.getElementById(`grid`).addEventListener(`click`,si.handler,false);
		document.body.classList.remove(`loading`);
	},
	copy(target,value){
		let tmp=si.search.input.value;
		si.search.input.value=value;
		try{
			navigator.clipboard.writeText(si.search.input.value);
		}catch(err){
			si.search.input.select();
			document.execCommand(`copy`);
		}
		si.search.input.value=tmp;
		target.classList.add(`copied`);
		setTimeout(()=>target.classList.remove('copied'),1000)
		target.focus();
	},
	download(data,name){
		let link=document.createElement(`a`);
		link.download=name;
		link.href=data;
		document.body.append(link);
		link.click();
		link.remove();
		URL.revokeObjectURL(link);
	},
	getcolor(item){
		return item.style.getPropertyValue(`--color-brand`);
	},
	getsvg(item,fill){
		let svg=item.querySelector(`svg.icon`).cloneNode(true);
		svg.removeAttribute(`class`);
		if(fill)
			svg.setAttribute(`fill`,fill);
		svg.setAttribute(`xmlns`,`http://www.w3.org/2000/svg`);
		svg.querySelector(`path`).removeAttribute(`id`);
		return svg.outerHTML;
	},
	handler(event){
		let target=event.target.closest(`button`);
		if(target){
			let	data=target.dataset,
				item=target.closest(`li.icon`);
			switch(true){
				case data.copy===`hex`:
					si.copy(target,si.getcolor(item));
					break;
				case data.copy===`svg`:
					si.copy(target,si.getsvg(item));
					break;
				case data.download===`svg`:
					let svg=si.getsvg(item,si.getcolor(item));
					svg=`data:image/svg+xml;utf8,`+svg.replace(/#/,`%23`);
					si.download(svg,item.dataset.slug+`.svg`);
					break;
			}
		}
	},
	mode:{
		init(){
			if(si.theme)
				document.body.dataset.theme=si.theme;
			else si.theme=document.body.dataset.theme;
			document.getElementById(`theme`).addEventListener(`click`,si.mode.change,false);
		},
		change(event){
			let target=event.target.closest(`button[data-theme]`);
			if(target&&target.dataset.theme!==si.theme){
				si.theme=target.dataset.theme;
				document.body.dataset.theme=si.theme;
				localStorage.setItem(`theme`,si.theme);
			}
		}
	},
	search:{
		button:document.getElementById(`clear`),
		input:document.getElementById(`filter`),
		init(){
			si.search.input.disabled=false;
			si.search.input.addEventListener(`input`,si.search.debounce,false);
			si.search.input.addEventListener(`keydown`,si.search.clear,false);
			si.search.button.addEventListener(`click`,si.search.clear,false);
			if(!matchMedia('(hover: none),(pointer: coarse)').matches)
				si.search.input.focus();
			si.search.query=si.url.searchParams.get(`q`);
			if(si.search.query){
				si.search.input.value=si.search.query;
				si.search.filter(si.search.query,true);
			}
		},
		clear(event){
			if(!event.keyCode||event.keyCode===27){
				si.search.input.value=``;
				si.search.filter();
				si.search.input.focus();
			}
		},
		debounce(){
			if(si.search.timer)
				clearTimeout(si.search.timer);
			si.search.timer=setTimeout(si.search.filter,10,si.search.input.value);
		},
		filter(value=``,init=false){
			value=si.search.normalise(value.trim());
			document.body.classList.toggle(`filtered`,value);
			if(value){
				if(!init)
					si.url.searchParams.set(`q`,value);
				if(si.sort.auto)
					document.body.dataset.order=`relevance`;
				let request=true;
				for(let item of si.items){
					if(!si.normalised)
						item.dataset.title=si.search.normalise(item.dataset.title);
					let score=si.search.score(item.dataset.title,value)+si.search.score(item.dataset.slug,value);
					item.style.setProperty(`--order-relevance`,score);
					item.classList.toggle(`hide`,!score);
					if(score)
						request=false;
				}
				si.request.classList.toggle(`hide`,!request);
				si.normalised=true;
			}else{
				si.url.searchParams.delete(`q`);
				document.body.dataset.order=si.order;
			}
			if(!init)
				history.replaceState(null,window.title,si.url);
		},
		normalise(value){
			return	value.toLowerCase()
				.replace(/đ/g,`d`)
				.replace(/ħ/g,`h`)
				.replace(/ı/g,`i`)
				.replace(/ĸ/g,`k`)
				.replace(/ŀ/g,`l`)
				.replace(/ł/g,`l`)
				.replace(/ß/g,`ss`)
				.replace(/ŧ/g,`t`)
				.normalize(`NFD`)
				.replace(/[\u0300-\u036f]/g,``);
		},
		score(name,query){
			let	score=name.length-query.length,
				index=0;
			for(let letter of query){
				index=name.indexOf(letter,index);
				if(index===-1)
					return 0;
				score+=index;
				index++;
			}
			return score+1;
		}
	},
	sort:{
		init(){
			if(si.order){
				document.body.dataset.order=si.order;
				si.sort.auto=false;
			}else{
				si.order=document.body.dataset.order;
				si.sort.auto=true;
			}
			document.getElementById(`sort`).addEventListener(`click`,si.sort.change,false);
		},
		change(event){
			let target=event.target.closest(`button[data-order]`);
			if(target){
				let order=target.dataset.order;
				if(order!==document.body.dataset.order){
					document.body.dataset.order=order;
					if(order!==`relevance`){
						si.order=order;
						localStorage.setItem(`order`,si.order);
						si.sort.auto=false;
						console.log(order);
					}else si.sort.auto=true;
				}
			}
		}
	}
};
si.init();