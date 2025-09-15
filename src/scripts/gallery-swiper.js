const swiper = new Swiper(".gallery__swiper", {
  direction: "horizontal",
  loop: true,
  spaceBetween: 60,
  autoplay: {
    delay: 3000,
    disableOnInteraction: false,
  },

  navigation: {
    nextEl: ".gallery-swiper__button-next",
    prevEl: ".gallery-swiper__button-prev",
  },
});
