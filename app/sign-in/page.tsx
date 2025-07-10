"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import LoadingButton from "@/components/loading-button";
import { Button } from "@/components/ui/button";
import { signInWithEmail, signInWithGithub, signInWithDiscord } from "@/actions/user.actions";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { signUp } from "@/lib/auth-client";
import AuthForm from "@/components/auth-form";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const signUpSchema = z.object({
  name: z.string().min(2, { message: "Name is required" }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export default function SignIn() {
  return (
    <main className="flex items-center justify-center min-h-[80vh] p-4 bg-muted">
      <Card className="w-full max-w-md shadow-lg">
        <AuthForm />
      </Card>
    </main>
  );
}
