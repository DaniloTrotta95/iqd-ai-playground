"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import LoadingButton from "@/components/loading-button";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { signUpWithEmail, signInWithEmail } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(64, "Password must be at most 64 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character"
  );

const signUpSchema = z
  .object({
    name: z.string().min(2, { message: "Name is required" }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: passwordSchema,
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match.",
    path: ["password_confirmation"],
  });

export default function AuthForm() {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const isSignUp = searchParams.get("sign-up") === "true";
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(isSignUp ? signUpSchema : formSchema),
    defaultValues: isSignUp
      ? { name: "", email: "", password: "", password_confirmation: "" }
      : { email: "", password: "" },
  });

  const onSubmit = (
    values: z.infer<typeof formSchema> | z.infer<typeof signUpSchema>
  ) => {
    setError("");
    startTransition(async () => {
      try {
        if (isSignUp) {
          console.log(values);

          const { email, password, name } = values as z.infer<typeof signUpSchema>;


          const signUpData = {
            email: email,
            password: password,
            name: name,
            callbackURL: "/dashboard",
          };
          // @ts-ignore
          const response = await signUpWithEmail(signUpData);

          if (response?.error) {
            const errorMessage = response.error.message || "";
            if (errorMessage.includes("User already exists")) {
              toast.error("E-Mail oder Passwort bereits vorhanden.");
            } else if (errorMessage.includes("Invalid email")) {
              toast.error("Ungültige E-Mail Adresse.");
            } else {
              toast.error("Es ist ein Fehler aufgetreten. Bitte versuche es erneut.");
            }
          } else {
            toast.success("Dein Konto wurde erfolgreich erstellt.");
            router.push("/dashboard");
          }
          // if (response.error) {
          //   if (response.error.status === 404) {
          //     toast.error("Es ist ein Fehler aufgetreten. Bitte versuche es erneut.");
          //   } else {
          //     toast.error(response.error.message);
          //   }
          // } else {
          //   toast.success("Dein Konto wurde erfolgreich erstellt.");
          // }
        } else {
          const response = await signInWithEmail(values as z.infer<typeof formSchema>);
          if (response?.error) {
            toast.error(response.error.message);
          } else {
            toast.success("Du wurdest erfolgreich angemeldet.");
            router.push("/dashboard");
          }
        }
        // Optionally redirect here
      } catch (err: any) {
        setError(
          err?.message ||
            (isSignUp ? "Registrierung fehlgeschlagen." : "Ungültige E-Mail oder Passwort.")
        );
        toast.error(
          err?.message ||
            (isSignUp
              ? "Registrierung fehlgeschlagen."
              : "Anmeldung fehlgeschlagen. Bitte überprüfe deine Anmeldeinformationen.")
        );
      }
    });
  };

  return (
    <>
      <CardHeader>
        <CardTitle className="text-2xl text-center">
          {isSignUp ? "Registrieren" : "Anmelden"}
        </CardTitle>
        <CardDescription className="text-center">
          {isSignUp
            ? "Erstelle ein neues Konto."
            : "Willkommen zurück! Bitte melde dich mit deinem Konto an."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {isSignUp && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Your name"
                        autoComplete="name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Passwort</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      autoComplete={
                        isSignUp ? "new-password" : "current-password"
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isSignUp && (
              <FormField
                control={form.control}
                name="password_confirmation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Passwort bestätigen</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        autoComplete={
                          isSignUp ? "new-password" : "current-password"
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {error && (
              <div className="text-destructive text-sm text-center">
                {error}
              </div>
            )}
            <LoadingButton pending={pending}>
              {isSignUp ? "Registrieren" : "Anmelden"}
            </LoadingButton>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {isSignUp ? (
            <>
              Hast du bereits ein Konto?{" "}
              <a href="/sign-in" className="underline">
                Anmelden
              </a>
            </>
          ) : (
            <>
              Hast du noch kein Konto?{" "}
              <a href="/sign-in?sign-up=true" className="underline">
                Registrieren
              </a>
            </>
          )}
        </span>
      </CardFooter>
    </>
  );
}
