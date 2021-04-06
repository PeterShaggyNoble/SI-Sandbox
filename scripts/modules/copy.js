export const copy=(target,value)=>{
	try{
		navigator.clipboard.writeText(value);
	}catch(err){
		let input=document.createElement(`input`);
		input.value=value;
		document.body.append(input);
		input.select();
		document.execCommand(`copy`);
		input.remove();
	}
	target.classList.add(`copied`);
	target.focus();
	setTimeout(()=>target.classList.remove('copied'),1000)
};