
import Script from 'next/script';
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
        {/* PopAds Anti-Adblock Script Integration */}
        <Script
          id="popads-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                var u=window,
                    z="b479e157b324167e9abb6eeb2a7c5511",
                    j=[["siteId",5301392],["minBid",0],["popundersPerIP","0"],["delayBetween",0],["default",false],["defaultPerDay",0],["topmostLayer","auto"]],
                    k=["d3d3LmFudGlhZGJsb2Nrc3lzdGVtcy5jb20vWmVVcFlvL3F1c2VyaW5mby5taW4uanM=","ZDNjb2Q4MHRobjdxbmQuY2xvdWRmcm9udC5uZXQvR2RGb28vdlgvdmx1bnIubWluLmNzcw=="],
                    f=-1,d,r,
                    p=function(){
                      clearTimeout(r);f++;
                      if(k[f]&&!(1806355132000<(new Date).getTime()&&1<f)){
                        d=u.document.createElement("script");
                        d.type="text/javascript";
                        d.async=!0;
                        var h=u.document.getElementsByTagName("script")[0];
                        d.src="https://"+atob(k[f]);
                        d.crossOrigin="anonymous";
                        d.onerror=p;
                        d.onload=function(){clearTimeout(r);u[z.slice(0,16)+z.slice(0,16)]||p()};
                        r=setTimeout(p,5E3);
                        h.parentNode.insertBefore(d,h);
                      }
                    };
                if(!u[z]){try{Object.freeze(u[z]=j)}catch(e){}p()}
              })();
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
