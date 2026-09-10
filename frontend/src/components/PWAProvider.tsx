"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Download, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface PWAContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  promptInstall: () => Promise<void>;
}

const PWAContext = createContext<PWAContextType>({
  isInstallable: false,
  isInstalled: false,
  promptInstall: async () => {},
});

export const usePWA = () => useContext(PWAContext);

export default function PWAProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("D Tailors PWA ServiceWorker registered with scope:", registration.scope);
          })
          .catch((error) => {
            console.error("D Tailors PWA ServiceWorker registration failed:", error);
          });
      });
    }

    // Check if app is already running in standalone mode (PWA installed)
    const checkIsInstalled = () => {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsInstalled(isStandalone);
    };

    checkIsInstalled();
    window.matchMedia("(display-mode: standalone)").addEventListener("change", checkIsInstalled);

    // Listen for install prompt trigger
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      setShowBanner(false);
      console.log("D Tailors App successfully installed!");
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      console.log("User accepted the D Tailors PWA install prompt");
    } else {
      console.log("User dismissed the D Tailors PWA install prompt");
    }
    setDeferredPrompt(null);
    setIsInstallable(false);
    setShowBanner(false);
  };

  return (
    <PWAContext.Provider value={{ isInstallable, isInstalled, promptInstall }}>
      {children}
      {/* Optional Install Toast/Banner for Mobile/Desktop */}
      {isInstallable && showBanner && !isInstalled && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 bg-stone-900/95 text-white p-4 rounded-2xl shadow-2xl border border-stone-800 backdrop-blur-xl flex items-center justify-between gap-4 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-500 p-0.5 shadow-md flex-shrink-0">
              <img src="/logo-icon.svg" alt="D Tailors Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-white">Install D Tailors</p>
              <p className="text-xs text-stone-400">Install as an app for fast offline access</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowBanner(false)}
              className="px-2.5 py-1.5 text-xs text-stone-400 hover:text-white transition-colors"
            >
              Later
            </button>
            <button
              onClick={promptInstall}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white text-xs font-bold shadow-md shadow-primary-500/30 hover:scale-105 active:scale-95 transition-all"
            >
              <Download className="h-3.5 w-3.5" />
              Install
            </button>
          </div>
        </div>
      )}
    </PWAContext.Provider>
  );
}
