'use client';

import * as React from "react";
import { InfiniteCanvas } from "./index";
import { PageLoader } from "./PageLoader";
import type { InfiniteCanvasProps } from "./types";

export function InfiniteCanvasClient(props: InfiniteCanvasProps) {
  const [textureProgress, setTextureProgress] = React.useState(0);

  return (
    <>
      <PageLoader progress={textureProgress} />
      <InfiniteCanvas 
        {...props}
        onTextureProgress={setTextureProgress}
      />
    </>
  );
}

