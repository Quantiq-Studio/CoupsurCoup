export const avatarSeeds = [
  'Foxie', 'CoolKid', 'PandaFace', 'BotX', 'Alienette', 'Cactus',
  'Smiley', 'BurgerMan', 'RainbowZ', 'FunkyMonkey', 'NekoChan', 'PirateJoe'
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

export const getAvatarUrl = (seed: string) =>
    `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${seed}`;