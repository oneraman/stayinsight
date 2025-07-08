
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, TrendingUp, Shield, Upload, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { SimpleFileUploader } from "@/components/SimpleFileUploader";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-24 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 analytics-gradient"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
        
        <div className="relative max-w-5xl mx-auto">
          <div className="mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 animate-bounce-gentle">
              ✨ AI-Powered Customer Intelligence
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Predict Customer Churn
            </span>
            <br />
            <span className="text-foreground">with Smart Analytics</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Transform your customer data into actionable insights. Upload files, discover patterns, and implement retention strategies that actually work.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Button asChild size="lg" className="text-lg px-10 py-4 shadow-primary rounded-xl">
              <Link to="/signup">Start Free Analysis</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-10 py-4 border-2 rounded-xl">
              <Link to="/login">View Demo Dashboard</Link>
            </Button>
          </div>
          
          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-muted-foreground text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span>99.9% Uptime</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Enterprise Security</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <span>GDPR Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-warning rounded-full"></div>
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Experience the Power
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload your customer data and watch our AI transform it into actionable insights in seconds
            </p>
          </div>
          
          <div className="glass-effect rounded-2xl p-8 shadow-elevated">
            <SimpleFileUploader />
          </div>
          
          {/* Feature highlights */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="text-center p-6 rounded-xl bg-card border border-border/50">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Instant Processing</h3>
              <p className="text-sm text-muted-foreground">Upload CSV or Excel files and get results in under 30 seconds</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-card border border-border/50">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">Smart Analysis</h3>
              <p className="text-sm text-muted-foreground">AI automatically detects patterns and identifies at-risk customers</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-card border border-border/50">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <h3 className="font-semibold mb-2">Actionable Insights</h3>
              <p className="text-sm text-muted-foreground">Get specific recommendations to improve customer retention</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Powerful Features for Customer Success
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform provides comprehensive insights to help you understand and retain your customers.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="card-hover group border-border/50 bg-gradient-to-br from-card to-muted/20">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Advanced Analytics</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Get deep insights into customer behavior patterns, purchase history, and engagement metrics with our advanced analytics dashboard.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-hover group border-border/50 bg-gradient-to-br from-card to-muted/20">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-lg bg-success/10 group-hover:bg-success/20 transition-colors">
                    <Users className="h-6 w-6 text-success" />
                  </div>
                  <CardTitle className="text-lg">Customer Segmentation</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Automatically segment your customers based on risk levels, behavior patterns, and value to create targeted retention strategies.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-hover group border-border/50 bg-gradient-to-br from-card to-muted/20">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                    <TrendingUp className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-lg">Predictive Modeling</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Use machine learning algorithms to predict which customers are most likely to churn and take proactive measures.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-hover group border-border/50 bg-gradient-to-br from-card to-muted/20">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-lg bg-destructive/10 group-hover:bg-destructive/20 transition-colors">
                    <Shield className="h-6 w-6 text-destructive" />
                  </div>
                  <CardTitle className="text-lg">Risk Assessment</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Identify high-risk customers with our comprehensive risk scoring system and get recommendations for intervention.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-hover group border-border/50 bg-gradient-to-br from-card to-muted/20">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-lg bg-warning/10 group-hover:bg-warning/20 transition-colors">
                    <Upload className="h-6 w-6 text-warning" />
                  </div>
                  <CardTitle className="text-lg">Easy Data Import</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Upload your customer data in CSV or Excel format and get instant analysis with automated column mapping and validation.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-hover group border-border/50 bg-gradient-to-br from-card to-muted/20">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-lg bg-info/10 group-hover:bg-info/20 transition-colors">
                    <Eye className="h-6 w-6 text-info" />
                  </div>
                  <CardTitle className="text-lg">Real-time Insights</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Monitor customer health scores and churn predictions in real-time with our interactive dashboard and reporting tools.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M36%2030c0-6.627-5.373-12-12-12s-12%205.373-12%2012%205.373%2012%2012%2012%2012-5.373%2012-12zm12%200c0-6.627-5.373-12-12-12s-12%205.373-12%2012%205.373%2012%2012%2012%2012-5.373%2012-12z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        
        <div className="relative max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl md:text-2xl mb-12 opacity-90 max-w-2xl mx-auto">
            Join thousands of businesses using our platform to reduce churn, increase retention, and boost revenue.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Button asChild size="lg" variant="secondary" className="text-lg px-10 py-4 bg-white text-primary hover:bg-gray-100 rounded-xl shadow-lg">
              <Link to="/signup">Start Free Trial</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-10 py-4 border-2 border-white text-white hover:bg-white hover:text-primary rounded-xl">
              <Link to="/dashboard">View Live Demo</Link>
            </Button>
          </div>
          
          {/* Social proof */}
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-80">
            <div className="text-center">
              <div className="text-3xl font-bold">99%</div>
              <div className="text-sm">Customer Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">15M+</div>
              <div className="text-sm">Records Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-sm">Expert Support</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">SOC2</div>
              <div className="text-sm">Type II Compliant</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
