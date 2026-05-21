import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

export function ResponsiveToaster() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <Toaster
      position={isMobile ? "bottom-center" : "top-center"}
      toastOptions={{ className: "dark:bg-gray-800 dark:text-gray-100" }}
    />
  );
}
