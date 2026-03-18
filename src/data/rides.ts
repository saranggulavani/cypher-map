export interface Ride {
  id: string;
  title: string;
  bike: string;
  coordinates: [number, number]; // [longitude, latitude]
  stats: {
    distance: string;
    duration: string;
    type: string;
  };
  links: {
    youtube?: string;
    instagram?: string;
  };
  contentType: {
    youtube?: "Shorts" | "Video";
    instagram?: "Reel" | "Post" | "Highlight";
  };
}

export const rides: Ride[] = [
  {
    id: "goa-first-ride",
    title: "GOA - First Ride",
    bike: "Super Meteor 650",
    coordinates: [15.524429083057536, 73.7679265954954], // GOA
    stats: { distance: "840 km", duration: "18h 17m", type: "Sunny" },
    links: {
      instagram:
        "https://www.instagram.com/reel/DH5LTWVNZXy/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
      youtube: "https://youtube.com/shorts/oBx2_qA41v0?si=HVxuqX7Sdqa9RWzD",
    },
    contentType: {
      instagram: "Reel",
      youtube: "Shorts",
    },
  },
  {
    id: "velas-coastal-ride",
    title: "Velas Coastal Ride",
    bike: "Super Meteor 650",
    coordinates: [18.201602430477518, 72.97437112040053], // Velas
    stats: { distance: "370 km", duration: "6h 27m", type: "Sunny" },
    links: {
      instagram:
        "https://www.instagram.com/reel/DS5HyNFDbws/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
      youtube: "https://youtube.com/shorts/S_KDCXlE85w?si=yViu7iJwd-eb_vzU",
    },
    contentType: {
      instagram: "Reel",
      youtube: "Shorts",
    },
  },
  {
    id: "satara-ride",
    title: "Satara Snacks Ride",
    bike: "Super Meteor 650",
    coordinates: [17.717139281603274, 74.00532870321828], // Satara
    stats: { distance: "237 km", duration: "4h 16m", type: "Sunny / Cloudy" },
    links: {
      instagram:
        "https://www.instagram.com/reel/DUsAmqlDX5L/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
      youtube: "https://youtube.com/shorts/jaAL_bmc5tc?si=tDz1Vs0BErmOAViC",
    },
    contentType: {
      instagram: "Reel",
      youtube: "Shorts",
    },
  },
  {
    id: "tamhini-ride",
    title: "Tamhini Ride",
    bike: "Super Meteor 650",
    coordinates: [18.42465897622231, 73.36089482534888], // Tamhini
    stats: { distance: "185 km", duration: "3h 14m", type: "Sunny / Cloudy" },
    links: {
      instagram:
        "https://www.instagram.com/reel/DTQQsjRDSHC/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
    },
    contentType: {
      instagram: "Reel",
    },
  },
  {
    id: "jungle-jetty",
    title: "Jungle Jetty Ferry",
    bike: "Super Meteor 650",
    coordinates: [18.27937495240356, 72.99264547513071], // Jungle Jetty
    stats: { distance: "163 km", duration: "4h 24m", type: "Sunny" },
    links: {
      instagram:
        "https://www.instagram.com/reel/DTF4p1bjQcp/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
    },
    contentType: {
      instagram: "Reel",
    },
  },
  {
    id: "lavasa-city",
    title: "Lavasa City",
    bike: "Super Meteor 650",
    coordinates: [18.421881236418997, 73.50634651762562], // Lavasa City
    stats: { distance: "65 km", duration: "2h 22m", type: "Cloudy" },
    links: {
      instagram:
        "https://www.instagram.com/stories/highlights/17938493954962163/",
    },
    contentType: {
      instagram: "Highlight",
    },
  },
];
