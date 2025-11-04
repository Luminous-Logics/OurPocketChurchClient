"use client";

import { useEffect } from "react";
import { usePromiseTracker } from "react-promise-tracker";

export const Loader = () => {
  const { promiseInProgress } = usePromiseTracker();

  useEffect(() => {
    if (promiseInProgress) document.body.classList.add("overflow-hidden");
    else document.body.classList.remove("overflow-hidden");
  }, [promiseInProgress]);

  return promiseInProgress ? (
    <div id="preloader" className="preloader">
      <div className="spinner-border text-primary" role="status" />
    </div>
  ) : (
    <></>
  );
};
