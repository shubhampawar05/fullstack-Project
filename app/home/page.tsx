"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { logout, isAuthenticated } from "@/lib/auth";
import { FeedbackButton } from "@/components/feedback/feedback-button";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      console.log("🔐 [Home Page] Checking authentication...");
      const authenticated = await isAuthenticated();
      console.log("🔐 [Home Page] Authentication result:", authenticated);
      if (!authenticated) {
        console.log(
          "❌ [Home Page] Not authenticated, redirecting to login..."
        );
        router.push("/login");
      } else {
        console.log("✅ [Home Page] Authenticated, staying on page");
      }
    };
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <header className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold">Home</h1>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </header>

          {/* Dummy Components Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Dummy Component 1 */}
            <Card>
              <CardHeader>
                <CardTitle>Welcome Back!</CardTitle>
                <CardDescription>This is a dummy component</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  You can replace this with your actual content later.
                </p>
              </CardContent>
            </Card>

            {/* Dummy Component 2 */}
            <Card>
              <CardHeader>
                <CardTitle>Stats Overview</CardTitle>
                <CardDescription>Sample statistics card</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Items</span>
                    <span className="font-semibold">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active</span>
                    <span className="font-semibold">0</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dummy Component 3 */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest updates</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  No recent activity to display.
                </p>
              </CardContent>
            </Card>

            {/* Dummy Component 5 */}
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Stay updated</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  You have no new notifications.
                </p>
              </CardContent>
            </Card>

            {/* Dummy Component 6 */}
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Manage your preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" disabled>
                  Open Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <FeedbackButton />
    </>
  );
}
