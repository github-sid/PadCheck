import { Suspense } from "react";
import { Auth } from "./auth";

export default function AuthPage() {
  return (
    <Suspense>
      <Auth />
    </Suspense>
  );
}
