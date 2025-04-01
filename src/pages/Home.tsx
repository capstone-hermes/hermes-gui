import { useState } from "react";
import UrlInput from "../components/UrlInput";
import TestList from "../components/TestList";
import { runScan } from "../service/api.service";
import { toast } from 'react-hot-toast';

interface Finding {
  id: string;
  chapter: string;
  section?: string;
  description: string;
  url?: string;
}

interface ScanResponse {
  data: {
    url: string;
    timestamp: string;
    findings: Finding[];
  }
}

const Home = () => {
  const [tests, setTests] = useState<Array<{
    id: string;
    name: string;
    description: string;
    status: "pending" | "running" | "completed" | "failed";
  }>>([]);
  
  const [isScanning, setIsScanning] = useState(false);

  const handleUrlSubmit = async (url: string) => {
    console.log(`Analyse démarrée pour ${url}...`);
    // Réinitialise les tests pour effacer les anciens résultats
    setTests([]);
    setIsScanning(false);
    
    // Affiche un toast de chargement
    const toastId = toast.loading(`Analyse de ${url} en cours...`, {
      position: 'bottom-center',
      style: {
        backgroundColor: '#2A2E3B',
        color: 'white',
        border: '2px solid #00FF9C'
      }
    });

    try {
      // Appel de l'API de scan
      const response = await runScan(url) as ScanResponse;
      console.log("Réponse du scanner : ", response);
      
      const { data } = response;
      const { findings, url: scannedUrl, timestamp } = data;
      
      const scanTime = new Date(timestamp).toLocaleString();
      
      const newTests = findings.map((finding) => ({
        id: finding.id,
        name: `${finding.id} - ${finding.chapter}`,
        description: finding.description,
        section: finding.section,
        url: finding.url,
        status: "completed" as const,
      }));
      
      if (newTests.length === 0) {
        newTests.push({
          id: "0",
          name: "Scan Complete",
          description: "No vulnerabilities were found in the scan",
          section: undefined,
          url: undefined,
          status: "completed" as const,
        });
      }
      
      setTests(newTests);
      setIsScanning(true);
      
      toast.success(`Scan completed for ${scannedUrl} at ${scanTime}`, {
        position: 'bottom-center',
        id: toastId,
        style: {
          backgroundColor: '#2A2E3B',
          color: 'white',
          border: '2px solid #00FF9C'
        }
      });
    } catch (error) {
      console.error("Erreur lors de l'analyse :", error);
      setIsScanning(false);
      toast.error('Error: Unable to complete the scan', {
        position: 'bottom-center',
        id: toastId,
        style: {
          backgroundColor: '#2A2E3B',
          color: 'white',
          border: '2px solid #FF1F00'
        }
      });
    }
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
        <main className="space-y-2">
          <UrlInput onSubmit={handleUrlSubmit} />
          {/* Afficher TestList seulement s'il y a des tests */}
          {tests.length > 0 && (
            <div className="overflow-y-auto pb-16 scrollbar-hide" style={{ height: 'calc(100vh - 200px)'}}>
              <TestList tests={tests} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Home;
