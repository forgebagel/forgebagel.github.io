import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "CLAVIO Movies",
  description: "Discover your favorite movies and TV shows with CLAVIO Movies",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark bg-slate-950" suppressHydrationWarning>
      <head>
        {/* PopAds Anti-Adblock Script - Standard HTML for Troubleshooter Verification */}
        <script 
          type="text/javascript" 
          data-cfasync="false"
          dangerouslySetInnerHTML={{
            __html: `
/*<![CDATA[/* */
(function(){var y=window,r="b479e157b324167e9abb6eeb2a7c5511",s=[["siteId",784*782-672+4688307],["minBid",0],["popundersPerIP","0"],["delayBetween",0],["default",false],["defaultPerDay",0],["topmostLayer","auto"]],j=["d3d3LmFudGlhZGJsb2Nrc3lzdGVtcy5jb20vSC9idXNlcmluZm8ubWluLmpz","ZDNjb2Q4MHRobjdxbmQuY2xvdWRmcm9udC5uZXQveWQvRkwvc2x1bnIubWluLmNzcw==","d3d3LnNrc3prdXJubS5jb20vWUFFSi91dXNlcmluZm8ubWluLmpz","d3d3Lnppd3B5bmFzbi5jb20vU1B5L0JDL3psdW5yLm1pbi5jc3M="],x=-1,u,t,l=function(){clearTimeout(t);x++;if(j[x]&&!(1806359996000<(new Date).getTime()&&1<x)){u=y.document.createElement("script");u.type="text/javascript";u.async=!0;var w=y.document.getElementsByTagName("script")[0];u.src="https://"+atob(j[x]);u.crossOrigin="anonymous";u.onerror=l;u.onload=function(){clearTimeout(t);y[r.slice(0,16)+r.slice(0,16)]||l()};t=setTimeout(l,5E3);w.parentNode.insertBefore(u,w)}};if(!y[r]){try{Object.freeze(y[r]=s)}catch(e){}l()}})();
/*]]>/* */
            `,
          }} 
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-950 text-white overflow-x-hidden">
        <Navbar />
        <main className="flex-1 pt-20">{children}</main>
      </body>
    </html>
  );
}
