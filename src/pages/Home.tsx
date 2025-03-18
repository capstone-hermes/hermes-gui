import { useState } from "react";
import UrlInput from "../components/UrlInput";
import TestList from "../components/TestList";
import { runScan } from "../service/api.service";// Import de runScan
import { toast } from 'react-hot-toast';

const Home = () => {
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

  const [isScanning, setIsScanning] = useState(false);

  const handleUrlSubmit = async (url: string) => {
    console.log(`Analyse démarrée pour ${url}...`); // Afficher un message dans la console

    toast.loading(`Analyse de ${url} en cours...`, {
      position: 'bottom-center',
      style: {
        backgroundColor: '#2A2E3B',
        color: 'white',
        border: '2px solid #00FF9C'
      }
    });

    try {
      const response = await runScan(url); // Appel de runScan

      console.log("Réponse du scanner : ", response); // Afficher la réponse dans la console

      console.log("Analyse terminée pour l'URL:", url);

      toast.success('Analyse terminée : ${response.output}', {
        position: 'bottom-center',
        style: {
          backgroundColor: '#2A2E3B',
          color: 'white',
          border: '2px solid #00FF9C'
        }
      });
      setIsScanning(true);
    } catch (error) {
      setIsScanning(false);
      console.error("Erreur lors de l'analyse :", error);
      toast.error('Erreur: Impossible de lancer le test', {
        position: 'bottom-center',
        style: {
          backgroundColor: '#2A2E3B',
          color: 'white',
          border: '2px solid #FF1F00'
        }
      });
    }
  };

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
  // };

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
          {isScanning && <TestList tests={tests} />}
        </main>
      </div>
    </div>
  );
};

export default Home;