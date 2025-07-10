"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSession, authClient } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import LoadingButton from "@/components/loading-button";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).optional(),
}).refine((data) => data.name, {
  message: "Name must be provided.",
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required." }),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(64, "Password must be at most 64 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

export default function ProfilPage() {
  const { data: session, isPending } = useSession();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [pending, startTransition] = useTransition();

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: session?.user?.name || "",
    },
  });

  // Update form values when session data is available
  useEffect(() => {
    if (session?.user) {
      profileForm.reset({
        name: session.user.name || "",
      });
    }
  }, [session?.user, profileForm]);

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onProfileSubmit = (values: z.infer<typeof profileSchema>) => {
    startTransition(async () => {
      try {
        // Only update if name has actually changed
        if (!values.name || values.name === session?.user?.name) {
          toast.info("Keine Änderungen zum Speichern.");
          setIsEditingProfile(false);
          return;
        }

        // Update user profile using auth client
        await authClient.updateUser({
          name: values.name,
        });

        toast.success("Profil erfolgreich aktualisiert!");
        setIsEditingProfile(false);
      } catch (error) {
        console.error("Profile update error:", error);
        toast.error("Fehler beim Aktualisieren des Profils. Bitte versuche es erneut.");
      }
    });
  };

  const onPasswordSubmit = (values: z.infer<typeof passwordSchema>) => {
    startTransition(async () => {
      try {
        // Change password using auth client
        const response = await authClient.changePassword({
          newPassword: values.newPassword,
          currentPassword: values.currentPassword,
          revokeOtherSessions: true, // revoke all other sessions the user is signed into
        });

        if (response.error?.code === "INVALID_PASSWORD") {
          // Set form error on the current password field
          passwordForm.setError("currentPassword", {
            type: "manual",
            message: "Aktuelles Passwort ist nicht korrekt."
          });
          return;
        } else if (response.error) {
          toast.error("Fehler beim Ändern des Passworts. Bitte versuche es erneut.");
          return;
        }

        toast.success("Passwort erfolgreich geändert!");
        setIsChangingPassword(false);
        passwordForm.reset();
      } catch (error) {
        console.error("Password change error:", error);
        toast.error("Fehler beim Ändern des Passworts. Bitte versuche es erneut.");
      }
    });
  };

  if (isPending) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Please sign in to view your profile.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6 mt-16">
      <div>
        <h1 className="text-3xl font-bold">Profil</h1>
        <p className="text-muted-foreground">
          Verwalte deine Kontoeinstellungen und Einstellungen.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session.user.image || ""} />
                <AvatarFallback>
                  {session.user.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              Profil Informationen
            </CardTitle>
            <CardDescription>
              Aktualisiere deine persönlichen Informationen und Profilbild.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isEditingProfile ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Benutzername</Label>
                  <p className="text-sm text-muted-foreground">{session.user.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">E-Mail</Label>
                  <p className="text-sm text-muted-foreground">{session.user.email}</p>
                  {session.user.emailVerified && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground mt-1">
                      Verifiziert
                    </span>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    E-Mail-Adresse kann nicht geändert werden
                  </p>
                </div>
                <Button onClick={() => setIsEditingProfile(true)}>
                  Profil bearbeiten
                </Button>
              </div>
            ) : (
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Benutzername</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder={session?.user?.name || "Dein Name"}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2 w-fit">
                    <LoadingButton pending={pending}>
                      Änderungen speichern
                    </LoadingButton>
                    <Button
						className="w-fit"
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditingProfile(false)}
                    >
                      Abbrechen
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Sicherheit</CardTitle>
            <CardDescription>
              Verwalte deine Passwort und Sicherheitseinstellungen.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isChangingPassword ? (
              <div className="space-y-4">
                
                <Button onClick={() => setIsChangingPassword(true)}>
                  Passwort ändern
                </Button>
              </div>
            ) : (
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aktuelles Passwort</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Neues Passwort</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bestätige neues Passwort</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-2">
                    <LoadingButton pending={pending}>
                      Passwort ändern
                    </LoadingButton>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsChangingPassword(false)}
                    >
                      Abbrechen
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Konto Informationen</CardTitle>
          <CardDescription>
            Verwalte deine Kontoinformationen und Einstellungen.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-sm font-medium">Konto ID</Label>
              <p className="text-sm text-muted-foreground font-mono">
                {session.user.id}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Mitglied seit</Label>
              <p className="text-sm text-muted-foreground">
                {session.user.createdAt ? new Date(session.user.createdAt).toLocaleDateString() : "Unknown"}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">E-Mail Verifizierung</Label>
              <div className="flex items-center gap-2 mt-1">
                <Switch checked={session.user.emailVerified} disabled />
                <span className="text-sm text-muted-foreground">
                  {session.user.emailVerified ? "Verifiziert" : "Nicht verifiziert"}
                </span>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Last Updated</Label>
              <p className="text-sm text-muted-foreground">
                {session.user.updatedAt ? new Date(session.user.updatedAt).toLocaleDateString() : "Unknown"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible und destruktive Aktionen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Konto löschen</Label>
              <p className="text-sm text-muted-foreground">
                Lösche dein Konto und alle zugehörigen Daten.
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Konto löschen
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}