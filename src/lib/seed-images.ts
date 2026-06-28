const unsplash = (photoId: string, width: number) =>
  `https://images.unsplash.com/photo-${photoId}?w=${width}&q=80&auto=format&fit=crop`;

export const storeImages = {
  brandStory: unsplash('1574680096145-d05b8e5ed4fc', 800),
} as const;
