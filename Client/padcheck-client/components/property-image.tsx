import Image from "next/image";
import house1 from "../assest/house1.jpg";

const STREET_VIEW_BASE = "https://maps.googleapis.com/maps/api/streetview";
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

type Props = {
    lat: string | number | null;
    lng: string | number | null;
    address: string;
};

export function PropertyImage({ lat, lng, address }: Props) {
    const hasCoords = lat != null && lng != null && API_KEY;
    const streetViewUrl = hasCoords
        ? `${STREET_VIEW_BASE}?size=800x600&location=${lat},${lng}&key=${API_KEY}`
        : console.log('No coordinates available');

    return (
        <div className="w-full aspect-4/3 overflow-hidden rounded-2xl outline-1 -outline-offset-1 outline-black/5 bg-neutral-100">
            {streetViewUrl ? (
                <Image
                    src={streetViewUrl}
                    alt={`Street view of ${address}`}
                    width={800}
                    height={600}
                    className="object-cover w-full h-full"
                />
            ) : (
                <Image src={house1} alt="Property" className="object-cover w-full h-full" />
            )}
        </div>
    );
}