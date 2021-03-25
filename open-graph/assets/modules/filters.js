export const filters={
	getrgb(hex){
		let 	r=parseInt(hex.substr(0,2),16)/255,
			g=parseInt(hex.substr(2,2),16)/255,
			b=parseInt(hex.substr(4,2),16)/255;
		return{
			r,
			g,
			b
		};
	},
	length(data,limit){
		return data.length>limit;
	},
	gethsl(hex){
		/* adapted from https://www.npmjs.com/package/tinycolor2 */
		let 	{r,g,b}=this.getrgb(hex),
			max=Math.max(r,g,b),
			min=Math.min(r,g,b),
			delta=max-min,
			h=0,
			s=0,
			l=(max+min)/2;
		if(max!==min){
			s=l>.5?delta/(2-max-min):delta/(max+min);
			switch(max){
				case r:
					h=(g-b)/delta+(g<b?6:0);
					break;
				case g:
					h=(b-r)/delta+2;
					break;
				case b:
					h=(r-g)/delta+4;
					break;
			}
		}
		return{
			hue:h*60,
			saturation:s*100,
			lightness:l*100
		};
	},
	hsl(hex,limit){
		let hsl=this.gethsl(hex);
		return hsl.hue<limit.hue||hsl.saturation<limit.saturation||hsl.lightness<limit.lightness;
	},
	getluminance(hex){
		let {r,g,b}=this.getrgb(hex);
		return r*76.245+g*149.685+b*29.07;
	},
	luminance(hex,limit){
		return this.getluminance(hex)<limit;
	},
	getratio(path){
		let 	box=path.getBBox(),
			width=box.width,
			height=box.height;
		return width/height;
	},
	ratio(data,limit,svg){
		let path=document.createElementNS(`http://www.w3.org/2000/svg`,`path`);
		path.setAttribute(`d`,data);
		svg.prepend(path);
		let ratio=this.getratio(path);
		path.remove();
		return ratio>limit;
	}
};