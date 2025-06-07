const track = document.querySelector(".carousel-track");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

const items = track.querySelectorAll("img");
const itemWidth = items[0].offsetWidth + 20; // 20px gap
let currentIndex = 0;

function updateCarousel() {
  const maxIndex = items.length - 4; // Mostrar 4 a la vez
  currentIndex = Math.max(0, Math.min(currentIndex, maxIndex));
  const offset = -currentIndex * itemWidth;
  track.style.transform = `translateX(${offset}px)`;
}

prevBtn.addEventListener("click", () => {
  currentIndex--;
  updateCarousel();
});

nextBtn.addEventListener("click", () => {
  currentIndex++;
  updateCarousel();
});

window.addEventListener("resize", () => {
  updateCarousel();
});

updateCarousel();
