export const download=(data,name)=>{
	let link=document.createElement(`a`);
	link.download=name;
	link.href=data;
	document.body.append(link);
	link.click();
	link.remove();
	URL.revokeObjectURL(link);
};