import React, { useEffect, useState } from 'react';

export const CursorHaloGlow: React.FC = () => {
  const [position, setPosition] = useState({ x: -1000, y: -1000 });
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const checkTheme = () => {
      setIsLightMode(document.documentElement.classList.contains("light"));
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    });

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
      style={{
        background: isLightMode
          ? `radial-gradient(650px circle at ${position.x}px ${position.y}px, rgba(56, 189, 248, 0.32), rgba(59, 130, 246, 0.18), rgba(255, 255, 255, 0) 70%)`
          : `radial-gradient(650px circle at ${position.x}px ${position.y}px, rgba(6, 182, 212, 0.22), rgba(59, 130, 246, 0.12), rgba(3, 7, 18, 0) 70%)`

      }}
    />
  );
};
