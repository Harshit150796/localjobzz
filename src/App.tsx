
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import PostAd from "./pages/PostAd";
import Category from "./pages/Category";
import About from "./pages/About";
import HowItWorks from "./pages/HowItWorks";
import Pricing from "./pages/Pricing";
import SafetyTips from "./pages/SafetyTips";
import HelpCenter from "./pages/HelpCenter";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import MyJobs from "./pages/MyJobs";
import Messages from "./pages/Messages";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";
import WaitingVerification from "./pages/WaitingVerification";
import VerifySuccess from "./pages/VerifySuccess";
import NotFound from "./pages/NotFound";
import CityJobs from "./pages/CityJobs";
import CategoryCityJobs from "./pages/CategoryCityJobs";
import CityJobsLanding from "./pages/CityJobsLanding";
import AIAssistant from "./pages/AIAssistant";
import VerifyOTP from "./pages/VerifyOTP";
import JobDetail from "./pages/JobDetail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPasswordVerify from "./pages/ResetPasswordVerify";
import ResetPasswordNew from "./pages/ResetPasswordNew";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <ScrollToTop />
        <Toaster />
        <Sonner />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/post-ad" element={<PostAd />} />
        <Route path="/job/:jobId" element={<JobDetail />} />
        <Route path="/category/:categoryName" element={<Category />} />
        <Route path="/about" element={<About />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/safety" element={<SafetyTips />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/user/:userId" element={<UserProfile />} />
        <Route path="/my-jobs" element={<MyJobs />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/waiting-verification" element={<WaitingVerification />} />
        <Route path="/verify" element={<VerifySuccess />} />
        <Route path="/jobs/:city" element={<CityJobs />} />
        <Route path="/jobs/:city/:category" element={<CategoryCityJobs />} />
        <Route path="/cities" element={<CityJobsLanding />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password-verify" element={<ResetPasswordVerify />} />
        <Route path="/reset-password-new" element={<ResetPasswordNew />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
