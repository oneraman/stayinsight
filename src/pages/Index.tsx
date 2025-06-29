import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FeatureCard from "@/components/FeatureCard";
import { ChartBar, Database, FileUp, Users } from "lucide-react";
import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    // Scroll animation observer
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    // Observe all elements with scroll-fade-in class
    const elements = document.querySelectorAll('.scroll-fade-in');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-24 md:py-32 bg-gradient-to-br from-gray-50 via-white to-indigo-50">
        <div className="container px-6 mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="max-w-xl animate-fade-in">
              <h1 className="text-5xl md:text-6xl font-bold mb-8 leading-tight">
                Transform Your <br />
                Customer Data into <br />
                <span className="text-indigo-600">Actionable</span> <span className="text-teal-400">Insights</span>
              </h1>
              <p className="text-xl md:text-2xl mb-10 text-slate-600 leading-relaxed">
                Unlock the power of customer behavior analytics with our AI-driven platform. Make data-driven decisions and boost customer retention.
              </p>
              <div className="flex flex-col sm:flex-row gap-6">
                <Link to="/demo">
                  <Button className="btn-primary text-lg py-6 px-10 font-semibold tracking-wide">
                    Request Demo
                  </Button>
                </Link>
                <Link to="/learn-more">
                  <Button className="btn-secondary text-lg py-6 px-10 font-semibold tracking-wide">
                    Learn More
                  </Button>
                </Link>
              </div>
              
              <div className="mt-12 flex items-center scroll-fade-in stagger-1">
                <div className="flex -space-x-4">
                  <div className="h-12 w-12 rounded-full border-4 border-white bg-gradient-to-br from-indigo-400 to-indigo-600 shadow-lg"></div>
                  <div className="h-12 w-12 rounded-full border-4 border-white bg-gradient-to-br from-teal-400 to-teal-600 shadow-lg"></div>
                  <div className="h-12 w-12 rounded-full border-4 border-white bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg"></div>
                </div>
                <p className="ml-6 text-lg text-slate-600 font-medium">Trusted by 2,000+ companies worldwide</p>
              </div>
            </div>
            
            <div className="relative animate-scale-up">
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 hover:shadow-3xl transition-all duration-500">
                <img 
                  src="/lovable-uploads/98af3396-d23f-4b1e-a715-e34c0ae29717.png" 
                  alt="StayInsightAI Dashboard" 
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full opacity-20 animate-float"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full opacity-20 animate-float" style={{animationDelay: '1s'}}></div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container px-6 mx-auto">
          <div className="text-center mb-20 scroll-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-800">How StayInsightAI Works</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Our powerful AI analyzes your customer data to identify patterns and predict which customers are at risk.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="scroll-fade-in stagger-1">
              <FeatureCard 
                icon={<FileUp size={28} />}
                title="Data Upload"
                description="Upload your customer data via CSV or connect through our API for real-time analysis."
              />
            </div>
            <div className="scroll-fade-in stagger-2">
              <FeatureCard 
                icon={<Database size={28} />}
                title="AI Analysis"
                description="Our machine learning models analyze customer behavior patterns to identify risk factors."
              />
            </div>
            <div className="scroll-fade-in stagger-3">
              <FeatureCard 
                icon={<ChartBar size={28} />}
                title="Predictive Insights"
                description="Get clear visualizations of churn risk with actionable insights on why customers might leave."
              />
            </div>
            <div className="scroll-fade-in stagger-4">
              <FeatureCard 
                icon={<Users size={28} />}
                title="Retention Actions"
                description="Automatically trigger personalized retention campaigns based on AI recommendations."
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Social Proof */}
      <section className="py-20 bg-gray-50">
        <div className="container px-6 mx-auto">
          <div className="text-center mb-12 scroll-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-800">Trusted by Leading Companies</h2>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 scroll-fade-in">
            {['Company 1', 'Company 2', 'Company 3', 'Company 4', 'Company 5'].map((company, index) => (
              <div key={index} className="grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                <div className="h-16 flex items-center justify-center">
                  <div className="bg-white border border-gray-200 w-40 h-12 rounded-2xl flex items-center justify-center text-slate-600 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300">
                    {company} Logo
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-teal-600/20"></div>
        <div className="container px-6 mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center scroll-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
              Ready to reduce churn and increase revenue?
            </h2>
            <p className="text-xl mb-12 text-gray-200 leading-relaxed max-w-2xl mx-auto">
              Join thousands of businesses that use StayInsightAI to retain customers and maximize lifetime value.
            </p>
            <Link to="/signup">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-lg py-6 px-12 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/25 animate-glow">
                Start Your Free Trial
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full opacity-10 animate-float"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full opacity-10 animate-float" style={{animationDelay: '2s'}}></div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;