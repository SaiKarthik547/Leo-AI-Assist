import * as React from "react";

export function LeoLogo({ size = 48 }: { size?: number }) {
  return (
    <img
      src="/public/lion.png"
      alt="Leo Logo"
      width={size}
      height={size}
      style={{ display: 'block', margin: '0 auto' }}
    />
  );
}
