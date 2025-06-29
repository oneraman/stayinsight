import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <Card className="feature-card group">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
            {icon}
          </div>
          <CardTitle className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors duration-300">
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-slate-600 text-base leading-relaxed">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;