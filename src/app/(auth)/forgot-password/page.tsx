import AuthCard from "@/components/auth/AuthCard";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AuthCard title="Forgot Password" subtitle="Enter your email to receive a reset link">
      <ForgotPasswordForm />
    </AuthCard>
  );
}
