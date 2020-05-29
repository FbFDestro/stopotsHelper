const titles = document.getElementsByClassName('title-menu');
const details = document.getElementsByClassName('box-details');
const image = document.getElementById('mainImage');

const imgsUrl = [
  'stopots_respostas.jpg',
  'stopots_adicionar_dicionario.jpg',
  'stopots_gerenciar_dicionar_respostas.jpg',
  'stopots_exportar_importar_respostas.jpg',
  'stopots_configurar_ativar_respostas.jpg',
];

function addTitleOnClick() {
  for (let i = 0; i < titles.length; i++) {
    const title = titles[i];
    title.onclick = () => {
      toggleMenu(i);
    };
  }
}

addTitleOnClick();

function toggleMenu(index) {
  for (let i = 0; i < titles.length; i++) {
    if (i != index) {
      titles[i].classList.remove('active');
      details[i].classList.add('hidden');
    } else if (!titles[i].classList.contains('active')) {
      image.src = 'imgs/' + imgsUrl[i];
      titles[i].classList.add('active');
      details[i].classList.remove('hidden');
    }
  }
}
