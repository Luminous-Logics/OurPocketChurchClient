export const dynamic = "force-dynamic";

import React, { Suspense } from "react";
import RegisterComp from "@/components/Register";

export default function Page() {
  return (
    <Suspense fallback={<p></p>}>
      <RegisterComp />
    </Suspense>
  );
}
