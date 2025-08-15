// Room type to image mapping for beautiful hotel room display
export interface RoomImage {
  url: string;
  alt: string;
  description: string;
}

export const ROOM_IMAGES: Record<string, RoomImage> = {
  SINGLE: {
    url: '/images/rooms/single-room.svg',
    alt: 'Cozy single room with modern amenities',
    description: 'Perfect for solo travelers with all essential comforts'
  },
  DOUBLE: {
    url: '/images/rooms/double-room.svg',
    alt: 'Spacious double room with elegant furnishings',
    description: 'Ideal for couples with premium bedding and amenities'
  },
  SUITE: {
    url: '/images/rooms/suite-room.svg',
    alt: 'Luxurious suite with separate living area',
    description: 'Premium accommodation with extra space and luxury features'
  },
  DELUXE: {
    url: '/images/rooms/deluxe-room.svg',
    alt: 'Deluxe room with premium amenities and views',
    description: 'Exceptional comfort with enhanced features and stunning views'
  },
  FAMILY: {
    url: '/images/rooms/double-room.svg', // Use double room image for family
    alt: 'Spacious family room with multiple beds',
    description: 'Perfect for families with comfortable sleeping arrangements'
  },
  EXECUTIVE: {
    url: '/images/rooms/suite-room.svg', // Use suite image for executive
    alt: 'Executive room with business amenities',
    description: 'Professional accommodation with work-friendly features'
  },
  PRESIDENTIAL: {
    url: '/images/rooms/deluxe-room.svg', // Use deluxe image for presidential
    alt: 'Presidential suite with ultimate luxury',
    description: 'The pinnacle of luxury with exclusive amenities and service'
  }
};

// Fallback image for unknown room types
export const DEFAULT_ROOM_IMAGE: RoomImage = {
  url: '/images/rooms/default-room.svg',
  alt: 'Beautiful hotel room',
  description: 'Comfortable accommodation with modern amenities'
};

// Get room image based on room type
export function getRoomImage(roomType: string): RoomImage {
  const upperType = roomType.toUpperCase();
  return ROOM_IMAGES[upperType] || DEFAULT_ROOM_IMAGE;
}

// Get random room image for variety (useful for testing)
export function getRandomRoomImage(): RoomImage {
  const types = Object.keys(ROOM_IMAGES);
  const randomType = types[Math.floor(Math.random() * types.length)];
  return ROOM_IMAGES[randomType] || DEFAULT_ROOM_IMAGE;
}
