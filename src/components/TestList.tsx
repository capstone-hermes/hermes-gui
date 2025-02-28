import { Check, AlertCircle } from "lucide-react";

interface Test {
  id: string;
  name: string;
  description: string;
  status: "pending" | "running" | "completed" | "failed";
}

interface TestListProps {
  tests: Test[];
}

const TestList = ({ tests }: TestListProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto mt-8 space-y-4 animate-slideUp">
      {tests.map((test) => (
        <div
          key={test.id}
          className="p-4 bg-cyber-gray/50 border border-cyber-green/20 rounded-lg 
                     hover:border-cyber-green/40 transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-['JetBrains_Mono'] text-white">
              {test.name}
            </h3>
            <StatusIcon status={test.status} />
          </div>
          <p className="mt-2 text-gray-400 text-sm">{test.description}</p>
        </div>
      ))}
    </div>
  );
};

const StatusIcon = ({ status }: { status: Test["status"] }) => {
  switch (status) {
    case "completed":
      return <Check className="w-5 h-5 text-cyber-green animate-glow" />;
    case "failed":
      return <AlertCircle className="w-5 h-5 text-cyber-red animate-glow" />;
    default:
      return (
        <div className="w-5 h-5 rounded-full bg-gray-600 animate-pulse"></div>
      );
  }
};

export default TestList;