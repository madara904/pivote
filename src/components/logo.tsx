import * as React from "react";

const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="15 15 25 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g>
      <rect x="18" y="16" width="13" height="3" rx="2" fill="currentColor" />
      <rect x="18" y="27" width="22" height="3" rx="2" fill="currentColor" />
      <rect x="18" y="38" height="4" rx="2" />
      <rect x="18" y="16" width="3" height="14" rx="2"  fill="currentColor" />
      <rect x="28" y="16" width="3" height="22" rx="2" fill="currentColor" />
    </g>
  </svg>
);

export default Logo;
