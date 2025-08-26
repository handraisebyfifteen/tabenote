import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Search from "@/pages/search";
import Elements from "@/pages/elements";
import Seasons from "@/pages/seasons";
import Combinations from "@/pages/combinations";
import Education from "@/pages/education";
import Manage from "@/pages/manage";
import Navigation from "@/components/navigation";

function Router() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="md:ml-64 pb-20 md:pb-0">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/search" component={Search} />
          <Route path="/elements" component={Elements} />
          <Route path="/seasons" component={Seasons} />
          <Route path="/combination" component={Combinations} />
          <Route path="/education" component={Education} />
          <Route path="/manage" component={Manage} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
