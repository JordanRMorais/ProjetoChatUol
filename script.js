// prompt("Qual o seu nome?");




function exibirMenu (){
    const menu = document.querySelector(".overlay")
    menu.classList.add("visivel");

    menu.addEventListener('click', function (event) {
        if (event.target === menu) {
        menu.classList.remove("visivel");
        }
    });
}