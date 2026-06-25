"use client";

import { useEffect, useState } from "react";
import { HeroSection } from "@/components/hero-section";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/header";
import { PageLoader } from "@/components/page-loader";

const LOADER_DURATION_MS = 1800;

export default function Home() {
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setReady(true);
      requestAnimationFrame(() => setVisible(true));
    }, LOADER_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!ready) return <PageLoader />;

  return (
    <div
      className="transition-opacity duration-500"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <Navbar />
      <HeroSection />
      <Footer />
    </div>
  );
}
