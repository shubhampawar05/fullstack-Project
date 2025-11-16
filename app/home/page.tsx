"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { logout, isAuthenticated } from "@/lib/auth";
import { authenticatedFetch, apiJson } from "@/lib/api-client";
import { Listing, ListingResponse } from "@/types/listing";
import { ListingCard } from "@/components/listings/listing-card";
import { ListingForm } from "@/components/listings/listing-form";
import { Plus, LogOut, Package, TrendingUp, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function HomePage() {
  const router = useRouter();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        router.push("/login");
      } else {
        fetchMyListings();
      }
    };
    checkAuth();
  }, [router]);

  async function fetchMyListings() {
    try {
      setLoading(true);
      // Get current user first, then fetch their listings
      const profileResponse = await authenticatedFetch("/api/profile");
      const profileData = await apiJson<{ profile: { userId: string } }>(profileResponse);
      
      if (profileData.profile?.userId) {
        const response = await authenticatedFetch(`/api/listings/user/${profileData.profile.userId}?limit=6`);
        const data = await apiJson<ListingResponse>(response);
        setMyListings(data.listings || []);
      }
    } catch (error) {
      console.error("Failed to fetch listings:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async () => {
    await logout();
    router.push("/login");
    router.refresh();
  };

  const handleListingCreated = () => {
    setShowCreateForm(false);
    fetchMyListings();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Modern Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-bold text-xl">
                LC
              </div>
              <div>
                <h1 className="text-xl font-bold">LocalConnect</h1>
                <p className="text-xs text-muted-foreground">Your Community Marketplace</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
                <DialogTrigger asChild>
                  <Button size="lg" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Listing
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Listing</DialogTitle>
                  </DialogHeader>
                  <ListingForm onSuccess={handleListingCreated} onCancel={() => setShowCreateForm(false)} />
                </DialogContent>
              </Dialog>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-3xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Welcome to Your Marketplace
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Connect with your community. Buy, sell, and discover amazing items and services.
            </p>
            <div className="flex gap-3">
              <Button size="lg" onClick={() => router.push("/listings")}>
                Browse Listings
              </Button>
              <Button size="lg" variant="outline" onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Sell Something
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{myListings.length}</p>
                  <p className="text-sm text-muted-foreground">Your Listings</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">Active</p>
                  <p className="text-sm text-muted-foreground">Marketplace Status</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">Community</p>
                  <p className="text-sm text-muted-foreground">Local Connections</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* My Listings Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold">Your Listings</h3>
            <p className="text-muted-foreground">Manage your active listings</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/listings")}>
            View All
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading your listings...</p>
          </div>
        ) : myListings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-6xl mb-4">📦</div>
              <h4 className="text-xl font-semibold mb-2">No listings yet</h4>
              <p className="text-muted-foreground mb-6">
                Create your first listing to start selling
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Listing
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myListings.map((listing) => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
