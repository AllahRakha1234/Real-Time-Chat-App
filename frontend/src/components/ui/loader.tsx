// src/components/ui/loader.tsx
import Lottie from "lottie-react";
import loaderAnimation from "@/assets/DoubleLoader.json";

interface LoaderProps {
  size?: number;
}

export const Loader = ({ size = 100 }: LoaderProps) => {
  return (
    <div className="flex items-center justify-center">
      <Lottie
        animationData={loaderAnimation}
        loop={true}
        className="select-none pointer-events-none"
        style={{ width: size, height: size }}
      />
    </div>
  );
};
