"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { USER_API } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [role, setRole] = useState<"buyer" | "seller">("buyer");

  const handleRegister = async (e: any) => {
    e.preventDefault();

    try {
      await USER_API.post("/register", {
        ...formData,
        role,
      });

      alert("Registered ✅");
      router.push("/login");
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Error ❌");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <span className="font-serif text-3xl font-semibold">
              StyleSphere
            </span>
          </Link>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-serif">
              Create Account
            </CardTitle>
            <CardDescription>
              Join StyleSphere today
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">

              {/* Name */}
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  placeholder="Your name"
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  placeholder="jane@example.com"
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  placeholder="Enter password"
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Register As</Label>
                <div className="flex gap-2">
                  {(["buyer", "seller"] as const).map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRole(value)}
                      className={`flex-1 rounded-md border px-3 py-2 text-sm capitalize transition ${
                        role === value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>

             
              {/* Submit */}
              <Button type="submit" className="w-full">
                Create Account
              </Button>
            </form>

            {/* Login link */}
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">
                Already have an account?{" "}
              </span>
              <Link
                href="/login"
                className="text-primary font-medium hover:underline"
              >
                Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
