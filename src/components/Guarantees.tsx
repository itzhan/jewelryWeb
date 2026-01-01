import { Plane, RotateCcw, Shield } from 'lucide-react';

export default function Guarantees() {
  return (
    <div className="bg-gray-900 text-white py-12 sm:py-16">
      <div className="page-width">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
          <GuaranteeItem
            icon={<Plane className="w-10 h-10 sm:w-12 sm:h-12" />}
            title="Worldwide Delivery"
            description="Overnight Complimentary Shipping"
          />
          <GuaranteeItem
            icon={<RotateCcw className="w-10 h-10 sm:w-12 sm:h-12" />}
            title="Returns Within 30 Days"
            description="Satisfaction Guaranteed"
          />
          <GuaranteeItem
            icon={<Shield className="w-10 h-10 sm:w-12 sm:h-12" />}
            title="Life Time Warranty"
            description="Shop With Confidence"
          />
        </div>
      </div>
    </div>
  );
}

function GuaranteeItem({ icon, title, description }: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="flex justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}
