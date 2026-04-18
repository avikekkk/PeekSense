export interface GridItem {
  image: string;
  caption: string;
}

export interface GalleryConfig {
  bodyClass: string;
  items: GridItem[];
}

const captions = [
  'Zorith - L91',
  'Mykar - L27',
  'Thalon - V75',
  'Vexra - N22',
  'Drosin - X29',
  'Ryndel - Y52',
  'Korin - T18',
  'Nymera - L50',
  'Lektar - X43',
  'Fexil - R50',
  'Jaleth - N49',
  'Torvik - Y15',
  'Lumora - X82',
  'Zekron - X99',
  'Brynd - Q89',
  'Solmir - Q91',
  'Dareon - N38',
  'Noxil - T76',
  'Kairon - R28',
  'Voric - T97',
] as const;

const repeatItems = (count: number): GridItem[] =>
  Array.from({ length: count }, (_, index) => {
    const offset = index % captions.length;

    return {
      image: `/assets/${offset + 1}.webp`,
      caption: captions[offset],
    };
  });

export const gallery: GalleryConfig = {
  bodyClass: 'peeksense',
  items: repeatItems(80),
};
