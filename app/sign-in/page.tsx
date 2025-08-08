import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import AuthForm from "@/components/auth-form";

export default function SignIn() {
  return (
    <main className="flex items-center justify-center min-h-[80vh] p-4 bg-muted">
      <Card className="w-full max-w-md shadow-lg">
        <Suspense fallback={<div className="p-6">Laden...</div>}>
          <AuthForm />
        </Suspense>
      </Card>
    </main>
  );
}
