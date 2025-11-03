import * as React from "react";
import { cn } from "@/lib/utils";

export const InboxIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("lucide lucide-inbox", className)}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <defs>
      <linearGradient id="swatch32">
        <stop style={{stopColor:"#b5d6e0", stopOpacity:1}} offset="0" />
      </linearGradient>
      <linearGradient id="swatch1">
        <stop style={{stopColor:"#5248ff", stopOpacity:1}} offset="0" />
      </linearGradient>
      <linearGradient
        href="#swatch1"
        id="linearGradient1"
        x1="1"
        y1="13.5"
        x2="23"
        y2="13.5"
        gradientUnits="userSpaceOnUse"
      />
      <linearGradient
        href="#swatch1"
        id="linearGradient2"
        x1="1"
        y1="12"
        x2="23"
        y2="12"
        gradientUnits="userSpaceOnUse"
        gradientTransform="translate(-0.15980028,1.8190669)"
      />
    </defs>
    <polyline
      points="22 12 16 12 14 15 10 15 8 12 2 12"
      style={{fill:"none", fillOpacity:1, stroke:"url(#linearGradient1)", strokeWidth:0.4, strokeDasharray:"none"}}
      transform="translate(-0.15980028,1.8190669)"
    />
    <path
      d="m 5.2901997,6.9290669 -3.45,6.8900001 v 6 c 0,1.104569 0.8954305,2 2,2 H 19.8402 c 1.104569,0 2,-0.895431 2,-2 v -6 l -3.45,-6.8900001 c -0.33773,-0.6796577 -1.031056,-1.1095973 -1.79,-1.11 H 13.06171 10.070955 8.5755772 7.0801997 c -0.758944,4.027e-4 -1.45227,0.4303423 -1.79,1.11 z"
      style={{fill:"none", fillOpacity:1, stroke:"url(#linearGradient2)", strokeWidth:0.4, strokeDasharray:"none"}}
    />
    <path
      style={{fill:"none", fillRule:"evenodd", stroke:"#5248ff", strokeWidth:0.1, strokeLinecap:"butt", strokeLinejoin:"miter", strokeDasharray:"none", strokeOpacity:1}}
      d="M 4.4519644,1.8190669 6.1460821,4.5798512"
    />
    <path
      style={{fill:"none", fillRule:"evenodd", stroke:"#5248ff", strokeWidth:0.1, strokeLinecap:"butt", strokeLinejoin:"miter", strokeDasharray:"none", strokeOpacity:1}}
      d="m 11.950004,1.8190669 -0.03137,2.572549"
    />
    <path
      style={{fill:"none", fillRule:"evenodd", stroke:"#5248ff", strokeWidth:0.1, strokeLinecap:"butt", strokeLinejoin:"miter", strokeDasharray:"none", strokeOpacity:1}}
      d="M 19.448043,1.8190669 16.781376,4.5798512"
    />
  </svg>
);

