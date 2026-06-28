const unsplash = (photoId: string, width: number) =>
  `https://images.unsplash.com/photo-${photoId}?ixlib=rb-4.0.3&auto=format&fit=crop&w=${width}&q=80`;

export const storeImages = {
  brandStory: unsplash('1526506118085-60ce8714f8c5', 1200),
} as const;
