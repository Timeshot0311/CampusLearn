
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ size = "default" }: { size?: "default" | "large" }) {
  const sizeClasses = {
    default: {
      container: "gap-2",
      image: "h-8 w-8",
      text: "text-2xl",
    },
    large: {
      container: "gap-4 flex-col",
      image: "h-24 w-24",
      text: "text-5xl",
    },
  };
  
  const selectedSize = sizeClasses[size];

  return (
    <div className={cn("flex items-center", selectedSize.container)}>
      <Image 
        src="/logo.png" 
        alt="CampusLearn Logo" 
        width={256} 
        height={256} 
        className={selectedSize.image}
        priority={size === 'large'}
      />
      <span className={cn("font-bold font-headline tracking-tight", selectedSize.text)}>
        CampusLearn
      </span>
    </div>
  );
}
