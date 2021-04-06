const simpleicons={
	order:localStorage.getItem(`order`),
	url:new URL(location),
	touch:matchMedia('(hover:none),(pointer:coarse)').matches,
	normalised:false,
	request:document.getElementById(`request`),
	selectors:{
		icon:`svg.icon`,
		item:`li.icon`
	},
	async init(){
		simpleicons.items=document.querySelectorAll(simpleicons.selectors.item);
		simpleicons.copy=await simpleicons.getmodule(`copy`);
		simpleicons.download=await simpleicons.getmodule(`download`);
		simpleicons.mode=await simpleicons.getmodule(`mode`);
		simpleicons.mode.init();
		simpleicons.sort.init();
		simpleicons.search.init();
		document.querySelector(`main`).addEventListener(`click`,simpleicons.handler,false);
		document.body.addEventListener(`keydown`,simpleicons.shortcuts,false);
		document.body.classList.remove(`loading`);
	},
	getcolor(item){
		return item.style.getPropertyValue(`--color-brand`);
	},
	async getmodule(name){
		let module=await import(simpleicons.url.origin+`/scripts/modules/${name}.js`);
		return module[name];
	},
	getsvg(item,fill){
		let svg=item.querySelector(simpleicons.selectors.icon).cloneNode(true);
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
				item=target.closest(simpleicons.selectors.item);
			switch(true){
				case data.copy===`hex`:
					simpleicons.copy(target,simpleicons.getcolor(item));
					break;
				case data.copy===`npm`:
					simpleicons.copy(target,target.firstChild.firstChild.nodeValue);
					break;
				case data.copy===`svg`:
					simpleicons.copy(target,simpleicons.getsvg(item));
					break;
				case data.download===`svg`:
					let svg=simpleicons.getsvg(item,simpleicons.getcolor(item));
					svg=`data:image/svg+xml;utf8,`+svg.replace(/#/,`%23`);
					simpleicons.download(svg,item.dataset.slug+`.svg`);
					break;
			}
		}
	},
	shortcuts(event){
		if(event.ctrlKey)
			switch(event.key.toLowerCase()){
				case`enter`:
					event.preventDefault();
					simpleicons.search.input.focus();
					break;
			}
	},
	search:{
		button:document.getElementById(`clear`),
		input:document.getElementById(`filter`),
		param:`q`,
		init(){
			simpleicons.search.input.disabled=false;
			document.getElementById(`search`).addEventListener(`submit`,simpleicons.search.block,false);
			simpleicons.search.input.addEventListener(`input`,simpleicons.search.debounce,false);
			simpleicons.search.input.addEventListener(`keydown`,simpleicons.search.clear,false);
			simpleicons.search.button.addEventListener(`click`,simpleicons.search.clear,false);
			if(!simpleicons.touch)
				simpleicons.search.input.focus();
			simpleicons.search.query=simpleicons.url.searchParams.get(simpleicons.search.param);
			if(simpleicons.search.query){
				simpleicons.search.input.value=simpleicons.search.query;
				simpleicons.search.filter(simpleicons.search.query,true);
			}
		},
		block(event){
			event.preventDefault();
		},
		clear(event){
			if(!event.keyCode||event.keyCode===27){
				if(!event.keyCode)
					event.preventDefault();
				simpleicons.search.input.value=``;
				simpleicons.search.filter();
				if(!simpleicons.touch)
					simpleicons.search.input.focus();
			}
		},
		debounce(){
			if(simpleicons.search.timer)
				clearTimeout(simpleicons.search.timer);
			simpleicons.search.timer=setTimeout(simpleicons.search.filter,10,simpleicons.search.input.value);
		},
		filter(value=``,init=false){
			value=simpleicons.search.normalise(value.trim());
			document.body.classList.toggle(`filtered`,value);
			if(value){
				if(!init)
					simpleicons.url.searchParams.set(simpleicons.search.param,value);
				if(simpleicons.sort.auto)
					document.body.dataset.order=`relevance`;
				let noresults=true;
				for(let item of simpleicons.items){
					if(!simpleicons.normalised)
						item.dataset.title=simpleicons.search.normalise(item.dataset.title);
					let score=simpleicons.search.score(item.dataset.title,value)+simpleicons.search.score(item.dataset.slug,value);
					item.style.setProperty(`--order-relevance`,score);
					item.classList.toggle(`hide`,!score);
					if(score)
						noresults=false;
				}
				simpleicons.request.classList.toggle(`hide`,!noresults);
				simpleicons.normalised=true;
			}else{
				simpleicons.url.searchParams.delete(simpleicons.search.param);
				document.body.dataset.order=simpleicons.order;
			}
			if(!init)
				history.replaceState(null,window.title,simpleicons.url);
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
				index=name.indexOf(letter,index)+1;
				if(index===0)
					return index;
				score+=index;
				index++;
			}
			return score;
		}
	},
	sort:{
		init(){
			if(simpleicons.order){
				document.body.dataset.order=simpleicons.order;
				simpleicons.sort.auto=false;
			}else{
				simpleicons.order=document.body.dataset.order;
				simpleicons.sort.auto=true;
			}
			document.getElementById(`sort`).addEventListener(`click`,simpleicons.sort.change,false);
		},
		change(event){
			let target=event.target.closest(`button[data-order]`);
			if(target){
				let order=target.dataset.order;
				if(order!==document.body.dataset.order){
					document.body.dataset.order=order;
					if(order!==`relevance`){
						simpleicons.order=order;
						localStorage.setItem(`order`,simpleicons.order);
						simpleicons.sort.auto=false;
					}else simpleicons.sort.auto=true;
				}
			}
		}
	}
};
simpleicons.init();