"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useCategoryStore } from "@/stores/categoryStore";
import { createProductRequest } from "@/requests/product/create";

const FEATURES = [
  "Alcohol-free",
  "EU-allergen-free",
  "Fragrance-free",
  "Oil-free",
  "Paraben-free",
  "Sulfate-free",
  "Cruelty-free",
  "Fungal-acne-safe",
  "Reef-safe",
  "Silicon-free",
  "Vegan",
];

export default function CreateProductForm() {
  const router = useRouter();
  const { categories, fetchCategories } = useCategoryStore();

  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [imgLink, setImgLink] = useState("");
  const [shopLink, setShopLink] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([""]);
  const [features, setFeatures] = useState<string[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const toggleFeature = (feature: string) => {
    setFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature]
    );
  };

  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const addIngredient = () => setIngredients([...ingredients, ""]);
  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const result = await createProductRequest({
      name,
      price,
      img_link: imgLink,
      shop_link: shopLink,
      ingredients,
      features,
      category_id: parseInt(categoryId),
    });
    setLoading(false);

    if (result.success) {
      toast.success(result.message);
      router.push("/dashboard/product");
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="space-y-6">
      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Product Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Product Name"/>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Image Link</label>
            <Input value={imgLink} onChange={(e) => setImgLink(e.target.value)} placeholder="Image Link"/>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Shop Link</label>
            <Input value={shopLink} onChange={(e) => setShopLink(e.target.value)} placeholder="Shop Link"/>
        </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Ingredients</label>
          {ingredients.map((ingredient, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={ingredient}
                onChange={(e) => updateIngredient(index, e.target.value)}
                placeholder={`Ingredient ${index + 1}`}
              />
              {ingredients.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => removeIngredient(index)}
                >
                  <IconTrash className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
          <Button type="button" onClick={addIngredient} className="mt-2">
            <IconPlus className="w-4 h-4 mr-1" /> Add Ingredient
          </Button>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Features</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {FEATURES.map((feature) => (
              <label key={feature} className="flex items-center space-x-2">
                <Checkbox
                  checked={features.includes(feature)}
                  onCheckedChange={() => toggleFeature(feature)}
                />
                <span>{feature}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <Select value={categoryId} onValueChange={(val) => setCategoryId(val)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={String(cat.id)}>
                  {cat.category_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Create Product"}
        </Button>
      </form>
    </div>
  );
}