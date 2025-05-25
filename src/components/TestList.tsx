import { Check, AlertCircle, ExternalLink } from "lucide-react";

interface Test {
  id: string;
  name: string;
  description: string;
  status: "pending" | "running" | "completed" | "failed";
  url?: string;
  section?: string;
}

interface TestListProps {
  tests: Test[];
  onStatusChange: (id: string, currentStatus: Test["status"]) => void;
}

const TestList = ({ tests, onStatusChange }: TestListProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto mt-8 space-y-4 animate-slideUp">
      <h2 className="text-xl text-white mb-4">
        Scan Results <span className="text-cyber-green">({tests.length} findings)</span>
      </h2>
      
      {tests.map((test) => (
        <div
          key={test.id}
          className="p-4 bg-cyber-gray/50 border border-cyber-green/20 rounded-lg 
                     hover:border-cyber-green/40 transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg text-white">
              {test.name}
            </h3>
            {/* Icône cliquable pour basculer le statut */}
            <div 
              onClick={() => onStatusChange(test.id, test.status)} 
              className="cursor-pointer"
            >
              <StatusIcon status={test.status} />
            </div>
          </div>
          
          {test.section && (
            <div className="mt-1 mb-2">
              <span className="text-xs bg-cyber-green/20 text-cyber-green px-2 py-1 rounded">
                {test.section}
              </span>
            </div>
          )}
          
          <p className="mt-2 text-gray-400 text-sm">{test.description}</p>
          
          {test.url && (
            <div className="mt-3 flex items-center text-xs text-cyber-green">
              <ExternalLink className="w-3 h-3 mr-1" />
              <a 
                href={test.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {test.url}
              </a>
            </div>
          )}
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
