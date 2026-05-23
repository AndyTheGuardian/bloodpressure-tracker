// import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import type { ToastPosition } from "react-hot-toast";
// import type { Options } from "../types/BpTypes";

type Props = {
  position: ToastPosition;
  // options: Options;
  // setOptions: (o: Options) => void;
};

export function ResponsiveToaster({ position }: Props) {
  // const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  // useEffect(() => {
  //   const onResize = () => {
  //     setIsMobile(window.innerWidth < 640);
  //   };

  //   window.addEventListener("resize", onResize);

  //   return () => window.removeEventListener("resize", onResize);
  // }, []);

  return (
    <Toaster
      position={position}
      toastOptions={{ className: "dark:bg-gray-800 dark:text-gray-100" }}
    />
  );
}
