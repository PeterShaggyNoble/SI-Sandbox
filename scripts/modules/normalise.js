export const normalise=(value)=>{
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
};