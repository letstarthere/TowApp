import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { GoogleLogin } from '@react-oauth/google';
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = "598211654488-v7e4nihjjp0pqtoq4sirqknro2btpqti.apps.googleusercontent.com";

function UserAuthContent() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const { toast } = useToast();

  const authMutation = useMutation({
    mutationFn: async (data: { email: string; phone: string; name?: string }) => {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const payload = isLogin 
        ? { email, phone }
        : { email, phone, name, userType: "user" };
      
      return apiRequest("POST", endpoint, payload);
    },
    onSuccess: async (data) => {
      // Save user to localStorage for persistence
      const response = await data.json();
      localStorage.setItem('user', JSON.stringify(response));
      
      // Invalidate auth cache to trigger user data refetch
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      
      // Navigate to user dashboard
      setTimeout(() => {
        setLocation("/user-map");
      }, 100);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    authMutation.mutate({ email, phone, name });
  };

  const handleBack = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="flex items-center justify-center p-6">
        <h1 className="text-xl font-semibold text-white">User {isLogin ? "Login" : "Signup"}</h1>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6">
        <Card className="w-full max-w-sm mx-auto bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                {isLogin ? "Sign In" : "Create Account"}
              </h2>
              <p className="text-gray-400">
                {isLogin ? "Enter your details to continue" : "Enter your details to get started"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-300">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-towapp-orange focus:border-towapp-orange"
                  placeholder="Enter your email"
                  required
                />
              </div>

              {!isLogin && (
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-300">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-2 w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-towapp-orange focus:border-towapp-orange"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              )}

              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-gray-300">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-2 w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-towapp-orange focus:border-towapp-orange"
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={authMutation.isPending}
                className="w-full bg-towapp-orange hover:bg-orange-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg disabled:opacity-50"
              >
                {authMutation.isPending ? "Please wait..." : "Continue"}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900 text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  console.log(credentialResponse);
                  // Decode JWT and extract user info
                  const token = credentialResponse.credential;
                  if (token) {
                    const base64Url = token.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => 
                      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
                    ).join(''));
                    const userData = JSON.parse(jsonPayload);
                    
                    // Save user data
                    const user = {
                      email: userData.email,
                      name: userData.name,
                      phone: '',
                      userType: 'user'
                    };
                    localStorage.setItem('user', JSON.stringify(user));
                    queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
                    setLocation("/user-map");
                  }
                }}
                onError={() => {
                  toast({
                    title: "Error",
                    description: "Google sign-in failed",
                    variant: "destructive",
                  });
                }}
                theme="filled_black"
                size="large"
                width="300"
              />
            </div>

            <div className="text-center mt-6">
              <p className="text-gray-400">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-towapp-orange font-semibold hover:underline"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function UserAuth() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <UserAuthContent />
    </GoogleOAuthProvider>
  );
}
