"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface CarouselImage {
  id: string;
  imageUrl: string;
  altText?: string | null;
  color?: string | null;
}

interface BuildGalleryOptions {
  color?: string;
  limit?: number;
}

interface DraggableImageCarouselProps {
  images: CarouselImage[];
  alt: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
  aspectClassName?: string;
  showDots?: boolean;
  onNavigate?: () => void;
}

const SWIPE_THRESHOLD = 48;

export function DraggableImageCarousel({
  images,
  alt,
  priority = false,
  sizes = "(max-width: 1024px) 100vw, 50vw",
  className,
  aspectClassName = "aspect-[3/4]",
  showDots = true,
  onNavigate,
}: DraggableImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const didDragRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);

  const slideCount = images.length;
  const canSwipe = slideCount > 1;

  const goTo = useCallback(
    (index: number) => {
      if (slideCount === 0) return;
      setActiveIndex(Math.max(0, Math.min(index, slideCount - 1)));
    },
    [slideCount],
  );

  useEffect(() => {
    setActiveIndex(0);
    setDragOffset(0);
  }, [images]);

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!canSwipe) return;

    pointerIdRef.current = event.pointerId;
    startXRef.current = event.clientX;
    didDragRef.current = false;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging || pointerIdRef.current !== event.pointerId) return;

    const delta = event.clientX - startXRef.current;
    if (Math.abs(delta) > 6) {
      didDragRef.current = true;
    }
    setDragOffset(delta);
  }

  function finishDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging || pointerIdRef.current !== event.pointerId) return;

    if (dragOffset <= -SWIPE_THRESHOLD) {
      goTo(activeIndex + 1);
    } else if (dragOffset >= SWIPE_THRESHOLD) {
      goTo(activeIndex - 1);
    }

    setDragOffset(0);
    setIsDragging(false);
    pointerIdRef.current = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleClick() {
    if (didDragRef.current) return;
    onNavigate?.();
  }

  if (slideCount === 0) {
    return null;
  }

  return (
    <div className={cn("relative overflow-hidden bg-yora-sand", className)}>
      <div
        className={cn(
          "relative touch-pan-y select-none",
          aspectClassName,
          canSwipe && (isDragging ? "cursor-grabbing" : "cursor-grab"),
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onClick={handleClick}
        role={onNavigate ? "button" : undefined}
        tabIndex={onNavigate ? 0 : undefined}
        onKeyDown={
          onNavigate
            ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onNavigate();
                }
              }
            : undefined
        }
      >
        <div
          className={cn(
            "flex h-full",
            !isDragging && "transition-transform duration-300 ease-out",
          )}
          style={{
            transform: `translateX(calc(-${activeIndex * 100}% + ${dragOffset}px))`,
          }}
        >
          {images.map((image, index) => (
            <div key={image.id} className="relative h-full w-full shrink-0">
              <Image
                src={image.imageUrl}
                alt={image.altText ?? alt}
                fill
                priority={priority && index === 0}
                draggable={false}
                className="pointer-events-none object-cover"
                sizes={sizes}
              />
            </div>
          ))}
        </div>
      </div>

      {showDots && canSwipe && (
        <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              aria-label={`Ir para foto ${index + 1}`}
              onClick={(event) => {
                event.stopPropagation();
                goTo(index);
              }}
              className={cn(
                "h-1.5 rounded-full transition-all",
                activeIndex === index
                  ? "w-5 bg-yora-cream"
                  : "w-1.5 bg-yora-cream/50",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function buildProductGalleryImages(
  coverImage: string,
  name: string,
  images?: CarouselImage[],
  options?: BuildGalleryOptions,
): CarouselImage[] {
  const allImages =
    images && images.length > 0
      ? [...images].sort((a, b) => {
          const orderA = "displayOrder" in a ? Number(a.displayOrder ?? 0) : 0;
          const orderB = "displayOrder" in b ? Number(b.displayOrder ?? 0) : 0;
          return orderA - orderB;
        })
      : [];

  const hasColorTaggedImages = allImages.some((image) => image.color);

  let filtered = allImages;

  if (options?.color && hasColorTaggedImages) {
    filtered = allImages.filter(
      (image) => !image.color || image.color === options.color,
    );
  }

  const mapped = filtered.map((image) => ({
    id: image.id,
    imageUrl: image.imageUrl,
    altText: image.altText,
    color: image.color,
  }));

  const unique = mapped.filter(
    (image, index, list) =>
      list.findIndex((item) => item.imageUrl === image.imageUrl) === index,
  );

  const gallery =
    unique.length > 0
      ? unique
      : [
          {
            id: "cover",
            imageUrl: coverImage,
            altText: name,
            color: null,
          },
        ];

  const coverInGallery = gallery.some((image) => image.imageUrl === coverImage);
  const skipCoverPrepend = Boolean(options?.color && hasColorTaggedImages);

  const withCover =
    coverInGallery || skipCoverPrepend
      ? gallery
      : [
          { id: "cover", imageUrl: coverImage, altText: name, color: null },
          ...gallery,
        ];

  if (!options?.limit) {
    return withCover;
  }

  return withCover.slice(0, options.limit);
}
