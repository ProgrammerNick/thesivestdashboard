import { useForm } from "@tanstack/react-form";
import { authClient } from "@/lib/auth-client";
import { signUpSchema } from "@/lib/auth-schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, ArrowRight, Check, X, User, Building2 } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";

// Password field component with requirements list
function PasswordField({
  field,
  everMet,
  onEverMetChange,
}: {
  field: any;
  everMet: Set<string>;
  onEverMetChange: (newSet: Set<string>) => void;
}) {
  const password = field.state.value;

  // Password requirements
  const requirements = [
    {
      key: "length",
      text: "At least 8 characters",
      check: (pwd: string) => pwd.length >= 8,
    },
    {
      key: "uppercase",
      text: "Contains uppercase letter",
      check: (pwd: string) => /[A-Z]/.test(pwd),
    },
    {
      key: "lowercase",
      text: "Contains lowercase letter",
      check: (pwd: string) => /[a-z]/.test(pwd),
    },
    {
      key: "number",
      text: "Contains a number",
      check: (pwd: string) => /\d/.test(pwd),
    },
  ];

  useEffect(() => {
    if (password) {
      // Accumulate requirements that have been met (don't remove if they become invalid)
      const met = requirements
        .filter((r) => r.check(password))
        .map((r) => r.key);

      // Use functional update to access the latest everMet state
      // This prevents the infinite loop by not depending on everMet
      const newSet = new Set(everMet);
      met.forEach((key) => newSet.add(key));
      onEverMetChange(newSet);
    }
    // Don't reset when password is cleared - keep everMet state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password]);

  return (
    <div className="space-y-2">
      <Label htmlFor={field.name}>Password</Label>
      <Input
        id={field.name}
        type="password"
        showPasswordToggle
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        className={`bg-background/50 border-input transition-all focus:ring-2 focus:ring-primary/20 ${field.state.meta.isTouched && field.state.meta.errors.length > 0
          ? "border-destructive focus:ring-destructive/20"
          : ""
          }`}
      />
      {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
        <p className="text-sm text-destructive font-medium">
          {typeof field.state.meta.errors[0] === "string"
            ? field.state.meta.errors[0]
            : field.state.meta.errors[0]?.message || "Invalid value"}
        </p>
      )}

      {/* Password Requirements List */}
      <ul className="space-y-1.5 mt-3">
        {requirements.map((req) => {
          const isMet = req.check(password);
          const hasEverBeenMet = everMet.has(req.key);

          // Color logic:
          // - Green if requirement is currently met
          // - Red if requirement has ever been met but is now not met (user is typing incorrectly)
          // - Black if requirement has never been met yet
          const getColor = () => {
            if (isMet) return "text-green-600";
            if (hasEverBeenMet) return "text-red-600";
            return "text-foreground";
          };

          const getIcon = () => {
            if (isMet) return <Check className="h-4 w-4 text-green-600" />;
            if (hasEverBeenMet) return <X className="h-4 w-4 text-red-600" />;
            return null;
          };

          return (
            <li
              key={req.key}
              className={`flex items-center gap-2 text-sm ${getColor()}`}
            >
              {getIcon()}
              <span>{req.text}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function SignUp() {
  const navigate = useNavigate();
  const [authError, setAuthError] = useState("");
  const [accountType, setAccountType] = useState<"contributor" | "employer">("contributor");
  const [passwordEverMet, setPasswordEverMet] = useState<Set<string>>(
    new Set()
  );

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    validators: {
      onChange: signUpSchema,
    },
    onSubmit: async ({ value }) => {
      setAuthError("");

      await authClient.signUp.email(
        {
          email: value.email,
          password: value.password,
          name: value.name,
          displayName: value.name,
          isCompany: accountType === "employer",
        },
        {
          onSuccess: async () => {
            navigate({ to: "/" });
          },
          onError: (ctx) => {
            setAuthError(ctx.error.message);
          },
        }
      );
    },
  });

  return (
    <div>
      <Card className="w-full bg-card/50 backdrop-blur-xl border-border shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-center">
            Create an account
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Join as a contributor or employer
          </CardDescription>

          {/* Account Type Toggle */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <button
              type="button"
              onClick={() => setAccountType("contributor")}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${accountType === "contributor"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:border-muted-foreground/50 text-muted-foreground"
                }`}
            >
              <User className="w-6 h-6" />
              <span className="text-sm font-medium">Contributor</span>
              <span className="text-[10px] text-center opacity-70">Research & invest</span>
            </button>
            <button
              type="button"
              onClick={() => setAccountType("employer")}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${accountType === "employer"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:border-muted-foreground/50 text-muted-foreground"
                }`}
            >
              <Building2 className="w-6 h-6" />
              <span className="text-sm font-medium">Employer</span>
              <span className="text-[10px] text-center opacity-70">Hire talent</span>
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-4"
          >
            <form.Field name="name">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Name</Label>
                  <Input
                    id={field.name}
                    type="text"
                    placeholder="John Doe"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className={`bg-background/50 border-input transition-all focus:ring-2 focus:ring-primary/20 ${field.state.meta.isTouched &&
                      field.state.meta.errors.length > 0
                      ? "border-destructive focus:ring-destructive/20"
                      : ""
                      }`}
                  />
                  {field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-destructive font-medium">
                        {typeof field.state.meta.errors[0] === "string"
                          ? field.state.meta.errors[0]
                          : field.state.meta.errors[0]?.message ||
                          "Invalid value"}
                      </p>
                    )}
                  <p className="text-xs text-muted-foreground">
                    This will be your display name. You can change it later.
                  </p>
                </div>
              )}
            </form.Field>

            <form.Field name="email">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Email</Label>
                  <Input
                    id={field.name}
                    type="email"
                    placeholder="name@example.com"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className={`bg-background/50 border-input transition-all focus:ring-2 focus:ring-primary/20 ${field.state.meta.isTouched &&
                      field.state.meta.errors.length > 0
                      ? "border-destructive focus:ring-destructive/20"
                      : ""
                      }`}
                  />
                  {field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-destructive font-medium">
                        {typeof field.state.meta.errors[0] === "string"
                          ? field.state.meta.errors[0]
                          : field.state.meta.errors[0]?.message ||
                          "Invalid value"}
                      </p>
                    )}
                </div>
              )}
            </form.Field>

            <form.Field name="password">
              {(field) => (
                <PasswordField
                  field={field}
                  everMet={passwordEverMet}
                  onEverMetChange={setPasswordEverMet}
                />
              )}
            </form.Field>

            {authError && (
              <div className="text-destructive text-sm text-center bg-destructive/10 p-2 rounded-md font-medium">
                {authError}
              </div>
            )}

            <form.Subscribe
              selector={(state) => ({
                isSubmitting: state.isSubmitting,
                canSubmit: state.canSubmit,
                values: state.values,
              })}
              children={({ isSubmitting, canSubmit, values }) => {
                const hasStartedTyping =
                  values.name !== "" ||
                  values.email !== "" ||
                  values.password !== "";

                return (
                  <Button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
                    disabled={isSubmitting || !canSubmit || !hasStartedTyping}
                  >
                    {isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Sign Up
                    {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                );
              }}
            />
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <form.Subscribe
            selector={(state) => state.isSubmitting}
            children={(isSubmitting) => (
              <div className="grid grid-cols-1 gap-4">
                <Button
                  variant="outline"
                  className="bg-background/50 hover:bg-muted"
                  disabled={isSubmitting}
                  onClick={async () => {
                    await authClient.signIn.social({
                      provider: "google",
                      callbackURL: "http://localhost:3000/dashboard", // Explicit callback to avoid port mismatches
                    });
                  }}
                >
                  <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                    <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                  </svg>
                  Google
                </Button>
              </div>
            )}
          />
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground gap-1">
          Already have an account?
          <Link
            to="/login"
            className="text-primary hover:text-primary/80 font-semibold transition-colors hover:underline"
          >
            Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
