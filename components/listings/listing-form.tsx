"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { authenticatedFetch, apiJson } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, X, Loader2 } from "lucide-react";
import { CreateListingInput, ListingType } from "@/types/listing";
import { Category } from "@/types/category";

const listingSchema = z.object({
  type: z.enum(["item", "service"]),
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000),
  price: z.coerce.number().min(0, "Price must be positive"),
  category: z.string().min(1, "Category is required"),
  location: z.object({
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zipCode: z.string().min(5, "Valid zip code is required"),
  }),
});

type ListingFormValues = z.infer<typeof listingSchema>;

interface ListingFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ListingForm({ onSuccess, onCancel }: ListingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const form = useForm({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      type: "item",
      title: "",
      description: "",
      price: 0,
      category: "",
      location: {
        city: "",
        state: "",
        zipCode: "",
      },
    },
  });

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await authenticatedFetch("/api/categories");
        const data = await apiJson<{ categories: Category[] }>(response);
        setCategories(data.categories || []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        toast.error("Failed to load categories");
      } finally {
        setLoadingCategories(false);
      }
    }
    fetchCategories();
  }, []);

  async function onSubmit(data: ListingFormValues) {
    try {
      setIsSubmitting(true);

      const listingData: CreateListingInput = {
        type: data.type as ListingType,
        title: data.title.trim(),
        description: data.description.trim(),
        price: data.price,
        category: data.category,
        location: {
          city: data.location.city.trim(),
          state: data.location.state.trim(),
          zipCode: data.location.zipCode.trim(),
        },
      };

      const response = await authenticatedFetch("/api/listings", {
        method: "POST",
        body: JSON.stringify(listingData),
      });

      if (response.ok) {
        toast.success("Listing created successfully! 🎉");
        form.reset();
        onSuccess?.();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create listing");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error("Error creating listing:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Listing Type */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Listing Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="item">
                    <div className="flex items-center gap-2">
                      <span>📦</span>
                      <span>Item for Sale</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="service">
                    <div className="flex items-center gap-2">
                      <span>🛠️</span>
                      <span>Service Offered</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title *</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Vintage Bike in Great Condition"
                  className="h-11"
                  {...field}
                />
              </FormControl>
              <FormDescription>Be specific and descriptive</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your item or service in detail..."
                  className="min-h-[120px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {field.value?.length || 0} / 2000 characters
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category and Price */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={loadingCategories}
                >
                  <FormControl>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category.slug}>
                        <div className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price ($) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="h-11"
                    step="0.01"
                    min="0"
                    value={field.value?.toString() ?? ""}
                    onChange={(e) => {
                      const value =
                        e.target.value === ""
                          ? 0
                          : parseFloat(e.target.value) || 0;
                      field.onChange(value);
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Location */}
        <div className="space-y-4">
          <FormLabel className="text-base">Location *</FormLabel>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="location.city"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="City" className="h-11" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location.state"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="State" className="h-11" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location.zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Zip Code" className="h-11" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 h-11 text-base font-semibold"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Listing
              </>
            )}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="h-11"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
