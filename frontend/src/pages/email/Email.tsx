import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";

// shadcn components
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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

// Schema with Zod
const reviewSchema = z.object({
  email: z.string().email("Adresa de email invalidă"),
  serviciu: z.string().min(1, "Selectați un serviciu"),
  nota: z.number().int().min(1, "Alegeți o notă").max(10),
  mesaj: z.string().max(5000, "Mesajul nu poate depăși 5000 caractere"),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

function Review() {
  const navigate = useNavigate();
  const [messageLength, setMessageLength] = useState(0);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      email: "",
      serviciu: "",
      nota: undefined,
      mesaj: "",
    },
  });

  const onSubmit = (data: ReviewFormValues) => {
    console.log("Review submitted:", data);
    setTimeout(() => {
      navigate("/thank-you", { state: { name: "client" } });
    }, 500);
  };

  // Custom rating component (1-10)
  const RatingSelector = ({
    value,
    onChange,
  }: {
    value?: number;
    onChange: (val: number) => void;
  }) => (
    <div className="flex flex-wrap gap-2">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
        <Button
          key={num}
          type="button"
          variant={value === num ? "default" : "outline"}
          className="w-10 h-10 rounded-full"
          onClick={() => onChange(num)}
        >
          {num}
        </Button>
      ))}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6">
      <h1 className="text-3xl font-bold text-center">
        Cum a fost experiența ta?
      </h1>
      <p className="text-muted-foreground text-center mt-2">
        Lasă-ne o recenzie, completând formularul de mai jos
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-8">
          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="exemplu@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Serviciu (Select) */}
          <FormField
            control={form.control}
            name="serviciu"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Serviciu</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Alege un serviciu" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="consultanță">Consultanță</SelectItem>
                    <SelectItem value="dezvoltare">Dezvoltare web</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="suport">Suport tehnic</SelectItem>
                    <SelectItem value="altul">Altul</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Nota (Rating 1-10) */}
          <FormField
            control={form.control}
            name="nota"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nota</FormLabel>
                <FormControl>
                  <RatingSelector
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Mesaj (Textarea with character counter) */}
          <FormField
            control={form.control}
            name="mesaj"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mesaj</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Textarea
                      placeholder="Scrieți feedback-ul dumneavoastră..."
                      className="min-h-[150px] pr-20"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        setMessageLength(e.target.value.length);
                      }}
                    />
                    <span className="absolute bottom-2 right-3 text-sm text-muted-foreground">
                      {messageLength}/5000
                    </span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            Trimite
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default Review;
