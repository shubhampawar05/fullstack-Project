"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Listing } from "@/types/listing";
import { MapPin, Eye, Heart, DollarSign } from "lucide-react";
import Image from "next/image";

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getTypeColor = (type: string) => {
    return type === "item" ? "bg-blue-500/10 text-blue-700 dark:text-blue-400" : "bg-purple-500/10 text-purple-700 dark:text-purple-400";
  };

  const getTypeIcon = (type: string) => {
    return type === "item" ? "📦" : "🛠️";
  };

  return (
    <Link href={`/listings/${listing._id}`}>
      <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50 overflow-hidden h-full flex flex-col">
        {/* Image Section */}
        <div className="relative w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
          {listing.images && listing.images.length > 0 ? (
            <Image
              src={listing.images[0]}
              alt={listing.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              {getTypeIcon(listing.type)}
            </div>
          )}
          
          {/* Type Badge */}
          <div className="absolute top-2 left-2">
            <Badge className={getTypeColor(listing.type)}>
              {getTypeIcon(listing.type)} {listing.type === "item" ? "Item" : "Service"}
            </Badge>
          </div>

          {/* Price Badge */}
          <div className="absolute top-2 right-2">
            <Badge className="bg-background/90 backdrop-blur-sm text-foreground font-bold text-sm px-3 py-1">
              <DollarSign className="h-3 w-3 mr-1" />
              {formatPrice(listing.price)}
            </Badge>
          </div>
        </div>

        {/* Content Section */}
        <CardContent className="p-4 flex-1 flex flex-col">
          {/* Title */}
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {listing.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">
            {listing.description}
          </p>

          {/* Category */}
          <div className="mb-3">
            <Badge variant="outline" className="text-xs">
              {listing.category}
            </Badge>
          </div>

          {/* Footer Info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="truncate">
                {listing.location.city}, {listing.location.state}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {listing.views > 0 && (
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{listing.views}</span>
                </div>
              )}
              {listing.favorites > 0 && (
                <div className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  <span>{listing.favorites}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

