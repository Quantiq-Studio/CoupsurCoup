
export const avatarImages = [
  "/avatars/avatar-1.png",
  "/avatars/avatar-2.png",
  "/avatars/avatar-3.png",
  "/avatars/avatar-4.png", 
  "/avatars/avatar-5.png",
  "/avatars/avatar-6.png",
  "/avatars/avatar-7.png",
  "/avatars/avatar-8.png",
  "/avatars/avatar-9.png",
  "/avatars/avatar-10.png",
  "/avatars/avatar-11.png",
  "/avatars/avatar-12.png",
];

export const badgeImages = [
  "/badges/badge-1.png",
  "/badges/badge-2.png",
  "/badges/badge-3.png",
  "/badges/badge-4.png",
  "/badges/badge-5.png",
  "/badges/badge-6.png",
];

export const categoryImages = {
  history: "/categories/history.jpg",
  science: "/categories/science.jpg",
  geography: "/categories/geography.jpg",
  sports: "/categories/sports.jpg",
  movies: "/categories/movies.jpg",
  music: "/categories/music.jpg",
  literature: "/categories/literature.jpg",
  art: "/categories/art.jpg",
  food: "/categories/food.jpg",
  technology: "/categories/technology.jpg",
};

export const getRandomAvatar = (): string => {
  const randomIndex = Math.floor(Math.random() * avatarImages.length);
  return avatarImages[randomIndex];
};
