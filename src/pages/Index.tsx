
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FeatureCard from "@/components/FeatureCard";
import { ChartBar, Database, FileUp, Users } from "lucide-react";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="hero-gradient text-white py-20 md:py-32">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Predict & Prevent Customer Churn with AI
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Identify at-risk customers, understand why they might leave, and take action before it's too late.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/signup">
                <Button className="text-lg py-6 px-8 bg-white text-churnify-blue hover:bg-gray-100">
                  Get Started Free
                </Button>
              </Link>
              <Link to="/demo">
                <Button variant="outline" className="text-lg py-6 px-8 border-white text-white hover:bg-white/10">
                  Watch Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How Churnify Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our powerful AI analyzes your customer data to identify patterns and predict which customers are at risk.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<FileUp size={24} />}
              title="Data Upload"
              description="Upload your customer data via CSV or connect through our API for real-time analysis."
            />
            <FeatureCard 
              icon={<Database size={24} />}
              title="AI Analysis"
              description="Our machine learning models analyze customer behavior patterns to identify risk factors."
            />
            <FeatureCard 
              icon={<ChartBar size={24} />}
              title="Predictive Insights"
              description="Get clear visualizations of churn risk with actionable insights on why customers might leave."
            />
            <FeatureCard 
              icon={<Users size={24} />}
              title="Retention Actions"
              description="Automatically trigger personalized retention campaigns based on AI recommendations."
            />
          </div>
        </div>
      </section>
      
      {/* Social Proof */}
      <section className="py-16 bg-white">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Trusted by Leading Companies</h2>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {['Company 1', 'Company 2', 'Company 3', 'Company 4', 'Company 5'].map((company, index) => (
              <div key={index} className="grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all">
                <div className="h-12 flex items-center justify-center">
                  {/* Placeholder for company logos */}
                  <div className="bg-gray-200 w-32 h-8 rounded flex items-center justify-center text-gray-500 text-sm">
                    {company} Logo
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to reduce churn and increase revenue?
            </h2>
            <p className="text-xl mb-8 text-gray-300">
              Join thousands of businesses that use Churnify to retain customers and maximize lifetime value.
            </p>
            <Link to="/signup">
              <Button className="text-lg py-6 px-8 bg-churnify-blue hover:bg-churnify-light-blue">
                Start Your Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
