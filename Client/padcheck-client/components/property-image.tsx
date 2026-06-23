import Image from "next/image";
import house1 from "../assest/house1.jpg";

type Props = {
    streetViewUrl: string | null;
    address: string;
};

export function PropertyImage({ streetViewUrl, address }: Props) {
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
