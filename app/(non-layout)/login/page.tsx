export const dynamic = "force-dynamic";

import React, { Suspense } from "react";
import LoginComp from "@/components/Login";

export default function Page() {
  return (
    <Suspense fallback={<p></p>}>
      <LoginComp />
    </Suspense>
  );
}
