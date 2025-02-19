import { useState } from "react";
import UrlInput from "../components/UrlInput";
import TestList from "../components/TestList";
import { useToast } from "../hooks/use-toast";

const Home = () => {
  const { toast } = useToast();
  const [tests, setTests] = useState([
    {
      id: "1",
      name: "Test XSS",
      description: "Vérification des vulnérabilités XSS",
      status: "pending" as const,
    },
    {
      id: "2",
      name: "Test SQL Injection",
      description: "Recherche d'injections SQL possibles",
      status: "pending" as const,
    },
    {
      id: "3",
      name: "Test CSRF",
      description: "Vérification des protections CSRF",
      status: "pending" as const,
    },
  ]);

  const handleUrlSubmit = (url: string) => {
    toast({
      title: "Analyse démarrée",
      description: "L'analyse de sécurité est en cours...",
    });
    
    // Simulate tests running
    // setTests((prev) =>
    //   prev.map((test) => ({ ...test, status: "running" as const }))
    // );

    // // Simulate test completion after delay
    // setTimeout(() => {
    //   setTests((prev) =>
    //     prev.map((test) => ({
    //       ...test,
    //       status: Math.random() > 0.5 ? "completed" : "failed",
    //     }))
    //   );
    // }, 3000);
  };

  return (
    <div className="min-h-screen bg-cyber-black p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4 font-['JetBrains_Mono']">
            PenTest Assistant
          </h1>
          <p className="text-gray-400">
            Outil d'analyse de sécurité pour pentesteurs juniors
          </p>
        </header>

        <main className="space-y-8">
          <UrlInput onSubmit={handleUrlSubmit} />
          <TestList tests={tests} />
        </main>
      </div>
    </div>
  );
};

export default Home;