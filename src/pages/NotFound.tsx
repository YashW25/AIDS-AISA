import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero p-4">
      <Helmet>
        <title>Page Not Found | AISA Club - ISBM COE</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="The page you are looking for does not exist. Return to the AISA Club homepage." />
      </Helmet>
      <div className="text-center max-w-md animate-fade-in">
        <div className="text-9xl font-display font-bold text-primary-foreground/20 mb-4">
          404
        </div>
        <h1 className="font-display text-3xl font-bold text-primary-foreground mb-4">
          Page Not Found
        </h1>
        <p className="text-primary-foreground/70 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/">
            <Button variant="accent" size="lg">
              <Home className="h-5 w-5" />
              Go Home
            </Button>
          </Link>
          <Button variant="outline-light" size="lg" onClick={() => window.history.back()}>
            <ArrowLeft className="h-5 w-5" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
