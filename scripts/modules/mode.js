export const mode={
	init(){
		simpleicons.theme=localStorage.getItem(`theme`);
		if(simpleicons.theme)
			document.body.dataset.theme=simpleicons.theme;
		else simpleicons.theme=document.body.dataset.theme;
		document.getElementById(`theme`).addEventListener(`click`,simpleicons.mode.change,false);
	},
	change(event){
		let target=event.target.closest(`button[data-theme]`);
		if(target&&target.dataset.theme!==simpleicons.theme){
			simpleicons.theme=target.dataset.theme;
			document.body.dataset.theme=simpleicons.theme;
			localStorage.setItem(`theme`,simpleicons.theme);
		}
	}
};