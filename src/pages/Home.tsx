import { useState } from "react";
import UrlInput from "../components/UrlInput";
import TestList from "../components/TestList";
import { runScan } from "../service/api.service";
import { toast } from 'react-hot-toast';

// Définition de l'interface pour un résultat de scan (finding)
interface Finding {
  id: string;
  chapter: string;
  section?: string;
  description: string;
  url?: string;
}

// Définition de l'interface pour la réponse du scan
interface ScanResponse {
  data: {
    url: string;
    timestamp: string;
    findings: Finding[];
  }
}

const Home = () => {
  // State pour stocker la liste des tests (résultats)
  const [tests, setTests] = useState<Array<{
    id: string;
    name: string;
    description: string;
    status: "pending" | "running" | "completed" | "failed";
    url?: string;
    section?: string;
  }>>([]);
  
  // State pour gérer l'état de l'analyse (scan)
  const [isScanning, setIsScanning] = useState(false);

  // Fonction appelée lors de la soumission d'une URL
  const handleUrlSubmit = async (url: string) => {
    console.log(`Analyse démarrée pour ${url}...`);
    // Réinitialisation des tests et de l'état de scan avant le début de l'analyse
    setTests([]);
    setIsScanning(false);
    
    // Affichage d'un toast de chargement
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
      
      // Récupération des données de la réponse
      const { data } = response;
      const { findings, url: scannedUrl, timestamp } = data;
      
      // Formatage de la date du scan pour affichage
      const scanTime = new Date(timestamp).toLocaleString();
      
      // Création d'un tableau de tests à partir des findings
      const newTests = findings.map((finding) => ({
        id: finding.id,
        name: `${finding.id} - ${finding.chapter}`,
        description: finding.description,
        section: finding.section,
        url: finding.url,
        status: "pending" as const,
      }));
      
      // Si aucun finding n'est trouvé, on ajoute un test par défaut
      if (newTests.length === 0) {
        newTests.push({
          id: "0",
          name: "Scan Complete",
          description: "No vulnerabilities were found in the scan",
          section: undefined,
          url: undefined,
          status: "pending" as const,
        });
      }
      
      // Mise à jour du state avec les nouveaux tests
      setTests(newTests);
      // Passage de l'état de scan à true pour afficher les résultats
      setIsScanning(true);
      
      // Affichage d'un toast de succès avec les informations du scan
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
      // Gestion de l'erreur lors de l'analyse
      console.error("Erreur lors de l'analyse :", error);
      setIsScanning(false);
      // Affichage d'un toast d'erreur
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

  // Fonction pour basculer le statut d'un test entre "completed" et "pending"
  const handleStatusChange = (id: string, currentStatus: "pending" | "running" | "completed" | "failed") => {
    // Si le statut actuel est "completed", le passer à "pending", sinon à "completed"
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    // Mise à jour du state en modifiant uniquement le test concerné
    setTests((prevTests) =>
      prevTests.map((test) =>
        test.id === id ? { ...test, status: newStatus } : test
      )
    );
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
          {/* Composant pour saisir l'URL */}
          <UrlInput onSubmit={handleUrlSubmit} />
          {/* Affichage de la liste des tests si au moins un test existe */}
          {tests.length > 0 && (
            <div className="overflow-y-auto pb-16 scrollbar-hide" style={{ height: 'calc(100vh - 200px)'}}>
              {/* Passage du callback pour la modification du statut */}
              <TestList tests={tests} onStatusChange={handleStatusChange} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Home;
