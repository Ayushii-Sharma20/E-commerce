"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export default function ChatRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const user = getSessionUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role === "seller") {
      router.replace("/seller#seller-chat");
      return;
    }

    if (user.role === "admin") {
      router.replace("/admin#admin-chat");
      return;
    }

    router.replace("/profile#buyer-chat");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Opening your chat workspace</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Redirecting you to the correct dashboard chat section for your account.
        </p>
      </div>
    </div>
  );
}
