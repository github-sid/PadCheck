import { RatingPicker } from "./rating-picker";

export type Ratings = {
  landlord: number;
  noise: number;
  safety: number;
  transit: number;
  amenities: number;
};

export type RatingSetters = {
  setLandlord: (n: number) => void;
  setNoise: (n: number) => void;
  setSafety: (n: number) => void;
  setTransit: (n: number) => void;
  setAmenities: (n: number) => void;
};

export function RatingGrid({
  ratings,
  setters,
}: {
  ratings: Ratings;
  setters: RatingSetters;
}) {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <RatingPicker label="Landlord" value={ratings.landlord} onChange={setters.setLandlord} />
      <RatingPicker label="Safety" value={ratings.safety} onChange={setters.setSafety} />
      <RatingPicker label="Noise" value={ratings.noise} onChange={setters.setNoise} />
      <RatingPicker label="Transit" value={ratings.transit} onChange={setters.setTransit} />
      <RatingPicker label="Amenities" value={ratings.amenities} onChange={setters.setAmenities} />
    </div>
  );
}
