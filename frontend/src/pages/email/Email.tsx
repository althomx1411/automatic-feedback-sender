import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Zod Schema for validation
const schema = z.object({
  email: z.string().email("Introduceți un email valid."),
  service: z.string().min(1, "Serviciul este obligatoriu."),
  rating: z.number().min(1, "Selectați o notă.").max(10),
  message: z.string().max(5000, "Mesajul nu poate depăși 5000 de caractere."),
});

type FormData = z.infer<typeof schema>;

export default function FeedbackForm() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      service: "",
      rating: 0,
      message: ""
    },
  });

  // Watch the message field for the live character counter
  const message = watch("message") || "";

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Eroare la trimitere.");
      }

      // SUCCESS: Native browser alert pop-up
      alert(`Success! 🎉\n\n${result.message || "Feedback-ul tău a fost trimis cu succes. Mulțumim!"}`);

      reset(); // Clear form fields
    } catch (error: unknown) {
      // Extract clean error message safely in TypeScript
      const errorMessage = error instanceof Error ? error.message : "A apărut o eroare neașteptată.";

      // ERROR: Native browser alert pop-up
      alert(`Eroare! ❌\n\n${errorMessage}\nTe rugăm să încerci din nou.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Cum a fost experiența ta?
          </CardTitle>
          <p className="text-center text-gray-500">
            Lasă-ne o recenzie, completând formularul de mai jos
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Email Field */}
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Field data-invalid={!!errors.email}>
                  <FieldLabel>Email</FieldLabel>
                  <Input placeholder="exemplu@email.com" {...field} disabled={isLoading} />
                  {errors.email && <FieldError>{errors.email.message}</FieldError>}
                </Field>
              )}
            />

            {/* Service Field */}
            <Controller
              name="service"
              control={control}
              render={({ field }) => (
                <Field data-invalid={!!errors.service}>
                  <FieldLabel>Serviciu</FieldLabel>
                  <Input placeholder="Care serviciu ați utilizat?" {...field} disabled={isLoading} />
                  {errors.service && <FieldError>{errors.service.message}</FieldError>}
                </Field>
              )}
            />

            {/* Rating Field */}
            <Controller
              name="rating"
              control={control}
              render={({ field }) => (
                <Field data-invalid={!!errors.rating}>
                  <FieldLabel>Nota</FieldLabel>
                  {/* Modern grid: 5 buttons per row on small mobile, 10 on larger devices */}
                  <div className="grid grid-cols-5 gap-2 sm:grid-cols-10 justify-items-center">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <Button
                        key={num}
                        type="button"
                        variant={field.value === num ? "default" : "outline"}
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-full text-sm font-semibold transition-all duration-200"
                        onClick={() => field.onChange(num)}
                        disabled={isLoading}
                      >
                        {num}
                      </Button>
                    ))}
                  </div>
                  {errors.rating && <FieldError>{errors.rating.message}</FieldError>}
                </Field>
              )}
            />

            {/* Message Field */}
            <Controller
              name="message"
              control={control}
              render={({ field }) => (
                <Field data-invalid={!!errors.message}>
                  <FieldLabel>Mesaj</FieldLabel>
                  <div className="relative">
                    <Textarea
                      placeholder="Scrieți feedback-ul dvs. aici..."
                      className="min-h-[120px] resize-none pb-8"
                      {...field}
                      disabled={isLoading}
                    />
                    <div className="absolute bottom-2 right-3 text-xs text-gray-400 font-mono">
                      {message.length}/5000
                    </div>
                  </div>
                  {errors.message && <FieldError>{errors.message.message}</FieldError>}
                </Field>
              )}
            />

            {/* Submit Button with Loading Spinner */}
            <Button type="submit" className="w-full flex items-center justify-center gap-2" disabled={isLoading}>
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Se trimite...</span>
                </>
              ) : (
                "Trimite"
              )}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
