export interface Ride {
  id: string;
  title: string;
  bike: string;
  googleMapUrl?: string;
  coordinates: [number, number]; // [longitude, latitude]
  stats: {
    distance: string;
    duration: string;
    type: string;
  };
  waypoints: string[];
  links: {
    youtube?: string;
    instagram?: string;
  };
  contentType: {
    youtube?: "Shorts" | "Video";
    instagram?: "Reel" | "Post" | "Highlight";
  };
}
